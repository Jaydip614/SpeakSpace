import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {UserType} from "@prisma/client";
export const GET = async (req: Request) => {
    try {
        const user = await currentUser();
        if (!user || !user.id) {
            // Return a proper error response
            return new NextResponse(
                JSON.stringify({ error: "Unauthorized" }),
                {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        });

        if (!existingUser) {
            await prisma.user.create({
                data: {
                    clerkId: user.id,
                    email: user.emailAddresses[0]?.emailAddress || "no-email-provided",
                    username: user.username || `user-${Math.random().toString(36).substring(2, 8)}`,
                    imageUrl: user.imageUrl || "default-avatar-url",
                    userType: UserType.STUDENT // Add default userType
                }
            });
        }

        // Fixed redirect - using NextResponse.redirect()
        const path = existingUser ? "/dashboard" : "/complete-profile";
        const redirectUrl = new URL(path, req.url);
        return NextResponse.redirect(redirectUrl);

    } catch (error: any) {
        console.log(error?.message, error?.stack)
        console.error("Error in user creation:", error);

        // Ensure we always return a valid JSON response
        const errorMessage = error instanceof Error ? error.message : "Registration failed";
        return new NextResponse(
            JSON.stringify({ error: errorMessage }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
};