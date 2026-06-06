import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Plus, Search, Filter, ShieldCheck, X, Upload } from 'lucide-react';

import { listVendors, createVendor } from '../services/vendorApi.js';
import api, { uploadFile } from '../services/api.js';
import Card from '../components/common/Card.jsx';
import Table from '../components/common/Table.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Select from '../components/common/Select.jsx';
import Modal from '../components/common/Modal.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { showToast } from '../components/common/Toast.jsx';

const CATEGORIES = [
  'IT & Hardware',
  'Office Supplies',
  'Logistics',
  'Raw Materials',
  'Consulting',
  'Facilities',
  'Marketing',
  'Other'
];

export default function Vendors() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // List states
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Form / Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [vendorCategory, setVendorCategory] = useState(CATEGORIES[0]);
  const [gstNumber, setGstNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [address, setAddress] = useState('');
  const [linkedUserEmail, setLinkedUserEmail] = useState('');
  const [logo, setLogo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Quick stats
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 });

  const fetchVendorsList = async () => {
    setLoading(true);
    try {
      const res = await listVendors({ search, category, status, page, limit: 12 });
      setVendors(res.data.data.vendors);
      setTotal(res.data.data.total);

      // Recalculate stats overview from fetched data or do a separate quick loop if needed
      // To get full count, we can fetch all or just calculate basic stats from our main list/api (but api returns filtered list).
      // Let's get general counts by loading unfiltered list once.
      const statsRes = await listVendors({ limit: 1000 });
      const list = statsRes.data.data.vendors;
      setStats({
        total: list.length,
        active: list.filter(v => v.status === 'active').length,
        pending: list.filter(v => v.status === 'pending').length
      });
    } catch (err) {
      showToast('Failed to fetch vendors', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorsList();
  }, [search, category, status, page]);

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    if (!companyName || !vendorCategory || !gstNumber || !contactPerson || !email || !phone) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await createVendor({
        companyName,
        category: vendorCategory,
        gstNumber,
        contactPerson,
        email,
        phone,
        country,
        address,
        logo,
        documents,
        linkedUserEmail
      });
      showToast('Vendor registered successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchVendorsList();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to register vendor';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCompanyName('');
    setVendorCategory(CATEGORIES[0]);
    setGstNumber('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setCountry('India');
    setAddress('');
    setLinkedUserEmail('');
    setLogo(null);
    setDocuments([]);
  };

  const isOfficerOrAdmin = user?.role === 'officer' || user?.role === 'manager' || user?.role === 'admin';

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '4px' }}>Vendors</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Register, evaluate, and track organization suppliers and vendors.
          </p>
        </div>
        {isOfficerOrAdmin && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Register Vendor
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <Card>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Total Registered
          </p>
          <h3 style={{ fontSize: '24px', fontWeight: 700 }}>{stats.total} Vendors</h3>
        </Card>
        <Card>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Active Partners
          </p>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success-color)' }}>{stats.active} Active</h3>
        </Card>
        <Card>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Pending Verification
          </p>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning-color)' }}>{stats.pending} Pending</h3>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by vendor name, GST number, or contact..."
              style={{ paddingLeft: '38px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select 
              className="form-control"
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ width: '150px' }}>
            <select 
              className="form-control"
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grid List */}
      {loading ? (
        <div className="spinner-container">
          <Spinner />
        </div>
      ) : vendors.length > 0 ? (
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {vendors.map(v => (
            <Card 
              key={v._id} 
              onClick={() => navigate(`/vendors/${v._id}`)} 
              style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease', hover: { transform: 'translateY(-2px)' } }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div 
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '8px', 
                    backgroundColor: '#F1F5F9', 
                    overflow: 'hidden',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {v.logo?.url ? (
                    <img src={v.logo.url} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>{v.companyName.charAt(0)}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'inline-block', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.companyName}
                    </span>
                    <Badge status={v.status}>{v.status}</Badge>
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{v.category}</p>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '12px' }}>
                    GST: <span style={{ fontFamily: 'monospace', color: 'var(--accent-color)' }}>{v.gstNumber}</span>
                  </p>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Orders: <strong>{v.totalOrders || 0}</strong></span>
                    <span>Spend: <strong>₹{new Intl.NumberFormat('en-IN').format(v.totalSpend || 0)}</strong></span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <ShieldCheck size={48} className="empty-state-icon" />
          <h3>No Vendors Found</h3>
          <p>We couldn't find any vendors matching your selection.</p>
        </div>
      )}

      {/* Register Vendor Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Vendor">
        <form onSubmit={handleCreateVendor}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
            <div 
              style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '8px', 
                backgroundColor: '#F8FAFC', 
                border: '1px dashed var(--border-color)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {logo ? (
                <img src={logo.url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Logo</span>
              )}
            </div>
            
            <label 
              style={{ 
                fontSize: '11px', 
                color: 'var(--accent-color)', 
                fontWeight: 600, 
                cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: '4px',
                backgroundColor: '#FFFFFF'
              }}
            >
              {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                disabled={uploadingLogo}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setUploadingLogo(true);
                  try {
                    const res = await uploadFile(file, '/vendor-logos');
                    setLogo({ url: res.url, fileId: res.fileId });
                    showToast('Logo uploaded successfully');
                  } catch (err) {
                    showToast('Logo upload failed', 'error');
                  } finally {
                    setUploadingLogo(false);
                  }
                }}
              />
            </label>
          </div>

          <div className="form-grid-2">
            <Input
              label="Company Name"
              placeholder="Acme Industrial Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Select
              label="Category"
              value={vendorCategory}
              onChange={(e) => setVendorCategory(e.target.value)}
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
              required
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="GST Number"
              placeholder="27AAAAA1111A1Z1"
              maxLength={15}
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              required
            />
            <Input
              label="Contact Person"
              placeholder="Jane Smith"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Email Address"
              type="email"
              placeholder="procurement@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Linked User Email (Optional)"
              placeholder="user@vendor.com"
              value={linkedUserEmail}
              onChange={(e) => setLinkedUserEmail(e.target.value)}
            />
            <Input
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Address</label>
            <textarea
              className="form-control"
              placeholder="123 Industrial Phase, Mumbai, Maharashtra"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          {/* Documents Upload Section */}
          <div className="form-group">
            <label className="form-label">Vendor KYC Documents</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {documents.map((doc, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '4px 8px', 
                    backgroundColor: '#F1F5F9', 
                    borderRadius: '4px',
                    fontSize: '12px' 
                  }}
                >
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.name}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setDocuments(prev => prev.filter((_, i) => i !== idx))}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <label 
              className="btn btn-secondary" 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                cursor: uploadingDoc ? 'not-allowed' : 'pointer',
                fontSize: '13px'
              }}
            >
              <Upload size={14} /> {uploadingDoc ? 'Uploading...' : 'Upload Document'}
              <input
                type="file"
                style={{ display: 'none' }}
                disabled={uploadingDoc}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setUploadingDoc(true);
                  try {
                    const res = await uploadFile(file, '/vendor-docs');
                    setDocuments(prev => [...prev, { url: res.url, fileId: res.fileId, name: res.name }]);
                    showToast('Document uploaded successfully');
                  } catch (err) {
                    showToast('Document upload failed', 'error');
                  } finally {
                    setUploadingDoc(false);
                  }
                }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting || uploadingLogo || uploadingDoc}>
              Register Vendor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
