import { createTRPCRouter, protectedProcedure } from "@/app/trpc/init";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = createTRPCRouter({
    updateDetails: protectedProcedure
        .input(
            z.object({
                username: z.string().min(3).max(20).optional(),
                email: z.string().email().optional(),
                imageUrl: z.string().url().optional(),
                userType: z.enum(["HR", "STUDENT", "JOBSEEKER", "EMPLOYEE"]).optional(),
                // Changed from 'role' to 'userType' to match schema
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;
            const { username, email, imageUrl, userType } = input; // Changed variable name

            try {
                const updatedUser = await prisma.user.update({
                    where: { id: userId },
                    data: {
                        ...(username && { username }),
                        ...(email && { email }),
                        ...(imageUrl && { imageUrl }),
                        ...(userType && { userType }), // Changed to userType
                    },
                });

                return updatedUser;
            } catch (error: any) {
                console.error("Update error:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update user details",
                });
            }
        }),
});