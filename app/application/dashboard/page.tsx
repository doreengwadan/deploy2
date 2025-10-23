import Button from '@/componets/Button';
import ProgressIndicator from '@/componets/ProgressIndicator';
export default function DashboardPage() {
  return (
    <>

    <ProgressIndicator currentStep={1} />
    
    <div>
     
      <h1 className="text-2xl text-green-900 font-bold mb-4">Welcome to Mzuzu  University Applications Portal</h1>
      <p className='text-gray-500'></p>
    </div>

    <div>
     
      <h1 className="text-2xl text-green-900 font-bold mb-4">Application Submission</h1>
      <p className='text-gray-500'>It looks like you have not yet started your <br />
      application process. please submit the details after you fill them
      </p>
     
     <div className=" lg:flex-center  ">
                         <Button 
                         type={"button"} 
                         title={"apply now"} 
                         icon=""
                         variant={"bg-teal-800"} 
                          href="/application/select-type"
                         />
                        
                 </div>
    </div>
    
</>
  );
}
