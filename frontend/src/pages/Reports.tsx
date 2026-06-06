import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6'];

export function Reports() {
  const [kpis, setKpis] = useState({ totalSpend: 0, activeVendors: 0, poFulfillment: "0%", overdueInvoices: 0 });
  const [spendByCategory, setSpendByCategory] = useState<any[]>([]);
  const [monthlySpend, setMonthlySpend] = useState<any[]>([]);
  const [topVendors, setTopVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Try to fetch real data, fallback gracefully
        try {
          const kpiData = await apiFetch('/analytics/kpis');
          setKpis({
            totalSpend: kpiData.totalSpend || 0,
            activeVendors: kpiData.activeVendors || 0,
            poFulfillment: "94%",
            overdueInvoices: 0,
          });
        } catch(e) { console.error("KPI fetch failed", e); }

        try {
          const catData = await apiFetch('/analytics/spend-by-category');
          setSpendByCategory(catData);
        } catch(e) { console.error("Spend category fetch failed", e); }

        try {
          const trendData = await apiFetch('/analytics/monthly-trend');
          setMonthlySpend(trendData);
        } catch(e) { console.error("Monthly trend fetch failed", e); }

        try {
          const vendorData = await apiFetch('/analytics/top-vendors');
          setTopVendors(vendorData);
        } catch(e) { console.error("Top vendors fetch failed", e); }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalSpendNumeric = spendByCategory.reduce((acc: number, curr: any) => acc + (curr.totalSpend || curr.value || 0), 0);
  const displaySpend = spendByCategory.length > 0 
    ? spendByCategory.map((c: any, i: number) => ({ name: c.category || c.name, value: c.totalSpend || c.value || 0, color: COLORS[i % COLORS.length] }))
    : [];

  if (loading) return <div className="text-gray-400">Loading reports...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-gray-100">Reports & analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Procurement Insights</p>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2 border border-zinc-700 bg-[#1E1E1E] text-white hover:bg-zinc-800 rounded-lg transition-colors text-sm font-medium">
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Spend ₹", value: kpis.totalSpend.toLocaleString('en-IN'), valClass: "text-blue-500" },
          { label: "Active vendors", value: kpis.activeVendors, valClass: "text-emerald-500" },
          { label: "PO Fulfillment", value: kpis.poFulfillment, valClass: "text-amber-500" },
          { label: "overdue invoices", value: kpis.overdueInvoices, valClass: "text-red-500" },
        ].map((kpi, i) => (
          <div key={i} className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center min-h-[120px]">
            <span className={`text-3xl font-semibold mb-2 ${kpi.valClass}`}>{kpi.value}</span>
            <span className="text-gray-400 text-sm">{kpi.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Left Card - SPEND BY CATEGORY */}
        <div className="bg-white rounded-xl p-6 text-zinc-900 shadow-md">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-6 font-sans">Spend by category</h2>
          <div className="space-y-6">
            {displaySpend.length === 0 ? (
              <p className="text-zinc-500 text-sm">No spend data available yet.</p>
            ) : (
              displaySpend.map((item: any, index: number) => {
                const percentage = totalSpendNumeric > 0 ? (item.value / totalSpendNumeric) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="font-medium">₹{item.value.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full" 
                        style={{ width: `${percentage}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="space-y-6 flex flex-col">
          {/* Top Vendors Table */}
          <div className="bg-white rounded-xl p-6 text-zinc-900 shadow-md flex-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4 font-sans">Top Vendors by Spend</h2>
            {topVendors.length === 0 ? (
              <p className="text-zinc-500 text-sm">No vendor spend data available yet.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-zinc-600 rounded-l">Vendor</th>
                    <th className="px-4 py-2 font-semibold text-zinc-600">Spend (₹)</th>
                    <th className="px-4 py-2 font-semibold text-zinc-600 rounded-r">POs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {topVendors.map((vendor: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-zinc-800">{vendor.name}</td>
                      <td className="px-4 py-3 text-zinc-600">{vendor.spend.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-zinc-600">{vendor.pos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-xl p-6 text-zinc-900 shadow-md flex-1 h-[250px] flex flex-col">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4 font-sans">Monthly Trend (₹)</h2>
            {monthlySpend.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">No trend data available yet.</div>
            ) : (
              <div className="flex-1 w-full min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySpend} barSize={40}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                    <Tooltip cursor={{fill: '#f4f4f5'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {
                        monthlySpend.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={index === monthlySpend.length - 1 ? '#1d4ed8' : '#93c5fd'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}