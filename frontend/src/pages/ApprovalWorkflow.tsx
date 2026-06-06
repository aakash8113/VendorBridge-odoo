import { CheckCircle2, Clock, Inbox } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import { useNavigate } from "react-router-dom";

export function ApprovalWorkflow() {
  const [pendingQuotes, setPendingQuotes] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPending() {
      try {
        const data = await apiFetch("/quotations/pending");
        setPendingQuotes(data);
        if (data.length > 0) {
          setSelectedQuote(data[0]);
        }
      } catch (err) {
        console.error("Failed to load pending approvals", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPending();
  }, []);

  const [approvalRemarks, setApprovalRemarks] = useState("");

  const handleAction = async (action: "approve" | "reject") => {
    if (!selectedQuote) return;
    if (!confirm(`Are you sure you want to ${action} this quotation?`)) return;

    setActionLoading(true);
    try {
      await apiFetch(`/quotations/${selectedQuote.id}/${action}`, {
        method: "PUT",
        body: JSON.stringify({ approvalRemarks }),
      });
      alert(`Quotation ${action}d successfully`);

      if (action === "approve") {
        navigate("/purchase-orders");
      } else {
        // Remove from list and select another
        const updated = pendingQuotes.filter((q) => q.id !== selectedQuote.id);
        setPendingQuotes(updated);
        setSelectedQuote(updated.length > 0 ? updated[0] : null);
        setApprovalRemarks("");
      }
    } catch (err: any) {
      alert(err.message || `Failed to ${action} quotation`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return <div className="text-gray-400">Loading pending approvals...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 flex flex-col md:flex-row gap-8">
      {/* Left Sidebar: List of Pending Approvals */}
      <div className="w-full md:w-1/3 bg-[#1E1E1E] border border-zinc-800 rounded-lg p-4 h-[calc(100vh-8rem)] overflow-y-auto hidden-scrollbar">
        <h2 className="text-lg font-semibold text-gray-100 mb-4 px-2">
          Pending Approvals
        </h2>
        {pendingQuotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <Inbox className="w-12 h-12 mb-2 opacity-50" />
            <p>No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingQuotes.map((quote) => (
              <button
                key={quote.id}
                onClick={() => setSelectedQuote(quote)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedQuote?.id === quote.id
                    ? "bg-blue-600/10 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                    : "bg-black/20 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="text-sm font-medium text-gray-200 truncate">
                  {quote.rfq?.title}
                </div>
                <div className="text-xs text-gray-400 mt-1 truncate">
                  {quote.vendor?.companyName}
                </div>
                <div className="text-sm font-semibold text-blue-400 mt-2">
                  ₹{quote.grandTotal.toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Content: Selected Approval Details */}
      <div className="flex-1 w-full space-y-8">
        {!selectedQuote ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Select a quotation from the list to review
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-semibold text-gray-100">
                Review Quotation
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                RFQ: {selectedQuote.rfq?.title} - Vendor:{" "}
                {selectedQuote.vendor?.companyName}
              </p>
            </div>

            <div className="flex items-center w-full max-w-4xl py-6 text-sm">
              <div className="flex flex-col items-center gap-2 relative flex-1">
                <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-emerald-500 bg-emerald-500/20 text-emerald-500 font-medium z-10">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-gray-400 absolute -bottom-6 whitespace-nowrap">
                  Submitted
                </span>
                <div className="absolute top-4 left-1/2 w-full border-t-2 border-emerald-500"></div>
              </div>
              <div className="flex flex-col items-center gap-2 relative flex-1">
                <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-blue-500 bg-blue-500/20 text-blue-500 font-medium z-10">
                  2
                </div>
                <span className="text-blue-500 absolute -bottom-6 whitespace-nowrap">
                  Manager Review
                </span>
                <div className="absolute top-4 left-1/2 w-full border-t-2 border-zinc-700"></div>
              </div>
              <div className="flex flex-col items-center gap-2 relative">
                <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-zinc-600 bg-[#121212] text-zinc-500 font-medium z-10">
                  3
                </div>
                <span className="text-zinc-500 absolute -bottom-6 whitespace-nowrap">
                  Generate PO
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Vendor Details
                  </h3>
                  <div className="bg-[#121212] p-4 rounded-lg border border-zinc-800 space-y-2">
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-500">Company:</span>{" "}
                      {selectedQuote.vendor?.companyName}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-500">Email:</span>{" "}
                      {selectedQuote.vendor?.contactEmail}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-500">Category:</span>{" "}
                      {selectedQuote.vendor?.category}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Approval Remarks
                  </h3>
                  <textarea
                    rows={4}
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    placeholder="Add your comments or conditions (Optional)...."
                    className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 resize-none text-sm placeholder:text-zinc-600"
                  ></textarea>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-full">
                  <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Quotation Summary
                    </h3>
                    <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
                      Net {selectedQuote.paymentTerms} Days
                    </span>
                  </div>
                  <div className="p-6 flex-1 space-y-4 text-sm overflow-y-auto">
                    {selectedQuote.quotationLineItems?.map(
                      (item: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between border-b border-zinc-800/50 pb-2"
                        >
                          <span className="text-gray-300">
                            {item.quantity}x {item.item}
                          </span>
                          <span className="text-gray-300">
                            ₹{item.total.toFixed(2)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="bg-black/30 p-6 border-t border-zinc-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="text-gray-300">
                        ₹{selectedQuote.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-400">
                        GST ({selectedQuote.gstPercentage}%):
                      </span>
                      <span className="text-gray-300">
                        ₹
                        {(
                          selectedQuote.grandTotal - selectedQuote.subtotal
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-zinc-800/50">
                      <span className="text-gray-300 font-medium">
                        Grand Total:
                      </span>
                      <span className="text-blue-400 font-bold text-lg">
                        ₹{selectedQuote.grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Approve & Generate PO"}
                  </button>
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading}
                    className="flex-1 py-3 border border-zinc-700 hover:bg-zinc-800 text-gray-300 rounded-lg transition-colors font-medium disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
