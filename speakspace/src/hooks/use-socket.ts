import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type SocketMessage = {
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

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Create socket connection
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
            withCredentials: true,
        });

        // Set up event listeners
        socketInstance.on('connect', () => {
            setIsConnected(true);
            console.log('Socket connected');
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket disconnected');
        });

        // Save socket instance
        setSocket(socketInstance);

        // Clean up on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return { socket, isConnected };
};