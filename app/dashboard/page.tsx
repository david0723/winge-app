import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";
import { AddFlightForm } from "@/components/add-flight-form";
import { connection } from "next/server";
import Link from "next/link";
import { Plane, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="flex-1 w-full flex flex-col max-w-lg mx-auto p-4 h-screen pt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Boarding Passes</h1>
      </div>
      
      <div className="flex flex-col gap-4 mb-8">
        {(!flights || flights.length === 0) ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                <Plane className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">No Upcoming Flights</h3>
            <p className="text-slate-500 mb-6">Add your next flight to see who's sitting near you.</p>
          </div>
        ) : (
          flights.map((flight) => (
            <Link key={flight.id} href={`/dashboard/flight/${flight.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-all border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 group cursor-pointer">
                <div className="h-2 w-full bg-blue-600"></div>
                <CardContent className="p-0">
                  <div className="flex justify-between items-center p-5">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Flight</div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{flight.flight_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 font-medium mb-1 justify-end">
                        <Calendar className="w-4 h-4" />
                        {new Date(flight.flight_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 font-medium justify-end">
                        <MapPin className="w-4 h-4" />
                        Seat {flight.seat_number}
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Enter Cabin →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      <div className="mt-auto pb-6">
        <AddFlightForm userId={user.id} />
      </div>
    </div>
  );
}