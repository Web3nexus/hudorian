import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';

// Public Pages
import HomePage from './pages/HomePage';
import RoyalFamilyPage from './pages/RoyalFamilyPage';
import RoyalFamilyHousesPage from './pages/RoyalFamilyHousesPage';
import RoyalHousesPage from './pages/RoyalHousesPage';
import HousesPage from './pages/HousesPage';
import HouseDetailPage from './pages/HouseDetailPage';
import EstatesPage from './pages/EstatesPage';
import StaysPage from './pages/StaysPage';
import StayDetailPage from './pages/StayDetailPage';
import ExperiencesPage from './pages/ExperiencesPage';
import JournalPage from './pages/JournalPage';
import JournalPostPage from './pages/JournalPostPage';
import ShopPage from './pages/ShopPage';
import RoyalArchivePage from './pages/RoyalArchivePage';
import RoyalArchiveDetailPage from './pages/RoyalArchiveDetailPage';
import MyArchivePage from './pages/MyArchivePage';
import MembershipPage from './pages/MembershipPage';
import MembershipApplyPage from './pages/MembershipApplyPage';
import SignInPage from './pages/SignInPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Member Portal Pages
import MemberDashboardPage from './pages/MemberDashboardPage';
import MemberProfilePage from './pages/MemberProfilePage';
import MemberBookingsPage from './pages/MemberBookingsPage';
import MemberPaymentsPage from './pages/MemberPaymentsPage';

// Legal & Info Pages
import PrivacyPage from './pages/PrivacyPage';
import PrivacyDataPage from './pages/PrivacyDataPage';
import TermsPage from './pages/TermsPage';

// Admin / SecureGate Pages
import SecureGateLoginPage from './pages/securegate/SecureGateLoginPage';
import SecureGateDashboardPage from './pages/securegate/SecureGateDashboardPage';
import SecureGateApplicationsPage from './pages/securegate/SecureGateApplicationsPage';
import SecureGateMembersPage from './pages/securegate/SecureGateMembersPage';
import SecureGateHousesPage from './pages/securegate/SecureGateHousesPage';
import SecureGatePaymentsPage from './pages/securegate/SecureGatePaymentsPage';
import SecureGateArchivePage from './pages/securegate/SecureGateArchivePage';
import SecureGateCmsPage from './pages/securegate/SecureGateCmsPage';
import SecureGateAuditLogsPage from './pages/securegate/SecureGateAuditLogsPage';
import SecureGateSecurityPage from './pages/securegate/SecureGateSecurityPage';

// Status & Error Pages
import AccessDeniedPage from './pages/AccessDeniedPage';
import ServerErrorPage from './pages/ServerErrorPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Public grounds */}
          <Route path="/" element={<HomePage />} />
          <Route path="/royal-family" element={<RoyalFamilyPage />} />
          <Route path="/royal-family/houses" element={<RoyalFamilyHousesPage />} />
          <Route path="/royal-houses" element={<RoyalHousesPage />} />
          <Route path="/houses" element={<HousesPage />} />
          <Route path="/houses/:slug" element={<HouseDetailPage />} />
          <Route path="/estates" element={<EstatesPage />} />
          <Route path="/stays" element={<StaysPage />} />
          <Route path="/stays/:slug" element={<StayDetailPage />} />
          <Route path="/experiences" element={<ExperiencesPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalPostPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/royal-archive" element={<RoyalArchivePage />} />
          <Route path="/royal-archive/my-archive" element={<MyArchivePage />} />
          <Route path="/royal-archive/:slug" element={<RoyalArchiveDetailPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/membership/apply" element={<MembershipApplyPage />} />

          {/* Authentication */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Member Portal */}
          <Route path="/member" element={<MemberDashboardPage />} />
          <Route path="/member/profile" element={<MemberProfilePage />} />
          <Route path="/member/bookings" element={<MemberBookingsPage />} />
          <Route path="/member/payments" element={<MemberPaymentsPage />} />

          {/* Legal / Policy */}
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/privacy/data" element={<PrivacyDataPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Admin / SecureGate */}
          <Route path="/securegate/login" element={<SecureGateLoginPage />} />
          <Route path="/securegate" element={<SecureGateDashboardPage />} />
          <Route path="/securegate/applications" element={<SecureGateApplicationsPage />} />
          <Route path="/securegate/members" element={<SecureGateMembersPage />} />
          <Route path="/securegate/houses" element={<SecureGateHousesPage />} />
          <Route path="/securegate/payments" element={<SecureGatePaymentsPage />} />
          <Route path="/securegate/archive" element={<SecureGateArchivePage />} />
          <Route path="/securegate/cms" element={<SecureGateCmsPage />} />
          <Route path="/securegate/audit-logs" element={<SecureGateAuditLogsPage />} />
          <Route path="/securegate/security" element={<SecureGateSecurityPage />} />

          {/* Errors / Status */}
          <Route path="/403" element={<AccessDeniedPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
