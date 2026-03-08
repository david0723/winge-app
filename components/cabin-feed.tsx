"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, X, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

// Define a type for flight with profile
type Passenger = {
  id: string; // user_flights ID
  user_id: string; // The target user's ID
  flight_number: string;
  flight_date: string;
  seat_number: string;
  profiles: {
    name: string;
    bio: string;
    avatar_url: string;
  };
};

export function CabinFeed({ flight, currentUserId }: { flight: any, currentUserId: string }) {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchPassengers() {
      if (!flight.flight_number || !flight.flight_date) return;

      // Fetch all passengers on the same flight except the current user
      const { data, error } = await supabase
        .from('user_flights')
        .select(`
          id,
          user_id,
          flight_number,
          flight_date,
          seat_number,
          profiles (
            name,
            bio,
            avatar_url
          )
        `)
        .eq('flight_number', flight.flight_number)
        .eq('flight_date', flight.flight_date)
        .neq('user_id', currentUserId);

      if (error) {
        console.error("Error fetching passengers:", error);
      } else {
        // Filter out people we've already interacted with
        const { data: matches } = await supabase
          .from('matches')
          .select('target_id')
          .eq('user_id', currentUserId)
          .eq('flight_number', flight.flight_number)
          .eq('flight_date', flight.flight_date);
        
        const interactedIds = matches?.map(m => m.target_id) || [];
        const filteredPassengers = data?.filter(p => !interactedIds.includes(p.user_id)) || [];
        
        // We know profiles exists because of foreign key, but TypeScript needs convincing
        setPassengers(filteredPassengers as any);
      }
      setLoading(false);
    }

    fetchPassengers();
  }, [flight, currentUserId]);

  const handleInteraction = async (targetUserId: string, action: 'liked' | 'passed') => {
    // Optimistic UI update
    setPassengers(prev => prev.filter(p => p.user_id !== targetUserId));

    // Save interaction to the database
    const { error } = await supabase
      .from('matches')
      .insert({
        user_id: currentUserId,
        target_id: targetUserId,
        flight_number: flight.flight_number,
        flight_date: flight.flight_date,
        status: action
      });
      
    if (error) {
      console.error(`Error saving ${action} interaction:`, error);
    } else if (action === 'liked') {
      // Check for mutual match
      const { data: reciprocalMatch } = await supabase
        .from('matches')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('target_id', currentUserId)
        .eq('flight_number', flight.flight_number)
        .eq('flight_date', flight.flight_date)
        .eq('status', 'liked')
        .single();
        
      if (reciprocalMatch) {
        // It's a mutual match! Upgrade both statuses to 'matched'
        await supabase
          .from('matches')
          .update({ status: 'matched' })
          .or(`and(user_id.eq.${currentUserId},target_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},target_id.eq.${currentUserId})`)
          .eq('flight_number', flight.flight_number)
          .eq('flight_date', flight.flight_date);
          
        alert("It's a Match! Check your Matches tab to see their seat number.");
        router.refresh();
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (passengers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
        <div className="text-4xl mb-4">💺</div>
        <h3 className="text-xl font-bold mb-2">Cabin Empty</h3>
        <p className="text-slate-500 mb-6 max-w-xs">You are the first one here. Be the first to start the party.</p>
        <Button 
          variant="outline" 
          className="rounded-full border-blue-200 text-blue-600 font-semibold"
          onClick={() => {
            navigator.clipboard.writeText(`I'm checking in on Winge! Flight ${flight.flight_number}. See who else is here.`);
            alert("Invite text copied! Share it with your friends on this flight.");
          }}
        >
          Invite Friends on this Flight
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 overflow-y-auto pb-24 hide-scrollbar pt-2">
      {passengers.map((passenger) => (
        <Card key={passenger.id} className="w-full overflow-hidden shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-3xl">
          <div className="h-[400px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
             {passenger.profiles.avatar_url ? (
               <img src={passenger.profiles.avatar_url} alt={passenger.profiles.name} className="w-full h-full object-cover" />
             ) : (
               <div className="text-8xl font-black text-slate-300 dark:text-slate-600 uppercase">
                 {passenger.profiles.name ? passenger.profiles.name.charAt(0) : '?'}
               </div>
             )}
             
             {/* Gradient overlay for text legibility if we were overlaying text */}
             <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
             
             <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-bold text-3xl drop-shadow-md">{passenger.profiles.name}</h3>
                <div className="flex items-center gap-1.5 text-sm font-medium opacity-90 drop-shadow-md">
                   <MapPin className="w-4 h-4" />
                   Seat Revealed on Match
                </div>
             </div>
          </div>
          <CardContent className="p-5 pt-6">
            <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg font-medium">{passenger.profiles.bio || "No bio provided"}</p>
            
            <div className="flex justify-center gap-8">
              <Button 
                variant="outline" 
                size="icon" 
                className="w-16 h-16 rounded-full border-2 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-red-500 hover:border-red-200 transition-all"
                onClick={() => handleInteraction(passenger.user_id, 'passed')}
              >
                <X className="w-8 h-8" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-16 h-16 rounded-full border-2 border-blue-200 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                onClick={() => handleInteraction(passenger.user_id, 'liked')}
              >
                <Heart className="w-8 h-8 fill-current" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}