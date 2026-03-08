"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

export function OnboardingForm({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
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
        bio
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
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-center text-2xl">Create Your Profile</CardTitle>
          <CardDescription className="text-center">
            Set up your identity before joining the cabin.
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

            <Button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Saving..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
