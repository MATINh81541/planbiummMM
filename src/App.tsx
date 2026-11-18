/*
 * PlanBium application root.
 *
 * Public marketing site renders at "/" (HomePage). Dashboard and admin areas
 * use descendant <Routes> inside their layouts, with splat parent paths
 * ("/dashboard/*", "/admin/*") so every sub-route resolves by URL and by
 * refresh. Unknown sub-routes show NotFound inside the matching layout.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LocaleProvider } from '@/lib/i18n/locale-context';
import { AuthProvider } from '@/lib/auth/auth-context';
import { DashboardThemeProvider } from '@/lib/dashboard-theme';
import { ProtectedRoute } from '@/lib/auth/protected-route';
import { AdminRoute } from '@/lib/auth/admin-route';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { HomePage } from '@/pages/HomePage';
import { PricingPage } from '@/pages/PricingPage';
import { ContactPage } from '@/pages/ContactPage';
import { LegalPage } from '@/pages/LegalPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';
import { AuthErrorPage } from '@/pages/AuthErrorPage';
import { DashboardHomePage } from '@/pages/DashboardHomePage';
import { DashboardPricingPage } from '@/pages/DashboardPricingPage';
import { DashboardCartPage } from '@/pages/DashboardCartPage';
import { DashboardPurchasesPage } from '@/pages/DashboardPurchasesPage';
import { DashboardAccountPage } from '@/pages/DashboardAccountPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { CheckoutResultPage } from '@/pages/CheckoutResultPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage';
import { AdminEntitlementsPage } from '@/pages/admin/AdminEntitlementsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';

export default function App() {
  return (
    <ErrorBoundary>
      <LocaleProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
            {/* Public marketing routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/legal/terms" element={<LegalPage type="terms" />} />
              <Route path="/legal/privacy" element={<LegalPage type="privacy" />} />
              <Route path="/legal/refunds" element={<LegalPage type="refunds" />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Auth routes — temporarily disabled, redirect to dashboard */}
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/auth/error" element={<AuthErrorPage />} />

            {/* Dashboard routes (protected) */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <DashboardThemeProvider>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<DashboardHomePage />} />
                      <Route path="pricing" element={<DashboardPricingPage />} />
                      <Route path="cart" element={<DashboardCartPage />} />
                      <Route path="purchases" element={<DashboardPurchasesPage />} />
                      <Route path="account" element={<DashboardAccountPage />} />
                      <Route path="checkout" element={<CheckoutPage />} />
                      <Route path="checkout/result" element={<CheckoutResultPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </DashboardLayout>
                </DashboardThemeProvider>
              </ProtectedRoute>
            } />

            {/* Admin routes (protected + admin role) */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route index element={<AdminProductsPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="payments" element={<AdminPaymentsPage />} />
                    <Route path="entitlements" element={<AdminEntitlementsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </AdminLayout>
              </AdminRoute>
            } />
          </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}
