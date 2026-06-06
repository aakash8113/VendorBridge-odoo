import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CreateRFQ() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-semibold text-gray-100">Create RFQ's</h1>
        <p className="text-sm text-gray-400 mt-1">new request for quotation</p>
      </div>

      <div className="flex items-center w-full max-w-3xl mx-auto py-4">
        <div className="flex items-center text-blue-500 relative">
          <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-blue-500 bg-blue-500/20 font-medium">1</div>
        </div>
        <div className="flex-auto border-t-2 border-zinc-700 mx-4"></div>
        <div className="flex items-center text-gray-500 relative">
          <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-gray-500 bg-[#121212] font-medium">2</div>
        </div>
        <div className="flex-auto border-t-2 border-zinc-700 mx-4"></div>
        <div className="flex items-center text-gray-500 relative">
          <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-gray-500 bg-[#121212] font-medium">3</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm text-gray-400">RFQ's title*</label>
            <input type="text" defaultValue="Office Furniture procurement Q2" className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Category</label>
            <input type="text" defaultValue="Furniture" className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Deadline*</label>
            <input type="text" defaultValue="15 June 2025" className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Description</label>
            <textarea rows={4} defaultValue="Ergonomic chairs and standing desks for 3rd floor" className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-2 outline-none focus:border-blue-500 resize-none"></textarea>
          </div>
          
          <div className="flex flex-col gap-3 pt-6">
            <Link to="/quotations" className="w-fit">
              <button className="px-6 py-2.5 border border-zinc-700 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors w-full">
                Save & Send to Vendors
              </button>
            </Link>
            <button className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors w-fit underline underline-offset-4">
              Save as Draft
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Line items</label>
            <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-800/50 text-gray-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-2 font-medium">item</th>
                    <th className="px-4 py-2 font-medium">qty</th>
                    <th className="px-4 py-2 font-medium">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-gray-300">
                  <tr>
                    <td className="px-4 py-3">Ergonomic chair</td>
                    <td className="px-4 py-3">25</td>
                    <td className="px-4 py-3">NOS</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Standing desks</td>
                    <td className="px-4 py-3">10</td>
                    <td className="px-4 py-3">NOS</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button className="px-4 py-1.5 border border-zinc-700 bg-[#1E1E1E] text-white hover:bg-zinc-800 rounded text-sm mt-2">
              + add line item
            </button>
          </div>

          <div className="space-y-2">
             <label className="text-sm text-gray-400 uppercase tracking-wider text-xs">Assign Vendors</label>
             <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-3 space-y-3">
               <div className="flex flex-wrap gap-2">
                 <div className="bg-zinc-800 px-3 py-1.5 rounded flex items-center justify-between gap-2 text-sm">
                   Infra Supplies Pvt ltd <X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-white" />
                 </div>
                 <div className="bg-zinc-800 px-3 py-1.5 rounded flex items-center justify-between gap-2 text-sm">
                   Techcore LTD <X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-white" />
                 </div>
               </div>
               <div className="text-gray-500 text-sm border-t border-zinc-800 pt-2 cursor-pointer hover:text-white">
                 + add vendor
               </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Attachments</label>
            <div className="border border-dashed border-zinc-700 rounded-lg p-8 flex flex-col items-center justify-center text-sm text-gray-400 bg-black/20 hover:bg-black/40 transition-colors cursor-pointer">
              Drag & drop files or click to upload
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
