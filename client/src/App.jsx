import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

// Public pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';

// Overview
import Dashboard from './pages/Dashboard';

// Operations
import ShipmentList from './pages/shipments/ShipmentList';
import ShipmentTrackingPage from './pages/shipments/ShipmentTrackingPage';
import VesselSchedulePage from './pages/shipments/VesselSchedulePage';
import ContainerInventoryPage from './pages/containers/ContainerInventoryPage';

// Container Business
import ContainerRentalsPage from './pages/containers/ContainerRentalsPage';
import ContainerPurchasesPage from './pages/containers/ContainerPurchasesPage';
import ContainerSalesPage from './pages/containers/ContainerSalesPage';
import ContainerMaintenancePage from './pages/containers/ContainerMaintenancePage';

// Vessel Management (Module 21)
import VesselDashboardPage from './pages/vessels/VesselDashboardPage';
import VesselDatabasePage from './pages/vessels/VesselDatabasePage';
import VesselPurchasesPage from './pages/vessels/VesselPurchasesPage';
import VesselSalesPage from './pages/vessels/VesselSalesPage';
import VesselMaintenancePage from './pages/vessels/VesselMaintenancePage';
import VesselDocumentsPage from './pages/vessels/VesselDocumentsPage';
import VesselSurveysPage from './pages/vessels/VesselSurveysPage';
import VesselTradingCalculatorPage from './pages/vessels/VesselTradingCalculatorPage';

// Finance
import FinancialOverviewPage from './pages/finance/FinancialOverviewPage';
import TransactionsPage from './pages/finance/TransactionsPage';
import ProfitLossPage from './pages/finance/ProfitLossPage';
import CashflowPage from './pages/finance/CashflowPage';
import InvoicesPage from './pages/finance/InvoicesPage';
import TaxCustomsPage from './pages/finance/TaxCustomsPage';

// Tools & Calculators
import CalculatorsCenterPage from './pages/calculators/CalculatorsCenterPage';

// Relationships
import CustomersPage from './pages/crm/CustomersPage';
import SuppliersPage from './pages/crm/SuppliersPage';

// Reports
import ReportsAnalyticsPage from './pages/reports/ReportsAnalyticsPage';

// System
import UserManagementPage from './pages/system/UserManagementPage';
import SettingsPage from './pages/system/SettingsPage';
import AuditLogsPage from './pages/system/AuditLogsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#102A43] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-ocean-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-300">
            Initializing HANSAI Shipping Fleet ERP...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* Authenticated Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Overview */}
        <Route index element={<Dashboard />} />

        {/* Operations */}
        <Route path="operations/shipments" element={<ShipmentList />} />
        <Route path="operations/tracking" element={<ShipmentTrackingPage />} />
        <Route path="operations/vessel-schedule" element={<VesselSchedulePage />} />
        <Route path="operations/containers" element={<ContainerInventoryPage />} />

        {/* Container Business */}
        <Route path="container-business/rentals" element={<ContainerRentalsPage />} />
        <Route path="container-business/purchases" element={<ContainerPurchasesPage />} />
        <Route path="container-business/sales" element={<ContainerSalesPage />} />
        <Route path="container-business/maintenance" element={<ContainerMaintenancePage />} />

        {/* Vessel Management (Module 21) */}
        <Route path="vessels/dashboard" element={<VesselDashboardPage />} />
        <Route path="vessels/database" element={<VesselDatabasePage />} />
        <Route path="vessels/purchases" element={<VesselPurchasesPage />} />
        <Route path="vessels/sales" element={<VesselSalesPage />} />
        <Route path="vessels/maintenance" element={<VesselMaintenancePage />} />
        <Route path="vessels/expenses" element={<VesselMaintenancePage />} />
        <Route path="vessels/documents" element={<VesselDocumentsPage />} />
        <Route path="vessels/surveys" element={<VesselSurveysPage />} />
        <Route path="vessels/trading-calculator" element={<VesselTradingCalculatorPage />} />

        {/* Finance */}
        <Route path="finance/overview" element={<FinancialOverviewPage />} />
        <Route path="finance/transactions" element={<TransactionsPage />} />
        <Route path="finance/profit-loss" element={<ProfitLossPage />} />
        <Route path="finance/cashflow" element={<CashflowPage />} />
        <Route path="finance/invoices" element={<InvoicesPage />} />
        <Route path="finance/tax-customs" element={<TaxCustomsPage />} />

        {/* Tools */}
        <Route path="tools/calculators" element={<CalculatorsCenterPage />} />

        {/* Relationships */}
        <Route path="relationships/customers" element={<CustomersPage />} />
        <Route path="relationships/suppliers" element={<SuppliersPage />} />

        {/* Reports */}
        <Route path="reports/analytics" element={<ReportsAnalyticsPage />} />

        {/* System */}
        <Route path="system/users" element={<UserManagementPage />} />
        <Route path="system/settings" element={<SettingsPage />} />
        <Route path="system/audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

