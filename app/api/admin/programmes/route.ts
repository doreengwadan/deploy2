import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const connectionString =
  process.env.apply_POSTGRES_PRISMA_URL ||
  process.env.apply_POSTGRES_URL ||
  process.env.apply_POSTGRES_URL_NON_POOLING;

if (!connectionString) throw new Error("Missing Postgres connection string");

// Persistent connection
let sql: any;
if (!globalThis._sql) {
  globalThis._sql = postgres(connectionString, {
    ssl: { rejectUnauthorized: false },
  });
}
sql = globalThis._sql;

// --- GET all programmes ---
export async function GET() {
  try {
    const programmes = await sql`
      SELECT p.id, p.name, p.duration, p.category, p.applicant_id, p.created_at,
             a.firstname, a.lastname
      FROM programmes p
      LEFT JOIN applicants a ON a.id = p.applicant_id
      ORDER BY p.id DESC
    `;
    return NextResponse.json(programmes);
  } catch (error) {
    console.error('❌ Error fetching programmes:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// --- POST create programme ---
export async function POST(req: NextRequest) {
  try {
    const { name, duration, category, applicant_id } = await req.json();

    if (!name || !duration || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO programmes (name, duration, category, applicant_id)
      VALUES (${name}, ${duration}, ${category}, ${applicant_id || null})
      RETURNING *
    `;

    return NextResponse.json({ message: 'Programme created successfully!', programme: result[0] }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating programme:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// --- PUT update programme ---
export async function PUT(req: NextRequest) {
  try {
    const { id, name, duration, category, applicant_id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Programme ID is required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE programmes
      SET name = ${name}, duration = ${duration}, category = ${category}, applicant_id = ${applicant_id || null}, updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Programme not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Programme updated successfully!', programme: result[0] });
  } catch (error) {
    console.error('❌ Error updating programme:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
