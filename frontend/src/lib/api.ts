import { NavigateFunction } from "react-router-dom";

const API_BASE_URL = "/api";

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
  if (options.headers) {
    const optionHeaders = options.headers as Record<string, string>;
    Object.assign(headers, optionHeaders);
  }

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Handle unauthorized (clear token)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  if (!res.ok) {
    let errStr = res.statusText;
    try {
      const errBody = await res.json();
      errStr = errBody.error || errStr;
    } catch (e) {}
    throw new Error(errStr);
  }

  // PDF download special case
  if (res.headers.get("Content-Type")?.includes("application/pdf")) {
    return res.blob();
  }

  // Attempt to return JSON, otherwise text if empty
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
};

// Create a new RFQ (handles standard JSON payload)
export const createRfqRequest = async (rfqData: any) => {
  return await apiFetch("/rfqs", {
    method: "POST",
    body: JSON.stringify(rfqData),
  });
};

// Fetch Vendors to assign
export const fetchVendorsRequest = async () => {
  return await apiFetch("/vendors");
};

// Fetch analytics KPIs
export const fetchKpis = async () => {
  return await apiFetch("/analytics/kpis");
};

// Fetch spend by category
export const fetchSpendByCategory = async () => {
  return await apiFetch("/analytics/spend-by-category");
};

// Fetch monthly trend
export const fetchMonthlyTrend = async () => {
  return await apiFetch("/analytics/monthly-trend");
};

// Fetch top vendors
export const fetchTopVendors = async () => {
  return await apiFetch("/analytics/top-vendors");
};

// Fetch purchase orders
export const fetchPurchaseOrders = async () => {
  return await apiFetch("/pos");
};

// Fetch invoices
export const fetchInvoices = async () => {
  return await apiFetch("/invoices");
};

// Generate invoice for a PO
export const generateInvoice = async (poId: string) => {
  return await apiFetch(`/invoices/generate/${poId}`, {
    method: "POST",
  });
};

// Download invoice PDF
export const downloadInvoicePdf = async (invoiceId: string) => {
  const blob = await apiFetch(`/documents/pdf/${invoiceId}`);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${invoiceId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Send invoice email
export const sendInvoiceEmail = async (invoiceId: string) => {
  return await apiFetch(`/invoices/${invoiceId}/send`, {
    method: "POST",
  });
};

// Update PO status
export const updatePoStatus = async (id: string, status: string) => {
  return await apiFetch(`/pos/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};

// Update invoice status
export const updateInvoiceStatus = async (id: string, status: string) => {
  return await apiFetch(`/invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};

// Fetch RFQs
export const fetchRfqs = async () => {
  return await apiFetch("/rfqs");
};

// Fetch all quotations
export const fetchAllQuotations = async () => {
  return await apiFetch("/quotations");
};

// Fetch pending approvals
export const fetchPendingApprovals = async () => {
  return await apiFetch("/quotations/pending");
};

// Approve a quotation
export const approveQuotation = async (id: string) => {
  return await apiFetch(`/quotations/${id}/approve`, { method: "PUT" });
};

// Reject a quotation
export const rejectQuotation = async (id: string) => {
  return await apiFetch(`/quotations/${id}/reject`, { method: "PUT" });
};

// Fetch activity logs
export const fetchLogs = async (query?: string) => {
  const endpoint = query ? `/logs?${query}` : "/logs";
  return await apiFetch(endpoint);
};