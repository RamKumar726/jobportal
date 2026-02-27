import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import { ResumeContent, Resume } from "../types";
import { motion } from "motion/react";
import { Plus, Save, Trash2, FileText, Download, User, GraduationCap, Briefcase, Code, FolderKanban, Award, ChevronRight, ChevronLeft, X } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const initialContent: ResumeContent = {
  personal: { name: "", email: "", phone: "", address: "" },
  education: [{ school: "", degree: "", year: "" }],
  experience: [{ company: "", role: "", duration: "", description: "" }],
  skills: [],
  projects: [{ name: "", description: "", link: "" }],
  certifications: []
};

export default function ResumeBuilder() {
  const [step, setStep] = useState(1);
  const [content, setContent] = useState<ResumeContent>(initialContent);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeName, setResumeName] = useState("My Professional Resume");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await apiFetch("/resumes");
      setResumes(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/resumes", {
        method: "POST",
        body: JSON.stringify({ name: resumeName, content }),
      });
      fetchResumes();
      alert("Resume saved successfully!");
    } catch (e) {
      alert("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  const exportPDF = async () => {
    const element = document.getElementById("resume-preview");
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${resumeName}.pdf`);
  };

  const steps = [
    { id: 1, title: "Personal", icon: User },
    { id: 2, title: "Education", icon: GraduationCap },
    { id: 3, title: "Experience", icon: Briefcase },
    { id: 4, title: "Skills", icon: Code },
    { id: 5, title: "Projects", icon: FolderKanban },
    { id: 6, title: "Certs", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-20 md:pt-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Builder Sidebar */}
          <div className="lg:w-1/3 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm">
              <h1 className="text-4xl font-black text-zinc-900 mb-8 tracking-tighter uppercase font-display leading-none">
                Resume <br />
                <span className="text-emerald-600">Architect</span>
              </h1>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                {steps.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className={`flex items-center gap-3 p-3 sm:p-4 rounded-2xl transition-all ${
                      step === s.id 
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                        : "text-zinc-600 hover:bg-zinc-50 border border-transparent hover:border-zinc-100"
                    }`}
                  >
                    <s.icon size={18} className="shrink-0" />
                    <span className="font-bold text-xs sm:text-sm truncate">{s.title}</span>
                    {step === s.id && <ChevronRight className="ml-auto hidden lg:block" size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-sm hidden sm:block">
              <h2 className="text-base sm:text-lg font-black text-zinc-900 mb-4 tracking-tight">Saved Resumes</h2>
              <div className="space-y-3">
                {resumes.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={16} className="text-zinc-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-zinc-700 truncate">{r.name}</span>
                    </div>
                    <button 
                      onClick={() => setContent(JSON.parse(r.content))}
                      className="text-[10px] font-black text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors uppercase tracking-wider"
                    >
                      Load
                    </button>
                  </div>
                ))}
                {resumes.length === 0 && <p className="text-xs text-zinc-400 text-center py-4 font-medium">No saved resumes</p>}
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="lg:w-2/3 space-y-6 sm:space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div className="w-full sm:w-auto">
                  <input
                    type="text"
                    className="text-xl sm:text-2xl font-black text-zinc-900 border-none focus:ring-0 p-0 w-full bg-transparent tracking-tight"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                  />
                  <div className="h-0.5 w-12 bg-emerald-600 mt-1 rounded-full"></div>
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-50"
                  >
                    <Save size={18} /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={exportPDF}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-zinc-900 text-white rounded-xl font-black text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Download size={18} /> PDF
                  </button>
                </div>
              </div>

              {/* Step Content */}
              <div className="min-h-[300px] sm:min-h-[400px]">
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Full Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50"
                          value={content.personal.name}
                          onChange={(e) => setContent({ ...content, personal: { ...content.personal, name: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email Address</label>
                        <input
                          type="email"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50"
                          value={content.personal.email}
                          onChange={(e) => setContent({ ...content, personal: { ...content.personal, email: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Phone Number</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50"
                          value={content.personal.phone}
                          onChange={(e) => setContent({ ...content, personal: { ...content.personal, phone: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Address</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-zinc-50/50"
                          value={content.personal.address}
                          onChange={(e) => setContent({ ...content, personal: { ...content.personal, address: e.target.value } })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-zinc-900">Education</h3>
                      <button 
                        onClick={() => setContent({ ...content, education: [...content.education, { school: "", degree: "", year: "" }] })}
                        className="text-emerald-600 font-bold flex items-center gap-1 hover:underline"
                      >
                        <Plus size={16} /> Add More
                      </button>
                    </div>
                    {content.education.map((edu, i) => (
                      <div key={i} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4 relative">
                        <button 
                          onClick={() => setContent({ ...content, education: content.education.filter((_, idx) => idx !== i) })}
                          className="absolute top-4 right-4 text-zinc-400 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            placeholder="School/University"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={edu.school}
                            onChange={(e) => {
                              const newEdu = [...content.education];
                              newEdu[i].school = e.target.value;
                              setContent({ ...content, education: newEdu });
                            }}
                          />
                          <input
                            placeholder="Degree"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={edu.degree}
                            onChange={(e) => {
                              const newEdu = [...content.education];
                              newEdu[i].degree = e.target.value;
                              setContent({ ...content, education: newEdu });
                            }}
                          />
                          <input
                            placeholder="Year"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={edu.year}
                            onChange={(e) => {
                              const newEdu = [...content.education];
                              newEdu[i].year = e.target.value;
                              setContent({ ...content, education: newEdu });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-zinc-900">Experience</h3>
                      <button 
                        onClick={() => setContent({ ...content, experience: [...content.experience, { company: "", role: "", duration: "", description: "" }] })}
                        className="text-emerald-600 font-bold flex items-center gap-1 hover:underline"
                      >
                        <Plus size={16} /> Add More
                      </button>
                    </div>
                    {content.experience.map((exp, i) => (
                      <div key={i} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4 relative">
                        <button 
                          onClick={() => setContent({ ...content, experience: content.experience.filter((_, idx) => idx !== i) })}
                          className="absolute top-4 right-4 text-zinc-400 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            placeholder="Company"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={exp.company}
                            onChange={(e) => {
                              const newExp = [...content.experience];
                              newExp[i].company = e.target.value;
                              setContent({ ...content, experience: newExp });
                            }}
                          />
                          <input
                            placeholder="Role"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={exp.role}
                            onChange={(e) => {
                              const newExp = [...content.experience];
                              newExp[i].role = e.target.value;
                              setContent({ ...content, experience: newExp });
                            }}
                          />
                          <input
                            placeholder="Duration"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={exp.duration}
                            onChange={(e) => {
                              const newExp = [...content.experience];
                              newExp[i].duration = e.target.value;
                              setContent({ ...content, experience: newExp });
                            }}
                          />
                        </div>
                        <textarea
                          placeholder="Description"
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                          value={exp.description}
                          onChange={(e) => {
                            const newExp = [...content.experience];
                            newExp[i].description = e.target.value;
                            setContent({ ...content, experience: newExp });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-zinc-900">Skills</h3>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Add a skill (e.g. React)"
                        className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.currentTarget.value.trim();
                            if (val && !content.skills.includes(val)) {
                              setContent({ ...content, skills: [...content.skills, val] });
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {content.skills.map((skill, i) => (
                        <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 font-medium">
                          {skill}
                          <button onClick={() => setContent({ ...content, skills: content.skills.filter((_, idx) => idx !== i) })}>
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-zinc-900">Projects</h3>
                      <button 
                        onClick={() => setContent({ ...content, projects: [...content.projects, { name: "", description: "", link: "" }] })}
                        className="text-emerald-600 font-bold flex items-center gap-1 hover:underline"
                      >
                        <Plus size={16} /> Add More
                      </button>
                    </div>
                    {content.projects.map((proj, i) => (
                      <div key={i} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4 relative">
                        <button 
                          onClick={() => setContent({ ...content, projects: content.projects.filter((_, idx) => idx !== i) })}
                          className="absolute top-4 right-4 text-zinc-400 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            placeholder="Project Name"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={proj.name}
                            onChange={(e) => {
                              const newProj = [...content.projects];
                              newProj[i].name = e.target.value;
                              setContent({ ...content, projects: newProj });
                            }}
                          />
                          <input
                            placeholder="Link (Optional)"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={proj.link}
                            onChange={(e) => {
                              const newProj = [...content.projects];
                              newProj[i].link = e.target.value;
                              setContent({ ...content, projects: newProj });
                            }}
                          />
                        </div>
                        <textarea
                          placeholder="Description"
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                          value={proj.description}
                          onChange={(e) => {
                            const newProj = [...content.projects];
                            newProj[i].description = e.target.value;
                            setContent({ ...content, projects: newProj });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-zinc-900">Certifications</h3>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Add a certification"
                        className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.currentTarget.value.trim();
                            if (val && !content.certifications.includes(val)) {
                              setContent({ ...content, certifications: [...content.certifications, val] });
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {content.certifications.map((cert, i) => (
                        <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 font-medium">
                          {cert}
                          <button onClick={() => setContent({ ...content, certifications: content.certifications.filter((_, idx) => idx !== i) })}>
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-10 border-t border-zinc-100 mt-10">
                <button
                  disabled={step === 1}
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-6 py-3 text-zinc-600 font-bold hover:bg-zinc-50 rounded-xl transition-all disabled:opacity-30"
                >
                  <ChevronLeft size={20} /> Previous
                </button>
                <button
                  disabled={step === 6}
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-30"
                >
                  Next Step <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white p-12 rounded-3xl border border-zinc-200 shadow-sm overflow-hidden hidden md:block">
              <div id="resume-preview" className="max-w-[800px] mx-auto bg-white min-h-[1000px]">
                <div className="border-b-4 border-emerald-600 pb-8 mb-8">
                  <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter mb-2">
                    {content.personal.name || "YOUR NAME"}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-zinc-500 font-medium">
                    <span>{content.personal.email || "email@example.com"}</span>
                    <span>•</span>
                    <span>{content.personal.phone || "Phone Number"}</span>
                    <span>•</span>
                    <span>{content.personal.address || "Location"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-10">
                  <div className="col-span-2 space-y-10">
                    <section>
                      <h2 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Professional Experience</h2>
                      <div className="space-y-6">
                        {content.experience.map((exp, i) => (
                          <div key={i}>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-zinc-900">{exp.role || "Role Title"}</h3>
                              <span className="text-xs font-bold text-zinc-400">{exp.duration || "Duration"}</span>
                            </div>
                            <div className="text-sm font-bold text-zinc-600 mb-2">{exp.company || "Company Name"}</div>
                            <p className="text-sm text-zinc-500 leading-relaxed">{exp.description || "Describe your responsibilities and achievements..."}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Projects</h2>
                      <div className="space-y-6">
                        {content.projects.map((proj, i) => (
                          <div key={i}>
                            <div className="flex justify-between items-center mb-1">
                              <h3 className="font-bold text-zinc-900">{proj.name || "Project Name"}</h3>
                              {proj.link && <span className="text-[10px] text-zinc-400">{proj.link}</span>}
                            </div>
                            <p className="text-sm text-zinc-500 leading-relaxed">{proj.description || "Brief description of the project..."}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-10">
                    <section>
                      <h2 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Education</h2>
                      <div className="space-y-4">
                        {content.education.map((edu, i) => (
                          <div key={i}>
                            <div className="font-bold text-zinc-900 text-sm">{edu.degree || "Degree"}</div>
                            <div className="text-xs text-zinc-500">{edu.school || "School"}</div>
                            <div className="text-[10px] font-bold text-zinc-400 mt-1">{edu.year || "Year"}</div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {content.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-zinc-100 text-zinc-700 text-[10px] font-bold rounded uppercase">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Certifications</h2>
                      <div className="space-y-2">
                        {content.certifications.map((cert, i) => (
                          <div key={i} className="text-xs text-zinc-600 font-medium">• {cert}</div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
