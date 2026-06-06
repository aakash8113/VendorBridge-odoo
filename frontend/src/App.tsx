import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { Dashboard } from "./pages/Dashboard";
import { Vendors } from "./pages/Vendors";
import { CreateRFQ } from "./pages/CreateRFQ";
import { SubmitQuotation } from "./pages/SubmitQuotation";
import { QuotationComparison } from "./pages/QuotationComparison";
import { ApprovalWorkflow } from "./pages/ApprovalWorkflow";
import { PurchaseOrder } from "./pages/PurchaseOrder";
import { ActivityLogs } from "./pages/ActivityLogs";
import { Reports } from "./pages/Reports";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="users" element={<div>User Management</div>} />
          </Route>

          {/* Procurement Officer Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PROCUREMENT_OFFICER"]} />
            }
          >
            <Route path="vendors" element={<Vendors />} />
            <Route path="create-rfq" element={<CreateRFQ />} />
            <Route path="compare" element={<QuotationComparison />} />
            <Route path="purchase-orders" element={<PurchaseOrder />} />
          </Route>

          {/* Vendor Routes */}
          <Route element={<ProtectedRoute allowedRoles={["VENDOR"]} />}>
            <Route path="quotations" element={<SubmitQuotation />} />
          </Route>

          {/* Manager / Approver Routes */}
          <Route
            element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]} />}
          >
            <Route path="approvals" element={<ApprovalWorkflow />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Shared Routes */}
          <Route path="rfqs" element={<CreateRFQ />} />
          <Route path="invoices" element={<PurchaseOrder />} />
          <Route path="activity" element={<ActivityLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
