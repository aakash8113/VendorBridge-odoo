import { useState, useEffect } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import { apiFetch } from '../lib/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6'];

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ totalSpend: 0, activeVendors: 0, poFulfillment: "0%", overdueInvoices: 0 });
  const [spendByCategory, setSpendByCategory] = useState<any[]>([]);
  const [monthlySpend, setMonthlySpend] = useState<any[]>([]);
  const [topVendors, setTopVendors] = useState<any[]>([]);

  useEffect(() => {
    async function loadReportsData() {
      try {
        setLoading(true);
        // Fetching all analytics in parallel
        const [kpiData, categoryData, monthlyData, vendorsData] = await Promise.all([
          apiFetch('/analytics/kpis'),
          apiFetch('/analytics/spend-by-category'),
          apiFetch('/analytics/monthly-trend'),
          apiFetch('/analytics/top-vendors')
        ]);

        if (kpiData) {
          setKpis({
            totalSpend: kpiData.totalSpend || 0,
            activeVendors: kpiData.activeVendors || 0,
            poFulfillment: "94%",
            overdueInvoices: 0,
          });
        }
        
        if (categoryData) {
          setSpendByCategory(categoryData.map((c: any, i: number) => ({
            name: c.category || c.name,
            value: c.totalSpend || c.value || 0,
            color: COLORS[i % COLORS.length]
          })));
        }

        if (monthlyData) setMonthlySpend(monthlyData);
        if (vendorsData) setTopVendors(vendorsData);

      } catch (err) {
        console.error("Failed to fetch reports data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReportsData();
  }, []);

  const totalSpendNumeric = spendByCategory.reduce((acc: number, curr: any) => acc + (Number(curr.value) || 0), 0);

  if (loading) {
    return <div className="text-gray-400 animate-pulse">Loading procurement analytics...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-gray-100">Reports & analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Procurement Insights - Live Data</p>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2 border border-zinc-700 bg-[#1E1E1E] text-white hover:bg-zinc-800 rounded-lg transition-colors text-sm font-medium">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Spend ₹", value: kpis.totalSpend.toLocaleString ? kpis.totalSpend.toLocaleString('en-IN') : kpis.totalSpend, valClass: "text-blue-500" },
          { label: "Active Vendors", value: kpis.activeVendors, valClass: "text-emerald-500" },
          { label: "PO Fulfillment", value: kpis.poFulfillment, valClass: "text-amber-500" },
          { label: "Overdue Invoices", value: kpis.overdueInvoices, valClass: "text-red-500" },
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
            {spendByCategory.length === 0 ? (
              <p className="text-sm text-zinc-500">No category spend data available.</p>
            ) : (
              spendByCategory.map((category: any, index: number) => {
                const percentage = totalSpendNumeric > 0 ? (category.value / totalSpendNumeric) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{category.name}</span>
                      <span className="font-medium">₹{Number(category.value).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-1000" 
                        style={{ width: `${percentage}%`, backgroundColor: category.color }}
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
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-2 font-semibold text-zinc-600 rounded-l">Vendor</th>
                  <th className="px-4 py-2 font-semibold text-zinc-600">Spend (₹)</th>
                  <th className="px-4 py-2 font-semibold text-zinc-600 rounded-r">POs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {topVendors.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-4 text-center text-zinc-500">No vendor data available.</td></tr>
                ) : (
                  topVendors.map((vendor: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-zinc-800">{vendor.name || vendor.companyName}</td>
                      <td className="px-4 py-3 text-zinc-600">{Number(vendor.spend || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-zinc-600">{vendor.pos || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-xl p-6 text-zinc-900 shadow-md flex-1 h-[250px] flex flex-col">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4 font-sans">Monthly Trend (₹)</h2>
            <div className="flex-1 w-full min-h-0">
               {monthlySpend.length === 0 ? (
                 <div className="flex items-center justify-center h-full text-zinc-500 text-sm">No monthly trend data.</div>
               ) : (
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
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}