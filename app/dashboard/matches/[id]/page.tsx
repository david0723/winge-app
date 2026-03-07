import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/chat-interface";
import { connection } from "next/server";

export default async function MatchChatPage({ params }: { params: { id: string } }) {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const matchId = params.id;

  // Verify the user is part of this match
  const { data: match, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();

  if (error || !match || (match.user_id !== user.id && match.target_id !== user.id) || match.status !== 'matched') {
    redirect("/dashboard/matches");
  }

  const targetUserId = match.user_id === user.id ? match.target_id : match.user_id;

  // Fetch target profile
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, seat_number')
    .eq('id', targetUserId)
    .single();

  if (!targetProfile) {
    return <div>Error loading match profile.</div>;
  }

  // Fetch initial messages
  const { data: initialMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  return (
    <div className="flex-1 w-full flex flex-col h-screen overflow-hidden">
      <ChatInterface 
        matchId={matchId}
        currentUserId={user.id}
        targetProfile={targetProfile}
        initialMessages={initialMessages || []}
      />
    </div>
  );
}
