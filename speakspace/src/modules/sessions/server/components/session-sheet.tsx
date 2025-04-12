"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Users, X } from 'lucide-react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CommunicationMode, SessionType } from "@prisma/client";
import { trpc } from "@/app/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/use-socket";

// Form schema for creating a session
const createFormSchema = z.object({
    title: z.string().min(3, {
        message: "Title must be at least 3 characters.",
    }),
    description: z.string().optional(),
    sessionType: z.nativeEnum(SessionType),
    communicationModes: z.array(z.nativeEnum(CommunicationMode)).min(1, {
        message: "Select at least one communication mode.",
    }),
});

// Form schema for joining a session
const joinFormSchema = z.object({
    code: z.string().min(3, {
        message: "Session code is required",
    }),
});

type CreateFormValues = z.infer<typeof createFormSchema>;
type JoinFormValues = z.infer<typeof joinFormSchema>;

interface SessionSheetProps {
    variant?: "create" | "join" | "both";
    defaultTab?: "create" | "join";
    buttonText?: string;
    buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
    buttonIcon?: boolean;
    className?: string;
}

export function SessionSheet({
    variant = "both",
    defaultTab = "join",
    buttonText = "Join Session",
    buttonVariant = "default",
    buttonIcon = true,
    className,
}: SessionSheetProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const { socket } = useSocket();

    // Create session form
    const createForm = useForm<CreateFormValues>({
        resolver: zodResolver(createFormSchema),
        defaultValues: {
            title: "",
            description: "",
            sessionType: SessionType.GROUP_DISCUSSION,
            communicationModes: [CommunicationMode.CHAT],
        },
    });

    // Join session form
    const joinForm = useForm<JoinFormValues>({
        resolver: zodResolver(joinFormSchema),
        defaultValues: {
            code: "",
        },
    });

    // Create session mutation
    const createSession = trpc.session.create.useMutation({
        onSuccess: (data) => {
            toast({
                title: "Success!",
                description: "Your session has been created.",
            });

            // Join the socket room
            if (socket && data?.session?.id) {
                socket.emit("join_room", data.session.id);
            }

            // Navigate to the session
            router.push(`/dashboard/sessions/${data?.session.id}`);
            setIsOpen(false);
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Join session mutation
    const joinSession = trpc.session.join.useMutation({
        onSuccess: (data) => {
            toast({
                title: "Joined!",
                description: `You have joined ${data.session.title}`,
            });

            // Join the socket room
            if (socket && data.session.id) {
                socket.emit("join_room", data.session.id);
            }

            // Navigate to the session
            router.push(`/dashboard/sessions/${data.session.id}`);
            setIsOpen(false);
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Handle create session form submission
    function onCreateSubmit(values: CreateFormValues) {
        createSession.mutate(values);
    }

    // Handle join session form submission
    function onJoinSubmit(values: JoinFormValues) {
        joinSession.mutate({ code: values.code });
    }

    const communicationOptions = [
        { id: CommunicationMode.CHAT, label: "Chat" },
        { id: CommunicationMode.VOICE, label: "Voice" },
        { id: CommunicationMode.VIDEO, label: "Video" },
    ];

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant={buttonVariant} className={className}>
                    {buttonIcon && (variant === "create" ? <Plus className="mr-2 h-4 w-4" /> : <Users className="mr-2 h-4 w-4" />)}
                    {buttonText}
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>
                        {variant === "create"
                            ? "Create Session"
                            : variant === "join"
                                ? "Join Session"
                                : "Session Management"}
                    </SheetTitle>
                    <SheetDescription>
                        {variant === "create"
                            ? "Create a new discussion or interview session"
                            : variant === "join"
                                ? "Join an existing session with a code"
                                : "Create or join a session to collaborate with others"}
                    </SheetDescription>
                </SheetHeader>

                {variant === "both" ? (
                    <Tabs defaultValue={defaultTab} className="mt-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="join">Join Session</TabsTrigger>
                            <TabsTrigger value="create">Create Session</TabsTrigger>
                        </TabsList>

                        <TabsContent value="join" className="mt-4">
                            <Form {...joinForm}>
                                <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
                                    <FormField
                                        control={joinForm.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Session Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter session code" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Enter the code provided by the session creator
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={joinSession.isPending}
                                    >
                                        {joinSession.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Joining...
                                            </>
                                        ) : (
                                            "Join Session"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="create" className="mt-4">
                            <Form {...createForm}>
                                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                                    <FormField
                                        control={createForm.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Session Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter session title" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={createForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe what this session is about"
                                                        className="max-h-32"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={createForm.control}
                                        name="sessionType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Session Type</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a session type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={SessionType.GROUP_DISCUSSION}>
                                                            Group Discussion
                                                        </SelectItem>
                                                        <SelectItem value={SessionType.INTERVIEW}>
                                                            Interview
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={createForm.control}
                                        name="communicationModes"
                                        render={() => (
                                            <FormItem>
                                                <div className="mb-2">
                                                    <FormLabel>Communication Modes</FormLabel>
                                                    <FormDescription>
                                                        Select how participants can communicate
                                                    </FormDescription>
                                                </div>
                                                {communicationOptions.map((option) => (
                                                    <FormField
                                                        key={option.id}
                                                        control={createForm.control}
                                                        name="communicationModes"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={option.id}
                                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(option.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, option.id])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                            (value) => value !== option.id
                                                                                        )
                                                                                    );
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        {option.label}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                ))}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={createSession.isPending}
                                    >
                                        {createSession.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Session"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                ) : variant === "create" ? (
                    <div className="mt-6">
                        <Form {...createForm}>
                            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                                <FormField
                                    control={createForm.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Session Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter session title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={createForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe what this session is about"
                                                    className="max-h-32"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={createForm.control}
                                    name="sessionType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Session Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a session type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value={SessionType.GROUP_DISCUSSION}>
                                                        Group Discussion
                                                    </SelectItem>
                                                    <SelectItem value={SessionType.INTERVIEW}>
                                                        Interview
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={createForm.control}
                                    name="communicationModes"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-2">
                                                <FormLabel>Communication Modes</FormLabel>
                                                <FormDescription>
                                                    Select how participants can communicate
                                                </FormDescription>
                                            </div>
                                            {communicationOptions.map((option) => (
                                                <FormField
                                                    key={option.id}
                                                    control={createForm.control}
                                                    name="communicationModes"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={option.id}
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(option.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, option.id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== option.id
                                                                                    )
                                                                                );
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    {option.label}
                                                                </FormLabel>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={createSession.isPending}
                                >
                                    {createSession.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Session"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>
                ) : (
                    <div className="mt-6">
                        <Form {...joinForm}>
                            <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
                                <FormField
                                    control={joinForm.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Session Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter session code" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the code provided by the session creator
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={joinSession.isPending}
                                >
                                    {joinSession.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Joining...
                                        </>
                                    ) : (
                                        "Join Session"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
