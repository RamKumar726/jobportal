export interface Job {
  id: number;
  title: string;
  company: string;
  type: 'Government' | 'IT' | 'Private';
  location: string;
  experience: string;
  qualification: string;
  salary: string;
  description: string;
  skills: string;
  last_date: string;
  external_url?: string;
  status: 'Active' | 'Expired';
  created_at: string;
}

export interface Resume {
  id: number;
  user_id: number;
  name: string;
  content: string; // JSON string
  created_at: string;
}

export interface Application {
  id: number;
  user_id: number;
  job_id: number;
  resume_data: string;
  status: string;
  applied_at: string;
  title?: string;
  company?: string;
  user_name?: string;
  user_email?: string;
}

export interface ResumeContent {
  personal: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  education: Array<{
    school: string;
    degree: string;
    year: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    link: string;
  }>;
  certifications: string[];
}
