"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { useRouter } from "next/navigation";

// Define a type for profiles (excluding seat_number for security in the frontend until matched)
type Profile = {
  id: string;
  name: string;
  bio: string;
  avatar_url: string;
  flight_number: string;
  flight_date: string;
};

export function CabinFeed({ profile }: { profile: Profile }) {
  const [passengers, setPassengers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchPassengers() {
      if (!profile.flight_number || !profile.flight_date) return;

      // Fetch all passengers on the same flight except the current user
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, bio, avatar_url, flight_number, flight_date')
        .eq('flight_number', profile.flight_number)
        .eq('flight_date', profile.flight_date)
        .neq('id', profile.id);

      if (error) {
        console.error("Error fetching passengers:", error);
      } else {
        // Also we need to filter out people we've already interacted with
        const { data: matches } = await supabase
          .from('matches')
          .select('target_id')
          .eq('user_id', profile.id);
        
        const interactedIds = matches?.map(m => m.target_id) || [];
        const filteredPassengers = data?.filter(p => !interactedIds.includes(p.id)) || [];
        
        setPassengers(filteredPassengers);
      }
      setLoading(false);
    }

    fetchPassengers();
  }, [profile]);

  const handleInteraction = async (targetId: string, action: 'liked' | 'passed') => {
    // Optimistic UI update
    setPassengers(prev => prev.filter(p => p.id !== targetId));

    // Save interaction to the database
    const { error } = await supabase
      .from('matches')
      .insert({
        user_id: profile.id,
        target_id: targetId,
        status: action
      });
      
    if (error) {
      console.error(`Error saving ${action} interaction:`, error);
    } else if (action === 'liked') {
      // Check for mutual match
      const { data: reciprocalMatch } = await supabase
        .from('matches')
        .select('id')
        .eq('user_id', targetId)
        .eq('target_id', profile.id)
        .eq('status', 'liked')
        .single();
        
      if (reciprocalMatch) {
        // It's a mutual match! Upgrade both statuses to 'matched'
        await supabase
          .from('matches')
          .update({ status: 'matched' })
          .or(`and(user_id.eq.${profile.id},target_id.eq.${targetId}),and(user_id.eq.${targetId},target_id.eq.${profile.id})`);
          
        alert("It's a Match! Check your Matches tab to see their seat number.");
        router.refresh();
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (passengers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="text-4xl mb-4">💺</div>
        <h3 className="text-xl font-bold mb-2">Cabin Empty</h3>
        <p className="text-slate-500">You are the first one here. Check back closer to boarding time or when others join the flight.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 overflow-y-auto pb-24 hide-scrollbar">
      {passengers.map((passenger) => (
        <Card key={passenger.id} className="w-full overflow-hidden shadow-sm border-slate-200 dark:border-slate-800">
          <div className="h-64 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
             {/* If no avatar, show a placeholder colored block or initials */}
             {passenger.avatar_url ? (
               <img src={passenger.avatar_url} alt={passenger.name} className="w-full h-full object-cover" />
             ) : (
               <div className="text-6xl font-bold text-slate-300 dark:text-slate-600">
                 {passenger.name ? passenger.name.charAt(0).toUpperCase() : '?'}
               </div>
             )}
          </div>
          <CardContent className="p-5">
            <h3 className="font-bold text-2xl mb-2">{passenger.name}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{passenger.bio || "No bio provided"}</p>
            
            <div className="flex justify-center gap-6 mt-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="w-14 h-14 rounded-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => handleInteraction(passenger.id, 'passed')}
              >
                <X className="w-6 h-6" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-14 h-14 rounded-full border-blue-200 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => handleInteraction(passenger.id, 'liked')}
              >
                <Heart className="w-6 h-6 fill-current" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
