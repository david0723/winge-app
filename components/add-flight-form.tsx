"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function AddFlightForm({ userId }: { userId: string }) {
  const [seatNumber, setSeatNumber] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from('user_flights')
      .insert({ 
        user_id: userId, 
        seat_number: seatNumber, 
        flight_number: flightNumber, 
        flight_date: flightDate 
      });

    setIsLoading(false);

    if (error) {
      console.error(error);
      alert("Error adding flight. You might have already added it.");
    } else {
      setIsOpen(false);
      // Reset form
      setSeatNumber("");
      setFlightNumber("");
      setFlightDate("");
      router.refresh();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 rounded-full py-7 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 border-0">
          <Plus className="w-6 h-6" /> Add a Flight
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 text-white shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
            <Plane className="w-7 h-7 text-blue-500" />
            Check In to a Flight
          </DialogTitle>
          <DialogDescription className="text-zinc-400 font-medium text-base">
            Enter your upcoming flight details to see who else is boarding.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-5 mt-6">
          <div className="space-y-2.5">
            <Label htmlFor="flightNumber" className="text-zinc-300 font-bold ml-1">Flight Number</Label>
            <Input id="flightNumber" required value={flightNumber} onChange={e => setFlightNumber(e.target.value.toUpperCase())} placeholder="e.g. AA123" className="bg-black/50 border-white/10 text-white rounded-2xl h-14 px-5 focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:border-transparent transition-all font-medium text-lg uppercase" />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="flightDate" className="text-zinc-300 font-bold ml-1">Flight Date</Label>
            <Input id="flightDate" type="date" required value={flightDate} onChange={e => setFlightDate(e.target.value)} className="bg-black/50 border-white/10 text-white rounded-2xl h-14 px-5 focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:border-transparent transition-all font-medium" />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="seatNumber" className="text-zinc-300 font-bold ml-1">Your Seat Number</Label>
            <Input id="seatNumber" required value={seatNumber} onChange={e => setSeatNumber(e.target.value.toUpperCase())} placeholder="e.g. 12B" className="bg-black/50 border-white/10 text-white rounded-2xl h-14 px-5 focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:border-transparent transition-all font-medium text-lg uppercase" />
            <p className="text-xs text-purple-400 font-bold ml-1">Only revealed to mutual matches.</p>
          </div>

          <Button type="submit" className="w-full h-14 rounded-full bg-white text-black hover:bg-zinc-200 font-bold text-lg mt-8 transition-all" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Flight"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
