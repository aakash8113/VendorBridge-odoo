import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FileText, ArrowRight, ShieldAlert, Search, Filter,
  CheckCircle, Clock, XCircle, AlertTriangle, Download,
  TrendingUp, DollarSign, Building2,
} from 'lucide-react';

import { listInvoices } from '../services/invoiceApi.js';
import Card from '../components/common/Card.jsx';
import Table from '../components/common/Table.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { showToast } from '../components/common/Toast.jsx';

const STATUS_TABS = [
  { value: '', label: 'All', icon: FileText },
  { value: 'pending_payment', label: 'Pending', icon: Clock },
  { value: 'paid', label: 'Paid', icon: CheckCircle },
  { value: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
];

export default function Invoices() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listInvoices({ status: statusFilter, page, limit: 12 });
      setInvoices(res.data.data.invoices || []);
      setTotal(res.data.data.total || 0);
    } catch {
      showToast('Error fetching invoices', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  // Derived stats from current list
  const totalAmount = invoices.reduce((s, i) => s + (i.grandTotal || 0), 0);
  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const pendingCount = invoices.filter((i) => i.status === 'pending_payment').length;
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

  // Client-side search filter
  const filtered = invoices.filter((inv) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.vendor?.companyName?.toLowerCase().includes(q) ||
      inv.po?.poNumber?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(total / 12);

  const isOverdue = (inv) => {
    if (inv.status === 'paid' || inv.status === 'cancelled') return false;
    return new Date(inv.dueDate) < new Date();
  };

  return (
    <div className="page-wrapper">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Tax Invoices
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Manage payments, CGST + SGST tax calculations, invoice emails, and PDF downloads.
          </p>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Value', value: fmt(totalAmount), icon: DollarSign, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Paid', value: paidCount, icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Pending', value: pendingCount, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Overdue', value: overdueCount, icon: AlertTriangle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</p>
                <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</p>
              </div>
              <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: bg, color }}>
                <Icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <Card style={{ padding: '12px 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {STATUS_TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setStatusFilter(value); setPage(1); }}
                style={{
                  padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, transition: 'all .15s',
                  backgroundColor: statusFilter === value ? 'var(--accent-color, #F59E0B)' : 'var(--bg-secondary,#F1F5F9)',
                  color: statusFilter === value ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ marginLeft: 'auto', position: 'relative', minWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search invoice, vendor, PO…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '32px', fontSize: '13px', height: '36px' }}
            />
          </div>
        </div>
      </Card>

      {/* ── Table ── */}
      {loading ? (
        <div className="spinner-container"><Spinner /></div>
      ) : filtered.length > 0 ? (
        <>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <Table headers={['Invoice #', 'PO Reference', 'Vendor', 'Invoice Date', 'Due Date', 'Grand Total', 'Status', '']}>
              {filtered.map((inv) => {
                const due = isOverdue(inv);
                return (
                  <tr key={inv._id} style={{ transition: 'background .15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(248,250,252,0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '13px' }}>
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {inv.po?.poNumber || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>
                          {inv.vendor?.companyName?.charAt(0) || 'V'}
                        </div>
                        <span style={{ fontWeight: 500 }}>{inv.vendor?.companyName || '—'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: due ? '#EF4444' : 'var(--text-secondary)', fontWeight: due ? 600 : 400 }}>
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '—'}
                        {due && <span style={{ display: 'block', fontSize: '10px', fontWeight: 700 }}>⚠ OVERDUE</span>}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{fmt(inv.grandTotal)}</span>
                    </td>
                    <td><Badge status={inv.status}>{inv.status?.replace('_', ' ')}</Badge></td>
                    <td>
                      <button
                        onClick={() => navigate(`/invoices/${inv._id}`)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)',
                          backgroundColor: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                          color: 'var(--text-primary)', transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-color)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent-color)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                      >
                        Manage <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </Table>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', alignItems: 'center' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: '13px', fontWeight: 600 }}
              >
                ← Prev
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontSize: '13px', fontWeight: 600 }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '80px 24px', border: '2px dashed var(--border-color)', borderRadius: '16px',
            color: 'var(--text-secondary)', gap: '12px',
          }}
        >
          <ShieldAlert size={48} strokeWidth={1.2} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>No Invoices Found</h3>
          <p style={{ fontSize: '14px', margin: 0 }}>No tax invoices match your current filters. Invoices are auto-generated after final approval.</p>
        </div>
      )}
    </div>
  );
}
