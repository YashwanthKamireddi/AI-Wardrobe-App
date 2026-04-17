/**
 * STYLE QUIZ PAGE
 *
 * Full-page wrapper for the Style Quiz component.
 * Saves results to user profile and redirects to home.
 */

import { useLocation } from "wouter";
import { StyleQuiz } from "@/components/style-quiz";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export function StyleQuizPage() {
    const [, navigate] = useLocation();
    const { toast } = useToast();

    const saveProfileMutation = useMutation({
        mutationFn: async (profile: any) => {
            // Save to localStorage for now, can be moved to API later
            localStorage.setItem("vessura_style_profile", JSON.stringify(profile));
            return profile;
        },
        onSuccess: () => {
            toast({
                title: "Style Profile Created!",
                description: "Your personalized recommendations are ready.",
            });
            navigate("/");
        },
    });

    const handleComplete = (profile: any) => {
        saveProfileMutation.mutate(profile);
    };

    const handleSkip = () => {
        navigate("/");
    };

    return (
        <StyleQuiz
            onComplete={handleComplete}
            onSkip={handleSkip}
        />
    );
}

export default StyleQuizPage;
