"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Send, MoreVertical, Paperclip, LogOut, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/hooks/use-socket";
import { format } from "date-fns";
import { UserRole, type Session, type SessionMember, type User } from "@prisma/client";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/app/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";

// Define proper types for the messages and session data
type MessageWithSender = {
    id: string;
    content: string | null;
    mediaUrl: string | null;
    mediaType: string | null;
    senderId: string;
    sessionId: string;
    createdAt: Date;
    sender: {
        id: string;
        username: string;
        imageUrl: string | null;
    };
};

type SessionWithMembers = Session & {
    sessionMembers: (SessionMember & {
        user: User;
    })[];
    creator: User;
};

type MessagesResponse = {
    messages: MessageWithSender[];
    nextCursor: string | undefined;
};

export default function SessionPage() {
    const params = useParams();
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useUser();
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { socket, isConnected } = useSocket();

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    // Get session data with proper typing
    const {
        data: session,
        isLoading: sessionLoading,
        error: sessionError
    } = trpc.session.getById.useQuery({ id: params.id as string }) as {
        data: SessionWithMembers | undefined;
        isLoading: boolean;
        error: any;
    };
    // console.log("session", session?.sessionMembers);
    useEffect(() => {
        if (sessionError) {
            toast({
                title: "Error",
                description: sessionError.message,
                variant: "destructive",
            });
            router.push("/dashboard/sessions");
        }
    }, [sessionError, toast, router]);

    // Get initial messages with proper typing
    const {
        data: initialMessages,
        isLoading: messagesLoading
    } = trpc.message.getSessionMessages.useQuery(
        { sessionId: params.id as string, limit: 50 },
        { enabled: !!session }
    ) as {
        data: MessagesResponse | undefined;
        isLoading: boolean;
    };

    useEffect(() => {
        if (initialMessages) {
            setMessages(initialMessages.messages);
            setNextCursor(initialMessages.nextCursor);
            scrollToBottom();
        }
    }, [initialMessages]);

    // Send message mutation
    const sendMessageMutation = trpc.message.send.useMutation({
        onSuccess: (newMessage) => {
            setMessageText("");
            setMessages((prev) => [...prev, newMessage as MessageWithSender]);
            scrollToBottom();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Leave session mutation
    const leaveSessionMutation = trpc.session.leave.useMutation({
        onSuccess: () => {
            toast({
                title: "Left Session",
                description: "You have left the session",
            });
            router.push("/dashboard/sessions");
        },
    });

    // Ban user mutation
    const banUserMutation = trpc.session.banUser.useMutation({
        onSuccess: () => {
            toast({
                title: "User Banned",
                description: "The user has been banned from this session",
            });
        },
    });

    // Load more messages with proper typing
    const loadMoreMessages = async () => {
        if (!nextCursor || isLoadingMore) return;

        setIsLoadingMore(true);
        try {
            const r = await trpc.message.getSessionMessages.useQuery({
                sessionId: params.id as string,
                cursor: nextCursor,
                limit: 50,
            });
            const result = r.data as MessagesResponse;
            setMessages((prev) => [...result.messages, ...prev]);
            setNextCursor(result.nextCursor);
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to load more messages",
                variant: "destructive",
            });
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Handle socket events
    useEffect(() => {
        if (!socket || !session) return;

        socket.emit('joinSession', session.id);

        socket.on('newMessage', (newMessage: MessageWithSender) => {
            setMessages((prev) => [...prev, newMessage]);
            scrollToBottom();
        });

        socket.on('userJoined', (userData: { username: string }) => {
            toast({
                title: "User Joined",
                description: `${userData.username} has joined the session`,
            });
        });

        socket.on('userLeft', (userData: { username: string }) => {
            toast({
                title: "User Left",
                description: `${userData.username} has left the session`,
            });
        });

        return () => {
            socket.emit('leaveSession', session.id);
            socket.off('newMessage');
            socket.off('userJoined');
            socket.off('userLeft');
        };
    }, [socket, session, toast]);

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const mediaUrl = URL.createObjectURL(file);

                sendMessageMutation.mutate({
                    sessionId: params.id as string,
                    mediaUrl: mediaUrl,
                    mediaType: file.type,
                });
            }
        };
        reader.readAsDataURL(file);
    };

    // Send message handler
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        sendMessageMutation.mutate({
            sessionId: params.id as string,
            content: messageText,
        });
    };

    // Leave session handler
    const handleLeaveSession = () => {
        leaveSessionMutation.mutate({ sessionId: params.id as string });
    };

    // Ban user handler
    const handleBanUser = (userId: string) => {
        banUserMutation.mutate({
            sessionId: params.id as string,
            targetUserId: userId
        });
    };

    if (sessionLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex h-screen flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Session not found</h1>
                <Button
                    className="mt-4"
                    onClick={() => router.push("/dashboard/sessions")}
                >
                    Go back to sessions
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={session.creator?.imageUrl || undefined} />
                        <AvatarFallback>
                            {session.creator?.username?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-xl font-bold">{session.title}{"'s Session"}</h1>
                        <p className="text-sm text-muted-foreground">
                            Created by {session.creator?.username}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Users className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Session Members</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 space-y-4">
                                {session?.sessionMembers?.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage
                                                    src={member?.user?.imageUrl || ""}
                                                />
                                                <AvatarFallback>
                                                    {member?.user?.username?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{member?.user?.username}</p>
                                                    {member.role === UserRole.MODERATOR && (
                                                        <Badge variant="outline">Moderator</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Joined{" "}
                                                    {format(new Date(member.joinedAt), "MMM d, yyyy")}
                                                </p>
                                            </div>
                                        </div>
                                        {/* {session.creator.clerkId + "," + user?.id} */}
                                        {session.creator?.clerkId == user?.id && member.role != UserRole.MODERATOR && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleBanUser(member.userId)}
                                                    >
                                                        Ban User
                                                    </DropdownMenuItem>

                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleLeaveSession}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Leave Session
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                {isLoadingMore && (
                    <div className="flex justify-center py-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}
                {nextCursor && (
                    <div className="flex justify-center py-2">
                        <Button variant="ghost" size="sm" onClick={loadMoreMessages}>
                            Load more messages
                        </Button>
                    </div>
                )}
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender.id === user?.id
                                ? "justify-end"
                                : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[70%] overflow-hidden rounded-lg p-3 ${message.sender.id === user?.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary"
                                    }`}
                            >
                                {message.sender.id !== user?.id && (
                                    <div className="mb-1 flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={message.sender.imageUrl || undefined} />
                                            <AvatarFallback>
                                                {message.sender.username.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <p className="text-xs font-medium">
                                            {message.sender.username}
                                        </p>
                                    </div>
                                )}
                                {message.content && <p>{message.content}</p>}
                                {message.mediaUrl && (
                                    <div className="mt-2">
                                        {message.mediaType?.startsWith("image/") ? (
                                            <img
                                                src={message.mediaUrl}
                                                alt="Shared image"
                                                className="max-h-60 rounded-md object-contain"
                                            />
                                        ) : message.mediaType?.startsWith("video/") ? (
                                            <video
                                                src={message.mediaUrl}
                                                controls
                                                className="max-h-60 rounded-md"
                                            />
                                        ) : (
                                            <a
                                                href={message.mediaUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-md bg-background/10 p-2 text-sm"
                                            >
                                                <Paperclip className="h-4 w-4" />
                                                Download file
                                            </a>
                                        )}
                                    </div>
                                )}
                                <p className="mt-1 text-right text-xs opacity-70">
                                    {format(new Date(message.createdAt), "HH:mm")}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Message Input */}
            <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 border-t p-4"
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Paperclip className="h-5 w-5" />
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </Button>
                <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                >
                    {sendMessageMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="h-5 w-5" />
                    )}
                </Button>
            </form>
        </div>
    );
}