import { PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { spendByCategory, monthlySpend, recentPOs, kpis } from '../lib/data';

export function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-semibold text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back, Procurement Officer - Today's Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active RFQ's", value: kpis.activeRfqs },
          { label: "Pending Approvals", value: kpis.pendingApprovals },
          { label: "PO's this month", value: kpis.posThisMonth },
          { label: "overdue invoices", value: kpis.overdueInvoices, className: "text-red-500" },
        ].map((kpi, i) => (
          <div key={i} className="bg-[#1E1E1E] border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center min-h-[140px]">
            <span className={`text-4xl font-semibold mb-2 ${kpi.className || 'text-white'}`}>{kpi.value}</span>
            <span className="text-gray-400 text-sm">{kpi.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-sm font-medium text-gray-300">Recent Purchase Orders</h2>
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-800/50 text-gray-400 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3 font-medium">PO#</th>
                  <th className="px-6 py-3 font-medium">Vendor</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-gray-300">
                {recentPOs.map((po, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">{po.id}</td>
                    <td className="px-6 py-4">{po.vendor}</td>
                    <td className="px-6 py-4">₹ {po.amount.toLocaleString('en-IN')}</td>
                    <td className={`px-6 py-4 ${po.statusColor}`}>{po.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-medium text-gray-300">Spending Trends last 6 months</h2>
          <div className="bg-white rounded-lg p-6 flex flex-col gap-6">
            <div className="h-[120px] w-full flex items-center justify-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     itemStyle={{ color: '#1f2937' }}
                  />
                  <Pie
                    data={spendByCategory}
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {spendByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="w-1/2 space-y-3 pl-4">
                 {spendByCategory.map((item, index) => (
                   <div key={index} className="flex items-center gap-2 text-xs text-zinc-600">
                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                     {item.name}
                   </div>
                 ))}
              </div>
            </div>
            <div className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySpend}>
                  <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     itemStyle={{ color: '#1f2937' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Spend (in Lakhs)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

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
  );
}
