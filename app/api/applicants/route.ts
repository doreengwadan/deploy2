import bcrypt from "bcrypt";
import postgres from "postgres";

// Connect using your Supabase Postgres connection string
const connectionString =
  process.env.base_POSTGRES_URL ||
  process.env.base_POSTGRES_PRISMA_URL ||
  process.env.base_POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  throw new Error("❌ Missing Supabase Postgres connection string in env vars");
}

// Create a reusable connection
const sql = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  idle_timeout: 30,
  connect_timeout: 30,
});

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

    // Validate input
    if (!firstname || !lastname || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if email already exists
    const existing = await sql`SELECT * FROM applicants WHERE email = ${email}`;
    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: "Email already registered" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new applicant
    await sql`
      INSERT INTO applicants (
        title,
        firstname,
        middlename,
        lastname,
        dob,
        email,
        phone,
        password,
        role
      ) VALUES (
        ${title},
        ${firstname},
        ${middlename || null},
        ${lastname},
        ${dob || null},
        ${email},
        ${phone || null},
        ${hashedPassword},
        ${role || "guest"}
      );
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
  } finally {
    await sql.end({ timeout: 5 });
  }
}
