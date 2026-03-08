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
    <div className="flex-1 w-full flex flex-col max-w-lg mx-auto p-6 h-[100dvh] pt-12 bg-black text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      <h1 className="text-4xl font-black tracking-tighter mb-10">Profile</h1>
      
      <div className="flex flex-col items-center gap-5 mb-10">
        <Avatar className="w-32 h-32 border-4 border-zinc-900 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <AvatarImage src={profile.avatar_url} className="object-cover" />
          <AvatarFallback className="text-4xl bg-zinc-800 text-zinc-400 font-bold">{profile.name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight">{profile.name}</h2>
          <p className="text-zinc-500 font-medium mt-1">{user.email}</p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        <div className="bg-zinc-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-lg text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-xs font-bold text-zinc-500 mb-4 uppercase tracking-widest relative z-10">Your Icebreaker</h3>
          <p className="text-white font-medium text-xl leading-snug relative z-10">{profile.bio || "No bio set. Add one to get more matches!"}</p>
        </div>
      </div>

      <div className="mt-auto pb-32">
        <LogoutButton />
      </div>
    </div>
  );
}
