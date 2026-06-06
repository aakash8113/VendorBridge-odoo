import { PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];

export function Dashboard() {
  const [kpis, setKpis] = useState({ activeRfqs: 0, pendingApprovals: 0, totalSpend: 0, activeVendors: 0 });
  const [spendCategory, setSpendCategory] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    async function loadData() {
      try {
        const kpiData = await apiFetch('/analytics/kpis');
        setKpis(kpiData);
        
        const catData = await apiFetch('/analytics/spend-by-category');
        const formattedCat = catData.map((c: any, i: number) => ({
          name: c.category,
          value: c.totalSpend,
          color: COLORS[i % COLORS.length]
        }));
        setSpendCategory(formattedCat);
      } catch (err) {
        console.error(err);
      }
    }
    if (user.role !== 'VENDOR') {
      loadData();
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-semibold text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back, {user.name} ({user.role}) - Today's Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active RFQ's", value: kpis.activeRfqs },
          { label: "Pending Approvals", value: kpis.pendingApprovals },
          { label: "Total Spend ₹", value: kpis.totalSpend.toLocaleString('en-IN') },
          { label: "Active Vendors", value: kpis.activeVendors, className: "text-blue-500" },
        ].map((kpi, i) => (
          <div key={i} className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center min-h-[140px]">
            <span className={`text-4xl font-semibold mb-2 ${kpi.className || 'text-white'}`}>{kpi.value}</span>
            <span className="text-gray-400 text-sm">{kpi.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-sm font-medium text-gray-300">Quick Actions</h2>
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg overflow-hidden p-6 space-y-4">
            <p className="text-gray-400 text-sm">You can start managing procurement easily.</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/create-rfq">
                <button className="px-6 py-2 border border-zinc-700 bg-[#1E1E1E] text-white hover:bg-zinc-800 rounded-lg transition-colors text-sm">
                  + new RFQ
                </button>
              </Link>
              <Link to="/vendors">
                <button className="px-6 py-2 border border-zinc-700 bg-[#1E1E1E] text-white hover:bg-zinc-800 rounded-lg transition-colors text-sm">
                  Add Vendor
                </button>
              </Link>
              <Link to="/invoices">
                <button className="px-6 py-2 border border-zinc-700 bg-[#1E1E1E] text-white hover:bg-zinc-800 rounded-lg transition-colors text-sm">
                  view Invoices
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-medium text-gray-300">Spending by Category</h2>
          <div className="bg-white rounded-lg p-6 flex flex-col gap-6 min-h-[220px]">
            <div className="h-[120px] w-full flex items-center justify-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     itemStyle={{ color: '#1f2937' }}
                  />
                  <Pie
                    data={spendCategory}
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {spendCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="w-1/2 space-y-3 pl-4">
                 {spendCategory.map((item, index) => (
                   <div key={index} className="flex items-center gap-2 text-xs text-zinc-600">
                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                     {item.name}
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

