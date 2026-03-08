import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plane, Clock } from "lucide-react";
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
      flight_number,
      flight_date,
      status
    `)
    .eq('status', 'matched')
    .or(`user_id.eq.${user.id},target_id.eq.${user.id}`)
    .order('flight_date', { ascending: false });

  if (error) {
    console.error("Error fetching matches:", error);
    return <div>Error loading matches.</div>;
  }

  const matches = matchesData || [];

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center p-6 h-[80vh] max-w-lg mx-auto">
        <div className="text-4xl mb-4 p-6 bg-slate-100 dark:bg-slate-800 rounded-full">💔</div>
        <h3 className="text-2xl font-bold mb-2">No Connections Yet</h3>
        <p className="text-slate-500 max-w-xs">Keep checking your flights. Matches automatically disappear 24 hours after landing.</p>
        <Button asChild className="mt-8 rounded-full bg-blue-600 hover:bg-blue-700">
           <Link href="/dashboard">Return to Cabin</Link>
        </Button>
      </div>
    );
  }

  // We need to fetch the profile details of the matched users
  const matchedUserIds = matches.map(m => m.user_id === user.id ? m.target_id : m.user_id);
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', matchedUserIds);

  // We also need to fetch their seat numbers for those specific flights
  // Wait, we can just fetch all user_flights for the matched users on those flights
  // Or we can just join user_flights when fetching profiles? Let's just do a second query
  
  const { data: flightSeats } = await supabase
    .from('user_flights')
    .select('user_id, flight_number, flight_date, seat_number')
    .in('user_id', matchedUserIds);

  return (
    <div className="flex-1 w-full flex flex-col max-w-lg mx-auto p-6 h-[100dvh] pt-12 bg-black text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-900/20 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black tracking-tighter">Matches</h1>
        <div className="text-xs font-bold bg-white/10 text-zinc-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md border border-white/5">
          <Clock className="w-3.5 h-3.5" /> 24h Auto-delete
        </div>
      </div>
      
      <div className="flex flex-col gap-4 pb-32 overflow-y-auto hide-scrollbar z-10">
        {matches.map((match) => {
          const targetUserId = match.user_id === user.id ? match.target_id : match.user_id;
          const profile = profiles?.find(p => p.id === targetUserId);
          
          // Find their seat for this specific flight
          const targetFlight = flightSeats?.find(f => 
            f.user_id === targetUserId && 
            f.flight_number === match.flight_number &&
            f.flight_date === match.flight_date
          );

          if (!profile) return null;

          return (
            <Link key={match.id} href={`/dashboard/matches/${match.id}`} className="flex items-center justify-between p-5 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] hover:bg-zinc-800/60 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] group">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border border-white/10 shadow-sm">
                  <AvatarImage src={profile.avatar_url} className="object-cover" />
                  <AvatarFallback className="text-xl bg-blue-900 text-blue-200 font-bold">{profile.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-black text-xl leading-tight text-white mb-1">{profile.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold mt-1 bg-black/40 w-max px-2.5 py-1 rounded-md border border-white/5">
                    <Plane className="w-3.5 h-3.5 text-blue-400" /> 
                    {match.flight_number} • Seat <span className="text-purple-400 ml-0.5">{targetFlight?.seat_number || 'Hidden'}</span>
                  </div>
                </div>
              </div>
              <div className="p-3.5 bg-white/5 text-blue-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <MessageCircle className="w-6 h-6" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
