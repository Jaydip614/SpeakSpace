// src/app/sessions/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CommunicationMode, SessionType } from "@prisma/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCopy, Share } from "lucide-react";
import { trpc } from "@/app/trpc/client";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
    title: z.string().min(3, {
        message: "Title must be at least 3 characters.",
    }),
    description: z.string().optional(),
    sessionType: z.nativeEnum(SessionType),
    communicationModes: z.array(z.nativeEnum(CommunicationMode)).min(1, {
        message: "Select at least one communication mode.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateSessionPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [joinLink, setJoinLink] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            sessionType: SessionType.GROUP_DISCUSSION,
            communicationModes: [CommunicationMode.CHAT],
        },
    });

    const createSession = trpc.session.create.useMutation({
        onSuccess: (data) => {
            setJoinLink(data?.joinLink ?? "");
            toast({
                title: "Success!",
                description: "Your session has been created.",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    function onSubmit(values: FormValues) {
        createSession.mutate(values);
    }

    async function copyToClipboard(text: string) {
        await navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Link copied to clipboard",
        });
    }

    const communicationOptions = [
        { id: CommunicationMode.CHAT, label: "Chat" },
        { id: CommunicationMode.VOICE, label: "Voice" },
        { id: CommunicationMode.VIDEO, label: "Video" },
    ];

    if (joinLink) {
        return (
            <div className="container max-w-2xl py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Session Created!</CardTitle>
                        <CardDescription>
                            Your session has been created successfully. Share this link with others to join.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Input value={joinLink} readOnly />
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => copyToClipboard(joinLink)}
                            >
                                <ClipboardCopy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => router.push("/sessions")}>
                            View My Sessions
                        </Button>
                        <Button onClick={() => router.replace(joinLink)}>
                            Enter Session
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Create a New Session</CardTitle>
                    <CardDescription>
                        Set up a new discussion or interview session
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
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
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe what this session is about"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
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
                                control={form.control}
                                name="communicationModes"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-4">
                                            <FormLabel>Communication Modes</FormLabel>
                                            <FormDescription>
                                                Select how participants can communicate
                                            </FormDescription>
                                        </div>
                                        {communicationOptions.map((option) => (
                                            <FormField
                                                key={option.id}
                                                control={form.control}
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
                                {createSession.isPending ? "Creating..." : "Create Session"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}