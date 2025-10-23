import { useRouter } from 'next/navigation';
import React from 'react'

const gate = () => {
    
  const handlePrevious = () => {
    router.push('/application/personal-details');
  };

  return (
    
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            className="bg-gray-200 hover:bg-gray-300 text-black font-semibold px-6 py-2 rounded"
          >
            Previous
          </button>
          <button
            type="submit"
            className="bg-mzuni-green hover:bg-green-700 text-white font-semibold px-6 py-2 rounded"
          >
            Next
          </button>
        </div>
  )
}

export default gate;
