import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FileText, Eye, Search, CheckCircle2, Clock, XCircle,
  Sparkles, Star, ArrowUpRight, TrendingDown, Send,
} from 'lucide-react';

import { listQuotations } from '../services/quotationApi.js';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { showToast } from '../components/common/Toast.jsx';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'selected', label: 'Selected' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_COLORS = {
  selected: { bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
  submitted: { bg: 'rgba(99,102,241,0.1)', color: '#6366F1' },
  draft: { bg: 'rgba(100,116,139,0.1)', color: '#64748B' },
  rejected: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
};

export default function Quotations() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const isVendor = user?.role === 'vendor';

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listQuotations({ page, limit: 12, status: statusFilter });
      setQuotations(res.data.data.quotations || []);
      setTotal(res.data.data.total || 0);
    } catch {
      showToast('Error loading quotations', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  const filtered = quotations.filter((q) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      q.rfq?.rfqNumber?.toLowerCase().includes(s) ||
      q.rfq?.title?.toLowerCase().includes(s) ||
      q.vendor?.companyName?.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(total / 12);

  // Stats
  const selectedCount = quotations.filter((q) => q.status === 'selected').length;
  const submittedCount = quotations.filter((q) => q.status === 'submitted').length;
  const totalValue = quotations.reduce((s, q) => s + (q.grandTotal || 0), 0);

  return (
    <div className="page-wrapper">
      {/* ── Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {isVendor ? 'My Quotations' : 'Vendor Quotations'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {isVendor
            ? 'View and manage your submitted price proposals for open RFQs.'
            : 'Review all vendor bids, compare prices, and track selection status.'}
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Quotes', value: total, icon: FileText, color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Submitted', value: submittedCount, icon: Send, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Selected / Won', value: selectedCount, icon: CheckCircle2, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Total Bid Value', value: fmt(totalValue), icon: TrendingDown, color: '#0F172A', bg: 'rgba(15,23,42,0.07)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</p>
                <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</p>
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
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {STATUS_TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setStatusFilter(value); setPage(1); }}
                style={{
                  padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, transition: 'all .15s',
                  backgroundColor: statusFilter === value ? '#6366F1' : 'var(--bg-secondary,#F1F5F9)',
                  color: statusFilter === value ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', position: 'relative', minWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text" placeholder="Search RFQ, vendor…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '32px', fontSize: '13px', height: '36px' }}
            />
          </div>
        </div>
      </Card>

      {/* ── Content ── */}
      {loading ? (
        <div className="spinner-container"><Spinner /></div>
      ) : filtered.length > 0 ? (
        <>
          {/* Card Grid for quotations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filtered.map((q) => {
              const sc = STATUS_COLORS[q.status] || STATUS_COLORS.draft;
              const isSelected = q.status === 'selected';
              return (
                <div
                  key={q._id}
                  style={{
                    borderRadius: '14px',
                    border: isSelected ? '2px solid #10B981' : '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--card-bg)',
                    padding: '20px',
                    position: 'relative',
                    boxShadow: isSelected ? '0 4px 20px rgba(16,185,129,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
                    transition: 'box-shadow .2s, transform .2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/rfqs/${q.rfq?._id}`)}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = isSelected ? '0 4px 20px rgba(16,185,129,0.1)' : '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {/* Selected winner badge */}
                  {isSelected && (
                    <div style={{ position: 'absolute', top: '-12px', right: '16px', backgroundColor: '#10B981', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={10} /> SELECTED
                    </div>
                  )}

                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {q.rfq?.rfqNumber || 'N/A'}
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {q.rfq?.title || 'Untitled RFQ'}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                        backgroundColor: sc.bg, color: sc.color, flexShrink: 0, marginLeft: '8px',
                      }}
                    >
                      {q.status}
                    </span>
                  </div>

                  {/* Vendor Info (internal users only) */}
                  {!isVendor && q.vendor && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '8px', backgroundColor: 'var(--bg-secondary,#F8FAFC)', borderRadius: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                        {q.vendor.companyName?.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{q.vendor.companyName}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#F59E0B' }}>
                          <Star size={10} fill="#F59E0B" /> {q.vendor.rating?.toFixed(1) || 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Price & Delivery Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 500 }}>Grand Total</p>
                      <p style={{ fontSize: '20px', fontWeight: 800, color: isSelected ? '#10B981' : 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                        {fmt(q.grandTotal)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 500 }}>Delivery</p>
                      <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{q.deliveryDays}d</p>
                    </div>
                  </div>

                  {/* Footer: GST + Submitted date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      GST {q.gstPercent}% • {fmt(q.subtotal)} + {fmt(q.gstAmount)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-color)', fontWeight: 600 }}>
                      <ArrowUpRight size={12} /> View RFQ
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px', alignItems: 'center' }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: '13px', fontWeight: 600 }}>← Prev</button>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontSize: '13px', fontWeight: 600 }}>Next →</button>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', border: '2px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)', gap: '12px' }}>
          <FileText size={48} strokeWidth={1.2} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>No Quotations Yet</h3>
          <p style={{ fontSize: '14px', margin: 0 }}>
            {isVendor ? 'You haven\'t submitted any quotations. Go to RFQs to find open bids.' : 'No vendor quotations have been submitted yet.'}
          </p>
          {isVendor && (
            <button onClick={() => navigate('/rfqs')} style={{ padding: '8px 20px', borderRadius: '10px', backgroundColor: '#6366F1', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>
              Browse Open RFQs
            </button>
          )}
        </div>
      )}
    </div>
  );
}
