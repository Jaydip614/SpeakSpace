// src/server/api/routers/sessionRouter.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/app/trpc/init";
import { TRPCError } from "@trpc/server";
import { CommunicationMode, SessionType, UserRole, } from "@prisma/client";
import { prisma } from "@/lib/db"; // Your Prisma client
import { nanoid } from "nanoid";

export const sessionRouter = createTRPCRouter({
    getByCode: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            try {
                const data = prisma.session.findUnique({
                    where: { code: input.id },
                    include: {
                        creator: {
                            select: {
                                id: true,
                                username: true,
                                imageUrl: true,
                                clerkId: true
                            },
                        },
                        sessionMembers: true,
                    },
                });
                return data;
            } catch (error: any) {
                console.log(error?.message, error?.stack);
                console.error("Error fetching session by ID:", error);

            }
        }),
    // Create a new session
    create: protectedProcedure
        .input(
            z.object({
                title: z.string().min(3).max(100),
                description: z.string().optional(),
                sessionType: z.nativeEnum(SessionType),
                communicationModes: z.array(z.nativeEnum(CommunicationMode)).min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const userId = ctx.user.id;

                // Generate a unique room code
                const code = nanoid(10);

                // Create the session
                const session = await prisma.session.create({
                    data: {
                        code,
                        title: input.title,
                        description: input.description,
                        sessionType: input.sessionType,
                        communicationModes: input.communicationModes,
                        creatorId: userId,
                    },
                });

                // Add the creator as a MODERATOR
                await prisma.sessionMember.create({
                    data: {
                        userId,
                        sessionId: session.id,
                        role: UserRole.MODERATOR,
                    },
                });

                return {
                    session,
                    joinLink: `${process.env.NEXT_PUBLIC_APP_URL}/sessions/join/${code}`
                };
            } catch (error: any) {
                console.log(error?.message, error?.stack);
                console.error("Error creating session:", error);
            }
        }),
    join: protectedProcedure
        .input(z.object({ code: z.string(), role: z.nativeEnum(UserRole).optional() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user.id;

            // Find the session
            const session = await prisma.session.findUnique({
                where: { code: input.code },
                include: {
                    sessionMembers: {
                        include: {
                            user: true
                        }
                    }
                },
            });

            if (!session) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Session not found",
                });
            }

            // ... (keep existing validation logic)

            // Check if user is already a member
            const existingMember = session.sessionMembers.find(
                (member) => member.userId === userId
            );

            if (existingMember) {
                if (existingMember.isBanned) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "You have been banned from this session",
                    });
                }

                if (existingMember.leftAt) {
                    const updatedMember = await prisma.sessionMember.update({
                        where: { id: existingMember.id },
                        data: { leftAt: null },
                        include: { user: true }
                    });

                    // Emit user rejoined event
                                       return { session };
                }

                return { session };
            }

            // Create new session member
            const newMember = await prisma.sessionMember.create({
                data: {
                    userId,
                    sessionId: session.id,
                    role: input.role || UserRole.PARTICIPANT,
                },
                include: {
                    user: true
                }
            });

         
            return { session };
        }),

    leave: protectedProcedure
        .input(z.object({ sessionId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user.id;

            const member = await prisma.sessionMember.findFirst({
                where: {
                    userId,
                    sessionId: input.sessionId,
                },
                include: {
                    user: true
                }
            });

            if (!member) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "You are not a member of this session",
                });
            }

            // Update the leftAt timestamp
            await prisma.sessionMember.update({
                where: { id: member.id },
                data: { leftAt: new Date() },
            });

            // Emit member left event
        
            return { success: true };
        }),


    // Ban user (Moderator only)
    banUser: protectedProcedure
        .input(
            z.object({
                sessionId: z.string(),
                targetUserId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user.id;

            // Check if the user is a moderator
            const moderator = await prisma.sessionMember.findFirst({
                where: {
                    userId,
                    sessionId: input.sessionId,
                    role: UserRole.MODERATOR,
                },
            });

            if (!moderator) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only moderators can ban users",
                });
            }

            // Ban the target user
            await prisma.sessionMember.updateMany({
                where: {
                    userId: input.targetUserId,
                    sessionId: input.sessionId,
                },
                data: {
                    isBanned: true,
                    leftAt: new Date(),
                },
            });

            return { success: true };
        }),
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            // Return session data
            try {
                const data = await prisma.session.findUnique({
                    where: { id: input.id },
                    include: {
                        creator: true,
                        sessionMembers: {
                            include: {
                                user: true
                            }
                        }
                    },
                });
                return data;
            } catch (error: any) {
                console.log(error?.message, error?.stack);
                console.error("Error fetching session by ID:", error);

            }
        }),
    getMySessions: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id;

        const memberSessions = await prisma.session.findMany({
            where: {
                sessionMembers: {
                    some: {
                        userId,
                        leftAt: null,
                        isBanned: false,
                    },
                },
                isActive: true,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                _count: {
                    select: {
                        sessionMembers: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return memberSessions;
    }),
});