import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const registerSchema = insertUserSchema
  .pick({
    username: true,
    password: true,
    name: true,
    email: true,
  })
  .extend({
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }).optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation, isLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      email: "",
    },
  });

  function onLoginSubmit(values: LoginValues) {
    loginMutation.mutate(values);
  }

  function onRegisterSubmit(values: RegisterValues) {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Hero Section */}
      <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="max-w-[500px] mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to Cher's Closet
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your personal stylist, helping you look your best every day with outfit recommendations based on your mood and the weather.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                  <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Smart Wardrobe Management</h3>
                <p className="text-muted-foreground">Easily organize your clothing with AI categorization</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M8 16.02A6 6 0 0 1 4.98 13H2" />
                  <path d="M22 12h-4c0-2.21-1.79-4-4-4" />
                  <path d="M20 17.5c0 .83-.67 1.5-1.5 1.5S17 18.33 17 17.5s.67-1.5 1.5-1.5" />
                  <path d="M15.42 13a4 4 0 0 0 0 5.66" />
                  <path d="M12 22s-2-1.9-2-3.5c0-.84.5-1.5 1.11-1.5.61 0 .89.41.89 1" />
                  <path d="M14 22s2-1.9 2-3.5c0-.84-.5-1.5-1.11-1.5-.61 0-.89.41-.89 1" />
                  <path d="M8 15h.01" />
                  <path d="M2 12h.01" />
                  <path d="M12 2C6.5 2 2 6.5 2 12c0 1.4.3 2.7.81 3.92" />
                  <path d="M8 8a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0" />
                  <path d="M16 12c3.31 0 6-2.69 6-6s-2.69-6-6-6c-2.1 0-4 1.1-5.09 2.77" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Weather-Aware Suggestions</h3>
                <p className="text-muted-foreground">Get outfit recommendations based on current weather</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M17 17c.3-1 .5-2.6.5-4 0-2.5-.8-4.5-2-5.3m0 0c-.4-.3-.9-.4-1.5-.4-3.1.3-6 4.1-6 9.7 0 .2 0 1.3.5 2.6.5 1.3 2.2 2.8 4.5 2.8 2.3 0 3.9-.7 4.4-1.5.5-.8.7-1.5.7-1.9" />
                  <path d="M8 15c-.4-.5-1-1.3-1-2.3 0-1.2 1-2.4 2.5-2.7" />
                  <path d="M2 9V5h4" />
                  <path d="M22 9V5h-4" />
                  <path d="M22 19h-4v-4" />
                  <path d="M2 19h4v-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Mood-Based Styling</h3>
                <p className="text-muted-foreground">Express yourself with fashion that matches your mood</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Forms */}
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <Tabs defaultValue="login">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Cher's Closet</CardTitle>
                <TabsList>
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                Your personal stylist app for perfect outfits every day
              </CardDescription>
            </CardHeader>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Log in"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}