import { Plane, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 relative overflow-hidden">
      
      {/* Top utility bar just for theme switching if needed, or we can keep it clean */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      <main className="flex-1 overflow-y-auto pb-20 w-full h-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 h-16 flex justify-around items-center px-4 max-w-lg mx-auto left-0 right-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400">
          <Plane className="w-6 h-6" />
          <span className="text-[10px] font-medium">Cabin</span>
        </Link>
        <Link href="/dashboard/matches" className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400">
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">Matches</span>
        </Link>
        <Link href="/dashboard/profile" className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
