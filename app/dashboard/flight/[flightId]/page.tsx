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
    <div className="flex-1 w-full flex flex-col max-w-lg mx-auto p-4 h-screen">
      <div className="flex items-center gap-3 mb-6 pt-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full -ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold leading-tight">The Cabin</h1>
          <p className="text-slate-500 text-sm font-medium">
            {flight.flight_number} • {new Date(flight.flight_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}
          </p>
        </div>
      </div>
      
      <CabinFeed flight={flight} currentUserId={user.id} />
    </div>
  );
}