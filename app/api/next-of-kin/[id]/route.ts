import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import postgres from 'postgres';

const connectionString = process.env.apply_POSTGRES_URL;
if (!connectionString) throw new Error('Missing database connection string');

let sql: any;
if (!globalThis._sql) {
  globalThis._sql = postgres(connectionString, { ssl: { rejectUnauthorized: false } });
}
sql = globalThis._sql;

const JWT_SECRET = process.env.apply_SUPABASE_JWT_SECRET || 'fallback_secret';

// Helper to verify JWT token
async function verifyToken(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) throw new Error('Unauthorized');

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error('Invalid or expired token');
  }
}

// GET — fetch next of kin
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyToken(req);
    const { id } = await params;

    const kin = await sql`
      SELECT * FROM next_of_kin WHERE applicant_id = ${id}
    `;
    return NextResponse.json({ data: kin });
  } catch (err: any) {
    console.error(err);
    const status = ['Unauthorized', 'Invalid or expired token'].includes(err.message) ? 401 : 500;
    return NextResponse.json({ message: err.message }, { status });
  }
}

// POST — add a next of kin
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyToken(req);
    const { title, firstName, lastName, relationship, mobile1, mobile2, email, address } = await req.json();
    const { id } = await params;

    const inserted = await sql`
      INSERT INTO next_of_kin 
        (applicant_id, title, "firstName", "lastName", relationship, mobile1, mobile2, email, address)
      VALUES 
        (${id}, ${title}, ${firstName}, ${lastName}, ${relationship}, ${mobile1}, ${mobile2}, ${email}, ${address})
      RETURNING *
    `;
    return NextResponse.json({ message: 'Next of kin added successfully', data: inserted[0] }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    const status = ['Unauthorized', 'Invalid or expired token'].includes(err.message) ? 401 : 500;
    return NextResponse.json({ message: err.message }, { status });
  }
}

// PUT — update a next of kin
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyToken(req);
    const { kinId, title, firstName, lastName, relationship, mobile1, mobile2, email, address } = await req.json();
    const { id } = await params;

    await sql`
      UPDATE next_of_kin
      SET 
        title = ${title}, 
        "firstName" = ${firstName}, 
        "lastName" = ${lastName}, 
        relationship = ${relationship}, 
        mobile1 = ${mobile1}, 
        mobile2 = ${mobile2}, 
        email = ${email}, 
        address = ${address}
      WHERE id = ${kinId} AND applicant_id = ${id}
    `;
    return NextResponse.json({ message: 'Next of kin updated successfully' });
  } catch (err: any) {
    console.error(err);
    const status = ['Unauthorized', 'Invalid or expired token'].includes(err.message) ? 401 : 500;
    return NextResponse.json({ message: err.message }, { status });
  }
}

// DELETE — remove a next of kin
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyToken(req);
    const { kinId } = await req.json();
    const { id } = await params;

    await sql`
      DELETE FROM next_of_kin WHERE id = ${kinId} AND applicant_id = ${id}
    `;
    return NextResponse.json({ message: 'Next of kin deleted successfully' });
  } catch (err: any) {
    console.error(err);
    const status = ['Unauthorized', 'Invalid or expired token'].includes(err.message) ? 401 : 500;
    return NextResponse.json({ message: err.message }, { status });
  }
}