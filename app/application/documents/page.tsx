'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { FileText, CreditCard, Receipt, Download, Trash2, Eye, File } from 'lucide-react';
import ProgressIndicator from '@/componets/ProgressIndicator';
import Button2 from '@/componets/Button2';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

type UploadedRecord = {
  id?: number;
  applicant_id?: number;
  msce?: string | number;
  msce_size?: number;
  msce_name?: string;
  id_card?: string | number;
  id_card_size?: number;
  id_card_name?: string;
  payment_proof?: string | number;
  payment_proof_size?: number;
  payment_proof_name?: string;
  created_at?: string;
  updated_at?: string;
};

type DocumentInfo = {
  name: string;
  field: keyof UploadedRecord;
  label: string;
  required: boolean;
  icon: React.ComponentType<any>;
};

const documentTypes: DocumentInfo[] = [
  { name: 'msce', field: 'msce', label: 'MSCE/Equivalent Certificate', required: true, icon: FileText },
  { name: 'id_card', field: 'id_card', label: 'National ID or Passport', required: true, icon: CreditCard },
  { name: 'payment_proof', field: 'payment_proof', label: 'Payment Proof', required: false, icon: Receipt },
];

export default function DocumentsUploadPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [files, setFiles] = useState<{ msce: File | null; id_card: File | null; payment_proof: File | null }>({
    msce: null,
    id_card: null,
    payment_proof: null,
  });
  const [uploadResult, setUploadResult] = useState<UploadedRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = Cookies.get('token');
    if (!storedToken) {
      router.push('/login');
      return;
    }
    setToken(storedToken);
    fetchExistingDocuments(storedToken);
  }, [router]);

  const fetchExistingDocuments = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applicants/documents`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const result = await res.json();
        setUploadResult(result.record);
      }
    } catch (err) {
      console.error('Error fetching existing documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      setError('User not authenticated');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    if (files.msce) formData.append('msce', files.msce);
    if (files.id_card) formData.append('id_card', files.id_card);
    if (files.payment_proof) formData.append('payment_proof', files.payment_proof);

    try {
      const res = await fetch(`${API_BASE_URL}/applicants/documents`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        const text = contentType?.includes('application/json') ? await res.json() : await res.text();
        throw new Error(text?.error || 'Upload failed');
      }

      const result = await res.json();
      setUploadResult(result.record);
      setSuccess('Documents uploaded successfully! Redirecting to application fees...');
      setFiles({ msce: null, id_card: null, payment_proof: null });

      setTimeout(() => router.push('/application/application-fees'), 2000);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (field: keyof UploadedRecord) => {
    if (!token || !uploadResult || !uploadResult[field]) return;
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/applicants/documents/${field}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      setSuccess('Document deleted successfully!');
      fetchExistingDocuments(token);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete document.');
    }
  };

  const getFileUrl = (filePath?: string | number) => {
    if (!filePath) return '';
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}/storage/${filePath}`;
  };

  const handleDownload = async (field: keyof UploadedRecord, filename: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applicants/documents/${field}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const fileUrl = getFileUrl(uploadResult?.[field]);
        window.open(fileUrl, '_blank');
      }
    } catch {
      const fileUrl = getFileUrl(uploadResult?.[field]);
      window.open(fileUrl, '_blank');
    }
  };

  const handleView = (field: keyof UploadedRecord) => {
    const apiUrl = `${API_BASE_URL}/applicants/documents/${field}`;
    const directUrl = getFileUrl(uploadResult?.[field]);
    const newWindow = window.open(apiUrl, '_blank');
    setTimeout(() => {
      if (newWindow && newWindow.closed) window.open(directUrl, '_blank');
    }, 1000);
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const getFileName = (document: UploadedRecord, field: keyof UploadedRecord): string => {
    const nameField = `${field}_name` as keyof UploadedRecord;
    return (document[nameField] as string) || `document.${getFileExtension(String(document[field] || '')).toLowerCase()}`;
  };

  const hasUploadedDocuments = uploadResult && 
    (uploadResult.msce || uploadResult.id_card || uploadResult.payment_proof);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProgressIndicator currentStep={8} />
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mt-4">
        <h1 className="text-3xl font-bold mb-6 text-green-900 text-center">Upload Documents</h1>
        
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 font-medium">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium">{success}</div>}

        {hasUploadedDocuments && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-green-800 flex items-center"><FileText className="mr-2" size={24} /> Previously Uploaded Documents</h2>
            <div className="grid gap-4">
              {documentTypes.map((docType) => {
                const filePath = uploadResult[docType.field];
                if (!filePath) return null;

                const Icon = docType.icon;
                const fileSize = uploadResult[`${docType.field}_size` as keyof UploadedRecord] as number;
                const fileName = getFileName(uploadResult, docType.field);
                const fileExtension = getFileExtension(fileName);

                return (
                  <div key={docType.field} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-3 rounded-lg"><Icon size={24} className="text-green-600" /></div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{docType.label}</h3>
                        <p className="text-sm text-gray-600">{fileName} • {fileExtension} • {formatFileSize(fileSize)}</p>
                        <p className="text-xs text-gray-500">Uploaded: {new Date(uploadResult.updated_at || '').toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleView(docType.field)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View"><Eye size={20} /></button>
                      <button onClick={() => handleDownload(docType.field, fileName)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Download"><Download size={20} /></button>
                      <button onClick={() => handleDeleteDocument(docType.field)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={20} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-6 text-green-800">
            {hasUploadedDocuments ? 'Upload New Documents (Will Replace Existing)' : 'Upload Required Documents'}
          </h2>
          
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            {documentTypes.map((docType) => {
              const Icon = docType.icon;
              const currentFile = files[docType.field as keyof typeof files];
              const hasExistingFile = uploadResult?.[docType.field];
              return (
                <div key={docType.name} className="border border-gray-200 rounded-lg p-4">
                  <label htmlFor={docType.name} className="block font-semibold text-gray-700 mb-3">
                    <Icon className="inline mr-2" size={20} /> {docType.label} {docType.required && '*'}
                    {hasExistingFile && <span className="text-sm text-green-600 ml-2">(Already uploaded)</span>}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      name={docType.name}
                      id={docType.name}
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      required={docType.required && !hasExistingFile}
                      className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {currentFile && (
                      <div className="flex items-center space-x-2 bg-green-50 p-2 rounded">
                        <File size={16} className="text-green-600" />
                        <span className="text-sm text-green-800">{currentFile.name} ({formatFileSize(currentFile.size)})</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Accepted formats: PDF, JPG, JPEG, PNG (Max: 5MB)</p>
                </div>
              );
            })}

            <div className="flex gap-4 pt-4">
              <Button2 type="button" onClick={() => router.back()} className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors" disabled={uploading}>Back</Button2>
              <Button2 type="submit" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center min-w-[120px]" disabled={uploading}>
                {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : 'Upload Documents'}
              </Button2>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
