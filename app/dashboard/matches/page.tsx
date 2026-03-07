import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { connection } from "next/server";

export default async function MatchesPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch matches where status is 'matched'
  const { data: matchesData, error } = await supabase
    .from('matches')
    .select(`
      id,
      user_id,
      target_id,
      status
    `)
    .eq('status', 'matched')
    .or(`user_id.eq.${user.id},target_id.eq.${user.id}`);

  if (error) {
    console.error("Error fetching matches:", error);
    return <div>Error loading matches.</div>;
  }

  const matches = matchesData || [];

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center p-6 h-[80vh] max-w-lg mx-auto">
        <div className="text-4xl mb-4">💔</div>
        <h3 className="text-xl font-bold mb-2">No Matches Yet</h3>
        <p className="text-slate-500">Keep browsing the cabin to find your mile-high connection.</p>
      </div>
    );
  }

  // We need to fetch the profile details of the matched users
  const matchedUserIds = matches.map(m => m.user_id === user.id ? m.target_id : m.user_id);
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', matchedUserIds);

  return (
    <div className="flex-1 w-full flex flex-col max-w-lg mx-auto p-4 h-screen pt-12">
      <h1 className="text-2xl font-bold mb-6">Your Connections</h1>
      
      <div className="flex flex-col gap-4">
        {profiles?.map((profile) => {
          // Find the corresponding match ID for the chat link
          const match = matches.find(m => m.user_id === profile.id || m.target_id === profile.id);

          return (
            <Link key={profile.id} href={`/dashboard/matches/${match?.id}`} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>{profile.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{profile.name}</h3>
                  <div className="text-sm text-slate-500 font-medium">Seat: {profile.seat_number}</div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                <MessageCircle className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
