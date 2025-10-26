declare global {
  var _sql: any;
}

import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';

import postgres from 'postgres';

const connectionString = process.env.apply_POSTGRES_URL;
if (!connectionString) throw new Error('Missing Postgres connection string');

let sql: any;
if (!globalThis._sql) {
  globalThis._sql = postgres(connectionString, { ssl: { rejectUnauthorized: false } });
}
sql = globalThis._sql;

const JWT_SECRET = process.env.apply_SUPABASE_JWT_SECRET || 'fallback_secret';

export async function GET(req: NextRequest) {
  try {
    // Extract ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1]; // last part of path
    if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 });

    // Check Authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized: Missing token' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '').trim();
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ message: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }

    // Optional: Ensure token matches requested ID
    if (decoded.id !== id) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    // Query full applicant profile
    const applicants = await sql`
      SELECT id, firstname, middlename, lastname, gender, dob, nationality, national_id,
             home_district, physical_address, email, role
      FROM applicants
      WHERE id = ${id}
    `;
    if (!applicants || applicants.length === 0) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const applicant = applicants[0];

    return NextResponse.json({
      id: applicant.id,
      firstName: applicant.firstname,
      middleName: applicant.middlename,
      lastName: applicant.lastname,
      gender: applicant.gender,
      dob: applicant.dob,
      nationality: applicant.nationality,
      nationalId: applicant.national_id,
      homeDistrict: applicant.home_district,
      physicalAddress: applicant.physical_address,
      email: applicant.email,
      role: applicant.role,
    });
  } catch (err: any) {
    console.error('Error fetching applicant:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
