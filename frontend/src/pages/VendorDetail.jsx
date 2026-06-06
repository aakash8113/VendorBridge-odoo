import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Building2, 
  Mail, 
  Phone as PhoneIcon, 
  MapPin, 
  Calendar, 
  Star, 
  FileText, 
  Trash2, 
  Edit3,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

import { getVendorDetail, changeVendorStatus, deleteVendor, getVendorRfqs } from '../services/vendorApi.js';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Table from '../components/common/Table.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { showToast } from '../components/common/Toast.jsx';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // States
  const [vendor, setVendor] = useState(null);
  const [stats, setStats] = useState(null);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Confirm Dialog states
  const [confirmStatusChange, setConfirmStatusChange] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchVendorData = async () => {
    try {
      const detailRes = await getVendorDetail(id);
      setVendor(detailRes.data.data.vendor);
      setStats(detailRes.data.data.stats);

      const rfqsRes = await getVendorRfqs(id);
      setRfqs(rfqsRes.data.data);
    } catch (err) {
      showToast('Error loading vendor details', 'error');
      navigate('/vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, [id]);

  const handleStatusUpdate = async () => {
    setUpdatingStatus(true);
    try {
      const res = await changeVendorStatus(id, targetStatus);
      setVendor(res.data.data);
      showToast(`Vendor status updated to ${targetStatus}`);
      setConfirmStatusChange(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteVendor = async () => {
    try {
      await deleteVendor(id);
      showToast('Vendor profile deleted');
      navigate('/vendors');
    } catch (err) {
      showToast('Failed to delete vendor', 'error');
    }
  };

  const isOfficerOrAdmin = user?.role === 'officer' || user?.role === 'manager' || user?.role === 'admin';

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
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="page-wrapper">
      {/* Back button */}
      <button 
        onClick={() => navigate('/vendors')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}
      >
        <ArrowLeft size={16} /> Back to Vendors List
      </button>

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '8px', 
              backgroundColor: '#FFFFFF', 
              border: '1px solid var(--border-color)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {vendor?.logo?.url ? (
              <img src={vendor.logo.url} alt="Vendor Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Building2 size={32} style={{ color: 'var(--text-secondary)' }} />
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {vendor?.companyName}
              <Badge status={vendor?.status}>{vendor?.status}</Badge>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{vendor?.category}</span>
              <span>•</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>GST: {vendor?.gstNumber}</span>
            </p>
          </div>
        </div>

        {isOfficerOrAdmin && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {vendor?.status === 'pending' && (
              <Button 
                onClick={() => { setTargetStatus('active'); setConfirmStatusChange(true); }}
                variant="primary" 
                style={{ backgroundColor: 'var(--success-color)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CheckCircle size={16} /> Verify & Approve
              </Button>
            )}
            {vendor?.status === 'active' && (
              <Button 
                onClick={() => { setTargetStatus('blocked'); setConfirmStatusChange(true); }}
                variant="secondary" 
                style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <AlertTriangle size={16} /> Block Vendor
              </Button>
            )}
            {vendor?.status === 'blocked' && (
              <Button 
                onClick={() => { setTargetStatus('active'); setConfirmStatusChange(true); }}
                variant="primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CheckCircle size={16} /> Unblock Partner
              </Button>
            )}
            <Button 
              onClick={() => setConfirmDelete(true)} 
              variant="secondary" 
              style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        )}
      </div>

      {/* Grid Content */}
      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: Profile info & Documents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Company Profile Card */}
          <Card style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              Vendor Contact Profile
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Contact Person
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>{vendor?.contactPerson}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Country
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>{vendor?.country || 'N/A'}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Email Address
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} style={{ color: 'var(--text-secondary)' }} />
                    <a href={`mailto:${vendor?.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{vendor?.email}</a>
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Phone Number
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PhoneIcon size={14} style={{ color: 'var(--text-secondary)' }} />
                    {vendor?.phone}
                  </p>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Address
                </p>
                <p style={{ fontSize: '14px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <MapPin size={14} style={{ color: 'var(--text-secondary)', marginTop: '3px', flexShrink: 0 }} />
                  {vendor?.address || 'No address provided'}
                </p>
              </div>

              {vendor?.linkedUser && (
                <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Linked Portal Account
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 500 }}>
                    {vendor.linkedUser.firstName} {vendor.linkedUser.lastName} ({vendor.linkedUser.email})
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* KYC Documents */}
          <Card style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              Verification Documents
            </h3>
            {vendor?.documents?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {vendor.documents.map((doc, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '12px', 
                      backgroundColor: '#F8FAFC', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '6px' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{doc.name}</span>
                    </div>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                    >
                      View <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                No documentation attached.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Order stats & RFQs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Stats Card */}
          <Card style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              Performance Metrics
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats?.totalOrders || 0}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Orders</p>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success-color)' }}>{formatCurrency(stats?.totalSpend || 0)}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Volume</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'center', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Vendor Rating:</span>
              <div style={{ display: 'flex', gap: '2px', color: '#F59E0B' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    size={16} 
                    fill={s <= (vendor?.rating || 0) ? '#F59E0B' : 'none'} 
                    stroke="#F59E0B" 
                  />
                ))}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>({vendor?.rating || 0}/5)</span>
            </div>
          </Card>

          {/* Assigned RFQs Card */}
          <Card style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              Assigned RFQs ({rfqs.length})
            </h3>
            {rfqs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rfqs.map(rfq => (
                  <div 
                    key={rfq._id}
                    onClick={() => navigate(`/rfqs/${rfq._id}`)}
                    style={{ 
                      padding: '12px', 
                      backgroundColor: '#F8FAFC', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{rfq.rfqNumber}</span>
                      <Badge status={rfq.status}>{rfq.status}</Badge>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rfq.title}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Deadline: {new Date(rfq.submissionDeadline).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                No active RFQs assigned yet.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Confirm Status Change Modal */}
      <ConfirmDialog
        isOpen={confirmStatusChange}
        title="Confirm Status Change"
        message={`Are you sure you want to change the status of this vendor to '${targetStatus}'?`}
        onConfirm={handleStatusUpdate}
        onCancel={() => setConfirmStatusChange(false)}
        loading={updatingStatus}
      />

      {/* Confirm Delete Vendor Modal */}
      <ConfirmDialog
        isOpen={confirmDelete}
        title="Confirm Delete Vendor"
        message="Are you sure you want to delete this vendor? This action is reversible but will soft-delete their profile from current pipelines."
        onConfirm={handleDeleteVendor}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
