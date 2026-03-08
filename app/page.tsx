import { AuthButton } from "@/components/auth-button";
import { Plane, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-black text-white relative overflow-hidden">
      
      {/* Background Glows (Glassmorphism 2.0 Base) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-900/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-900/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex-1 w-full flex flex-col items-center z-10">
        {/* Navbar - Ultra minimal */}
        <nav className="w-full flex justify-center h-20 bg-transparent">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-6">
            <div className="flex gap-2 items-center font-black text-2xl tracking-tighter">
              <Plane className="w-8 h-8 text-blue-500" />
              <span>WINGE</span>
            </div>
            <div>
              <AuthButton />
            </div>
          </div>
        </nav>

        {/* Hero Section - Huge Typography & Hyper-Minimalism */}
        <div className="flex-1 flex flex-col justify-center items-center gap-10 max-w-4xl p-6 text-center w-full mt-10 md:mt-20">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 rounded-full" />
            <div className="relative flex items-center justify-center p-6 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full">
              <Heart className="w-16 h-16 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
            BOARD.<br />MATCH.<br /><span className="text-blue-500">HOOK UP.</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-zinc-400 font-medium max-w-2xl mx-auto tracking-tight leading-snug">
            The exclusive club at 30,000 feet. Find your connection before the seatbelt sign turns off.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-8">
            <Button asChild size="lg" className="text-xl px-12 py-8 w-full sm:w-auto rounded-full font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_40px_rgba(37,99,235,0.3)] transition-all duration-300 hover:scale-105">
              <Link href="/auth/sign-up">Get Your Pass</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-xl px-12 py-8 w-full sm:w-auto rounded-full font-bold border-white/20 hover:bg-white/10 hover:text-white backdrop-blur-md transition-all duration-300">
              <Link href="/auth/login">Check In</Link>
            </Button>
          </div>
        </div>

        {/* Bento Box Features */}
        <div className="w-full max-w-6xl mx-auto px-6 py-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1540339832862-474599807836?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
              <div className="relative z-20">
                <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-blue-500/30 mb-6">
                  <Plane className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-4xl font-black tracking-tight mb-2">Sync Your Flight</h3>
                <p className="text-zinc-400 text-lg font-medium">Add your flight number. See the secret passenger manifest instantly.</p>
              </div>
            </div>

            <div className="col-span-1 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-between">
              <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-purple-500/30">
                <Heart className="w-8 h-8 text-purple-400" />
              </div>
              <div className="mt-12">
                <h3 className="text-3xl font-black tracking-tight mb-2">Shoot Your Shot</h3>
                <p className="text-zinc-400 font-medium">Swipe on the cabin. It’s strictly anonymous until it’s mutual.</p>
              </div>
            </div>

            <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-blue-500/20 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
               <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/30 blur-[100px] rounded-full" />
               <div className="relative z-10">
                 <h3 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white drop-shadow-md">Seat Reveal</h3>
                 <p className="text-xl md:text-2xl text-blue-200 font-medium max-w-2xl mx-auto">
                   Mutual match? We instantly reveal your seat numbers. The rest is up to you.
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full flex items-center justify-center p-8 text-sm text-zinc-600 font-medium">
          <p>© {new Date().getFullYear()} WINGE. The sky is not the limit.</p>
        </footer>
      </div>
    </main>
  );
}