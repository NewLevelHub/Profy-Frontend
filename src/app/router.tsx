import { createBrowserRouter, Navigate } from 'react-router';

import { RequireAuth } from '@/shared/guards/RequireAuth';
import { RequireAdmin } from '@/shared/guards/RequireAdmin';
import { RequireGuest } from '@/shared/guards/RequireGuest';
import { RequireProfile } from '@/shared/guards/RequireProfile';
import { AppLayout } from '@/shared/ui/layouts/AppLayout';
import { AuthLayout } from '@/shared/ui/layouts/AuthLayout';
import { AdminLayout } from '@/shared/ui/layouts/AdminLayout';

// ── Auth (mobile: AuthNavigator) ──────────────────────────────────────────────
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// ── Onboarding flow (mobile: Welcome → ProfileSetup → ArtifactsSetup) ─────────
import WelcomePage from '@/pages/onboarding/WelcomePage';
import ProfileSetupPage from '@/pages/onboarding/ProfileSetupPage';
import ArtifactsSetupPage from '@/pages/onboarding/ArtifactsSetupPage';

// ── Assessment flow (mobile: GoalSelection → Assessment → Praise → ResultLoading)
import GoalSelectionPage from '@/pages/assessment/GoalSelectionPage';
import GoalCheckPage from '@/pages/assessment/GoalCheckPage';
import AssessmentPage from '@/pages/assessment/AssessmentPage';
import PairAssessmentPage from '@/pages/assessment/pairs/PairAssessmentPage';
import MotivationAssessmentPage from '@/pages/assessment/motivation/MotivationAssessmentPage';
import PraisePage from '@/pages/assessment/PraisePage';
import RestStopPage from '@/pages/assessment/RestStopPage';
import ResultLoadingPage from '@/pages/assessment/ResultLoadingPage';

// ── Main tabs (mobile: Home | Result | Profile) ───────────────────────────────
import ResultsPage from '@/pages/results/ResultsPage';
import ProfilePage from '@/pages/profile/ProfilePage';

// ── Detail screens (mobile: App stack) ───────────────────────────────────────
import DirectionDetailPage from '@/pages/results/DirectionDetailPage';
import DirectionInquiryPage from '@/pages/results/inquiry/DirectionInquiryPage';
import UniversityListPage from '@/pages/results/UniversityListPage';
import ProgramDetailPage from '@/pages/results/ProgramDetailPage';
import RoadmapPage from '@/pages/roadmap/RoadmapPage';
import DirectionRoadmapPage from '@/pages/roadmap/direction/DirectionRoadmapPage';

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminUserDetailPage from '@/pages/admin/AdminUserDetailPage';

// ── Errors ────────────────────────────────────────────────────────────────────
import NotFoundPage from '@/pages/errors/NotFoundPage';

export const router = createBrowserRouter([
  // Root redirect — RequireProfile will handle the profile check at /results
  { path: '/', element: <Navigate to="/results" replace /> },

  // ── Guest-only: AuthLayout (mobile: AuthNavigator) ─────────────────────────
  {
    element: <RequireGuest />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/verify-email', element: <VerifyEmailPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
        ],
      },
    ],
  },

  // ── Authenticated (mobile: AppNavigator) ───────────────────────────────────
  {
    element: <RequireAuth />,
    children: [
      // Onboarding flow — full-screen, no header (mobile: Welcome / ProfileSetup / ArtifactsSetup)
      { path: '/welcome', element: <WelcomePage /> },
      { path: '/onboarding/profile', element: <ProfileSetupPage /> },
      { path: '/onboarding/artifacts', element: <ArtifactsSetupPage /> },

      // Assessment flow — full-screen wizard (mobile: GoalSelection → Assessment → Praise → ResultLoading)
      { path: '/assessment/goal', element: <GoalSelectionPage /> },
      { path: '/assessment', element: <AssessmentPage /> },
      { path: '/assessment/pairs', element: <PairAssessmentPage /> },
      { path: '/assessment/motivation', element: <MotivationAssessmentPage /> },
      { path: '/assessment/praise', element: <PraisePage /> },
      { path: '/assessment/rest', element: <RestStopPage /> },
      { path: '/assessment/loading', element: <ResultLoadingPage /> },
      { path: '/assessment/goal-check', element: <GoalCheckPage /> },

      // Main app — guarded by profile; redirects to /welcome if profile not yet created
      {
        element: <RequireProfile />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/results', element: <ResultsPage /> },
              { path: '/profile', element: <ProfilePage /> },
              { path: '/roadmap', element: <RoadmapPage /> },

              // Detail screens (mobile: App stack over tabs)
              { path: '/results/directions/:slug', element: <DirectionDetailPage /> },
              { path: '/results/directions/:slug/inquiry', element: <DirectionInquiryPage /> },
              { path: '/results/directions/:slug/roadmap', element: <DirectionRoadmapPage /> },
              { path: '/results/directions/:slug/universities', element: <UniversityListPage /> },
              {
                path: '/results/directions/:slug/universities/:programId',
                element: <ProgramDetailPage />,
              },

              // Admin (inside main layout — sidebar stays visible)
              {
                element: <RequireAdmin />,
                children: [
                  { path: '/admin', element: <Navigate to="/admin/users" replace /> },
                  {
                    // Persistent admin chrome (role badge) for every admin page
                    element: <AdminLayout />,
                    children: [
                      { path: '/admin/users', element: <AdminUsersPage /> },
                      { path: '/admin/users/:userId', element: <AdminUserDetailPage /> },
                    ],
                  },
                ],
              },

              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Catch-all
  { path: '*', element: <NotFoundPage /> },
]);
