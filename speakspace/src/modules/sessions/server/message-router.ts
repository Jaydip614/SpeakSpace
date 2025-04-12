    // src/server/api/routers/messageRouter.ts
    import { z } from "zod";
    import { createTRPCRouter, protectedProcedure } from "@/app/trpc/init";
    import { prisma } from "@/lib/db"; // Your Prisma client
    import { TRPCError } from "@trpc/server";

    export const messageRouter = createTRPCRouter({
        // Send a message to a session
        send: protectedProcedure
            .input(
                z.object({
                    sessionId: z.string(),
                    content: z.string().optional(),
                    mediaUrl: z.string().optional(),
                    mediaType: z.string().optional(),
                })
            )
            .mutation(async ({ ctx, input }) => {
                const userId = ctx.user.id;

                // Verify the user is a member of the session
                const memberCheck = await prisma.sessionMember.findFirst({
                    where: {
                        userId,
                        sessionId: input.sessionId,
                        isBanned: false,
                        leftAt: null,
                    },
                });

                if (!memberCheck) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "You must be an active member to send messages",
                    });
                }

                // Validate that we have either content or media
                if (!input.content && !input.mediaUrl) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Message must contain either text content or media",
                    });
                }

                // Create the message
                const message = await prisma.message.create({
                    data: {
                        content: input.content,
                        mediaUrl: input.mediaUrl,
                        mediaType: input.mediaType,
                        senderId: userId,
                        sessionId: input.sessionId,
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                imageUrl: true,
                            },
                        },
                    },
                });

                // Here you would also emit the message via your websocket/real-time mechanism

                return message;
            }),

        // Get messages for a session with pagination
        getSessionMessages: protectedProcedure
            .input(
                z.object({
                    sessionId: z.string(),
                    cursor: z.string().optional(),
                    limit: z.number().min(1).max(100).default(50),
                })
            )
            .query(async ({ ctx, input }) => {
                const userId = ctx.user.id;

                // Verify user is a member
                const memberCheck = await prisma.sessionMember.findFirst({
                    where: {
                        userId,
                        sessionId: input.sessionId,
                    },
                });

                if (!memberCheck) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "You must be a member to view messages",
                    });
                }

                // Set up the cursor condition
                const cursor = input.cursor
                    ? {
                        id: input.cursor,
                    }
                    : undefined;

                // Get messages with pagination
                const messages = await prisma.message.findMany({
                    where: {
                        sessionId: input.sessionId,
                    },
                    take: input.limit + 1, // take an extra item to determine if there are more items
                    cursor: cursor,
                    orderBy: {
                        createdAt: "desc", // Most recent messages first
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                imageUrl: true,
                            },
                        },
                    },
                });

                let nextCursor: typeof input.cursor | undefined = undefined;
                if (messages.length > input.limit) {
                    const nextItem = messages.pop();
                    nextCursor = nextItem?.id;
                }

                return {
                    messages: messages.reverse(), // Reverse to get chronological order
                    nextCursor,
                };
            }),
    });