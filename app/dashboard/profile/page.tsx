import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { connection } from "next/server";

export default async function ProfilePage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return <div>Profile not found.</div>;
  }

  return (
    <div className="flex-1 w-full flex flex-col max-w-lg mx-auto p-6 h-screen pt-12">
      <h1 className="text-2xl font-bold mb-8">Profile</h1>
      
      <div className="flex flex-col items-center gap-4 mb-8">
        <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-900 shadow-sm">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="text-2xl">{profile.name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Your Icebreaker</h3>
          <p className="text-slate-800 dark:text-slate-200 font-medium text-lg leading-relaxed">{profile.bio || "No bio set. Add one to get more matches!"}</p>
        </div>
      </div>

      <div className="mt-auto pb-6">
        <LogoutButton />
      </div>
    </div>
  );
}
