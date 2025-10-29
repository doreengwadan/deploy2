import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

const connectionString =
  process.env.apply_POSTGRES_PRISMA_URL ||
  process.env.apply_POSTGRES_URL ||
  process.env.apply_POSTGRES_URL_NON_POOLING;

if (!connectionString) throw new Error("❌ Missing Postgres connection string");

// Keep persistent connection
let sql: any;
if (!globalThis._sql) {
  globalThis._sql = postgres(connectionString, { ssl: { rejectUnauthorized: false } });
}
sql = globalThis._sql;

// --- GET single programme ---
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const programme = await sql`
      SELECT id, name, duration, category, applicant_id, created_at, updated_at
      FROM programmes
      WHERE id = ${params.id}
    `;

    if (programme.length === 0) {
      return NextResponse.json({ error: "Programme not found" }, { status: 404 });
    }

    return NextResponse.json(programme[0]);
  } catch (error) {
    console.error("❌ Error fetching programme:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// --- PUT update programme ---
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, duration, category, applicant_id } = await req.json();

    if (!name || !duration || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await sql`
      UPDATE programmes
      SET 
        name = ${name},
        duration = ${duration},
        category = ${category},
        applicant_id = ${applicant_id || null},
        updated_at = now()
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Programme not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "✅ Programme updated successfully!", programme: result[0] });
  } catch (error) {
    console.error("❌ Error updating programme:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// --- DELETE programme ---
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await sql`
      DELETE FROM programmes
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Programme not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "🗑️ Programme deleted successfully!", programme: result[0] });
  } catch (error) {
    console.error("❌ Error deleting programme:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
