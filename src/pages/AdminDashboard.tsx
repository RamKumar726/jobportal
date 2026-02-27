import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import { Job, Application } from "../types";
import { motion } from "motion/react";
import { Plus, Trash2, Users, Briefcase, BarChart3, Clock, MapPin, X, CheckCircle2, Edit3, ExternalLink } from "lucide-react";

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [newJob, setNewJob] = useState({
    title: "", company: "", type: "IT", location: "", experience: "",
    qualification: "", salary: "", description: "", skills: "", last_date: "",
    external_url: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsData, appsData] = await Promise.all([
        apiFetch("/jobs"),
        apiFetch("/admin/applications")
      ]);
      setJobs(jobsData);
      setApplications(appsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (job: Job) => {
    setEditingJobId(job.id);
    setNewJob({
      title: job.title,
      company: job.company,
      type: job.type,
      location: job.location,
      experience: job.experience,
      qualification: job.qualification,
      salary: job.salary,
      description: job.description,
      skills: job.skills,
      last_date: job.last_date,
      external_url: job.external_url || ""
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingJobId(null);
    setNewJob({
      title: "", company: "", type: "IT", location: "", experience: "",
      qualification: "", salary: "", description: "", skills: "", last_date: "",
      external_url: ""
    });
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJobId) {
        await apiFetch(`/jobs/${editingJobId}`, {
          method: "PUT",
          body: JSON.stringify(newJob),
        });
      } else {
        await apiFetch("/jobs", {
          method: "POST",
          body: JSON.stringify(newJob),
        });
      }
      handleCloseModal();
      fetchData();
    } catch (e) {
      alert("Failed to save job");
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await apiFetch(`/jobs/${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      alert("Failed to delete job");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-20 md:pt-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-16">
          <div>
            <h1 className="text-5xl md:text-8xl font-black text-zinc-900 tracking-tighter leading-[0.9] uppercase font-display mb-4">
              Control <br />
              <span className="text-emerald-600">Center</span>
            </h1>
            <p className="text-zinc-500 font-medium text-xl">Manage opportunities and track platform performance.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full lg:w-auto px-10 py-5 bg-zinc-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-zinc-900/20 active:scale-95"
          >
            <Plus size={20} /> Post New Job
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Briefcase size={24} className="sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-zinc-900">{jobs.length}</div>
                <div className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Jobs</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Users size={24} className="sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-zinc-900">{applications.length}</div>
                <div className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Applications</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                <BarChart3 size={24} className="sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-zinc-900">
                  {applications.length > 0 ? (applications.length / jobs.length).toFixed(1) : 0}
                </div>
                <div className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider">Avg. Apps per Job</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Jobs Management */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Active Listings</h2>
              <span className="px-3 py-1 bg-zinc-200 text-zinc-600 text-[10px] sm:text-xs font-bold rounded-full">{jobs.length}</span>
            </div>
            <div className="divide-y divide-zinc-100 overflow-y-auto max-h-[600px]">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 sm:p-8 hover:bg-zinc-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-zinc-900 text-base sm:text-lg truncate">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                      <span className="text-xs sm:text-sm text-zinc-500 font-medium">{job.company}</span>
                      <span className="text-zinc-300 hidden sm:inline">•</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
                        job.type === 'Government' ? 'bg-blue-50 text-blue-600' :
                        job.type === 'IT' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {job.type}
                      </span>
                      {job.external_url && (
                        <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">
                          <ExternalLink size={10} /> External
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenEdit(job)}
                      className="p-2 sm:p-3 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      title="Edit Job"
                    >
                      <Edit3 size={18} className="sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 sm:p-3 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Job"
                    >
                      <Trash2 size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <div className="p-12 sm:p-20 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                    <Briefcase size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <p className="text-zinc-400 font-medium text-sm sm:text-base">No jobs posted yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Applications Tracking */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Recent Applications</h2>
            </div>
            <div className="divide-y divide-zinc-100 overflow-y-auto max-h-[600px]">
              {applications.map((app) => (
                <div key={app.id} className="p-6 sm:p-8 hover:bg-zinc-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="font-black text-zinc-900 text-base sm:text-lg">{app.user_name}</div>
                      <div className="text-xs sm:text-sm text-zinc-500 font-medium">{app.user_email}</div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">
                      {app.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <Briefcase size={14} className="text-zinc-400 sm:w-4 sm:h-4" />
                    <span>Applied for <span className="font-bold text-zinc-900">{app.title}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-400 mt-4 font-medium">
                    <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span>{new Date(app.applied_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {applications.length === 0 && (
                <div className="p-12 sm:p-20 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                    <Users size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <p className="text-zinc-400 font-medium text-sm sm:text-base">No applications yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-white/20"
          >
            <div className="p-8 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                  {editingJobId ? "Edit Job Listing" : "Post a New Job"}
                </h2>
                <p className="text-sm text-zinc-500 font-medium mt-1">Fill in the details for the opportunity.</p>
              </div>
              <button onClick={handleCloseModal} className="p-3 hover:bg-zinc-100 rounded-2xl transition-all text-zinc-400 hover:text-zinc-900">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddJob} className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider">Job Title</label>
                  <input
                    type="text" required
                    className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50"
                    placeholder="e.g. Senior Product Designer"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider">Company / Dept</label>
                  <input
                    type="text" required
                    className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50"
                    placeholder="e.g. Acme Corp"
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider">Job Type</label>
                  <select
                    className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50 appearance-none"
                    value={newJob.type}
                    onChange={(e) => setNewJob({ ...newJob, type: e.target.value as any })}
                  >
                    <option value="IT">IT Jobs</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider">Location</label>
                  <input
                    type="text" required
                    className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50"
                    placeholder="e.g. Remote / New York"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider">Experience</label>
                  <input
                    type="text" required placeholder="e.g. 2-4 Years"
                    className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50"
                    value={newJob.experience}
                    onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider">Salary Range</label>
                  <input
                    type="text" required placeholder="e.g. $80k - $120k"
                    className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider">Qualification</label>
                <input
                  type="text" required placeholder="e.g. Bachelor's in CS"
                  className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50"
                  value={newJob.qualification}
                  onChange={(e) => setNewJob({ ...newJob, qualification: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider">Required Skills (Comma separated)</label>
                <input
                  type="text" required placeholder="React, Node.js, SQL"
                  className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50"
                  value={newJob.skills}
                  onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider">Job Description</label>
                <textarea
                  required rows={6}
                  className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50 resize-none"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider">Application Deadline</label>
                  <input
                    type="date" required
                    className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50"
                    value={newJob.last_date}
                    onChange={(e) => setNewJob({ ...newJob, last_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider">External URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://company.com/careers/apply"
                    className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50"
                    value={newJob.external_url}
                    onChange={(e) => setNewJob({ ...newJob, external_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-6 sticky bottom-0 bg-white pb-2">
                <button
                  type="submit"
                  className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 active:scale-[0.98]"
                >
                  {editingJobId ? "Update Job Listing" : "Post Job Opening"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

