import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
          <ShieldAlert className="h-6 w-6" />
          <span>GrievanceHub</span>
        </div>
        {session ? (
          <Link href="/dashboard" className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50">
            Enter Platform
          </Link>
        ) : (
          <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50">
            Log in
          </Link>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10" />
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-100/50 to-transparent dark:from-indigo-900/20 dark:to-transparent -z-10" />

        <ShieldAlert className="h-20 w-20 text-indigo-600 dark:text-indigo-500 mb-8 animate-bounce" style={{ animationDuration: '3s' }} />
        
        <h1 className="max-w-3xl text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          A Secure & Transparent <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Grievance Management
          </span> Platform
        </h1>
        
        <p className="max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
          GrievanceHub empowers employees to securely report concerns, ensuring complete confidentiality while giving HR teams the tools they need to resolve issues efficiently.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {session ? (
            <Link href="/dashboard" className="inline-flex h-14 items-center justify-center rounded-full bg-indigo-600 px-8 text-lg font-medium text-white shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 hover:bg-indigo-700">
              Enter Platform <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <Link href="/login" className="inline-flex h-14 items-center justify-center rounded-full bg-indigo-600 px-8 text-lg font-medium text-white shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 hover:bg-indigo-700">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        &copy; {new Date().getFullYear()} PGEPL GrievanceHub. All rights reserved.
      </footer>
    </div>
  );
}
