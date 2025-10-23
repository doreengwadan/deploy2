import { Download } from 'lucide-react';

export default function ManualPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">System User Manual</h2>
      <div className="bg-white p-4 shadow rounded">
        <p>Here you can provide downloadable PDFs, tutorials or system usage instructions for your users.</p>
        <div className="mt-4">
          <a
            href="/uploads/user-manual.docx"
            download
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            <Download size={18} />
            Download User Manual (docx)
          </a>
        </div>
      </div>
    </div>
  );
}
