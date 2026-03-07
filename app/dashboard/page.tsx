import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";
import { CabinFeed } from "@/components/cabin-feed";
import { connection } from "next/server";

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

  if (!profile || !profile.flight_number || !profile.flight_date) {
    return <OnboardingForm userId={user.id} />;
  }

  return (
    <div className="flex-1 w-full flex flex-col max-w-lg mx-auto p-4 h-screen">
      <h1 className="text-2xl font-bold mb-2">The Cabin</h1>
      <p className="text-slate-500 text-sm mb-6">Flight {profile.flight_number} • {profile.flight_date}</p>
      
      <CabinFeed profile={profile} />
    </div>
  );
}
