/*
 * PlanBium application root.
 *
 * Public marketing site renders at "/" (HomePage). Dashboard and admin areas
 * use descendant <Routes> inside their layouts, with splat parent paths
 * ("/dashboard/*", "/admin/*") so every sub-route resolves by URL and by
 * refresh. Unknown sub-routes show NotFound inside the matching layout.
 *
 * Dashboard and admin pages are lazy-loaded to reduce the initial bundle.
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LocaleProvider } from '@/lib/i18n/locale-context';
import { AuthProvider } from '@/lib/auth/auth-context';
import { DashboardThemeProvider } from '@/lib/dashboard-theme';
import { ProtectedRoute, GuestOnlyRoute } from '@/lib/auth/protected-route';
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
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';

const DashboardHomePage = lazy(() =>
  import('@/pages/DashboardHomePage').then((m) => ({ default: m.DashboardHomePage })),
);
const DashboardPricingPage = lazy(() =>
  import('@/pages/DashboardPricingPage').then((m) => ({ default: m.DashboardPricingPage })),
);
const DashboardCartPage = lazy(() =>
  import('@/pages/DashboardCartPage').then((m) => ({ default: m.DashboardCartPage })),
);
const DashboardPurchasesPage = lazy(() =>
  import('@/pages/DashboardPurchasesPage').then((m) => ({ default: m.DashboardPurchasesPage })),
);
const DashboardAccountPage = lazy(() =>
  import('@/pages/DashboardAccountPage').then((m) => ({ default: m.DashboardAccountPage })),
);
const CheckoutPage = lazy(() =>
  import('@/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
);
const CheckoutResultPage = lazy(() =>
  import('@/pages/CheckoutResultPage').then((m) => ({ default: m.CheckoutResultPage })),
);

const AdminProductsPage = lazy(() =>
  import('@/pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })),
);
const AdminOrdersPage = lazy(() =>
  import('@/pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })),
);
const AdminPaymentsPage = lazy(() =>
  import('@/pages/admin/AdminPaymentsPage').then((m) => ({ default: m.AdminPaymentsPage })),
);
const AdminEntitlementsPage = lazy(() =>
  import('@/pages/admin/AdminEntitlementsPage').then((m) => ({ default: m.AdminEntitlementsPage })),
);
const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
);

function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-lime-600" />
    </div>
  );
}

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
              <Route path="/legal/cookies" element={<LegalPage type="cookies" />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Auth routes */}
            <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
            <Route path="/signup" element={<GuestOnlyRoute><SignupPage /></GuestOnlyRoute>} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/auth/error" element={<AuthErrorPage />} />

            {/* Dashboard routes (protected) */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <DashboardThemeProvider>
                  <DashboardLayout>
                    <Suspense fallback={<PageSpinner />}>
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
                    </Suspense>
                  </DashboardLayout>
                </DashboardThemeProvider>
              </ProtectedRoute>
            } />

            {/* Admin routes (protected + admin role) */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminLayout>
                  <Suspense fallback={<PageSpinner />}>
                    <Routes>
                      <Route index element={<AdminProductsPage />} />
                      <Route path="products" element={<AdminProductsPage />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="payments" element={<AdminPaymentsPage />} />
                      <Route path="entitlements" element={<AdminEntitlementsPage />} />
                      <Route path="users" element={<AdminUsersPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
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
