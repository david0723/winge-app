import { Plane, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white relative overflow-hidden">
      
      {/* Top utility bar just for theme switching if needed, or we can keep it clean */}
      <div className="absolute top-4 right-4 z-50 hidden">
        <ThemeSwitcher />
      </div>

      <main className="flex-1 overflow-y-auto w-full h-full">
        {children}
      </main>

      {/* Bottom Navigation - Glassmorphism 2.0 */}
      <nav className="fixed bottom-0 w-full bg-black/50 backdrop-blur-2xl border-t border-white/10 h-20 flex justify-around items-center px-6 max-w-lg mx-auto left-0 right-0 z-50 pb-safe">
        <Link href="/dashboard" className="flex flex-col items-center gap-1.5 text-zinc-500 hover:text-white transition-colors">
          <Plane className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Passes</span>
        </Link>
        <Link href="/dashboard/matches" className="flex flex-col items-center gap-1.5 text-zinc-500 hover:text-blue-400 transition-colors">
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Matches</span>
        </Link>
        <Link href="/dashboard/profile" className="flex flex-col items-center gap-1.5 text-zinc-500 hover:text-white transition-colors">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
