import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Connection
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL && process.env.NODE_ENV === "production") {
  console.error("CRITICAL ERROR: DATABASE_URL is not defined in environment variables!");
  console.error("Please add DATABASE_URL to your Render environment settings.");
}

// Configure postgres with SSL for Supabase
const sql = postgres(DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres", {
  ssl: DATABASE_URL ? { rejectUnauthorized: false } : false,
  connect_timeout: 10,
  max: 10,
});
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Global error handlers
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Give the server a second to log before exiting
  setTimeout(() => process.exit(1), 1000);
});

// Initialize Database
async function initDb() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        type TEXT NOT NULL,
        location TEXT NOT NULL,
        experience TEXT NOT NULL,
        qualification TEXT NOT NULL,
        salary TEXT NOT NULL,
        description TEXT NOT NULL,
        skills TEXT NOT NULL,
        last_date TEXT NOT NULL,
        external_url TEXT,
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        job_id INTEGER NOT NULL REFERENCES jobs(id),
        resume_data JSONB,
        status TEXT DEFAULT 'Pending',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS resumes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        content JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Seed Admin if not exists
    const adminCheck = await sql`SELECT * FROM users WHERE role = 'admin' LIMIT 1`;
    if (adminCheck.length === 0) {
      const hashedPassword = bcrypt.hashSync("admin123", 10);
      await sql`INSERT INTO users (email, password, name, role) VALUES ('admin@careerpulse.com', ${hashedPassword}, 'System Admin', 'admin')`;
    }

    // Seed Jobs if empty
    const jobsCheck = await sql`SELECT COUNT(*) as count FROM jobs`;
    if (parseInt(jobsCheck[0].count) === 0) {
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

      for (const job of seedJobs) {
        await sql`
          INSERT INTO jobs (title, company, type, location, experience, qualification, salary, description, skills, last_date)
          VALUES (${job.title}, ${job.company}, ${job.type}, ${job.location}, ${job.experience}, ${job.qualification}, ${job.salary}, ${job.description}, ${job.skills}, ${job.last_date})
        `;
      }
    }
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Start listening immediately to satisfy Render's health check
  const server = app.listen(3000, "0.0.0.0", () => {
    console.log("Server listening on port 3000");
  });

  // Initialize DB in the background
  initDb().then(() => {
    console.log("Background DB initialization complete");
  }).catch(err => {
    console.error("Background DB initialization failed:", err);
  });

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
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const [user] = await sql`
        INSERT INTO users (email, password, name) 
        VALUES (${email}, ${hashedPassword}, ${name})
        RETURNING id, email, name, role
      `;
      const token = jwt.sign({ id: user.id, email, role: "user", name }, JWT_SECRET);
      res.json({ token, user });
    } catch (e) {
      res.status(400).json({ error: "User already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  });

  // --- Job Routes ---
  app.get("/api/jobs", async (req, res) => {
    const jobs = await sql`SELECT * FROM jobs ORDER BY created_at DESC`;
    res.json(jobs);
  });

  app.post("/api/jobs", authenticate, isAdmin, async (req, res) => {
    const { title, company, type, location, experience, qualification, salary, description, skills, last_date, external_url } = req.body;
    const [job] = await sql`
      INSERT INTO jobs (title, company, type, location, experience, qualification, salary, description, skills, last_date, external_url)
      VALUES (${title}, ${company}, ${type}, ${location}, ${experience}, ${qualification}, ${salary}, ${description}, ${skills}, ${last_date}, ${external_url})
      RETURNING id
    `;
    res.json({ id: job.id });
  });

  app.put("/api/jobs/:id", authenticate, isAdmin, async (req, res) => {
    const { title, company, type, location, experience, qualification, salary, description, skills, last_date, external_url } = req.body;
    await sql`
      UPDATE jobs 
      SET title = ${title}, company = ${company}, type = ${type}, location = ${location}, experience = ${experience}, qualification = ${qualification}, salary = ${salary}, description = ${description}, skills = ${skills}, last_date = ${last_date}, external_url = ${external_url}
      WHERE id = ${req.params.id}
    `;
    res.json({ success: true });
  });

  app.delete("/api/jobs/:id", authenticate, isAdmin, async (req, res) => {
    await sql`DELETE FROM jobs WHERE id = ${req.params.id}`;
    res.json({ success: true });
  });

  // --- Application Routes ---
  app.post("/api/applications", authenticate, async (req: any, res) => {
    const { job_id, resume_data } = req.body;
    await sql`
      INSERT INTO applications (user_id, job_id, resume_data) 
      VALUES (${req.user.id}, ${job_id}, ${resume_data ? JSON.stringify(resume_data) : null})
    `;
    res.json({ success: true });
  });

  app.get("/api/applications/my", authenticate, async (req: any, res) => {
    const apps = await sql`
      SELECT a.*, j.title, j.company 
      FROM applications a 
      JOIN jobs j ON a.job_id = j.id 
      WHERE a.user_id = ${req.user.id}
    `;
    res.json(apps);
  });

  app.get("/api/admin/applications", authenticate, isAdmin, async (req, res) => {
    const apps = await sql`
      SELECT a.*, j.title, j.company, u.name as user_name, u.email as user_email
      FROM applications a 
      JOIN jobs j ON a.job_id = j.id 
      JOIN users u ON a.user_id = u.id
    `;
    res.json(apps);
  });

  // --- Resume Routes ---
  app.post("/api/resumes", authenticate, async (req: any, res) => {
    const { name, content } = req.body;
    const [resume] = await sql`
      INSERT INTO resumes (user_id, name, content) 
      VALUES (${req.user.id}, ${name}, ${JSON.stringify(content)})
      RETURNING id
    `;
    res.json({ id: resume.id });
  });

  app.get("/api/resumes", authenticate, async (req: any, res) => {
    const resumes = await sql`SELECT * FROM resumes WHERE user_id = ${req.user.id}`;
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
}

startServer();
