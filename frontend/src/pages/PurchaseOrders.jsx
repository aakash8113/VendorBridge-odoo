import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FileText, Eye, Search, Package, CheckCircle, Clock,
  XCircle, Truck, DollarSign, Building2, Calendar,
  ArrowRight, ShieldCheck,
} from 'lucide-react';

import { listPurchaseOrders, getPurchaseOrderDetail, changePoStatus } from '../services/poApi.js';
import Card from '../components/common/Card.jsx';
import Table from '../components/common/Table.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { showToast } from '../components/common/Toast.jsx';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'issued', label: 'Issued' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function PurchaseOrders() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const canManage = user?.role === 'officer' || user?.role === 'admin';

  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [selectedPo, setSelectedPo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  const fetchPOs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPurchaseOrders({ status: statusFilter, page, limit: 12 });
      setPos(res.data.data.pos || []);
      setTotal(res.data.data.total || 0);
    } catch {
      showToast('Error fetching purchase orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchPOs(); }, [fetchPOs]);

  const handleOpenDetail = async (poId) => {
    setDetailLoading(true);
    setIsModalOpen(true);
    try {
      const res = await getPurchaseOrderDetail(poId);
      setSelectedPo(res.data.data);
    } catch {
      showToast('Error loading PO details', 'error');
      setIsModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (poId, status) => {
    setStatusChanging(true);
    try {
      await changePoStatus(poId, status);
      showToast(`✅ PO marked as ${status}`);
      const res = await getPurchaseOrderDetail(poId);
      setSelectedPo(res.data.data);
      fetchPOs();
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setStatusChanging(false);
    }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  const issuedCount = pos.filter((p) => p.status === 'issued').length;
  const deliveredCount = pos.filter((p) => p.status === 'delivered').length;
  const totalValue = pos.reduce((s, p) => s + (p.grandTotal || 0), 0);

  const filtered = pos.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.poNumber?.toLowerCase().includes(q) || p.vendor?.companyName?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="page-wrapper">
      {/* ── Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Purchase Orders
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Track auto-generated POs, delivery timelines, and payment status. POs are created after final manager approval.
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total POs', value: total, icon: Package, color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Issued', value: issuedCount, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Delivered', value: deliveredCount, icon: Truck, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Total Value', value: fmt(totalValue), icon: DollarSign, color: '#0F172A', bg: 'rgba(15,23,42,0.07)' },
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
          <div style={{ display: 'flex', gap: '6px' }}>
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
            <input type="text" placeholder="Search PO, vendor…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="form-control" style={{ paddingLeft: '32px', fontSize: '13px', height: '36px' }} />
          </div>
        </div>
      </Card>

      {/* ── Table ── */}
      {loading ? (
        <div className="spinner-container"><Spinner /></div>
      ) : filtered.length > 0 ? (
        <>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <Table headers={['PO Number', 'Vendor Partner', 'Issued Date', 'Delivery Date', 'Grand Total', 'Status', '']}>
              {filtered.map((po) => {
                const isLate = po.status === 'issued' && new Date(po.deliveryDate) < new Date();
                return (
                  <tr key={po._id}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(248,250,252,0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    style={{ transition: 'background .15s' }}
                  >
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                        {po.poNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#6366F1', flexShrink: 0 }}>
                          {po.vendor?.companyName?.charAt(0) || 'V'}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>{po.vendor?.companyName || '—'}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>{po.vendor?.category || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {new Date(po.issuedAt || po.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: isLate ? '#EF4444' : 'var(--text-secondary)', fontWeight: isLate ? 700 : 400 }}>
                        {new Date(po.deliveryDate).toLocaleDateString('en-IN')}
                        {isLate && <span style={{ display: 'block', fontSize: '10px' }}>⚠ DELAYED</span>}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{fmt(po.grandTotal)}</span>
                    </td>
                    <td><Badge status={po.status}>{po.status}</Badge></td>
                    <td>
                      <button
                        onClick={() => handleOpenDetail(po._id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)',
                          backgroundColor: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                          color: 'var(--text-primary)', transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6366F1'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#6366F1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                      >
                        <Eye size={12} /> Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </Table>
          </Card>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', alignItems: 'center' }}>
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
          <Package size={48} strokeWidth={1.2} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>No Purchase Orders</h3>
          <p style={{ fontSize: '14px', margin: 0, textAlign: 'center' }}>POs are automatically generated after manager L2 final approval. Complete the approval workflow to generate one.</p>
        </div>
      )}

      {/* ── PO Detail Modal ── */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedPo(null); }} title="Purchase Order Details" maxWidth="640px">
        {detailLoading ? (
          <div className="spinner-container"><Spinner /></div>
        ) : selectedPo ? (
          <div>
            {/* PO Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', padding: '16px', backgroundColor: 'var(--bg-secondary,#F8FAFC)', borderRadius: '10px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Purchase Order</p>
                <h3 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'monospace', margin: '0 0 4px' }}>{selectedPo.poNumber}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Issued: {new Date(selectedPo.issuedAt || selectedPo.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <Badge status={selectedPo.status} style={{ fontSize: '13px', padding: '6px 14px' }}>{selectedPo.status}</Badge>
            </div>

            {/* Vendor + Delivery */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Vendor</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#6366F1', flexShrink: 0 }}>
                    {selectedPo.vendor?.companyName?.charAt(0)}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedPo.vendor?.companyName}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>GST: {selectedPo.vendor?.gstNumber}</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Delivery</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} color="#6366F1" />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{new Date(selectedPo.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Procured Items</p>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary,#F8FAFC)' }}>
                    {['Description', 'Qty', 'Unit Price', 'Total'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Description' ? 'left' : 'right', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedPo.lineItems?.map((item, i) => (
                    <tr key={i} style={{ borderBottom: i < selectedPo.lineItems.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>{item.item}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>{item.qty}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>{fmt(item.unitPrice)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tax Summary */}
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary,#F8FAFC)', borderRadius: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Subtotal', val: fmt(selectedPo.subtotal) },
                { label: 'CGST (9%)', val: fmt(selectedPo.cgstAmount) },
                { label: 'SGST (9%)', val: fmt(selectedPo.sgstAmount) },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>{label}</span><span>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '6px' }}>
                <span>Grand Total</span>
                <span style={{ color: '#10B981' }}>{fmt(selectedPo.grandTotal)}</span>
              </div>
            </div>

            {/* Actions */}
            {canManage && selectedPo.status === 'issued' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleStatusChange(selectedPo._id, 'delivered')}
                  disabled={statusChanging}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#10B981', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: statusChanging ? 0.7 : 1 }}
                >
                  <Truck size={16} /> {statusChanging ? 'Updating…' : 'Mark as Delivered'}
                </button>
                <button
                  onClick={() => handleStatusChange(selectedPo._id, 'cancelled')}
                  disabled={statusChanging}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #EF4444', backgroundColor: 'transparent', color: '#EF4444', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: statusChanging ? 0.7 : 1 }}
                >
                  <XCircle size={16} /> Cancel PO
                </button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
