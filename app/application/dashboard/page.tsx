import Button from '@/componets/Button';
import ProgressIndicator from '@/componets/ProgressIndicator';

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8">
      <ProgressIndicator currentStep={1} />

      {/* Welcome Section */}
      <div className="mb-8 w-full max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl text-green-900 font-bold mb-2">
          Welcome to Mzuzu University Applications Portal
        </h1>
        <p className="text-gray-500 text-base sm:text-lg">
          Access and manage your application easily through this portal.
        </p>
      </div>

      {/* Application Submission Section */}
      <div className="mb-8 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl text-green-900 font-bold mb-2">
          Application Submission
        </h2>
        <p className="text-gray-500 text-base sm:text-lg mb-4">
          It looks like you have not yet started your <br className="sm:hidden" />
          application process. Please submit the details after you fill them.
        </p>

        {/* Button */}
        <div className="w-full sm:w-auto flex justify-start">
          <Button
            type="button"
            title="Apply Now"
            icon=""
            variant="bg-teal-800"
            href="/application/select-type"
          />
        </div>
      </div>
    </div>
  );
}