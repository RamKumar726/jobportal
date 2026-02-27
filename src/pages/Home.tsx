import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Briefcase, ShieldCheck, Zap, Globe, FileText, Sparkles, TrendingUp, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-emerald-500 selection:text-white font-sans">
      {/* Hero Section - Editorial Style */}
      <section className="relative pt-48 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-12 text-[10px] font-black tracking-[0.4em] text-emerald-600 uppercase bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <Sparkles size={12} className="animate-pulse" />
                AI-Powered Career Intelligence
              </div>
              
              <h1 className="text-[15vw] sm:text-[12vw] lg:text-[140px] font-black text-zinc-900 leading-[0.8] tracking-[-0.06em] uppercase mb-16 font-display">
                Your Future <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-400">Starts Here</span>
              </h1>

              <p className="max-w-2xl mx-auto text-lg sm:text-2xl text-zinc-500 font-medium leading-relaxed mb-20 px-4 font-sans">
                The ultimate platform for Government, IT, and Private sector careers. 
                Build professional resumes and get AI-driven insights to dominate your industry.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Link
                  to="/jobs"
                  className="group relative w-full sm:w-auto px-12 py-6 bg-zinc-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.25em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Explore Opportunities <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link
                  to="/resume-builder"
                  className="w-full sm:w-auto px-12 py-6 bg-white text-zinc-900 border border-zinc-200 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.25em] hover:bg-zinc-50 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-sm"
                >
                  Build Resume <FileText size={20} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full animate-pulse delay-1000" />
        </div>
      </section>

      {/* Stats Section - Minimalist */}
      <section className="py-32 border-y border-zinc-100 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
            {[
              { label: "Active Jobs", value: "10k+", icon: Briefcase },
              { label: "Success Rate", value: "94%", icon: TrendingUp },
              { label: "AI Analysis", value: "Instant", icon: Zap },
              { label: "User Base", value: "50k+", icon: Users },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl sm:text-6xl font-black text-zinc-900 mb-4 tracking-tighter font-display">{stat.value}</div>
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Bento Grid Style */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-24">
            <h2 className="text-5xl sm:text-8xl font-black text-zinc-900 tracking-tight uppercase mb-8 font-display leading-[0.9]">
              Engineered for <br />
              <span className="text-emerald-600">Performance</span>
            </h2>
            <p className="text-zinc-500 font-medium max-w-xl text-xl">
              We've built the most advanced career tools to give you an unfair advantage in the job market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 p-12 rounded-[4rem] bg-zinc-50 border border-zinc-200 shadow-sm group hover:shadow-2xl hover:bg-white transition-all duration-700">
              <div className="w-16 h-16 bg-emerald-500 text-zinc-900 rounded-2xl flex items-center justify-center mb-12 shadow-xl shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                <Briefcase size={32} />
              </div>
              <h3 className="text-4xl font-black text-zinc-900 mb-8 uppercase tracking-tight font-display">Multi-Sector Ecosystem</h3>
              <p className="text-zinc-500 font-medium leading-relaxed text-xl">
                Access a unified stream of verified listings from Government departments, 
                Fortune 500 IT firms, and high-growth private enterprises.
              </p>
            </div>
            <div className="md:col-span-4 p-12 rounded-[4rem] bg-zinc-900 text-white border border-white/5 shadow-2xl group hover:bg-zinc-800 transition-all duration-700">
              <div className="w-16 h-16 bg-white text-zinc-900 rounded-2xl flex items-center justify-center mb-12 group-hover:scale-110 transition-transform">
                <Zap size={32} />
              </div>
              <h3 className="text-3xl font-black mb-8 uppercase tracking-tight font-display">ATS Core</h3>
              <p className="text-zinc-400 font-medium leading-relaxed text-lg">
                Instant AI evaluation of your resume against specific job requirements.
              </p>
            </div>
            <div className="md:col-span-4 p-12 rounded-[4rem] bg-emerald-500 text-zinc-900 shadow-xl group hover:scale-[1.02] transition-all duration-700">
              <div className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mb-12">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-3xl font-black mb-8 uppercase tracking-tight font-display">Smart Logic</h3>
              <p className="text-zinc-900/70 font-bold leading-relaxed text-lg">
                Personalized gap analysis and keyword optimization for every application.
              </p>
            </div>
            <div className="md:col-span-8 p-12 rounded-[4rem] bg-zinc-50 border border-zinc-200 shadow-sm group hover:shadow-2xl hover:bg-white transition-all duration-700">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-12 shadow-xl shadow-blue-500/20">
                <Globe size={32} />
              </div>
              <h3 className="text-4xl font-black text-zinc-900 mb-8 uppercase tracking-tight font-display">Global Reach</h3>
              <p className="text-zinc-500 font-medium leading-relaxed text-xl">
                Connect with opportunities across borders. Our platform supports international applications and remote-first roles.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
