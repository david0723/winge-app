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
      <div className="flex flex-col items-center justify-center flex-1 text-center p-8 border border-white/10 rounded-[2.5rem] bg-zinc-900/40 backdrop-blur-xl mt-6">
        <div className="text-6xl mb-6">💺</div>
        <h3 className="text-2xl font-black mb-3 text-white tracking-tight">Cabin Empty</h3>
        <p className="text-zinc-400 mb-8 max-w-[250px] text-lg font-medium leading-snug">You are the first one here. Be the first to start the party.</p>
        <Button 
          variant="outline" 
          className="rounded-full border-blue-500/30 bg-blue-500/10 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-colors h-14 px-8"
          onClick={() => {
            navigator.clipboard.writeText(`I'm checking in on Winge! Flight ${flight.flight_number}. See who else is here.`);
            alert("Invite text copied! Share it with your friends on this flight.");
          }}
        >
          Invite Friends
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 overflow-y-auto pb-32 hide-scrollbar pt-6">
      {passengers.map((passenger) => (
        <Card key={passenger.id} className="w-full overflow-hidden border-0 bg-transparent rounded-[2.5rem] relative">
          <div className="h-[65dvh] min-h-[500px] w-full bg-zinc-900 flex items-center justify-center relative overflow-hidden">
             {passenger.profiles.avatar_url ? (
               <img src={passenger.profiles.avatar_url} alt={passenger.profiles.name} className="absolute inset-0 w-full h-full object-cover" />
             ) : (
               <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                 <div className="text-[10rem] font-black text-white/5 uppercase">
                   {passenger.profiles.name ? passenger.profiles.name.charAt(0) : '?'}
                 </div>
               </div>
             )}
             
             {/* Deep gradient overlay for text legibility */}
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"></div>
             
             <div className="absolute bottom-0 left-0 w-full p-6 pt-12 text-white z-10 flex flex-col gap-2">
                <h3 className="font-black text-5xl tracking-tighter drop-shadow-lg">{passenger.profiles.name}</h3>
                
                <div className="flex items-center gap-1.5 text-sm font-bold bg-white/20 backdrop-blur-md w-max px-3 py-1.5 rounded-full mt-1 border border-white/10">
                   <MapPin className="w-4 h-4 text-purple-300" />
                   <span>Seat Revealed on Match</span>
                </div>

                <p className="text-zinc-300 mt-3 text-lg font-medium leading-snug max-w-[90%] line-clamp-3">
                  {passenger.profiles.bio || "No bio provided."}
                </p>
             </div>
          </div>
          
          {/* Floating Action Buttons layered over the card bottom */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-4 z-20">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-16 h-16 rounded-full border-0 bg-zinc-900/60 backdrop-blur-xl text-white hover:bg-red-500 hover:text-white transition-all shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
              onClick={() => handleInteraction(passenger.user_id, 'passed')}
            >
              <X className="w-8 h-8" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="w-16 h-16 rounded-full border-0 bg-blue-600 backdrop-blur-xl text-white hover:bg-blue-500 transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)]"
              onClick={() => handleInteraction(passenger.user_id, 'liked')}
            >
              <Heart className="w-8 h-8 fill-current" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}