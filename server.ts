import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Government', 'IT', 'Private'
    location TEXT NOT NULL,
    experience TEXT NOT NULL,
    qualification TEXT NOT NULL,
    salary TEXT NOT NULL,
    description TEXT NOT NULL,
    skills TEXT NOT NULL,
    last_date TEXT NOT NULL,
    external_url TEXT,
    status TEXT DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    resume_data TEXT, -- Can be NULL for Govt jobs
    status TEXT DEFAULT 'Pending',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
  );

  CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed Admin if not exists
const adminCheck = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminCheck) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run(
    "admin@careerpulse.com",
    hashedPassword,
    "System Admin",
    "admin"
  );
}

// Seed Jobs if empty
const jobsCheck = db.prepare("SELECT COUNT(*) as count FROM jobs").get() as { count: number };
if (jobsCheck.count === 0) {
  const seedJobs = [
    {
      title: "Senior Full Stack Engineer",
      company: "TechFlow Systems",
      type: "IT",
      location: "San Francisco, CA",
      experience: "5+ Years",
      qualification: "Bachelor's in Computer Science",
      salary: "$140k - $180k",
      description: "We are looking for a Senior Full Stack Engineer to join our core product team. You will be responsible for building scalable web applications using React and Node.js.",
      skills: "React, Node.js, TypeScript, PostgreSQL",
      last_date: "2026-05-15"
    },
    {
      title: "Assistant Administrative Officer",
      company: "Ministry of Finance",
      type: "Government",
      location: "Washington, D.C.",
      experience: "2+ Years",
      qualification: "Master's in Public Administration",
      salary: "$75k - $95k",
      description: "The Ministry of Finance is seeking an Assistant Administrative Officer to support departmental operations and policy implementation.",
      skills: "Public Policy, Administration, Microsoft Office",
      last_date: "2026-04-30"
    },
    {
      title: "Marketing Manager",
      company: "Global Retail Corp",
      type: "Private",
      location: "New York, NY",
      experience: "4+ Years",
      qualification: "MBA in Marketing",
      salary: "$90k - $120k",
      description: "Lead our regional marketing campaigns and drive brand awareness through digital and traditional channels.",
      skills: "Digital Marketing, SEO, Brand Management",
      last_date: "2026-06-01"
    }
  ];

  const insertJob = db.prepare(`
    INSERT INTO jobs (title, company, type, location, experience, qualification, salary, description, skills, last_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  seedJobs.forEach(job => {
    insertJob.run(job.title, job.company, job.type, job.location, job.experience, job.qualification, job.salary, job.description, job.skills, job.last_date);
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- Auth Middleware ---
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    next();
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const info = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, hashedPassword, name);
      const token = jwt.sign({ id: info.lastInsertRowid, email, role: "user", name }, JWT_SECRET);
      res.json({ token, user: { id: info.lastInsertRowid, email, name, role: "user" } });
    } catch (e) {
      res.status(400).json({ error: "User already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  });

  // --- Job Routes ---
  app.get("/api/jobs", (req, res) => {
    const jobs = db.prepare("SELECT * FROM jobs ORDER BY created_at DESC").all();
    res.json(jobs);
  });

  app.post("/api/jobs", authenticate, isAdmin, (req, res) => {
    const { title, company, type, location, experience, qualification, salary, description, skills, last_date, external_url } = req.body;
    const info = db.prepare(`
      INSERT INTO jobs (title, company, type, location, experience, qualification, salary, description, skills, last_date, external_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, company, type, location, experience, qualification, salary, description, skills, last_date, external_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/jobs/:id", authenticate, isAdmin, (req, res) => {
    const { title, company, type, location, experience, qualification, salary, description, skills, last_date, external_url } = req.body;
    db.prepare(`
      UPDATE jobs 
      SET title = ?, company = ?, type = ?, location = ?, experience = ?, qualification = ?, salary = ?, description = ?, skills = ?, last_date = ?, external_url = ?
      WHERE id = ?
    `).run(title, company, type, location, experience, qualification, salary, description, skills, last_date, external_url, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/jobs/:id", authenticate, isAdmin, (req, res) => {
    db.prepare("DELETE FROM jobs WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- Application Routes ---
  app.post("/api/applications", authenticate, (req: any, res) => {
    const { job_id, resume_data } = req.body;
    db.prepare("INSERT INTO applications (user_id, job_id, resume_data) VALUES (?, ?, ?)").run(
      req.user.id,
      job_id,
      resume_data ? JSON.stringify(resume_data) : null
    );
    res.json({ success: true });
  });

  app.get("/api/applications/my", authenticate, (req: any, res) => {
    const apps = db.prepare(`
      SELECT a.*, j.title, j.company 
      FROM applications a 
      JOIN jobs j ON a.job_id = j.id 
      WHERE a.user_id = ?
    `).all(req.user.id);
    res.json(apps);
  });

  app.get("/api/admin/applications", authenticate, isAdmin, (req, res) => {
    const apps = db.prepare(`
      SELECT a.*, j.title, j.company, u.name as user_name, u.email as user_email
      FROM applications a 
      JOIN jobs j ON a.job_id = j.id 
      JOIN users u ON a.user_id = u.id
    `).all();
    res.json(apps);
  });

  // --- Resume Routes ---
  app.post("/api/resumes", authenticate, (req: any, res) => {
    const { name, content } = req.body;
    const info = db.prepare("INSERT INTO resumes (user_id, name, content) VALUES (?, ?, ?)").run(
      req.user.id,
      name,
      JSON.stringify(content)
    );
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/resumes", authenticate, (req: any, res) => {
    const resumes = db.prepare("SELECT * FROM resumes WHERE user_id = ?").all(req.user.id);
    res.json(resumes);
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://localhost:3000");
  });
}

startServer();
