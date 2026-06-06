import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export function SubmitQuotation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rfqs, setRfqs] = useState([]);
  const [selectedRfqId, setSelectedRfqId] = useState('');
  
  // Form State
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [lineItems, setLineItems] = useState([{ item: '', quantity: 1, unitPrice: 0 }]);

  // Fetch RFQs assigned to this vendor
  useEffect(() => {
    async function loadAssignedRfqs() {
      try {
        // Assuming you have an endpoint or get it from /rfqs filtering by assigned vendor
        const data = await apiFetch('/rfqs'); 
        setRfqs(data);
      } catch (err) {
        console.error("Failed to load RFQs", err);
      }
    }
    loadAssignedRfqs();
  }, []);

  const handleLineItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLineItems(newItems);
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { item: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfqId) return alert('Please select an RFQ');
    
    setLoading(true);
    try {
      await apiFetch('/quotations', {
        method: 'POST',
        body: JSON.stringify({
          rfqId: selectedRfqId,
          gstPercentage,
          deliveryDays,
          paymentTerms,
          lineItems
        })
      });
      alert('Quotation submitted successfully!');
      navigate('/');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to submit quotation");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = lineItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  const grandTotal = subtotal + (subtotal * (gstPercentage / 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold text-gray-100">Submit Quotation</h1>
        <p className="text-sm text-gray-400 mt-1">Provide your pricing for requested items</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-[#1E1E1E] p-6 border border-zinc-800 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Select RFQ</label>
            <select 
              value={selectedRfqId} 
              onChange={(e) => setSelectedRfqId(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg p-2.5 outline-none"
              required
            >
              <option value="" disabled>Select an RFQ...</option>
              {rfqs.map((rfq: any) => (
                <option key={rfq.id} value={rfq.id}>{rfq.title} (Deadline: {new Date(rfq.deadline).toLocaleDateString()})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Delivery Days</label>
            <input 
              type="number" 
              value={deliveryDays} 
              onChange={(e) => setDeliveryDays(Number(e.target.value))}
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg p-2.5 outline-none" 
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm text-gray-400">Line Items & Pricing</label>
          <div className="space-y-2">
            {lineItems.map((li, index) => (
              <div key={index} className="flex gap-2 text-sm">
                <input type="text" placeholder="Item Name" value={li.item} onChange={(e) => handleLineItemChange(index, 'item', e.target.value)} className="flex-1 bg-black/50 border border-zinc-700 text-gray-100 rounded p-2" required />
                <input type="number" placeholder="Qty" value={li.quantity} onChange={(e) => handleLineItemChange(index, 'quantity', Number(e.target.value))} className="w-24 bg-black/50 border border-zinc-700 text-gray-100 rounded p-2" required />
                <input type="number" placeholder="Unit Price (₹)" value={li.unitPrice} onChange={(e) => handleLineItemChange(index, 'unitPrice', Number(e.target.value))} className="w-32 bg-black/50 border border-zinc-700 text-gray-100 rounded p-2" required />
                <div className="w-32 bg-black/30 border border-zinc-800 text-gray-400 rounded p-2 flex items-center justify-end">
                  ₹{(li.quantity * li.unitPrice).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddLineItem} className="text-sm text-blue-400 hover:text-blue-300">+ Add another item</button>
        </div>

        <div className="border-t border-zinc-800 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div className="space-y-2">
              <label className="text-sm text-gray-400">Payment Terms</label>
              <input type="text" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg p-2.5" />
            </div>
             <div className="space-y-2">
              <label className="text-sm text-gray-400">GST Percentage (%)</label>
              <input type="number" value={gstPercentage} onChange={(e) => setGstPercentage(Number(e.target.value))} className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg p-2.5" />
            </div>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg flex flex-col justify-center space-y-2">
             <div className="flex justify-between text-gray-400 text-sm"><span>Subtotal</span> <span>₹{subtotal.toFixed(2)}</span></div>
             <div className="flex justify-between text-gray-400 text-sm"><span>GST ({gstPercentage}%)</span> <span>₹{(subtotal * (gstPercentage / 100)).toFixed(2)}</span></div>
             <div className="border-t border-zinc-800 my-2 pt-2 flex justify-between text-gray-100 font-semibold"><span>Grand Total</span> <span>₹{grandTotal.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Quotation'}
          </button>
        </div>
      </form>
    </div>
  );
}