import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import postgres from "postgres";

const connectionString =
  process.env.apply_POSTGRES_PRISMA_URL ||
  process.env.apply_POSTGRES_URL ||
  process.env.apply_POSTGRES_URL_NON_POOLING;

if (!connectionString) throw new Error("❌ Missing Postgres connection string");

let sql: any;
if (!globalThis._sql) {
  globalThis._sql = postgres(connectionString, {
    ssl: { rejectUnauthorized: false },
    idle_timeout: 30,
    connect_timeout: 30,
  });
}
sql = globalThis._sql;

const JWT_SECRET = process.env.apply_SUPABASE_JWT_SECRET || "fallback_secret";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const users = await sql`SELECT * FROM applicants WHERE email = ${email}`;
    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = users[0];

    if (!user.password) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || "guest" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password before sending user
    const { password: _, ...userData } = user;

    return new Response(
      JSON.stringify({ token, user: userData }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ Login error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
