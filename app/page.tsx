import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Plane, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div className="flex-1 w-full flex flex-col items-center">
        {/* Navbar */}
        <nav className="w-full flex justify-center border-b border-b-slate-200 dark:border-b-slate-800 h-16 bg-white dark:bg-slate-900">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-2 items-center font-bold text-lg tracking-tight">
              <Plane className="w-6 h-6 text-blue-600" />
              <span>Winge</span>
            </div>
            <div>
              <AuthButton />
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center items-center gap-8 max-w-3xl p-6 text-center w-full mt-10 md:mt-20">
          <div className="flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Heart className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
            Join the <span className="text-blue-600">Mile High Club</span>... before boarding.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Connect with fellow passengers on your exact flight. Find your connection at 30,000 feet. It's like Hinge, but for flights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-6">
            <Button asChild size="lg" className="text-lg px-8 py-6 w-full sm:w-auto rounded-full font-semibold">
              <Link href="/auth/sign-up">Start Boarding</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 w-full sm:w-auto rounded-full font-semibold">
              <Link href="/auth/login">I already have a ticket</Link>
            </Button>
          </div>
        </div>

        {/* Features/Tongue-in-cheek section */}
        <div className="w-full bg-white dark:bg-slate-900 py-16 px-6 mt-16 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl mb-2">✈️</div>
              <h3 className="font-bold text-xl">Enter your flight</h3>
              <p className="text-slate-500">Just type your flight number and date. No confusing boarding pass scans.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl mb-2">👀</div>
              <h3 className="font-bold text-xl">Browse the Cabin</h3>
              <p className="text-slate-500">See who else is flying with you. Send a like if you see someone interesting.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl mb-2">💺</div>
              <h3 className="font-bold text-xl">Seat Reveal</h3>
              <p className="text-slate-500">Mutual match? We reveal your seat numbers and open a private chat to meet at the gate.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full flex flex-col md:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 p-6 text-sm text-slate-500 bg-slate-50 dark:bg-slate-950">
          <p>
            © 2024 Winge. A very serious app.
          </p>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </footer>
      </div>
    </main>
  );
}
