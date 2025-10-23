'use client';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { CheckCircle, AlertCircle, FileText, User, Phone, BookOpen, ChevronRight, Download } from 'lucide-react';
import ProgressIndicator from '@/componets/ProgressIndicator';
import Button2 from '@/componets/Button2';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
interface SubjectRecord {
  qualification: string;
  centreNumber: string;
  examNumber: string;
  subject: string;
  grade: string;
  year: string;
}
interface PersonalData {
  firstname?: string;
  lastname?: string;
  email?: string;
  dob?: string;
  programme_id?: string;
}
interface ContactData {
  mobile1?: string;
  mobile2?: string;
  email?: string;
  postal_address?: string;
}
interface NextOfKin {
  id: number;
  title: string;
  firstName: string;
  lastName: string;
  relationship: string;
  mobile1: string;
  mobile2?: string;
  email?: string;
  address?: string;
}
interface ApplicationData {
  personal: PersonalData | null;
  contact: ContactData | null;
  nextOfKin: NextOfKin[];
  subjects: SubjectRecord[];
}
export default function FinalSubmitPage() {
  const [data, setData] = useState<ApplicationData>({
    personal: null,
    contact: null,
    nextOfKin: [],
    subjects: [],
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [progress, setProgress] = useState(0);
  const token = Cookies.get('token');
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const generateReferenceNumber = () => {
    const prefix = 'MZU';
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${date}-${random}`;
  };
  // Simulate Google-style progress bar
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setProgress(20);
      interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + Math.random() * 10 : prev));
      }, 300);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 300);
      return () => clearTimeout(timeout);
    }
    return () => clearInterval(interval);
  }, [loading]);
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('You must be logged in to view this page.');
        return;
      }
      setLoading(true);
      try {
        const userRes = await axiosInstance.get('/user');
        const applicantId = userRes.data.id;
        const [personalRes, contactRes, kinRes, subjectsRes] = await Promise.all([
          axiosInstance.get(`/applicants/${applicantId}`),
          axiosInstance.get(`/contacts/${applicantId}`),
          axiosInstance.get(`/applicants/${applicantId}/next-of-kin`),
          axiosInstance.get(`/subject-records`),
        ]);
        const subjectRecords: SubjectRecord[] = Array.isArray(subjectsRes.data)
          ? subjectsRes.data.map((r: any) => ({
              qualification: r.qualification || '',
              centreNumber: r.centre_number || '',
              examNumber: r.exam_number || '',
              subject: r.subject || '',
              grade: r.grade || '',
              year: r.year || '',
            }))
          : [];
        const nextOfKinData: NextOfKin[] = Array.isArray(kinRes.data.data)
          ? kinRes.data.data
          : kinRes.data.data ? [kinRes.data.data] : [];
        setData({
          personal: personalRes.data.data || personalRes.data,
          contact: contactRes.data.contact || contactRes.data.data || contactRes.data,
          nextOfKin: nextOfKinData,
          subjects: subjectRecords,
        });
      } catch (err: any) {
        console.error('Error fetching applicant data:', err);
        setError('Failed to load applicant data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setLoading(true);
    if (!token) {
      setError('You must be logged in to submit.');
      setLoading(false);
      return;
    }
    try {
      const reference = generateReferenceNumber();
      const programmeId = data.personal?.programme_id;
      if (!programmeId) {
        setError('Your programme information is missing. Please update your profile.');
        setLoading(false);
        return;
      }
      const res = await axiosInstance.post('/applicant-submissions', {
        reference_number: reference,
        programme_id: programmeId,
      });
      if (res.data.success) {
        setReferenceNumber(reference);
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      if (err.response?.status === 422 && err.response.data.details) {
        setValidationErrors(err.response.data.details);
        setError('Please fix the highlighted validation errors.');
      } else if (err.response?.status === 409 && err.response.data.submission) {
        setSubmitted(true);
        setReferenceNumber(err.response.data.submission.reference_number);
        setError(null);
      } else {
        setError(err.response?.data?.error || 'An error occurred while submitting.');
      }
    } finally {
      setLoading(false);
    }
  };
  const handlePrintApplication = () => {
    window.print();
  };
  return (
    <>
      {/* Google-style top loading bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-green-600 transition-all duration-300 z-50 shadow-lg"
        style={{ width: `${progress}%` }}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Final Application Review
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Review your application details before final submission. Once submitted, you'll receive your reference number for payment.
            </p>
          </div>
          <ProgressIndicator currentStep={11} />
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-6 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}
            {!submitted ? (
              <form onSubmit={handleFinalSubmit} className="p-8">
                {/* Personal Details Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg mr-4">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Personal Details</h3>
                      <p className="text-gray-600">Your basic information</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-semibold text-gray-900">
                        {data.personal?.firstname} {data.personal?.lastname}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">
                        {data.personal?.email || 'Not provided'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-semibold text-gray-900">
                        {data.personal?.dob || 'Not provided'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Programme ID</p>
                      <p className="font-semibold text-gray-900">
                        {data.personal?.programme_id || 'Not selected'}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Contact Details Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-100">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-100 rounded-lg mr-4">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                      <p className="text-gray-600">How we can reach you</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Primary Mobile</p>
                      <p className="font-semibold text-gray-900">
                        {data.contact?.mobile1 || 'Not provided'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Secondary Mobile</p>
                      <p className="font-semibold text-gray-900">
                        {data.contact?.mobile2 || 'Not provided'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Contact Email</p>
                      <p className="font-semibold text-gray-900">
                        {data.contact?.email || 'Not provided'}
                      </p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <p className="text-sm text-gray-500">Postal Address</p>
                      <p className="font-semibold text-gray-900">
                        {data.contact?.postal_address || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Next of Kin Card */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 mb-6 border border-purple-100">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg mr-4">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Next of Kin</h3>
                      <p className="text-gray-600">Your emergency contacts</p>
                    </div>
                  </div>
                  {data.nextOfKin.length > 0 ? (
                    <div className="space-y-4">
                      {data.nextOfKin.map((kin: NextOfKin, index: number) => (
                        <div key={kin.id} className="bg-white rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">
                              Contact {index + 1}
                            </h4>
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                              {kin.relationship}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <p className="text-sm text-gray-500">Full Name</p>
                              <p className="font-medium">{kin.title} {kin.firstName} {kin.lastName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Phone Numbers</p>
                              <p className="font-medium">
                                {kin.mobile1}{kin.mobile2 ? `, ${kin.mobile2}` : ''}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium">{kin.email || 'Not provided'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Address</p>
                              <p className="font-medium">{kin.address || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No next of kin added</p>
                    </div>
                  )}
                </div>
                {/* Subjects Card */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 mb-8 border border-orange-100">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg mr-4">
                      <BookOpen className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Academic Records</h3>
                      <p className="text-gray-600">Your subject qualifications</p>
                    </div>
                  </div>
                  {data.subjects.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-orange-100/50">
                            <th className="text-left p-3 text-sm font-semibold text-gray-700 border-b">Qualification</th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-700 border-b">Centre</th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-700 border-b">Exam No</th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-700 border-b">Subject</th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-700 border-b">Grade</th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-700 border-b">Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.subjects.map((r: SubjectRecord, i: number) => (
                            <tr key={i} className="hover:bg-orange-50/30 transition-colors">
                              <td className="p-3 border-b text-sm">{r.qualification}</td>
                              <td className="p-3 border-b text-sm font-mono">{r.centreNumber}</td>
                              <td className="p-3 border-b text-sm font-mono">{r.examNumber}</td>
                              <td className="p-3 border-b text-sm font-medium">{r.subject}</td>
                              <td className="p-3 border-b text-sm">
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                                  {r.grade}
                                </span>
                              </td>
                              <td className="p-3 border-b text-sm">{r.year}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No subject records found</p>
                    </div>
                  )}
                </div>
                {/* Submit Button */}
                <div className="text-center">
                  <Button2 
                    type="submit" 
                    className="w-full md:w-auto min-w-[200px] py-4 text-lg font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Submit Application
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button2>
                </div>
              </form>
            ) : (
              /* Success State */
              <div className="p-12 text-center">
                <div className="mb-8">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Application Submitted Successfully!
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Your application has been received and is now being processed. Please save your reference number for future correspondence and payment.
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 max-w-md mx-auto mb-8">
                  <div className="bg-white rounded-xl p-6 border-2 border-dashed border-green-300">
                    <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide font-semibold">
                      Your Reference Number
                    </p>
                    <p className="text-2xl font-bold text-green-700 font-mono tracking-wide">
                      {referenceNumber}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Use this reference when making payment or writing your deposit slip.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={handlePrintApplication}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Print Application
                  </button>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}add 