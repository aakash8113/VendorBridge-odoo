import { Search } from 'lucide-react';

export function Vendors() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-gray-100">Vendors</h1>
          <p className="text-sm text-gray-400 mt-1">Manage supplier profiles and registrations</p>
        </div>
        <button className="px-4 py-2 border border-zinc-700 bg-[#1E1E1E] text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 text-sm">
          + Add Vendor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search bar ...... search by name, gst number, category..."
          className="w-full bg-[#1E1E1E] border border-zinc-700 text-gray-100 rounded-lg pl-10 pr-4 py-3 outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="flex gap-2">
        {['All (28)', 'active (21)', 'Pending (4)', 'Blocked (3)'].map((filter, i) => (
          <button 
            key={i} 
            className={`px-4 py-1.5 rounded-full text-sm border ${i === 0 ? 'bg-zinc-800 border-zinc-700 text-white' : 'border-zinc-800 text-gray-400 hover:text-white'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-800/50 text-gray-400 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Vendor Name</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">GST no.</th>
              <th className="px-6 py-4 font-medium">contact no.</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 text-gray-300">
            <tr>
              <td className="px-6 py-4">Infra Supplies PVT ltd</td>
              <td className="px-6 py-4">Constructions</td>
              <td className="px-6 py-4">27AABCS1429B2O</td>
              <td className="px-6 py-4">XYZ Number</td>
              <td className="px-6 py-4">Active</td>
              <td className="px-6 py-4"><button className="px-3 py-1 text-xs border border-zinc-700 rounded hover:bg-zinc-800">View</button></td>
            </tr>
            <tr>
              <td className="px-6 py-4">Tech Core LTD</td>
              <td className="px-6 py-4">IT</td>
              <td className="px-6 py-4">27AABCS1429B2O</td>
              <td className="px-6 py-4">XYZ Number</td>
              <td className="px-6 py-4">Active</td>
              <td className="px-6 py-4"><button className="px-3 py-1 text-xs border border-zinc-700 rounded hover:bg-zinc-800">View</button></td>
            </tr>
            <tr>
              <td className="px-6 py-4">FastLog Transport</td>
              <td className="px-6 py-4">logistics</td>
              <td className="px-6 py-4">27AABCS1429B2O</td>
              <td className="px-6 py-4">XYZ Number</td>
              <td className="px-6 py-4">Blocked</td>
              <td className="px-6 py-4"><button className="px-3 py-1 text-xs border border-zinc-700 rounded hover:bg-zinc-800">View</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
