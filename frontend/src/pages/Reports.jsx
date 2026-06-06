import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Building,
  BarChart3,
  PieChart as PieIcon,
  FileSpreadsheet,
  DollarSign,
  Package,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

import { getAnalytics, exportProcurementData } from '../services/reportApi.js';
import Card from '../components/common/Card.jsx';
import Table from '../components/common/Table.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { showToast } from '../components/common/Toast.jsx';

const COLORS = ['#0F172A', '#F59E0B', '#10B981', '#EF4444', '#6366F1', '#64748B'];

// ── Axis tick formatter: 750000 → ₹7.5L, 10000000 → ₹1Cr ────────────────────
const fmtAxis = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
};

// ── Custom bar tooltip ────────────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>{label}</p>
      <p style={{ margin: 0, color: '#F59E0B', fontWeight: 600 }}>{fmt(payload[0]?.value)}</p>
    </div>
  );
};

// ── Custom pie tooltip ────────────────────────────────────────────────────────
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>{payload[0]?.name}</p>
      <p style={{ margin: 0, color: '#6366F1', fontWeight: 600 }}>{fmt(payload[0]?.value)}</p>
    </div>
  );
};

export default function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchReportsData() {
      try {
        const res = await getAnalytics();
        setAnalytics(res.data.data);
      } catch (err) {
        showToast('Error loading analytics reports', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchReportsData();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      showToast('Exporting procurement report...');
      const res = await exportProcurementData();
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `procurement_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('CSV report exported!');
    } catch (err) {
      showToast('Failed to export CSV report', 'error');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  if (loading) {
    return (
      <div className="spinner-container" style={{ minHeight: '60vh' }}>
        <Spinner />
      </div>
    );
  }

  const pieData = analytics?.spendByCategory?.map((item) => ({
    name: item._id || 'Uncategorized',
    value: item.totalSpend,
  })) || [];

  const totalSpend = pieData.reduce((s, i) => s + i.value, 0);
  const totalVendors = analytics?.topVendors?.length || 0;
  const totalOrders = analytics?.topVendors?.reduce((s, v) => s + v.poCount, 0) || 0;

  return (
    <div className="page-wrapper">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Analytics & Reports</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Analyze spend analysis, category breakdowns, and export full audit database spreadsheets.
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} loading={exporting}>
          <FileSpreadsheet size={16} /> Export CSV Report
        </Button>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Total Spend', value: formatCurrency(totalSpend), icon: DollarSign, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Active Suppliers', value: totalVendors, icon: Users, color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Orders Placed', value: totalOrders, icon: Package, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Categories', value: pieData.length, icon: BarChart3, color: '#0F172A', bg: 'rgba(15,23,42,0.07)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</p>
                <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{value}</p>
              </div>
              <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: bg, color }}><Icon size={20} /></div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Bar Chart — Monthly Trend */}
        <Card>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} /> Monthly Procurement Volume Trend
          </h3>
          <div style={{ width: '100%', minWidth: 0 }}>
            {analytics?.monthlyTrend?.length > 0 ? (
              <ResponsiveContainer width="99%" height={300}>
                <BarChart
                  data={analytics.monthlyTrend}
                  margin={{ top: 10, right: 16, left: 16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    tickFormatter={fmtAxis}
                    width={60}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(245,158,11,0.06)' }} />
                  <Bar dataKey="total" fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', gap: '8px' }}>
                <BarChart3 size={36} strokeWidth={1} />
                <p style={{ margin: 0, fontSize: '14px' }}>No trend data yet — complete some POs first.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Pie Chart — Category Distribution */}
        <Card>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieIcon size={18} /> Industry Category Spend Distribution
          </h3>
          <div style={{ width: '100%', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="99%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="46%"
                    innerRadius={72}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <PieIcon size={36} strokeWidth={1} />
                <p style={{ margin: 0, fontSize: '14px' }}>No category data yet.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Vendors performance table */}
      <Card>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building size={18} /> Top Performing Suppliers Summary
        </h3>
        {analytics?.topVendors?.length > 0 ? (
          <Table headers={['Supplier Name', 'Industry Category', 'Orders Completed', 'Total Procurement Volume']}>
            {analytics.topVendors.map((v) => (
              <tr key={v._id}>
                <td style={{ fontWeight: 600 }}>{v.vendorDetails.companyName}</td>
                <td>{v.vendorDetails.category}</td>
                <td>{v.poCount} Orders</td>
                <td style={{ fontWeight: 600, color: 'var(--success-color)' }}>{formatCurrency(v.totalSpend)}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
            No supplier rankings available.
          </div>
        )}
      </Card>
    </div>
  );
}
