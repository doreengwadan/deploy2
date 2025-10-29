import bcrypt from "bcryptjs";
import postgres from "postgres";

// --- Persistent connection setup ---
const connectionString =
  process.env.apply_POSTGRES_PRISMA_URL ||
  process.env.apply_POSTGRES_URL ||
  process.env.apply_POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  throw new Error("❌ Missing Supabase Postgres connection string in env vars");
}

// Global connection reuse (important for Next.js hot reloads)
let sql: any;
if (!globalThis._sql) {
  globalThis._sql = postgres(connectionString, {
    ssl: { rejectUnauthorized: false },
    idle_timeout: 30,
    connect_timeout: 30,
  });
}
sql = globalThis._sql;

// --- GET handler (Fetch all applicants) ---
export async function GET() {
  try {
    const applicants = await sql`
      SELECT 
        id, 
        title, 
        firstname, 
        middlename, 
        lastname, 
        dob, 
        email, 
        phone, 
        role, 
        created_at 
      FROM applicants
      ORDER BY id DESC
    `;

    return new Response(JSON.stringify(applicants), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching applicants:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// --- POST handler (Register applicant) ---
export async function POST(req: Request) {
  try {
    const {
      title,
      firstname,
      middlename,
      lastname,
      dob,
      email,
      phone,
      password,
      role,
    } = await req.json();

    // Validate required fields
    if (!firstname || !lastname || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if email already exists
    const existing = await sql`SELECT 1 FROM applicants WHERE email = ${email}`;
    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: "Email already registered" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert applicant
    await sql`
      INSERT INTO applicants (
        title, firstname, middlename, lastname, dob,
        email, phone, password, role
      ) VALUES (
        ${title || null},
        ${firstname},
        ${middlename || null},
        ${lastname},
        ${dob || null},
        ${email},
        ${phone || null},
        ${hashedPassword},
        ${role || "guest"}
      )
    `;

    return new Response(
      JSON.stringify({ message: "✅ Applicant registered successfully!" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Applicant registration error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
