"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plane } from "lucide-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 items-center w-full", className)} {...props}>
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Plane className="w-10 h-10 text-blue-500" />
      </Link>

      <div className="w-full bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tighter mb-2 text-white">Get Your Pass</h1>
          <p className="text-zinc-400 font-medium text-lg">Join the club at 30,000 feet.</p>
        </div>

        <form onSubmit={handleSignUp}>
          <div className="flex flex-col gap-5">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-zinc-300 font-semibold ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-white/10 text-white rounded-2xl h-14 px-5 focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:border-transparent transition-all"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-zinc-300 font-semibold ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-white/10 text-white rounded-2xl h-14 px-5 focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:border-transparent transition-all"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="repeat-password" className="text-zinc-300 font-semibold ml-1">Repeat Password</Label>
              <Input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="bg-black/50 border-white/10 text-white rounded-2xl h-14 px-5 focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:border-transparent transition-all"
              />
            </div>
            
            {error && <p className="text-sm text-red-400 font-medium text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}
            
            <Button type="submit" className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg mt-4 transition-all" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </div>
          
          <div className="mt-8 text-center text-zinc-400 font-medium">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-white hover:text-blue-400 transition-colors font-bold">
              Check In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}