import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch, analyzeResume } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Job, Resume } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Briefcase, Calendar, Building2, CheckCircle2, FileText, Sparkles, X, ChevronRight, AlertTriangle, ExternalLink, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiAnalysis, setAIAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const jobs = await apiFetch("/jobs");
      const foundJob = jobs.find((j: Job) => j.id === Number(id));
      setJob(foundJob);

      if (user) {
        const userResumes = await apiFetch("/resumes");
        setResumes(userResumes);
        
        const myApps = await apiFetch("/applications/my");
        if (myApps.some((app: any) => app.job_id === Number(id))) {
          setApplied(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) return navigate("/login");
    
    // For Government jobs, resume is optional unless an external URL is provided
    const isGovt = job?.type === 'Government';
    
    if (!isGovt && !selectedResume) return alert("Please select a resume to apply");

    setApplying(true);
    try {
      const resume = resumes.find(r => r.id === selectedResume);
      await apiFetch("/applications", {
        method: "POST",
        body: JSON.stringify({
          job_id: Number(id),
          resume_data: resume ? JSON.parse(resume.content) : null
        }),
      });
      setApplied(true);
    } catch (e) {
      alert("Application failed");
    } finally {
      setApplying(false);
    }
  };

  const handleExternalApply = () => {
    if (job?.external_url) {
      window.open(job.external_url, "_blank", "noopener,noreferrer");
    }
  };

  const handleAIAnalysis = async () => {
    if (!selectedResume) return alert("Please select a resume for analysis");
    setAnalyzing(true);
    setShowAIPanel(true);
    try {
      const resume = resumes.find(r => r.id === selectedResume);
      const analysis = await analyzeResume(JSON.parse(resume!.content), job!.description);
      setAIAnalysis(analysis);
    } catch (e) {
      alert("AI Analysis failed");
      setShowAIPanel(false);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
  if (!job) return <div className="text-center py-20">Job not found</div>;

  const isGovt = job.type === 'Government';

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-20 md:pt-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-600 mb-12 transition-colors font-black uppercase tracking-widest">
          <ChevronRight className="rotate-180" size={16} /> Back to Jobs
        </Link>

        <div className="bg-white rounded-[3rem] border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-8 md:p-16 border-b border-zinc-100 bg-zinc-50/30">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    job.type === 'Government' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    job.type === 'IT' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                  }`}>
                    {job.type}
                  </span>
                  <span className="text-zinc-300 text-sm">•</span>
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-6 leading-[0.9] uppercase font-display">{job.title}</h1>
                <div className="flex items-center gap-2 text-2xl text-emerald-600 font-black mb-12 uppercase tracking-tight">
                  <Building2 size={28} />
                  <span>{job.company}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Location</span>
                    <div className="flex items-center gap-2 text-zinc-900 font-bold">
                      <MapPin size={18} className="text-zinc-400" />
                      {job.location}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Experience</span>
                    <div className="flex items-center gap-2 text-zinc-900 font-bold">
                      <Briefcase size={18} className="text-zinc-400" />
                      {job.experience}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Salary</span>
                    <div className="text-zinc-900 font-black text-lg">{job.salary}</div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Deadline</span>
                    <div className="flex items-center gap-2 text-zinc-900 font-bold">
                      <Calendar size={18} className="text-zinc-400" />
                      {job.last_date}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-16 space-y-12">
            <section>
              <h2 className="text-2xl font-black text-zinc-900 mb-6 tracking-tight">Job Description</h2>
              <div className="text-zinc-600 leading-relaxed whitespace-pre-wrap text-lg">
                {job.description}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-zinc-900 mb-6 tracking-tight">Required Skills</h2>
              <div className="flex flex-wrap gap-3">
                {job.skills.split(",").map((skill, i) => (
                  <span key={i} className="px-5 py-2 bg-zinc-50 text-zinc-700 rounded-2xl text-sm font-bold border border-zinc-200 hover:border-emerald-200 transition-colors">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-zinc-900 mb-6 tracking-tight">Eligibility</h2>
              <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-200 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100">
                  <CheckCircle2 className="text-emerald-600" size={24} />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Qualification</p>
                  <p className="text-zinc-900 font-bold text-lg">{job.qualification}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="p-8 md:p-16 bg-zinc-50 border-t border-zinc-100">
            {applied ? (
              <div className="flex flex-col items-center justify-center gap-4 p-10 bg-emerald-50 text-emerald-700 rounded-[2rem] border border-emerald-100 font-black text-xl text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200/50">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                You have already applied for this position
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Apply Now</h2>
                  {isGovt && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-widest">
                      No Resume Required
                    </span>
                  )}
                </div>
                
                {user ? (
                  <>
                    {job.external_url ? (
                      <div className="p-10 bg-white rounded-[2rem] border border-zinc-200 text-center space-y-6 shadow-sm">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                          <ExternalLink size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-zinc-900">External Application</h3>
                          <p className="text-zinc-500 mt-2">This job requires applying through the official department portal.</p>
                        </div>
                        <button
                          onClick={handleExternalApply}
                          className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                        >
                          Visit Application Portal <ExternalLink size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {!isGovt && (
                          <>
                            {resumes.length > 0 ? (
                              <div className="space-y-6">
                                <label className="block text-sm font-black text-zinc-700 uppercase tracking-widest">Select your Resume</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {resumes.map((r) => (
                                    <button
                                      key={r.id}
                                      onClick={() => setSelectedResume(r.id)}
                                      className={`p-6 rounded-[1.5rem] border text-left transition-all flex items-center gap-4 group ${
                                        selectedResume === r.id 
                                          ? "bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-100 scale-[1.02]" 
                                          : "bg-white border-zinc-200 hover:border-emerald-200"
                                      }`}
                                    >
                                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                        selectedResume === r.id ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                                      }`}>
                                        <FileText size={24} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className={`font-black truncate ${selectedResume === r.id ? "text-emerald-900" : "text-zinc-900"}`}>{r.name}</div>
                                        <div className="text-xs text-zinc-500 font-bold">Created {new Date(r.created_at).toLocaleDateString()}</div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="p-10 text-center bg-white rounded-[2rem] border border-dashed border-zinc-300 space-y-4">
                                <div className="w-16 h-16 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mx-auto">
                                  <FileText size={32} />
                                </div>
                                <p className="text-zinc-500 font-bold">You haven't created any resumes yet.</p>
                                <Link to="/resume-builder" className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                                  Create your first resume
                                </Link>
                              </div>
                            )}
                          </>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            onClick={handleApply}
                            disabled={applying || (!isGovt && !selectedResume)}
                            className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                          >
                            {applying ? "Submitting..." : "Submit Application"}
                          </button>
                          {!isGovt && (
                            <button
                              onClick={handleAIAnalysis}
                              disabled={analyzing || !selectedResume}
                              className="flex-1 py-5 bg-zinc-900 text-white rounded-2xl font-black text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                              <Sparkles size={22} className="text-emerald-400" />
                              {analyzing ? "Analyzing..." : "AI ATS Score"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-12 text-center bg-white rounded-[2rem] border border-zinc-200 shadow-sm space-y-6">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <Users size={40} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-zinc-900">Join the platform</h3>
                      <p className="text-zinc-500 mt-2 font-medium">Please login or register to apply for this position.</p>
                    </div>
                    <Link to="/login" className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all inline-block shadow-xl shadow-emerald-100">
                      Login to Apply
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Analysis Sidebar/Panel */}
      <AnimatePresence>
        {showAIPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAIPanel(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-[70] overflow-y-auto border-l border-zinc-100"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Sparkles className="text-emerald-600" size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">AI Analysis</h2>
                </div>
                <button onClick={() => setShowAIPanel(false)} className="p-3 hover:bg-zinc-100 rounded-2xl transition-all text-zinc-400 hover:text-zinc-900">
                  <X size={28} />
                </button>
              </div>

              <div className="p-8 md:p-12">
                {analyzing ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 border-8 border-emerald-50 rounded-full"></div>
                      <div className="w-24 h-24 border-8 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-zinc-900 font-black text-xl mb-2">Analyzing Resume</p>
                      <p className="text-zinc-500 font-medium animate-pulse">Gemini AI is processing your profile...</p>
                    </div>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-12 pb-12">
                    <div className="text-center p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-200 shadow-inner">
                      <div className="text-xs text-zinc-400 uppercase font-black tracking-[0.2em] mb-4">ATS Match Score</div>
                      <div className={`text-8xl font-black mb-6 tracking-tighter ${
                        aiAnalysis.atsScore > 80 ? 'text-emerald-600' :
                        aiAnalysis.atsScore > 60 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {aiAnalysis.atsScore}%
                      </div>
                      <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden mb-8">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${aiAnalysis.atsScore}%` }}
                          className={`h-full ${
                            aiAnalysis.atsScore > 80 ? 'bg-emerald-500' :
                            aiAnalysis.atsScore > 60 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                      <p className="text-zinc-700 font-bold italic text-lg leading-relaxed">"{aiAnalysis.feedback}"</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="p-8 bg-red-50 rounded-[2rem] border border-red-100">
                        <div className="flex items-center gap-3 text-red-700 font-black mb-6 uppercase tracking-wider text-sm">
                          <AlertTriangle size={20} />
                          Missing Keywords
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {aiAnalysis.missingKeywords.map((kw: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-white text-red-600 text-xs font-black rounded-xl border border-red-200 shadow-sm">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-8 bg-orange-50 rounded-[2rem] border border-orange-100">
                        <div className="flex items-center gap-3 text-orange-700 font-black mb-6 uppercase tracking-wider text-sm">
                          <AlertTriangle size={20} />
                          Skill Gaps
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {aiAnalysis.skillGaps.map((sg: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-white text-orange-600 text-xs font-black rounded-xl border border-orange-200 shadow-sm">
                              {sg}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Improvement Suggestions</h3>
                      <div className="space-y-4">
                        {aiAnalysis.suggestions.map((s: string, i: number) => (
                          <div key={i} className="flex gap-4 p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:border-emerald-200 transition-colors">
                            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm">
                              {i + 1}
                            </div>
                            <p className="text-zinc-600 font-medium leading-relaxed">{s}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-8 bg-emerald-900 text-white rounded-[2rem] shadow-xl shadow-emerald-100">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles size={24} className="text-emerald-400" />
                        <h3 className="font-black text-xl">Pro Tip</h3>
                      </div>
                      <p className="text-emerald-100 font-medium leading-relaxed">
                        Try incorporating the missing keywords naturally into your experience descriptions to increase your score. AI systems look for these specific terms.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

