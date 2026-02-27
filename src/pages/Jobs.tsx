import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { Job } from "../types";
import { Search, MapPin, Briefcase, Filter, Calendar, ChevronRight, Building2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    search: "",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await apiFetch("/jobs");
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesType = !filters.type || job.type === filters.type;
    const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesSearch = !filters.search || 
      job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.company.toLowerCase().includes(filters.search.toLowerCase());
    return matchesType && matchesLocation && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-20 md:pt-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black text-zinc-900 tracking-tighter leading-[0.9] mb-8 font-display uppercase"
            >
              Find your next <br />
              <span className="text-emerald-600">big move.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-zinc-500 font-medium leading-relaxed"
            >
              Browse through curated opportunities in Government, IT, and Private sectors. Your dream career starts here.
            </motion.p>
          </div>
          <div className="flex flex-wrap gap-3">
            {["Government", "IT", "Private"].map((type, i) => (
              <motion.button
                key={type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                onClick={() => setFilters({ ...filters, type: filters.type === type ? "" : type })}
                className={`px-6 py-3 rounded-2xl text-sm font-black transition-all uppercase tracking-widest border-2 ${
                  filters.type === type 
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-200" 
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-emerald-500 hover:text-emerald-600"
                }`}
              >
                {type}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-2 rounded-[2.5rem] border border-zinc-200 shadow-2xl shadow-zinc-200/50 mb-16 flex flex-col md:flex-row gap-2"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="Search by job title, company, or keywords..."
              className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-none bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-zinc-900 placeholder:text-zinc-400"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="md:w-72 relative">
            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="Location..."
              className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-none bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-zinc-900 placeholder:text-zinc-400"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-16 h-16 border-8 border-zinc-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">Loading Opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 hover:border-emerald-200 transition-all flex flex-col relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 font-black text-2xl border border-zinc-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-colors">
                      {job.company[0]}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        job.type === 'Government' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        job.type === 'IT' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {job.type}
                      </span>
                      {job.external_url && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                          <ExternalLink size={10} /> External Portal
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-zinc-900 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-2 text-zinc-500 font-bold mb-8">
                      <Building2 size={16} />
                      <span>{job.company}</span>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-sm text-zinc-600 font-bold">
                        <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400">
                          <MapPin size={16} />
                        </div>
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-zinc-600 font-bold">
                        <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400">
                          <Briefcase size={16} />
                        </div>
                        <span>{job.experience} Experience</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-zinc-600 font-bold">
                        <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400">
                          <Calendar size={16} />
                        </div>
                        <span>Apply by {job.last_date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-zinc-100 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Salary</span>
                      <span className="text-xl font-black text-zinc-900">{job.salary}</span>
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="px-6 py-3 bg-zinc-900 text-white rounded-2xl text-sm font-black hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                      Details <ChevronRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-zinc-200"
          >
            <div className="w-20 h-20 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 mb-2">No matches found</h3>
            <p className="text-zinc-500 font-medium mb-8">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              onClick={() => setFilters({ type: "", location: "", search: "" })}
              className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

