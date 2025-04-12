"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/hooks/use-socket";

interface Participant {
    id: string;
    username: string;
    imageUrl: string | null;
    isActive?: boolean;
}

interface SessionParticipantListProps {
    sessionId: string;
    initialParticipants: Participant[];
}

export function SessionParticipantList({
    sessionId,
    initialParticipants = [],
}: SessionParticipantListProps) {
    const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Join the session room
        socket.emit("join_room", sessionId);

        // Listen for participant updates
        socket.on("participant_joined", (participant: Participant) => {
            setParticipants((prev) => {
                // Check if participant already exists
                if (prev.some((p) => p.id === participant.id)) {
                    return prev.map((p) =>
                        p.id === participant.id ? { ...p, isActive: true } : p
                    );
                }
                // Add new participant
                return [...prev, { ...participant, isActive: true }];
            });
        });

        socket.on("participant_left", (participantId: string) => {
            setParticipants((prev) =>
                prev.map((p) =>
                    p.id === participantId ? { ...p, isActive: false } : p
                )
            );
        });

        socket.on("participants_list", (participantsList: Participant[]) => {
            setParticipants(participantsList);
        });

        // Request current participants list
        socket.emit("get_participants", sessionId);

        return () => {
            socket.off("participant_joined");
            socket.off("participant_left");
            socket.off("participants_list");
            socket.emit("leave_room", sessionId);
        };
    }, [socket, isConnected, sessionId]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Participants ({participants.filter(p => p.isActive !== false).length})</h3>
            </div>
            <div className="space-y-2">
                {participants.map((participant) => (
                    <div
                        key={participant.id}
                        className={`flex items-center gap-2 rounded-md p-2 ${participant.isActive === false ? "opacity-50" : ""
                            }`}
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.imageUrl || `/placeholder.svg?height=32&width=32&text=${participant.username.charAt(0)}`} />
                            <AvatarFallback>{participant.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{participant.username}</span>
                        {participant.isActive === false && (
                            <Badge variant="outline" className="ml-auto text-xs">
                                Left
                            </Badge>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
