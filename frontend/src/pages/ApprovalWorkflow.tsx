import { CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ApprovalWorkflow() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-semibold text-gray-100">Approval Workflow</h1>
        <p className="text-sm text-gray-400 mt-1">RFQ: office furniture Q2 - Vendor: Infra Supplies - 185400</p>
      </div>

      <div className="flex items-center w-full max-w-4xl mx-auto py-8 text-sm">
        <div className="flex flex-col items-center gap-2 relative flex-1">
          <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-emerald-500 bg-emerald-500/20 text-emerald-500 font-medium z-10">1</div>
          <span className="text-gray-400 absolute -bottom-6 whitespace-nowrap">Submitted</span>
          <div className="absolute top-4 left-1/2 w-full border-t-2 border-emerald-500"></div>
        </div>
        <div className="flex flex-col items-center gap-2 relative flex-1">
          <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-emerald-500 bg-emerald-500/20 text-emerald-500 font-medium z-10">2</div>
          <span className="text-gray-400 absolute -bottom-6 whitespace-nowrap">L1 Review</span>
          <div className="absolute top-4 left-1/2 w-full border-t-2 border-zinc-700"></div>
        </div>
        <div className="flex flex-col items-center gap-2 relative flex-1">
          <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-blue-500 bg-blue-500/20 text-blue-500 font-medium z-10">3</div>
          <span className="text-blue-500 absolute -bottom-6 whitespace-nowrap">L2 approval</span>
          <div className="absolute top-4 left-1/2 w-full border-t-2 border-zinc-700"></div>
        </div>
        <div className="flex flex-col items-center gap-2 relative">
          <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-zinc-600 bg-[#121212] text-zinc-500 font-medium z-10">4</div>
          <span className="text-zinc-500 absolute -bottom-6 whitespace-nowrap">Generate PO</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
        <div className="space-y-8">
          <div>
             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">Approval Chain</h3>
             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
               
               <div className="relative flex items-start gap-4">
                 <div className="bg-[#121212] p-1 rounded-full relative z-10">
                   <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                 </div>
                 <div className="pt-1">
                   <p className="text-sm font-medium text-gray-200">Rahul Mehta <span className="text-gray-500 font-normal">(Procurement head)</span></p>
                   <p className="text-xs text-gray-400 mt-1">Approved on may 20, 10:32 Am</p>
                 </div>
               </div>

               <div className="relative flex items-start gap-4">
                 <div className="bg-[#121212] p-1 rounded-full relative z-10">
                   <Clock className="w-6 h-6 text-blue-500" />
                 </div>
                 <div className="pt-1">
                   <p className="text-sm font-medium text-gray-200">Priya Shah <span className="text-gray-500 font-normal">(finance manager)</span></p>
                   <p className="text-xs text-blue-400 mt-1">Awaiting <span className="text-gray-500">Assigned may 21</span></p>
                 </div>
               </div>

             </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Approval Remarks</h3>
            <textarea 
              rows={4} 
              placeholder="Add your comments or conditions...." 
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 resize-none text-sm placeholder:text-zinc-600"
            ></textarea>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg overflow-hidden">
             <div className="px-6 py-4 border-b border-zinc-800">
               <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quotations Summary</h3>
             </div>
             <div className="p-6 space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Vendor:</span>
                  <span className="text-gray-200 font-medium">Infra Supplies PVT LTD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-gray-200 font-medium">1,85,400</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Delivery:</span>
                  <span className="text-gray-200">10 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Rating:</span>
                  <span className="text-amber-500">4.5/5</span>
                </div>
             </div>
          </div>

          <div className="flex gap-4">
             <Link to="/purchase-orders" className="flex-1">
               <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors border border-blue-500 shadow-lg shadow-blue-900/20">
                 Approve
               </button>
             </Link>
             <button className="flex-1 py-3 border border-zinc-700 hover:bg-zinc-800 text-gray-300 rounded-lg transition-colors font-medium">
               Reject
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
