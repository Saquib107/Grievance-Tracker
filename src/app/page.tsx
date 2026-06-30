import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowRight, Lock, Activity, Users } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
            <ShieldAlert className="h-6 w-6" />
            <span>GrievanceHub</span>
          </div>
          
          <div>
            {session ? (
              <Link href="/dashboard" className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700 disabled:pointer-events-none disabled:opacity-50">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700 disabled:pointer-events-none disabled:opacity-50">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          
          <div className="container px-4 md:px-6 relative z-10 max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 mb-8">
              <ShieldAlert className="mr-2 h-4 w-4" />
              Secure Enterprise Platform
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
              A Transparent & Secure <br className="hidden sm:block" />
              <span className="text-indigo-600 dark:text-indigo-400">
                Workplace Environment
              </span>
            </h1>
            
            <p className="max-w-[42rem] mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
              Empowering employees to confidently report concerns while equipping HR with the tools to manage, track, and resolve issues efficiently.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {session ? (
                <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-md bg-indigo-600 px-8 text-base font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:bg-indigo-700">
                  Access Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-md bg-indigo-600 px-8 text-base font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:bg-indigo-700">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg mb-4">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Anonymous Reporting</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Submit grievances completely anonymously. Your identity remains protected while your voice is heard by the right people.
                </p>
              </div>
              
              <div className="flex flex-col items-start p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg mb-4">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Real-time Tracking</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Monitor the status of your reported issues in real-time. Know exactly when HR has reviewed, investigated, and resolved your case.
                </p>
              </div>

              <div className="flex flex-col items-start p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 sm:col-span-2 lg:col-span-1">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">HR Collaboration</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  HR teams get powerful dashboards to assign investigators, track SLAs, communicate securely, and manage resolutions effectively.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          &copy; {new Date().getFullYear()} PGEPL GrievanceHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
