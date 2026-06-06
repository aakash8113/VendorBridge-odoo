import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function QuotationComparison() {
  const [rfqs, setRfqs] = useState([]);
  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Load active RFQs to select from
  useEffect(() => {
    async function fetchRfqs() {
      try {
        const data = await apiFetch('/rfqs');
        setRfqs(data.filter((r: any) => r.status === 'PUBLISHED'));
      } catch (err) {
        console.error("Failed to fetch RFQs", err);
      }
    }
    fetchRfqs();
  }, []);

  // 2. Fetch and compare quotations when an RFQ is selected
  useEffect(() => {
    if (!selectedRfqId) return;
    
    async function fetchComparisons() {
      setLoading(true);
      try {
        const data = await apiFetch(`/quotations/compare/${selectedRfqId}`);
        setQuotations(data);
      } catch (err) {
        console.error("Failed to compare quotes", err);
      } finally {
        setLoading(false);
      }
    }
    fetchComparisons();
  }, [selectedRfqId]);

  const handleApprove = async (quotationId: string) => {
    if (!confirm('Are you sure you want to approve this quote? This will generate a Purchase Order.')) return;
    try {
      await apiFetch(`/quotations/${quotationId}/approve`, { method: 'PUT' });
      alert('Quotation Approved! Purchase order generated.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Approval failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-semibold text-gray-100">Compare Quotations</h1>
        <p className="text-sm text-gray-400 mt-1">Side-by-side comparison of vendor responses</p>
      </div>

      {/* RFQ Selector */}
      <div className="bg-[#1E1E1E] p-4 border border-zinc-800 rounded-lg">
        <label className="text-sm text-gray-400 block mb-2">Select an Active RFQ to Compare</label>
        <select 
          value={selectedRfqId}
          onChange={(e) => setSelectedRfqId(e.target.value)}
          className="w-full md:w-1/2 bg-black/50 border border-zinc-700 text-gray-100 rounded-lg p-2.5 outline-none"
        >
          <option value="">Select an RFQ...</option>
          {rfqs.map((rfq: any) => (
            <option key={rfq.id} value={rfq.id}>{rfq.title}</option>
          ))}
        </select>
      </div>

      {/* Comparison Area */}
      {loading ? (
        <div className="text-gray-400 text-center py-10">Loading comparisons...</div>
      ) : selectedRfqId && quotations.length === 0 ? (
        <div className="text-amber-500 bg-amber-900/20 p-4 rounded-lg flex items-center gap-2 border border-amber-900/50">
          <AlertCircle className="w-5 h-5" /> No vendor quotations submitted for this RFQ yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotations.map((quote: any, index: number) => {
            const isLowestPrice = index === 0; // Assuming backend orders by grandTotal ASC
            
            return (
              <div key={quote.id} className={`bg-[#1E1E1E] border ${isLowestPrice ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-zinc-800'} rounded-lg p-6 relative overflow-hidden flex flex-col`}>
                
                {isLowestPrice && (
                  <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 font-medium rounded-bl-lg">
                    Lowest Price
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-medium text-gray-100">{quote.vendor.companyName}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-zinc-800 text-gray-300 px-2 py-1 rounded">Rating: {quote.vendor.rating}/5</span>
                    <span className="text-xs bg-zinc-800 text-gray-300 px-2 py-1 rounded">{quote.deliveryDays} Days Delivery</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    {quote.quotationLineItems.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-400 border-b border-zinc-800/50 pb-2">
                        <span>{item.item}</span>
                        <span>₹{item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black/30 p-3 rounded-lg mt-4">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Subtotal</span>
                      <span>₹{quote.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>GST ({quote.gstPercentage}%)</span>
                      <span>₹{(quote.grandTotal - quote.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold text-gray-100 mt-2 pt-2 border-t border-zinc-800">
                      <span>Total</span>
                      <span>₹{quote.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {quote.status === 'SUBMITTED' ? (
                    <button 
                      onClick={() => handleApprove(quote.id)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex justify-center items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve Quote
                    </button>
                  ) : (
                    <div className={`w-full py-2.5 text-center rounded-lg font-medium ${quote.status === 'SELECTED' ? 'bg-emerald-900/30 text-emerald-500' : 'bg-red-900/30 text-red-500'}`}>
                      {quote.status}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}