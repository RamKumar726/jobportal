import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Briefcase, User, LogOut, LayoutDashboard, FileText, ClipboardList, Menu, X, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { name: "Jobs", path: "/jobs", icon: Briefcase },
    ...(user ? [
      { name: "Resume", path: "/resume-builder", icon: FileText },
      { name: "Apps", path: "/my-applications", icon: ClipboardList },
      ...(user.role === "admin" ? [{ name: "Admin", path: "/admin", icon: LayoutDashboard, admin: true }] : []),
    ] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-4 sm:px-6 lg:px-8 py-4 pointer-events-none">
      <nav 
        className={`max-w-7xl mx-auto w-full transition-all duration-700 pointer-events-auto ${
          scrolled 
            ? "bg-zinc-900/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl py-2.5 px-5" 
            : "bg-white/70 backdrop-blur-md border border-zinc-200/50 shadow-sm rounded-2xl py-3.5 px-6"
        }`}
      >
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsMenuOpen(false)}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-500 group-hover:rotate-12 ${
              scrolled ? "bg-emerald-500 text-zinc-900" : "bg-zinc-900 text-white"
            }`}>
              CP
            </div>
            <div className="flex flex-col justify-center">
              <span className={`text-lg font-black tracking-tighter leading-none transition-colors duration-500 ${scrolled ? "text-white" : "text-zinc-900"}`}>CareerPulse</span>
              <span className="text-[7px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-0.5">Next-Gen Platform</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className={`hidden lg:flex items-center gap-1 p-1 rounded-xl border transition-colors duration-500 ${
            scrolled ? "bg-white/5 border-white/10" : "bg-zinc-100/50 border-zinc-200/50"
          }`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-[0.15em] ${
                  isActive(link.path)
                    ? scrolled ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"
                    : scrolled ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-zinc-500 hover:text-zinc-900 hover:bg-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <div className={`flex flex-col items-end pr-3 border-r transition-colors duration-500 ${scrolled ? "border-white/10" : "border-zinc-200"}`}>
                  <span className={`text-[10px] font-black transition-colors duration-500 ${scrolled ? "text-white" : "text-zinc-900"}`}>{user.name.split(' ')[0]}</span>
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center active:scale-90 ${
                    scrolled ? "bg-white text-zinc-900 hover:bg-emerald-500" : "bg-zinc-900 text-white hover:bg-emerald-600"
                  }`}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className={`px-5 py-2.5 text-[10px] font-black transition-colors uppercase tracking-[0.15em] ${scrolled ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900"}`}>Login</Link>
                <Link to="/register" className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.15em] shadow-xl active:scale-95 ${
                  scrolled ? "bg-emerald-500 text-zinc-900 shadow-emerald-500/20" : "bg-zinc-900 text-white shadow-zinc-900/20"
                }`}>Join</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${
                scrolled ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"
              }`}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-xl z-[-1] lg:hidden pointer-events-auto"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute top-20 left-4 right-4 bg-zinc-900 border border-white/10 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] z-50 lg:hidden flex flex-col overflow-hidden pointer-events-auto max-h-[calc(100vh-6rem)]"
            >
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-2">
                  {user && (
                    <div className="mb-4 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-zinc-900 shadow-lg shadow-emerald-500/20">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-black text-white text-base leading-none mb-1">{user.name}</div>
                        <div className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em]">{user.role}</div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-1">
                    {navLinks.map((link, i) => (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                            isActive(link.path)
                              ? "bg-emerald-500 text-zinc-900 shadow-xl shadow-emerald-500/20"
                              : "text-zinc-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[9px]">
                            <link.icon size={16} className={isActive(link.path) ? "text-zinc-900" : "text-emerald-500"} />
                            {link.name}
                          </div>
                          <ChevronRight size={14} className="opacity-30" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/5">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-500/10 text-red-500 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                  >
                    <LogOut size={16} />
                    Disconnect
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-4 text-center font-black text-[9px] uppercase tracking-[0.3em] text-white bg-white/5 rounded-xl border border-white/10"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-4 text-center font-black text-[9px] uppercase tracking-[0.3em] text-zinc-900 bg-emerald-500 rounded-xl shadow-xl shadow-emerald-500/20"
                    >
                      Join
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
