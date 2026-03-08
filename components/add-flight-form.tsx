"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Plane, Plus, MapPin, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { searchFlight } from "@/app/actions/flight";

type FlightData = {
  departureCity: string;
  arrivalCity: string;
  airline: string;
  departureTime: string | null;
  arrivalTime: string | null;
};

export function AddFlightForm({ userId }: { userId: string }) {
  const [seatNumber, setSeatNumber] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [flightDate, setFlightDate] = useState("");
  
  const [isSearching, setIsSearching] = useState(false);
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNumber || !flightDate) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    // Call server action
    const result = await searchFlight(flightNumber, flightDate);
    
    setIsSearching(false);
    
    if (result.error) {
      setSearchError(result.error);
    } else if (result.flight) {
      setFlightData(result.flight);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightData) return;
    
    setIsSaving(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from('user_flights')
      .insert({ 
        user_id: userId, 
        seat_number: seatNumber, 
        flight_number: flightNumber, 
        flight_date: flightDate,
        departure_airport: flightData.departureCity,
        arrival_airport: flightData.arrivalCity,
        airline: flightData.airline
      });

    setIsSaving(false);

    if (error) {
      console.error(error);
      alert("Error adding flight. You might have already added it.");
    } else {
      setIsOpen(false);
      // Reset form
      setSeatNumber("");
      setFlightNumber("");
      setFlightDate("");
      setFlightData(null);
      router.refresh();
    }
  };

  // Format time if available
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "--:--";
    try {
      // The API often returns "2026-03-08 08:30Z" or similar
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setFlightData(null);
        setSearchError(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 rounded-full py-7 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 border-0">
          <Plus className="w-6 h-6" /> Add a Flight
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 text-white shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {!flightData ? (
          // STEP 1: Search Flight
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
                <Plane className="w-7 h-7 text-blue-500" />
                Find Your Flight
              </DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium text-base">
                Enter your flight number to verify your route.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSearch} className="space-y-5 mt-6">
              <div className="space-y-2.5">
                <Label htmlFor="flightNumber" className="text-zinc-300 font-bold ml-1">Flight Number</Label>
                <Input id="flightNumber" required value={flightNumber} onChange={e => setFlightNumber(e.target.value.toUpperCase())} placeholder="e.g. AA123" className="bg-black/50 border-white/10 text-white rounded-2xl h-14 px-5 focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:border-transparent transition-all font-medium text-lg uppercase" />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="flightDate" className="text-zinc-300 font-bold ml-1">Flight Date</Label>
                <Input id="flightDate" type="date" required value={flightDate} onChange={e => setFlightDate(e.target.value)} className="bg-black/50 border-white/10 text-white rounded-2xl h-14 px-5 focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:border-transparent transition-all font-medium" />
              </div>

              {searchError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
                  {searchError}
                </div>
              )}

              <Button type="submit" className="w-full h-14 rounded-full bg-white text-black hover:bg-zinc-200 font-bold text-lg mt-8 transition-all" disabled={isSearching}>
                {isSearching ? "Searching..." : "Lookup Flight"}
              </Button>
            </form>
          </>
        ) : (
          // STEP 2: Confirm & Seat Number
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
                <Plane className="w-7 h-7 text-blue-500" />
                Confirm Boarding
              </DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium text-base">
                Verify this is your flight and claim your seat.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 p-5 border border-white/10 rounded-3xl bg-zinc-900/60 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 text-xs font-black text-blue-500 bg-blue-500/10 rounded-bl-3xl">{flightData.airline}</div>
               
               <div className="flex justify-between items-center mt-2 mb-6">
                 <div className="text-center">
                    <div className="text-3xl font-black">{flightData.departureCity}</div>
                    <div className="text-xs text-zinc-500 font-bold mt-1 uppercase flex items-center justify-center gap-1"><Clock className="w-3 h-3"/> {formatTime(flightData.departureTime)}</div>
                 </div>
                 <Plane className="w-6 h-6 text-zinc-600" />
                 <div className="text-center">
                    <div className="text-3xl font-black">{flightData.arrivalCity}</div>
                    <div className="text-xs text-zinc-500 font-bold mt-1 uppercase flex items-center justify-center gap-1"><Clock className="w-3 h-3"/> {formatTime(flightData.arrivalTime)}</div>
                 </div>
               </div>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5 mt-6">
              <div className="space-y-2.5">
                <Label htmlFor="seatNumber" className="text-zinc-300 font-bold ml-1">Your Seat Number</Label>
                <Input id="seatNumber" required value={seatNumber} onChange={e => setSeatNumber(e.target.value.toUpperCase())} placeholder="e.g. 12B" className="bg-black/50 border-white/10 text-white rounded-2xl h-14 px-5 focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:border-transparent transition-all font-medium text-lg uppercase" />
                <p className="text-xs text-purple-400 font-bold ml-1">Only revealed to mutual matches.</p>
              </div>

              <div className="flex gap-3 mt-8">
                <Button type="button" variant="outline" onClick={() => setFlightData(null)} className="flex-1 h-14 rounded-full border-white/10 bg-transparent text-white hover:bg-white/5 font-bold text-lg transition-all" disabled={isSaving}>
                  Back
                </Button>
                <Button type="submit" className="flex-1 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]" disabled={isSaving}>
                  {isSaving ? "Checking In..." : "Check In"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
