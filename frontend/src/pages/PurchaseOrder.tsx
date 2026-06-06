import { Download, Printer, Mail } from 'lucide-react';

export function PurchaseOrder() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-100">Purchase Order & Invoice</h1>
          <p className="text-sm text-gray-400 mt-1">PO-2024-auto-generated after approval</p>
        </div>
        <div className="flex gap-2">
          <button className="flex justify-center items-center gap-2 px-4 py-2 border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-gray-300 rounded-lg transition-colors text-sm">
             <Download className="w-4 h-4" /> Download PDF
          </button>
          <button className="flex justify-center items-center gap-2 px-4 py-2 border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-gray-300 rounded-lg transition-colors text-sm">
             <Printer className="w-4 h-4" /> Print
          </button>
          <button className="flex justify-center items-center gap-2 px-4 py-2 border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-gray-300 rounded-lg transition-colors text-sm">
             <Mail className="w-4 h-4" /> Email invoice
          </button>
        </div>
      </div>

      <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="space-y-4">
            <div>
              <p className="text-zinc-500 mb-1">Bill to:</p>
              <div className="text-gray-300 space-y-1">
                <p className="text-gray-100 font-medium">your Organization Name</p>
                <p>123 business park, ahmedabad</p>
                <p>GSTIN:253834384FB</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-gray-300 pt-4">
              <div>
                <p className="text-zinc-500 mb-1">PO Number:</p>
                <p>PO-2025-0068</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">PO date:</p>
                <p>21 may, 2025</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <div>
              <p className="text-zinc-500 mb-1">Vendor</p>
              <div className="text-gray-300 space-y-1">
                <p className="text-gray-100 font-medium">Infra supplies pvt ltd</p>
                <p>456, industrial estate, surat</p>
                <p>GSTIN: 343434DB4523</p>
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4 text-gray-300 pt-4">
              <div>
                <p className="text-zinc-500 mb-1">invoice date:</p>
                <p>22 may 2025</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">Due date:</p>
                <p>21 june 2025</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#121212] flex w-full">
              <tr className="flex w-full text-gray-400 border-b border-zinc-800">
                <th className="p-4 font-medium w-1/4">Item</th>
                <th className="p-4 font-medium w-1/4 text-center">Qty</th>
                <th className="p-4 font-medium w-1/4 text-right">Unit price</th>
                <th className="p-4 font-medium w-1/4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="bg-[#1E1E1E] flex flex-col items-center justify-between w-full divide-y divide-zinc-800 text-gray-300">
              <tr className="flex w-full">
                <td className="p-4 w-1/4">Ergonomic chair</td>
                <td className="p-4 w-1/4 text-center">25</td>
                <td className="p-4 w-1/4 text-right">3500</td>
                <td className="p-4 w-1/4 text-right">87,500</td>
              </tr>
              <tr className="flex w-full border-b border-zinc-800">
                <td className="p-4 w-1/4">Tech Core LTD</td>
                <td className="p-4 w-1/4 text-center">10</td>
                <td className="p-4 w-1/4 text-right">8,200</td>
                <td className="p-4 w-1/4 text-right">82000</td>
              </tr>
            </tbody>
            {/* Totals Section */}
            <tbody className="bg-[#121212] flex flex-col w-full text-gray-300 border-t border-zinc-800">
              <tr className="flex w-full justify-end border-b border-zinc-800/50">
                <td className="p-3 w-1/4 text-right text-zinc-500">Subtotal</td>
                <td className="p-3 w-1/4 text-right">1,69,500</td>
              </tr>
              <tr className="flex w-full justify-end border-b border-zinc-800/50">
                <td className="p-3 w-1/4 text-right text-zinc-500">CGST(9%)</td>
                <td className="p-3 w-1/4 text-right">15,255</td>
              </tr>
              <tr className="flex w-full justify-end border-b border-zinc-800/50">
                <td className="p-3 w-1/4 text-right text-zinc-500">SGST(9%)</td>
                <td className="p-3 w-1/4 text-right">15,255</td>
              </tr>
              <tr className="flex w-full justify-end text-white font-semibold">
                <td className="p-4 w-1/4 text-right">Grand total</td>
                <td className="p-4 w-1/4 text-right text-lg">2,00,010</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm mt-4 px-2">
        <span className="text-zinc-500">status: <span className="text-amber-500 font-medium px-2 py-1 bg-amber-500/10 rounded">Pending Payment</span></span>
        <button className="text-blue-500 hover:text-blue-400 font-medium hover:underline transition-all">Mark as Paid</button>
      </div>
    </div>
  );
}
