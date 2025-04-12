"use client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { trpc } from "../trpc/client";
import { useToast } from "@/hooks/use-toast";
import { UserType } from '@prisma/client';
import { useRouter } from "next/navigation";

// Map your database enum to display values
const ROLE_DISPLAY_NAMES: Record<UserType, string> = {
    [UserType.HR]: "HR (Human Resources)",
    [UserType.STUDENT]: "Student",
    [UserType.JOBSEEKER]: "Job Seeker",
    [UserType.EMPLOYEE]: "Employee",
};

// Get the enum values as an array
const USER_ROLES = Object.values(UserType) as UserType[];

export default function RoleSelectionPage() {
    const [selectedRole, setSelectedRole] = useState<UserType>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const editMutation = trpc.auth.updateDetails.useMutation({
        onSuccess: () => {
            setIsSubmitting(false);
            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully.",
                variant: "success",
            });
            router.push("/dashboard"); // Redirect to the dashboard or any other page
        },
        onError: (error) => {
            console.error(error.message);
            setIsSubmitting(false);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    const handleSubmit = async () => {
        if (!selectedRole) return;
        setIsSubmitting(true);
        editMutation.mutate({
            userType: selectedRole,
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-semibold">
                        Complete Your Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground text-center">
                            Please select your primary role to help us personalize your experience.
                        </p>

                        <Select
                            value={selectedRole}
                            onValueChange={(value: UserType) => setSelectedRole(value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select your role..." />
                            </SelectTrigger>
                            <SelectContent>
                                {USER_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {ROLE_DISPLAY_NAMES[role]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        className="w-full"
                        disabled={!selectedRole || isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Continue"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}