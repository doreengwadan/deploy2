import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import postgres from "postgres";

// Database connection
const connectionString = process.env.apply_POSTGRES_URL;
if (!connectionString) throw new Error("Missing database connection string");

let sql: any;
if (!globalThis._sql) {
  globalThis._sql = postgres(connectionString, { ssl: { rejectUnauthorized: false } });
}
sql = globalThis._sql;

// JWT secret
const JWT_SECRET = process.env.apply_SUPABASE_JWT_SECRET || "fallback_secret";

// Verify token
async function verifyToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error("Invalid or expired token");
  }
}

// GET — fetch subject records for an applicant
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyToken(req);
    const { id } = params;
    const records = await sql`
      SELECT * FROM subject_records WHERE applicant_id = ${id} ORDER BY year DESC
    `;
    return NextResponse.json(records);
  } catch (err: any) {
    console.error(err);
    const status = ["Unauthorized", "Invalid or expired token"].includes(err.message) ? 401 : 500;
    return NextResponse.json({ message: err.message }, { status });
  }
}

// POST — insert multiple subject records
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyToken(req);
    const { id } = params;
    const { records } = await req.json(); // expects an array of records

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ message: "No records provided" }, { status: 400 });
    }

    const inserted: any[] = [];
    for (const r of records) {
      const row = await sql`
        INSERT INTO subject_records
          (applicant_id, qualification, centre_number, exam_number, subject, grade, year)
        VALUES
          (${id}, ${r.qualification}, ${r.centre_number}, ${r.exam_number}, ${r.subject}, ${r.grade}, ${r.year})
        RETURNING *
      `;
      inserted.push(row[0]);
    }

    return NextResponse.json({ message: "Records saved successfully", data: inserted }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    const status = ["Unauthorized", "Invalid or expired token"].includes(err.message) ? 401 : 500;
    return NextResponse.json({ message: err.message }, { status });
  }
}

// PUT — update a single subject record
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyToken(req);
    const { id } = params;
    const { recordId, qualification, centre_number, exam_number, subject, grade, year } = await req.json();

    await sql`
      UPDATE subject_records
      SET 
        qualification = ${qualification},
        centre_number = ${centre_number},
        exam_number = ${exam_number},
        subject = ${subject},
        grade = ${grade},
        year = ${year}
      WHERE id = ${recordId} AND applicant_id = ${id}
    `;

    return NextResponse.json({ message: "Record updated successfully" });
  } catch (err: any) {
    console.error(err);
    const status = ["Unauthorized", "Invalid or expired token"].includes(err.message) ? 401 : 500;
    return NextResponse.json({ message: err.message }, { status });
  }
}

// DELETE — remove a subject record
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyToken(req);
    const { id } = params;
    const { recordId } = await req.json();

    await sql`DELETE FROM subject_records WHERE id = ${recordId} AND applicant_id = ${id}`;

    return NextResponse.json({ message: "Record deleted successfully" });
  } catch (err: any) {
    console.error(err);
    const status = ["Unauthorized", "Invalid or expired token"].includes(err.message) ? 401 : 500;
    return NextResponse.json({ message: err.message }, { status });
  }
}
