"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
import Button2 from "@/componets/Button2";
import ProgressIndicator from "@/componets/ProgressIndicator";

// 🔹 Config
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 20 }, (_, i) => (currentYear - i).toString());

// ---------------- UNDERGRADUATE ----------------
const subjectsList = [
  "English", "Chichewa", "Mathematics", "Biology", "Physical Science",
  "Agriculture", "Geography", "History", "Bible Knowledge",
  "Social and Development Studies", "Computer Studies", "Home Economics",
  "Clothing and Textiles", "Woodwork", "Metalwork", "Technical Drawing",
  "French", "Life Skills", "Chemistry",
];
const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const qualifications = ["MSCE", "IGCSE"];

type SubjectRow = {
  qualification: string;
  centreNumber: string;
  examNumber: string;
  subject: string;
  grade: string;
  year: string;
};

function SubjectSelectionTable() {
  const [rows, setRows] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "review">("form");
  const router = useRouter();

  useEffect(() => {
    const t = Cookies.get("token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    const fetchRecords = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/subject-records`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && Array.isArray(res.data)) {
          const formatted = res.data.map((r: any) => ({
            qualification: r.qualification || "",
            centreNumber: r.centre_number || "",
            examNumber: r.exam_number || "",
            subject: r.subject || "",
            grade: r.grade || "",
            year: r.year || "",
          }));
          setRows(formatted);
          setStep("review");
        } else {
          setRows(Array.from({ length: 8 }, () => ({
            qualification: "", centreNumber: "", examNumber: "", subject: "", grade: "", year: "",
          })));
        }
      } catch (err) {
        console.error("Failed to fetch subject records:", err);
        setRows(Array.from({ length: 8 }, () => ({
          qualification: "", centreNumber: "", examNumber: "", subject: "", grade: "", year: "",
        })));
      }
    };
    fetchRecords();
  }, [token]);

  const handleChange = (i: number, field: keyof SubjectRow, value: string) => {
    const newRows = [...rows];
    newRows[i][field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { qualification: "", centreNumber: "", examNumber: "", subject: "", grade: "", year: "" }]);
  };
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const formatted = rows.map((r) => ({
        qualification: r.qualification,
        centre_number: r.centreNumber,
        exam_number: r.examNumber,
        subject: r.subject,
        grade: r.grade,
        year: r.year,
      }));
      await axios.post(`${API_BASE_URL}/subject-records`, { records: formatted }, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      setStep("review");
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save subjects.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <p className="text-center p-6">Checking authentication...</p>;

  return step === "form" ? (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl text-green-900 text-center font-bold mb-6">Subjects and Grades</h2>
      
      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="w-full min-w-[800px] table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Qualification</th>
              <th className="border p-2 text-left">Centre Number</th>
              <th className="border p-2 text-left">Exam Number</th>
              <th className="border p-2 text-left">Subject</th>
              <th className="border p-2 text-left">Grade</th>
              <th className="border p-2 text-left">Year</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border p-2">
                  <select value={row.qualification} onChange={(e) => handleChange(i, "qualification", e.target.value)} className="w-full border rounded p-1 text-sm md:text-base">
                    <option value="">Select</option>
                    {qualifications.map((q) => <option key={q}>{q}</option>)}
                  </select>
                </td>
                <td className="border p-2">
                  <input value={row.centreNumber} onChange={(e) => handleChange(i, "centreNumber", e.target.value)} className="w-full border rounded p-1 text-sm md:text-base" />
                </td>
                <td className="border p-2">
                  <input value={row.examNumber} onChange={(e) => handleChange(i, "examNumber", e.target.value)} className="w-full border rounded p-1 text-sm md:text-base" />
                </td>
                <td className="border p-2">
                  <select value={row.subject} onChange={(e) => handleChange(i, "subject", e.target.value)} className="w-full border rounded p-1 text-sm md:text-base">
                    <option value="">Select subject</option>
                    {subjectsList.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="border p-2">
                  <select value={row.grade} onChange={(e) => handleChange(i, "grade", e.target.value)} className="w-full border rounded p-1 text-sm md:text-base">
                    <option value="">Select grade</option>
                    {grades.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </td>
                <td className="border p-2">
                  <select value={row.year} onChange={(e) => handleChange(i, "year", e.target.value)} className="w-full border rounded p-1 text-sm md:text-base">
                    <option value="">Select year</option>
                    {years.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </td>
                <td className="border p-2 text-center">
                  <button onClick={() => removeRow(i)} className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col md:flex-row justify-between gap-4">
        <button onClick={addRow} className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          <Plus className="mr-2" size={18}/> Add New Record
        </button>
        <Button2 onClick={handleSave} disabled={loading} className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
          {loading ? "Saving..." : "Save & Next"}
        </Button2>
      </div>

      {/* Mobile scroll hint */}
      <div className="md:hidden text-center mt-2">
        <p className="text-xs text-gray-500">← Scroll horizontally to see all columns →</p>
      </div>
    </div>
  ) : (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl text-green-900 font-bold text-center mb-6">Review Your Details</h2>
      
      {/* Review Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="w-full min-w-[700px] border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Qualification</th>
              <th className="border p-2 text-left">Centre</th>
              <th className="border p-2 text-left">Exam No</th>
              <th className="border p-2 text-left">Subject</th>
              <th className="border p-2 text-left">Grade</th>
              <th className="border p-2 text-left">Year</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border p-2">{r.qualification}</td>
                <td className="border p-2">{r.centreNumber}</td>
                <td className="border p-2">{r.examNumber}</td>
                <td className="border p-2">{r.subject}</td>
                <td className="border p-2">{r.grade}</td>
                <td className="border p-2">{r.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col md:flex-row justify-between gap-4">
        <button onClick={() => setStep("form")} className="px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">Edit</button>
        <button onClick={() => router.push("/application/program-selection")} className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">Continue</button>
      </div>

      {/* Mobile scroll hint */}
      <div className="md:hidden text-center mt-2">
        <p className="text-xs text-gray-500">← Scroll horizontally to see all columns →</p>
      </div>
    </div>
  );
}

// ---------------- OTHER QUALIFICATIONS ----------------
type OtherRow = { qualification: string; institution: string; year: string; teachingSubject?: string; workExperience?: string; };

function OtherQualificationsTable({ type }: { type: string }) {
  const [rows, setRows] = useState<OtherRow[]>([{ qualification: "", institution: "", year: "" }]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const t = Cookies.get("token");
    if (!t) { router.push("/login"); return; }
    setToken(t);
  }, [router]);

  const handleChange = (i: number, field: keyof OtherRow, value: string) => {
    const newRows = [...rows]; newRows[i][field] = value; setRows(newRows);
  };
  const addRow = () => setRows([...rows, { qualification: "", institution: "", year: "" }]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/other-qualifications`, { records: rows, type }, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      router.push("/application/program-selection");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save qualifications.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate minimum width based on type
  const minWidth = type === "teacher" ? "min-w-[900px]" : "min-w-[600px]";

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold text-green-900 text-center mb-6">
        {type === "teacher" ? "Teaching Qualifications" : "Other Qualifications"}
      </h2>
      
      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className={`w-full ${minWidth} table-auto`}>
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Qualification</th>
              <th className="border p-2 text-left">Award Institution</th>
              <th className="border p-2 text-left">Year</th>
              {type === "teacher" && <th className="border p-2 text-left">Teaching Subject</th>}
              {type === "teacher" && <th className="border p-2 text-left">Work Experience</th>}
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border p-2">
                  <input value={row.qualification} onChange={(e) => handleChange(i, "qualification", e.target.value)} className="w-full border rounded p-1 text-sm md:text-base" />
                </td>
                <td className="border p-2">
                  <input value={row.institution} onChange={(e) => handleChange(i, "institution", e.target.value)} className="w-full border rounded p-1 text-sm md:text-base" />
                </td>
                <td className="border p-2">
                  <select value={row.year} onChange={(e) => handleChange(i, "year", e.target.value)} className="w-full border rounded p-1 text-sm md:text-base">
                    <option value="">Select</option>
                    {years.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </td>
                {type === "teacher" && (
                  <>
                    <td className="border p-2">
                      <input value={row.teachingSubject || ""} onChange={(e) => handleChange(i, "teachingSubject", e.target.value)} className="w-full border rounded p-1 text-sm md:text-base" />
                    </td>
                    <td className="border p-2">
                      <input value={row.workExperience || ""} onChange={(e) => handleChange(i, "workExperience", e.target.value)} className="w-full border rounded p-1 text-sm md:text-base" placeholder="e.g. 5 years" />
                    </td>
                  </>
                )}
                <td className="border p-2 text-center">
                  <button onClick={() => removeRow(i)} className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col md:flex-row justify-between gap-4">
        <button onClick={addRow} className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          <Plus className="mr-2" size={18}/> Add
        </button>
        <Button2 onClick={handleSave} disabled={loading} className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
          {loading ? "Saving..." : "Save & Next"}
        </Button2>
      </div>

      {/* Mobile scroll hint */}
      <div className="md:hidden text-center mt-2">
        <p className="text-xs text-gray-500">← Scroll horizontally to see all columns →</p>
      </div>
    </div>
  );
}

// ---------------- MAIN ENTRY ----------------
export default function QualificationStep() {
  const [applicationType, setApplicationType] = useState<string | null>(null);

  useEffect(() => {
    const type = Cookies.get("applicationType") || "undergraduate"; // default
    setApplicationType(type);
  }, []);

  if (!applicationType) return <p className="text-center p-6">Loading...</p>;

  return (
    <>
      <ProgressIndicator currentStep={6} />
      {applicationType === "undergraduate"
        ? <SubjectSelectionTable />
        : <OtherQualificationsTable type={applicationType} />}
    </>
  );
}