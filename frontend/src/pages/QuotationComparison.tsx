import { Link } from 'react-router-dom';

export function QuotationComparison() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-semibold text-gray-100">Quotation Comparison</h1>
        <p className="text-sm text-gray-400 mt-1">RFQ: office furniture procurement q2 - 3 quotations received</p>
      </div>

      <div className="grid grid-cols-4 border border-zinc-800 rounded-lg overflow-hidden text-sm">
        {/* Row Headers */}
        <div className="bg-[#1E1E1E] flex flex-col justify-between border-r border-zinc-800 pt-6">
           <div className="px-6 py-4 font-medium text-gray-300 border-b border-zinc-800 text-center uppercase tracking-wider text-xs invisible">Criteria</div>
           <div className="flex-1 flex flex-col justify-around py-4">
            <div className="px-6 py-3 text-gray-400">Grand Total</div>
            <div className="px-6 py-3 text-gray-400">GST %</div>
            <div className="px-6 py-3 text-gray-400">Delivery (days)</div>
            <div className="px-6 py-3 text-gray-400">Vendor rating</div>
            <div className="px-6 py-3 text-gray-400">Payment terms</div>
           </div>
           <div className="h-20 border-t border-transparent"></div>
        </div>

        {/* Lowest Highlighted */}
        <div className="bg-emerald-900/40 border-2 border-emerald-500 flex flex-col justify-between relative shadow-[0_0_15px_rgba(16,185,129,0.15)] z-10 m-[-1px]">
           <div className="px-6 py-4 font-medium text-emerald-400 border-b border-emerald-800 text-center">Infra Supplies (Lowest)</div>
           <div className="flex-1 flex flex-col justify-around py-4 text-center">
            <div className="px-6 py-3 font-semibold text-white">185000</div>
            <div className="px-6 py-3 text-gray-200">18</div>
            <div className="px-6 py-3 text-gray-200">10</div>
            <div className="px-6 py-3 text-gray-200">4.5/5</div>
            <div className="px-6 py-3 text-gray-200">30 days</div>
           </div>
           <div className="h-20 flex items-center justify-center p-4">
             <Link to="/approvals" className="w-full">
               <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition-colors border border-emerald-500">
                 Select & Approve
               </button>
             </Link>
           </div>
        </div>

        {/* Option 2 */}
        <div className="bg-[#1E1E1E] flex flex-col justify-between border-r border-zinc-800 pt-6">
           <div className="px-6 py-4 font-medium text-gray-300 border-b border-zinc-800 text-center">TechCore LTD</div>
           <div className="flex-1 flex flex-col justify-around py-4 text-center">
            <div className="px-6 py-3 font-medium text-gray-200">200010</div>
            <div className="px-6 py-3 text-gray-400">18</div>
            <div className="px-6 py-3 text-gray-400">14</div>
            <div className="px-6 py-3 text-gray-400">4.2/5</div>
            <div className="px-6 py-3 text-gray-400">30 days</div>
           </div>
           <div className="h-20 border-t border-zinc-800 flex items-center justify-center p-4">
             <button className="w-full py-2 border border-zinc-600 hover:bg-zinc-800 text-gray-300 rounded transition-colors text-sm">
               Select
             </button>
           </div>
        </div>

        {/* Option 3 */}
        <div className="bg-[#1E1E1E] flex flex-col justify-between pt-6">
           <div className="px-6 py-4 font-medium text-gray-300 border-b border-zinc-800 text-center">Office Need Co.</div>
           <div className="flex-1 flex flex-col justify-around py-4 text-center">
            <div className="px-6 py-3 font-medium text-gray-200">214800</div>
            <div className="px-6 py-3 text-gray-400">18</div>
            <div className="px-6 py-3 text-gray-400">7</div>
            <div className="px-6 py-3 text-gray-400">3.8/5</div>
            <div className="px-6 py-3 text-gray-400">15 days</div>
           </div>
           <div className="h-20 border-t border-zinc-800 flex items-center justify-center p-4">
             <button className="w-full py-2 border border-zinc-600 hover:bg-zinc-800 text-gray-300 rounded transition-colors text-sm">
               Select
             </button>
           </div>
        </div>
      </div>
      
      <p className="text-xs text-emerald-500/80 italic">Green = lowest price, selecting vendor initiates the approval workflow.</p>
    </div>
  );
}
