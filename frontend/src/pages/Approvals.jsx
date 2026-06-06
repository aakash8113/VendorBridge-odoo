import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  CheckSquare, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  MessageSquare, 
  FileText, 
  AlertCircle, 
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';

import { listApprovals, getApprovalDetail, processApprovalAction } from '../services/approvalApi.js';
import Card from '../components/common/Card.jsx';
import Table from '../components/common/Table.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import Input from '../components/common/Input.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { showToast } from '../components/common/Toast.jsx';

export default function Approvals() {
  const { user } = useSelector((state) => state.auth);

  // List states
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Detail / Action states
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await listApprovals({ status: statusFilter, page, limit: 10 });
      setApprovals(res.data.data.approvals);
      setTotal(res.data.data.total);
    } catch (err) {
      showToast('Failed to load approvals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter, page]);

  const handleOpenDetail = async (approvalId) => {
    setDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const res = await getApprovalDetail(approvalId);
      setSelectedApproval(res.data.data);
    } catch (err) {
      showToast('Error loading approval details', 'error');
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAction = async (actionStatus) => {
    if (!remarks) {
      showToast('Remarks are required for approval actions', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      const res = await processApprovalAction(selectedApproval._id, {
        status: actionStatus,
        remarks
      });
      showToast(`Quotation ${actionStatus} successfully!`);
      setRemarks('');
      setIsDetailOpen(false);
      fetchApprovals();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '4px' }}>Procurement Approvals</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Review pending workflows, approve pricing contracts, and trigger automated purchase orders.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ width: '180px' }}>
            <select 
              className="form-control"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="l1_approved">L1 Approved</option>
              <option value="approved">Approved (Completed)</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Approvals Table */}
      {loading ? (
        <div className="spinner-container">
          <Spinner />
        </div>
      ) : approvals.length > 0 ? (
        <Card style={{ padding: 0 }}>
          <Table headers={['RFQ Reference', 'Vendor Partner', 'Bid Amount', 'Stage', 'Overall Status', 'Initiated By', 'Actions']}>
            {approvals.map(approval => (
              <tr key={approval._id}>
                <td>
                  <div>
                    <span style={{ fontWeight: 600 }}>{approval.rfq?.rfqNumber}</span>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{approval.rfq?.title}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.7, margin: '2px 0 0', fontFamily: 'monospace' }}>
                      Quote #{String(approval._id).slice(-6).toUpperCase()}
                    </p>
                  </div>
                </td>
                <td>{approval.vendor?.companyName}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(approval.quotation?.grandTotal ?? approval.amount ?? 0)}</td>
                <td>
                  <Badge status={approval.overallStatus === 'pending' ? 'L1 Review' : approval.overallStatus === 'l1_approved' ? 'L2 Review' : 'Completed'}>
                    {approval.overallStatus === 'pending' ? 'L1 Review' : approval.overallStatus === 'l1_approved' ? 'L2 Review' : 'Completed'}
                  </Badge>
                </td>
                <td>
                  <Badge status={approval.overallStatus}>{approval.overallStatus}</Badge>
                </td>
                <td>
                  {approval.initiatedBy?.firstName} {approval.initiatedBy?.lastName}
                </td>
                <td>
                  <Button 
                    onClick={() => handleOpenDetail(approval._id)} 
                    variant="secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Review Workflow
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
          {/* Pagination */}
          {total > 10 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, total)} of {total} approvals
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 14px', fontSize: '13px' }}>← Prev</Button>
                <Button variant="secondary" onClick={() => setPage(p => p + 1)} disabled={page * 10 >= total} style={{ padding: '6px 14px', fontSize: '13px' }}>Next →</Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <div className="empty-state">
          <CheckSquare size={48} className="empty-state-icon" />
          <h3>No Approval Cycles</h3>
          <p>No procurement approvals found matching your search.</p>
        </div>
      )}

      {/* Workflow Review Modal */}
      <Modal 
        isOpen={isDetailOpen} 
        onClose={() => { setIsDetailOpen(false); setSelectedApproval(null); setRemarks(''); }}
        title="Procurement Approval Workflow Timeline"
        style={{ maxWidth: '650px' }}
      >
        {detailLoading ? (
          <div className="spinner-container">
            <Spinner />
          </div>
        ) : selectedApproval ? (
          <div>
            {/* Timeline Stepper */}
            <div className="timeline-stepper" style={{ marginBottom: '32px' }}>
              {selectedApproval.steps.map((step, idx) => {
                const isActive = selectedApproval.currentStep === idx && selectedApproval.overallStatus !== 'rejected' && selectedApproval.overallStatus !== 'approved';
                const isCompleted = step.status === 'approved' || (selectedApproval.currentStep > idx && selectedApproval.overallStatus !== 'rejected') || selectedApproval.overallStatus === 'approved';
                const isRejected = step.status === 'rejected';

                let stepClass = '';
                if (isActive) stepClass = 'active';
                else if (isCompleted) stepClass = 'completed';
                else if (isRejected) stepClass = 'rejected';

                return (
                  <div key={idx} className={`timeline-step ${stepClass}`}>
                    <div className="timeline-circle">
                      {isCompleted ? '✓' : isRejected ? '✗' : idx + 1}
                    </div>
                    <div className="timeline-label">{step.label}</div>
                  </div>
                );
              })}
            </div>

            {/* General details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Procured From
                </p>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>{selectedApproval.vendor?.companyName}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>GST: {selectedApproval.vendor?.gstNumber}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Grand Total Price (Bid)
                </p>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                  {formatCurrency(selectedApproval.amount)}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedApproval.quotation?.deliveryDays} days delivery</p>
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                Line Items Overview
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {selectedApproval.quotation?.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>{item.item} (x{item.qty})</span>
                    <span style={{ fontWeight: 500 }}>{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Steps */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px' }}>
                Reviewer Logs
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedApproval.steps.map((step, idx) => {
                  if (step.status === 'pending') {
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '6px', fontSize: '13px' }}>
                        <Clock size={16} style={{ color: 'var(--warning-color)' }} />
                        <span>{step.label} is currently pending.</span>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} style={{ padding: '12px', backgroundColor: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <UserIcon size={14} style={{ color: 'var(--text-secondary)' }} />
                          {step.approver?.firstName} {step.approver?.lastName} ({step.label})
                        </span>
                        <Badge status={step.status}>{step.status}</Badge>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <MessageSquare size={13} style={{ marginTop: '3px', flexShrink: 0 }} />
                        Remarks: {step.remarks || 'No remarks provided.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action panel (Managers only when workflow is pending at their level) */}
            {isManagerOrAdmin && (selectedApproval.overallStatus === 'pending' || selectedApproval.overallStatus === 'l1_approved') && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Submit Approval Action
                </h4>

                <Input
                  label="Review Remarks / Comments"
                  placeholder="Approve with specifications or reject with reason..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                />

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <Button 
                    onClick={() => handleAction('approved')} 
                    variant="primary" 
                    style={{ backgroundColor: 'var(--success-color)', color: 'white', flex: 1 }}
                    loading={actionLoading}
                  >
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleAction('rejected')} 
                    variant="secondary" 
                    style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)', flex: 1 }}
                    loading={actionLoading}
                  >
                    Reject Bidding
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
