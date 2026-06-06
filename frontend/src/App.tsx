/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { Dashboard } from './pages/Dashboard';
import { Vendors } from './pages/Vendors';
import { CreateRFQ } from './pages/CreateRFQ';
import { SubmitQuotation } from './pages/SubmitQuotation';
import { QuotationComparison } from './pages/QuotationComparison';
import { ApprovalWorkflow } from './pages/ApprovalWorkflow';
import { PurchaseOrder } from './pages/PurchaseOrder';
import { ActivityLogs } from './pages/ActivityLogs';
import { Reports } from './pages/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="create-rfq" element={<CreateRFQ />} />
          <Route path="rfqs" element={<CreateRFQ />} />
          <Route path="quotations" element={<SubmitQuotation />} />
          <Route path="compare" element={<QuotationComparison />} />
          <Route path="approvals" element={<ApprovalWorkflow />} />
          <Route path="purchase-orders" element={<PurchaseOrder />} />
          <Route path="invoices" element={<PurchaseOrder />} />
          <Route path="activity" element={<ActivityLogs />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
