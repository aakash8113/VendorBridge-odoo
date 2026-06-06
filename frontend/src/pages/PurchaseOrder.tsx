import { Download, Printer, Mail, Inbox } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch, downloadInvoicePdf, sendInvoiceEmail, generateInvoice } from "../lib/api";

export function PurchaseOrder() {
  const [pos, setPos] = useState<any[]>([]);
  const [selectedPo, setSelectedPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const poData = await apiFetch("/pos");
        setPos(poData);
        if (poData.length > 0) setSelectedPo(poData[0]);

        try {
          const invData = await apiFetch("/invoices");
          setInvoices(invData);
        } catch(e) { /* invoices might not exist */ }
      } catch (err) {
        console.error("Failed to load POs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getInvoiceForPo = (poId: string) => {
    return invoices.find(inv => inv.poId === poId || inv.purchaseOrder?.poNumber === selectedPo?.poNumber);
  };

  const handleDownloadPdf = async () => {
    if (!selectedPo) return;
    setActionLoading('pdf');
    try {
      // First try to find existing invoice, or generate one
      let invoice = getInvoiceForPo(selectedPo.id);
      if (!invoice) {
        invoice = await generateInvoice(selectedPo.id);
        setInvoices(prev => [...prev, invoice]);
      }
      await downloadInvoicePdf(invoice.id);
    } catch (err: any) {
      alert(err.message || 'Failed to download PDF');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEmailInvoice = async () => {
    if (!selectedPo) return;
    setActionLoading('email');
    try {
      let invoice = getInvoiceForPo(selectedPo.id);
      if (!invoice) {
        invoice = await generateInvoice(selectedPo.id);
        setInvoices(prev => [...prev, invoice]);
      }
      const result = await sendInvoiceEmail(invoice.id);
      alert('Invoice emailed successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to email invoice');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading)
    return <div className="text-gray-400">Loading Purchase Orders...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Left Sidebar: List of POs */}
      <div className="w-full md:w-1/3 bg-[#1E1E1E] border border-zinc-800 rounded-lg p-4 h-[calc(100vh-8rem)] overflow-y-auto hidden-scrollbar">
        <h2 className="text-lg font-semibold text-gray-100 mb-4 px-2">
          Purchase Orders
        </h2>
        {pos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <Inbox className="w-12 h-12 mb-2 opacity-50" />
            <p>No Purchase Orders generated yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pos.map((po) => (
              <button
                key={po.id}
                onClick={() => setSelectedPo(po)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedPo?.id === po.id
                    ? "bg-blue-600/10 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                    : "bg-black/20 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold text-gray-200">
                    {po.poNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] ${po.status === "GENERATED" ? "bg-blue-900/30 text-blue-400" : po.status === "SENT" ? "bg-amber-900/30 text-amber-400" : "bg-emerald-900/30 text-emerald-400"}`}
                  >
                    {po.status}
                  </span>
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {po.vendor?.companyName}
                </div>
                <div className="text-sm font-semibold text-emerald-400 mt-2">
                  ₹
                  {po.totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Content: Selected PO Document */}
      <div className="flex-1 w-full relative">
        {!selectedPo ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Select a Purchase Order from the list to view
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-gray-100">
                  Invoice / PO
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedPo.poNumber} - ({selectedPo.status})
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPdf}
                  disabled={actionLoading === 'pdf'}
                  className="flex justify-center items-center gap-2 px-4 py-2 border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-gray-300 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  <Download className="w-4 h-4" /> {actionLoading === 'pdf' ? 'Generating...' : 'PDF'}
                </button>
                <button
                  onClick={handleEmailInvoice}
                  disabled={actionLoading === 'email'}
                  className="flex justify-center items-center gap-2 px-4 py-2 border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-gray-300 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" /> {actionLoading === 'email' ? 'Sending...' : 'Email'}
                </button>
              </div>
            </div>

            <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-8 space-y-8 print:bg-white print:text-black">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div className="space-y-4">
                  <div>
                    <p className="text-zinc-500 mb-1">Bill to:</p>
                    <div className="text-gray-300 space-y-1">
                      <p className="text-gray-100 font-medium">
                        VendorBridge Organization
                      </p>
                      <p>Corporate HQ, Mumbai</p>
                      <p>GSTIN: 27AADCB2230M1Z2</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-gray-300 pt-4">
                    <div>
                      <p className="text-zinc-500 mb-1">PO Number:</p>
                      <p className="font-medium text-gray-200">
                        {selectedPo.poNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">PO Date:</p>
                      <p>{new Date(selectedPo.poDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-zinc-500 mb-1">Vendor / Supplier:</p>
                    <div className="text-gray-300 space-y-1">
                      <p className="text-gray-100 font-medium">
                        {selectedPo.vendor?.companyName}
                      </p>
                      <p>{selectedPo.vendor?.address}</p>
                      <p>GSTIN: {selectedPo.vendor?.gstNumber}</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="text-zinc-500 mb-1">Reference RFQ:</p>
                    <p className="text-gray-300">{selectedPo.rfq?.title}</p>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="mt-8 border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-800/50 text-gray-400 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Description</th>
                      <th className="px-6 py-3 font-medium text-right">Unit Price</th>
                      <th className="px-6 py-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-gray-300">
                    {selectedPo.quotation?.quotationLineItems?.map(
                      (item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-6 py-4">{item.item}</td>
                          <td className="px-6 py-4 text-right">
                            ₹
                            {item.unitPrice.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            ₹
                            {item.total.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end pt-6">
                <div className="w-full max-w-sm space-y-3 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal:</span>
                    <span>
                      ₹
                      {selectedPo.quotation?.subtotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>GST ({selectedPo.quotation?.gstPercentage}%):</span>
                    <span>
                      ₹
                      {(
                        selectedPo.totalAmount - selectedPo.quotation?.subtotal
                      ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-100 pt-3 border-t border-zinc-800">
                    <span>Grand Total:</span>
                    <span className="text-emerald-400">
                      ₹
                      {selectedPo.totalAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="pt-4 flex justify-between text-xs text-gray-500">
                    <span>
                      Payment Terms: Net {selectedPo.quotation?.paymentTerms}
                    </span>
                    <span>
                      Delivery: {selectedPo.quotation?.deliveryDays} Days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}