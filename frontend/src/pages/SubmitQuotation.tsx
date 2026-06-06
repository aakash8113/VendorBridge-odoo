import { Link } from 'react-router-dom';

export function SubmitQuotation() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-semibold text-gray-100">Submit Quotations</h1>
        <p className="text-sm text-gray-400 mt-1">RFQ: office furniture procurement q2 - deadline 15 june 2025</p>
      </div>

      <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-5">
        <h2 className="text-sm font-medium text-gray-400 mb-1">RFQ Summary</h2>
        <p className="text-gray-200">Ergonomic chair * 25, standing desk *10 - category furniture</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-400">Your Quotation</h2>
        <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-800/50 text-gray-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-6 py-3 font-medium">Qty</th>
                <th className="px-6 py-3 font-medium">Unit price</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Delivery ( days)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-gray-300">
              <tr>
                <td className="px-6 py-4">Ergonomic chair</td>
                <td className="px-6 py-4">25</td>
                <td className="px-6 py-4">3500</td>
                <td className="px-6 py-4">87,500</td>
                <td className="px-6 py-4">7</td>
              </tr>
              <tr>
                <td className="px-6 py-4">Tech Core LTD</td>
                <td className="px-6 py-4">10</td>
                <td className="px-6 py-4">8,200</td>
                <td className="px-6 py-4">82000</td>
                <td className="px-6 py-4">14</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
           <div className="space-y-1">
            <label className="text-sm text-gray-400">tax / GST %</label>
            <input type="text" defaultValue="18 %" className="w-full max-w-xs bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Note / terms</label>
            <textarea rows={3} defaultValue="Payment terms: 20 days net..." className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-2 outline-none focus:border-blue-500 resize-none"></textarea>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
              Submit Quotation
            </button>
            <button className="px-6 py-2.5 border border-zinc-700 bg-transparent text-gray-300 hover:bg-zinc-800 rounded-lg transition-colors font-medium">
              Save Draft
            </button>
            <Link to="/compare">
               <button className="px-6 py-2.5 border border-zinc-700 bg-transparent text-emerald-500 hover:bg-zinc-800 hover:text-emerald-400 rounded-lg transition-colors font-medium ml-4">
                 View Comparison Analysis
               </button>
            </Link>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6 w-full max-w-sm space-y-4 shadow-lg h-fit">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Subtotal</span>
              <span className="text-gray-200">1,69,599</span>
            </div>
            <div className="flex justify-between text-gray-400 text-sm">
              <span>GST (18%)</span>
              <span className="text-gray-200">30510</span>
            </div>
            <div className="border-t border-zinc-700 pt-4 flex justify-between font-semibold text-white">
              <span>Grand total</span>
              <span>2,00,010</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
