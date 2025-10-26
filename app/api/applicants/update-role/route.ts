import postgres from "postgres";
import jwt from "jsonwebtoken";

const connectionString =
  process.env.apply_POSTGRES_PRISMA_URL ||
  process.env.apply_POSTGRES_URL ||
  process.env.apply_POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  throw new Error("❌ Missing Postgres connection string in env vars");
}

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

export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const { role } = await req.json();
    if (!role) {
      return new Response(JSON.stringify({ message: "Role is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Update role in database
    const result = await sql`
      UPDATE applicants
      SET role = ${role}
      WHERE id = ${decoded.id}
      RETURNING id, email, role
    `;

    if (result.length === 0) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ message: "Role updated successfully", user: result[0] }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("❌ Update role error:", err);
    return new Response(JSON.stringify({ message: "Server error", error: err instanceof Error ? err.message : String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
