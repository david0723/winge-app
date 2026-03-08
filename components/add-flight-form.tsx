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
        <Button className="w-full gap-2 rounded-full py-6 text-md font-semibold bg-blue-600 hover:bg-blue-700">
          <Plus className="w-5 h-5" /> Add a Flight
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plane className="w-6 h-6 text-blue-600" />
            Check In to a Flight
          </DialogTitle>
          <DialogDescription>
            Enter your upcoming flight details to see who else is boarding.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="flightNumber">Flight Number</Label>
            <Input id="flightNumber" required value={flightNumber} onChange={e => setFlightNumber(e.target.value.toUpperCase())} placeholder="e.g. AA123" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flightDate">Flight Date</Label>
            <Input id="flightDate" type="date" required value={flightDate} onChange={e => setFlightDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seatNumber">Your Seat Number</Label>
            <Input id="seatNumber" required value={seatNumber} onChange={e => setSeatNumber(e.target.value)} placeholder="e.g. 12B" />
            <p className="text-xs text-slate-500">Only revealed to mutual matches.</p>
          </div>

          <Button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Flight"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
