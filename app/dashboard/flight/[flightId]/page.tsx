import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CabinFeed } from "@/components/cabin-feed";
import { connection } from "next/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function FlightCabinPage({ params }: { params: { flightId: string } }) {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch the specific flight details
  const { data: flight, error } = await supabase
    .from('user_flights')
    .select('*')
    .eq('id', params.flightId)
    .eq('user_id', user.id)
    .single();

  if (error || !flight) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 w-full flex flex-col max-w-lg mx-auto p-0 h-[100dvh] bg-black text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-blue-900/20 blur-[100px] pointer-events-none -z-10" />

      <div className="flex items-center gap-3 px-6 py-6 pt-8 z-10 relative bg-black/40 backdrop-blur-xl border-b border-white/5">
        <Button variant="ghost" size="icon" asChild className="rounded-full -ml-2 hover:bg-white/10 text-white">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-black leading-tight tracking-tight">The Cabin</h1>
          <p className="text-zinc-400 text-sm font-medium">
            {flight.flight_number} • {new Date(flight.flight_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}
          </p>
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-hidden flex flex-col">
        <CabinFeed flight={flight} currentUserId={user.id} />
      </div>
    </div>
  );
}