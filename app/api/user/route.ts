import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import postgres from 'postgres';

const connectionString = process.env.apply_POSTGRES_URL;
if (!connectionString) throw new Error('Missing Postgres connection string');

let sql: any;
if (!globalThis._sql) {
  globalThis._sql = postgres(connectionString, {
    ssl: { rejectUnauthorized: false },
  });
}
sql = globalThis._sql;

const JWT_SECRET = process.env.apply_SUPABASE_JWT_SECRET || 'fallback_secret';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ message: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }

    // Query user from DB
    const users = await sql`SELECT id, firstname, middlename, lastname, email, role FROM applicants WHERE id = ${decoded.id}`;
    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    return NextResponse.json({
      id: user.id,
      firstName: user.firstname,
      middleName: user.middlename,
      lastName: user.lastname,
      email: user.email,
      role: user.role,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
  }
}
