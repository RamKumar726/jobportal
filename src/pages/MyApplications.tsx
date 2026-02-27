import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import { Application } from "../types";
import { motion } from "motion/react";
import { ClipboardList, Briefcase, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await apiFetch("/applications/my");
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-20 md:pt-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter leading-[0.9] uppercase font-display mb-4">
            My <br />
            <span className="text-emerald-600">Applications</span>
          </h1>
          <p className="text-zinc-500 font-medium text-xl">Track the status of your job applications.</p>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{app.title}</h3>
                    <p className="text-zinc-500 text-sm font-medium">{app.company}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Clock size={16} />
                    <span>Applied on {new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    app.status === 'Pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                    app.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {app.status === 'Pending' && <AlertCircle size={14} />}
                    {app.status === 'Accepted' && <CheckCircle2 size={14} />}
                    {app.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200">
            <div className="w-16 h-16 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardList size={32} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">No applications yet</h2>
            <p className="text-zinc-500 mb-8">You haven't applied for any jobs. Start exploring opportunities!</p>
            <Link
              to="/jobs"
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
