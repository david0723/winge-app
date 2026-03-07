"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane } from "lucide-react";

export function OnboardingForm({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();
    
    // Using upsert since the trigger might have created the row already
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        name, 
        bio, 
        seat_number: seatNumber, 
        flight_number: flightNumber, 
        flight_date: flightDate 
      });

    setIsLoading(false);

    if (error) {
      console.error(error);
      alert("Error saving profile");
    } else {
      router.refresh();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Plane className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-center text-2xl">Prepare for Takeoff</CardTitle>
          <CardDescription className="text-center">
            Enter your details to join the cabin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="First Name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Icebreaker)</Label>
              <Input id="bio" required value={bio} onChange={e => setBio(e.target.value)} placeholder="Heading to a conference..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seatNumber">Seat Number</Label>
              <Input id="seatNumber" required value={seatNumber} onChange={e => setSeatNumber(e.target.value)} placeholder="e.g. 12B" />
              <p className="text-xs text-slate-500">Only revealed to your matches.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flightNumber">Flight Number</Label>
              <Input id="flightNumber" required value={flightNumber} onChange={e => setFlightNumber(e.target.value.toUpperCase())} placeholder="e.g. AA123" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flightDate">Flight Date</Label>
              <Input id="flightDate" type="date" required value={flightDate} onChange={e => setFlightDate(e.target.value)} />
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? "Saving..." : "Check In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
