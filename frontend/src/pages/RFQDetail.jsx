import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Users, 
  Paperclip, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Eye,
  PlusCircle,
  TrendingDown,
  Edit2
} from 'lucide-react';

import { getRfqDetail, publishRfq, closeRfq, cancelRfq } from '../services/rfqApi.js';
import { submitQuotation, editQuotation, selectQuotation } from '../services/quotationApi.js';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Table from '../components/common/Table.jsx';
import Modal from '../components/common/Modal.jsx';
import Input from '../components/common/Input.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { showToast } from '../components/common/Toast.jsx';

export default function RFQDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // States
  const [rfq, setRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status transitions loaders
  const [actionLoading, setActionLoading] = useState(false);

  // Quotation Submission Modal States
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [quoteItems, setQuoteItems] = useState([]);
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [gstPercent, setGstPercent] = useState(18);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [notes, setNotes] = useState('');
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Confirm Actions
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmSelection, setConfirmSelection] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);

  const fetchRFQData = async () => {
    try {
      const res = await getRfqDetail(id);
      setRfq(res.data.data.rfq);
      setQuotations(res.data.data.quotations);

      // Pre-fill quotation items matching the RFQ lines
      if (res.data.data.rfq?.lineItems) {
        setQuoteItems(res.data.data.rfq.lineItems.map(item => ({
          item: item.item,
          qty: item.qty,
          unit: item.unit,
          unitPrice: ''
        })));
      }
    } catch (err) {
      showToast('Error loading RFQ details', 'error');
      navigate('/rfqs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQData();
  }, [id]);

  const handlePublish = async () => {
    setActionLoading(true);
    try {
      const res = await publishRfq(id);
      setRfq(res.data.data);
      showToast('RFQ published! Vendors have been notified.');
      setConfirmPublish(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Publish failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    setActionLoading(true);
    try {
      const res = await closeRfq(id);
      setRfq(res.data.data);
      showToast('RFQ closed successfully.');
      setConfirmClose(false);
    } catch (err) {
      showToast('Close failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await cancelRfq(id);
      setRfq(res.data.data);
      showToast('RFQ cancelled.');
      setConfirmCancel(false);
    } catch (err) {
      showToast('Cancel failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Vendor quotation submission / edit
  const handleOpenQuoteModal = (existingQuote = null) => {
    if (existingQuote) {
      setIsEditingQuote(true);
      setEditingQuoteId(existingQuote._id);
      setQuoteItems(existingQuote.items.map(item => ({
        item: item.item,
        qty: item.qty,
        unitPrice: item.unitPrice
      })));
      setDeliveryDays(existingQuote.deliveryDays);
      setGstPercent(existingQuote.gstPercent);
      setPaymentTerms(existingQuote.paymentTerms);
      setNotes(existingQuote.notes || '');
    } else {
      setIsEditingQuote(false);
      setEditingQuoteId(null);
      setDeliveryDays(7);
      setGstPercent(18);
      setPaymentTerms('Net 30');
      setNotes('');
      if (rfq?.lineItems) {
        setQuoteItems(rfq.lineItems.map(item => ({
          item: item.item,
          qty: item.qty,
          unitPrice: ''
        })));
      }
    }
    setIsQuoteModalOpen(true);
  };

  const handleQuoteUnitPriceChange = (index, val) => {
    const updated = [...quoteItems];
    updated[index].unitPrice = val;
    setQuoteItems(updated);
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    const invalid = quoteItems.some(item => !item.unitPrice || parseFloat(item.unitPrice) <= 0);
    if (invalid) {
      showToast('Please provide valid unit prices for all items', 'warning');
      return;
    }

    setQuoteSubmitting(true);
    try {
      if (isEditingQuote) {
        await editQuotation(editingQuoteId, {
          items: quoteItems,
          deliveryDays,
          gstPercent,
          paymentTerms,
          notes,
          status: 'submitted'
        });
        showToast('Quotation updated and submitted!');
      } else {
        await submitQuotation({
          rfq: id,
          items: quoteItems,
          deliveryDays,
          gstPercent,
          paymentTerms,
          notes,
          status: 'submitted'
        });
        showToast('Quotation submitted successfully!');
      }
      setIsQuoteModalOpen(false);
      fetchRFQData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Quotation submission failed', 'error');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  // Quotation Selection (initiates L1/L2 approval)
  const handleSelectQuote = async () => {
    setActionLoading(true);
    try {
      await selectQuotation(selectedQuoteId);
      showToast('Quotation selected! L1/L2 approval workflow initiated.');
      setConfirmSelection(false);
      fetchRFQData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to select quotation', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const isOfficerOrAdmin = user?.role === 'officer' || user?.role === 'manager' || user?.role === 'admin';
  const isVendor = user?.role === 'vendor';

  if (loading) {
    return (
      <div className="spinner-container" style={{ minHeight: '60vh' }}>
        <Spinner />
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Calculate quote totals preview
  const subtotalPreview = quoteItems.reduce((acc, curr) => {
    return acc + (parseFloat(curr.unitPrice || 0) * (curr.qty || 1));
  }, 0);
  const gstPreview = subtotalPreview * (parseFloat(gstPercent || 0) / 100);
  const grandTotalPreview = subtotalPreview + gstPreview;

  // Check if vendor already submitted a quote
  const vendorSubmittedQuote = isVendor ? quotations[0] : null;

  return (
    <div className="page-wrapper">
      {/* Back button */}
      <button 
        onClick={() => navigate('/rfqs')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}
      >
        <ArrowLeft size={16} /> Back to RFQs List
      </button>

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>{rfq?.rfqNumber}</span>
            <Badge status={rfq?.status}>{rfq?.status}</Badge>
          </div>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {rfq?.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Category: <strong>{rfq?.category}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {isOfficerOrAdmin && rfq?.status === 'draft' && (
            <>
              <Button onClick={() => setConfirmPublish(true)} variant="primary">
                Publish RFQ
              </Button>
              <Button onClick={() => setConfirmCancel(true)} variant="secondary" style={{ color: 'var(--danger-color)' }}>
                Cancel RFQ
              </Button>
            </>
          )}

          {isOfficerOrAdmin && rfq?.status === 'published' && (
            <Button onClick={() => setConfirmClose(true)} variant="secondary" style={{ color: 'var(--warning-color)', borderColor: 'var(--warning-color)' }}>
              Close RFQ
            </Button>
          )}

          {isVendor && rfq?.status === 'published' && (
            <>
              {vendorSubmittedQuote ? (
                vendorSubmittedQuote.status === 'submitted' && (
                  <Button onClick={() => handleOpenQuoteModal(vendorSubmittedQuote)} variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Edit2 size={16} /> Edit Submitted Quote
                  </Button>
                )
              ) : (
                <Button onClick={() => handleOpenQuoteModal(null)} variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlusCircle size={16} /> Submit Price Quotation
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Details + Items */}
      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Specifications description */}
          <Card style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              RFQ Specifications & Details
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-line', marginBottom: '20px' }}>
              {rfq?.description || 'No description provided.'}
            </p>

            {/* Attachments */}
            {rfq?.attachments?.length > 0 && (
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Reference Specs / Blueprints
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {rfq.attachments.map((file, idx) => (
                    <a 
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#F1F5F9', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', color: 'var(--text-primary)', textDecoration: 'none' }}
                    >
                      <Paperclip size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Line items requested */}
          <Card style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              Requested Line Items
            </h3>
            <Table headers={['#', 'Item Description', 'Quantity', 'Unit']}>
              {rfq?.lineItems?.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: 500 }}>{item.item}</td>
                  <td>{item.qty}</td>
                  <td>{item.unit}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>

        {/* Right column: Info details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              Procurement Timeline
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Created Date</p>
                  <p style={{ fontWeight: 500 }}>{new Date(rfq?.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Submission Deadline</p>
                  <p style={{ fontWeight: 500, color: new Date(rfq?.deadline) < new Date() ? 'var(--danger-color)' : 'inherit' }}>
                    {new Date(rfq?.deadline).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {isOfficerOrAdmin && (
            <Card style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                Assigned Vendors
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rfq?.assignedVendors?.map(v => (
                  <div key={v._id} style={{ fontSize: '14px', fontWeight: 500, padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    {v.companyName}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Submitted Quotations Section (Officer / Admin / Manager only) */}
      {isOfficerOrAdmin && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
              Submitted Quotations ({quotations.length})
            </h3>
            {quotations.length >= 2 && (
              <Button 
                onClick={() => navigate(`/compare/${id}`)}
                variant="secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
              >
                <TrendingDown size={16} /> Compare Quotations Side-by-Side
              </Button>
            )}
          </div>

          {quotations.length > 0 ? (
            <Table headers={['Vendor Partner', 'Delivery Days', 'Subtotal', 'Grand Total (GST inc.)', 'Status', 'Actions']}>
              {quotations.map(quote => (
                <tr key={quote._id}>
                  <td>
                    <div>
                      <p style={{ fontWeight: 600 }}>{quote.vendor?.companyName}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Rating: {quote.vendor?.rating} ★</p>
                    </div>
                  </td>
                  <td>{quote.deliveryDays} Days</td>
                  <td>{formatCurrency(quote.subtotal)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(quote.grandTotal)}</td>
                  <td>
                    <Badge status={quote.status}>{quote.status}</Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {quote.status === 'submitted' && (
                        <Button 
                          onClick={() => { setSelectedQuoteId(quote._id); setConfirmSelection(true); }}
                          variant="primary" 
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        >
                          Select & Initiate Approval
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              No quotations submitted by vendors yet.
            </div>
          )}
        </Card>
      )}

      {/* Vendor view of their own quotation */}
      {isVendor && vendorSubmittedQuote && (
        <Card>
          <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            Your Submitted Quotation Price Bid
          </h3>

          <Table headers={['Item Description', 'Qty', 'Unit Price', 'Total']}>
            {vendorSubmittedQuote.items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 500 }}>{item.item}</td>
                <td>{item.qty}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </Table>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                Delivery duration
              </p>
              <p style={{ fontSize: '15px', fontWeight: 500 }}>{vendorSubmittedQuote.deliveryDays} Days</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                Payment Terms
              </p>
              <p style={{ fontSize: '15px', fontWeight: 500 }}>{vendorSubmittedQuote.paymentTerms}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                Grand Total (inc. {vendorSubmittedQuote.gstPercent}% GST)
              </p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                {formatCurrency(vendorSubmittedQuote.grandTotal)}
              </p>
            </div>
          </div>
          {vendorSubmittedQuote.notes && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', fontSize: '13px' }}>
              <strong>Notes:</strong> {vendorSubmittedQuote.notes}
            </div>
          )}
        </Card>
      )}

      {/* Vendor Quote Submission / Edit Modal */}
      <Modal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
        title={isEditingQuote ? "Edit Price Quotation Bid" : "Submit Price Quotation Bid"}
        style={{ maxWidth: '600px' }}
      >
        <form onSubmit={handleQuoteSubmit}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Enter unit prices for each requested item. GST amount and grand totals will auto-calculate.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
            {quoteItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 3 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.item}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Quantity: {item.qty}</p>
                </div>
                <div style={{ flex: 2 }}>
                  <Input
                    placeholder="Unit Price (INR)"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleQuoteUnitPriceChange(idx, e.target.value)}
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Delivery Days"
              type="number"
              min="1"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(parseInt(e.target.value) || 0)}
              required
            />
            <Input
              label="GST rate (%)"
              type="number"
              min="0"
              value={gstPercent}
              onChange={(e) => setGstPercent(parseInt(e.target.value) || 0)}
              required
            />
          </div>

          <Input
            label="Payment Terms"
            placeholder="Net 30 / Advance"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            required
          />

          <div className="form-group">
            <label className="form-label">Vendor Notes</label>
            <textarea
              className="form-control"
              placeholder="Provide warranty details, specifications, compliance statements..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          {/* Dynamic Summary */}
          <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotalPreview)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span>GST ({gstPercent}%):</span>
              <span>{formatCurrency(gstPreview)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', color: 'var(--accent-color)' }}>
              <span>Grand Total:</span>
              <span>{formatCurrency(grandTotalPreview)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={() => setIsQuoteModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={quoteSubmitting}>
              Submit Bid
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm publish dialog */}
      <ConfirmDialog
        isOpen={confirmPublish}
        title="Publish RFQ"
        message="Are you sure you want to publish this RFQ? Assigned vendors will receive real-time notifications to submit bids."
        onConfirm={handlePublish}
        onCancel={() => setConfirmPublish(false)}
        loading={actionLoading}
      />

      {/* Confirm close dialog */}
      <ConfirmDialog
        isOpen={confirmClose}
        title="Close RFQ"
        message="Are you sure you want to close this RFQ? No new quotation submissions will be accepted."
        onConfirm={handleClose}
        onCancel={() => setConfirmClose(false)}
        loading={actionLoading}
      />

      {/* Confirm cancel dialog */}
      <ConfirmDialog
        isOpen={confirmCancel}
        title="Cancel RFQ"
        message="Are you sure you want to cancel this RFQ? This action is irreversible."
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
        loading={actionLoading}
      />

      {/* Confirm quotation selection dialog */}
      <ConfirmDialog
        isOpen={confirmSelection}
        title="Select Quotation & Initiate Approval"
        message="Are you sure you want to select this quotation? This will close the RFQ, reject other bids, and initiate a multi-level L1/L2 approval pipeline."
        onConfirm={handleSelectQuote}
        onCancel={() => setConfirmSelection(false)}
        loading={actionLoading}
      />
    </div>
  );
}
