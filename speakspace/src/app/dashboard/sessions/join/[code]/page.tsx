"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trpc } from "@/app/trpc/client";
import { useToast } from "@/hooks/use-toast";

export default function JoinSessionPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const [isJoining, setIsJoining] = useState(false);

    // Get the code from params and ensure it's a string
    const code = Array.isArray(params.code) ? params.code[0] : params.code;

    // Only enable the query if we have a valid code
    const { data: session, isLoading, error } = trpc.session.getByCode.useQuery(
        { code: code! },
        { enabled: !!code }
    );
    console.log("Session data:", params);

    const joinMutation = trpc.session.join.useMutation({
        onSuccess: (data) => {
            toast({
                title: "Joined!",
                description: `You have joined ${data.session.title}`,
            });
            router.push(`/sessions/${data.session.id}`);
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
            setIsJoining(false);
        },
    });

    const handleJoin = () => {
        if (!code) return;

        setIsJoining(true);
        joinMutation.mutate({ code });
    };

    // // Redirect if no code
    // useEffect(() => {
    //     if (!code) {
    //         router.push("/sessions");
    //     }
    // }, [code, router]);

    // if (!code) {
    //     return null; // Will redirect anyway
    // }

    if (isLoading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="container max-w-md py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Session Not Found</CardTitle>
                        <CardDescription>
                            The session you're trying to join doesn't exist or has been closed.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button
                            onClick={() => router.push("/sessions")}
                            className="w-full"
                        >
                            Go to My Sessions
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-md py-10">
            <Card>
                <CardHeader>
                    <CardTitle>{session.title}</CardTitle>
                    <CardDescription>
                        {session.description || "No description provided"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Created by: {session.creator.username}
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">Type:</span>{" "}
                            {session.sessionType === "GROUP_DISCUSSION"
                                ? "Group Discussion"
                                : "Interview"}
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">Communication:</span>{" "}
                            {session.communicationModes
                                .map((mode) => {
                                    switch (mode) {
                                        case "CHAT":
                                            return "Chat";
                                        case "VOICE":
                                            return "Voice";
                                        case "VIDEO":
                                            return "Video";
                                        default:
                                            return mode;
                                    }
                                })
                                .join(", ")}
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">Participants:</span>{" "}
                            {session.sessionMembers.length}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/sessions")}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleJoin}
                        disabled={isJoining}
                    >
                        {isJoining ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Joining...
                            </>
                        ) : (
                            "Join Session"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}