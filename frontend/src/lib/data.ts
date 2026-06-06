export const spendByCategory = [
  { name: 'IT Hardware', value: 4.8, color: '#3b82f6' }, // value in Lakhs
  { name: 'Furniture', value: 3.2, color: '#10b981' },
  { name: 'Stationery', value: 2.1, color: '#f59e0b' },
  { name: 'Logistics', value: 2.3, color: '#f97316' },
];

export const monthlySpend = [
  { name: 'Dec', value: 3.0 },
  { name: 'Jan', value: 4.5 },
  { name: 'Feb', value: 3.5 },
  { name: 'Mar', value: 6.5 },
  { name: 'Apr', value: 5.5 },
  { name: 'May', value: 8.5 },
];

export const topVendors = [
  { name: 'TechCore Ltd', spend: 420000, pos: 6 },
  { name: 'Infra Supplies Pvt Ltd', spend: 310000, pos: 4 },
  { name: 'FastLog Transport', spend: 190000, pos: 3 },
];

export const recentPOs = [
  { id: 'PO-2025-0066', vendor: 'Infra Supplies Pvt Ltd', amount: 87000, status: 'Approved', statusColor: 'text-emerald-500' },
  { id: 'PO-2025-0067', vendor: 'TechCore Ltd', amount: 140000, status: 'Pending', statusColor: 'text-amber-500' },
  { id: 'PO-2025-0068', vendor: 'Office Need Co.', amount: 34900, status: 'Draft', statusColor: 'text-gray-500' },
];

export const kpis = {
  activeRfqs: 12,
  pendingApprovals: 5,
  posThisMonth: "$ 2.3L",
  overdueInvoices: 3,
  totalSpend: "12.4 L",
  activeVendors: 28,
  poFulfillment: "94%"
};
