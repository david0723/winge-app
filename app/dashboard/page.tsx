import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";
import { AddFlightForm } from "@/components/add-flight-form";
import { connection } from "next/server";
import Link from "next/link";
import { Plane, Calendar, MapPin, ChevronRight } from "lucide-react";

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.name || !profile.bio) {
    return <OnboardingForm userId={user.id} />;
  }

  // Fetch user flights
  const { data: flights } = await supabase
    .from('user_flights')
    .select('*')
    .eq('user_id', user.id)
    .order('flight_date', { ascending: true });

  return (
    <div className="flex-1 w-full flex flex-col max-w-lg mx-auto p-6 h-screen pt-12 bg-black text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-900/20 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black tracking-tighter">My Passes</h1>
      </div>
      
      <div className="flex flex-col gap-5 mb-8 z-10 overflow-y-auto pb-32 hide-scrollbar">
        {(!flights || flights.length === 0) ? (
          <div className="text-center py-16 px-6 border border-white/10 rounded-[2.5rem] bg-zinc-900/40 backdrop-blur-xl">
            <div className="flex justify-center mb-6">
              <div className="p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-sm">
                <Plane className="w-10 h-10 text-zinc-500" />
              </div>
            </div>
            <h3 className="text-2xl font-black mb-3">No Upcoming Flights</h3>
            <p className="text-zinc-400 font-medium">Add your next flight to see who's sitting near you in the cabin.</p>
          </div>
        ) : (
          flights.map((flight) => (
            <Link key={flight.id} href={`/dashboard/flight/${flight.id}`} className="group relative block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              
              <div className="relative overflow-hidden transition-all duration-300 border border-white/10 rounded-[2.5rem] bg-zinc-900/60 backdrop-blur-2xl group-hover:border-blue-500/50">
                {/* Decorative cutouts to look like a ticket */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 bg-black rounded-full border-r border-white/10 z-20" />
                <div className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 bg-black rounded-full border-l border-white/10 z-20" />
                
                {/* Dotted separation line */}
                <div className="absolute top-1/2 -translate-y-1/2 left-6 right-6 border-t-2 border-dashed border-white/10 z-10" />

                <div className="p-8 pb-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-1">Flight No.</div>
                      <div className="text-5xl font-black text-white tracking-tighter">{flight.flight_number}</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors">
                      <ChevronRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="px-8 pt-8 pb-8 bg-white/5 flex justify-between items-center z-20 relative">
                  <div>
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Date</div>
                    <div className="flex items-center gap-1.5 text-md text-white font-bold">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      {new Date(flight.flight_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Seat</div>
                    <div className="flex items-center gap-1.5 text-md text-white font-bold justify-end">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      {flight.seat_number}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-sm z-20 px-6">
        <AddFlightForm userId={user.id} />
      </div>
    </div>
  );
}