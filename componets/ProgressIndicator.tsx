'use client';

import Link from 'next/link';

interface Step {
  id: number;
  title: string;
  href: string;
}

interface ProgressIndicatorProps {
  currentStep: number;
}

// Updated steps with "Select Application Type" added
const steps: Step[] = [
  { id: 1, title: 'Dashboard', href: '/application/dashboard' },
  { id: 2, title: 'Select Application Type', href: '/application/select-type' },
  { id: 3, title: 'Personal Details', href: '/application/personal-details' },
  { id: 4, title: 'Contact Details', href: '/application/contact-details' },
  { id: 5, title: 'Next of Kin', href: '/application/next-of-kin' },
  { id: 6, title: 'High School Records', href: '/application/High-school-records' },
  { id: 7, title: 'Program Selection', href: '/application/program-selection' },
  { id: 8, title: 'Documents', href: '/application/documents' },
  { id: 9, title: 'Application Fees', href: '/application/application-fees' },
  { id: 10, title: 'Submit', href: '/application/submit' },
];

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <>
      {/* Progress bar fixed under header, not hidden by sidebar */}
      <nav
        aria-label="Progress"
        className="fixed top-16 left-0 right-0 z-40 bg-white shadow-md px-6 py-3 ml-64"
      >
        <ol className="flex justify-between border-b border-gray-300 max-w-full overflow-x-auto">
          {steps.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <li key={step.id} className="relative flex-1 text-center min-w-[100px]">
                <div className="group">
                  {isCompleted ? (
                    <Link
                      href={step.href}
                      className="flex items-center justify-center w-8 h-8 mx-auto rounded-full bg-green-800 text-white cursor-pointer hover:bg-teal-700"
                      aria-current={isActive ? 'step' : undefined}
                    >
                      ✓
                    </Link>
                  ) : isActive ? (
                    <span
                      className="flex items-center justify-center w-8 h-8 mx-auto rounded-full border-2 border-green-900 text-green-900 font-semibold"
                      aria-current="step"
                    >
                      {step.id}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-8 h-8 mx-auto rounded-full border-2 border-gray-300 text-red-500">
                      {step.id}
                    </span>
                  )}

                  <p
                    className={`mt-2 text-center text-xs ${
                      isActive ? 'text-mzuni-green font-semibold' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>

                {/* Connector line */}
                {idx !== steps.length - 1 && (
                  <div
                    className={`absolute top-4 right-0 h-0.5 ${
                      isCompleted ? 'bg-green-900' : 'bg-gray-300'
                    }`}
                    style={{ left: 'calc(100% + 0.5rem)', width: 'calc(100% - 2rem)' }}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Add space for fixed header and progress bar */}
      <div className="h-36" />
    </>
  );
}