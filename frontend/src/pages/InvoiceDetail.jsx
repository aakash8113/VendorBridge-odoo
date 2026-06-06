import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Mail, 
  CheckCircle, 
  Building, 
  Calendar,
  AlertTriangle,
  Receipt
} from 'lucide-react';

import { getInvoiceDetail, emailInvoice, markInvoicePaid } from '../services/invoiceApi.js';
import api from '../services/api.js';
import Card from '../components/common/Card.jsx';
import Table from '../components/common/Table.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { showToast } from '../components/common/Toast.jsx';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // States
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailing, setEmailing] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  // Confirm states
  const [confirmMarkPaid, setConfirmMarkPaid] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  const fetchInvoice = async () => {
    try {
      const res = await getInvoiceDetail(id);
      setInvoice(res.data.data);
    } catch (err) {
      showToast('Error loading invoice details', 'error');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleDownloadPdf = async () => {
    try {
      showToast('Downloading invoice PDF...');
      const res = await api.get(`/invoices/${id}/download`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showToast('Failed to download invoice PDF', 'error');
    }
  };

  const handlePrint = () => {
    if (invoice?.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
    } else {
      showToast('No PDF url generated yet', 'error');
    }
  };

  const handleEmailInvoice = async () => {
    setEmailing(true);
    try {
      await emailInvoice(id);
      showToast('Invoice PDF emailed to vendor successfully!');
      setConfirmEmail(false);
      fetchInvoice();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to email invoice', 'error');
    } finally {
      setEmailing(false);
    }
  };

  const handleMarkPaid = async () => {
    setMarkingPaid(true);
    try {
      const res = await markInvoicePaid(id);
      setInvoice(res.data.data);
      showToast('Invoice marked as PAID!');
      setConfirmMarkPaid(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update payment status', 'error');
    } finally {
      setMarkingPaid(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const isOfficerOrAdmin = user?.role === 'officer' || user?.role === 'manager' || user?.role === 'admin';

  if (loading) {
    return (
      <div className="spinner-container" style={{ minHeight: '60vh' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Back button */}
      <button 
        onClick={() => navigate('/invoices')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}
      >
        <ArrowLeft size={16} /> Back to Invoices List
      </button>

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Tax Invoice Details</span>
            <Badge status={invoice?.status}>{invoice?.status}</Badge>
          </div>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {invoice?.invoiceNumber}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Linked Order: <strong>{invoice?.po?.poNumber}</strong>
          </p>
        </div>

        {/* Action Triggers */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={handleDownloadPdf} variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Download PDF
          </Button>
          <Button onClick={handlePrint} variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={16} /> Print
          </Button>
          <Button onClick={() => setConfirmEmail(true)} variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={16} /> Email Vendor
          </Button>

          {isOfficerOrAdmin && invoice?.status !== 'paid' && (
            <Button 
              onClick={() => setConfirmMarkPaid(true)} 
              variant="primary" 
              style={{ backgroundColor: 'var(--success-color)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <CheckCircle size={16} /> Mark as Paid
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Details Layout */}
      <div className="grid-3" style={{ gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main invoice sheet */}
          <Card style={{ padding: '32px', marginBottom: 0 }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-bg)', margin: 0 }}>VendorBridge Procurement</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  456 Industrial Estate, Ahmedabad, Gujarat, India<br />
                  GSTIN: 24AAAAA1111A1Z1
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>TAX INVOICE</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Invoice Ref: {invoice?.invoiceNumber}<br />
                  Date: {new Date(invoice?.invoiceDate).toLocaleDateString('en-IN')}<br />
                  Due: {new Date(invoice?.dueDate).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            {/* Billing row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Supplier / Vendor Details
                </p>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{invoice?.vendor?.companyName}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {invoice?.vendor?.address}<br />
                  GSTIN: {invoice?.vendor?.gstNumber}<br />
                  Email: {invoice?.vendor?.email}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Billing Address
                </p>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>VendorBridge Ltd.</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  Procurement Department<br />
                  456 Industrial Estate, Ahmedabad, Gujarat<br />
                  GSTIN: 24AAAAA1111A1Z1
                </p>
              </div>
            </div>

            {/* Line Items */}
            <Table headers={['#', 'Item Description', 'Quantity', 'Unit Price', 'Total']}>
              {invoice?.lineItems?.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: 500 }}>{item.item}</td>
                  <td>{item.qty}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </Table>

            {/* Financial summary calculations */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(invoice?.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>CGST (9%):</span>
                  <span>{formatCurrency(invoice?.cgst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>SGST (9%):</span>
                  <span>{formatCurrency(invoice?.sgst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-color)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '6px' }}>
                  <span>Grand Total:</span>
                  <span>{formatCurrency(invoice?.grandTotal)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              Payment Timeline
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Invoice Date</p>
                  <p style={{ fontWeight: 500 }}>{new Date(invoice?.invoiceDate).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Due Date</p>
                  <p style={{ fontWeight: 500, color: invoice?.status === 'overdue' ? 'var(--danger-color)' : 'inherit' }}>
                    {new Date(invoice?.dueDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {invoice?.paidAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <CheckCircle size={16} style={{ color: 'var(--success-color)' }} />
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Paid Date</p>
                    <p style={{ fontWeight: 500, color: 'var(--success-color)' }}>{new Date(invoice.paidAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              )}

              {invoice?.sentAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Emailed To Vendor</p>
                    <p style={{ fontWeight: 500 }}>{new Date(invoice.sentAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm mark paid */}
      <ConfirmDialog
        isOpen={confirmMarkPaid}
        title="Mark Invoice as Paid"
        message="Are you sure you want to mark this invoice as Paid? This will record the payment in system logs and update metrics."
        onConfirm={handleMarkPaid}
        onCancel={() => setConfirmMarkPaid(false)}
        loading={markingPaid}
      />

      {/* Confirm email dialog */}
      <ConfirmDialog
        isOpen={confirmEmail}
        title="Email Invoice to Vendor"
        message={`Are you sure you want to email the Invoice PDF to ${invoice?.vendor?.companyName} at ${invoice?.vendor?.email}?`}
        onConfirm={handleEmailInvoice}
        onCancel={() => setConfirmEmail(false)}
        loading={emailing}
      />
    </div>
  );
}
