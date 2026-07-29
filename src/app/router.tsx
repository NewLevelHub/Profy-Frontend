import { createBrowserRouter, Navigate } from 'react-router';

import { RequireAuth } from '@/shared/guards/RequireAuth';
import { RequireAdmin } from '@/shared/guards/RequireAdmin';
import { RequireGuest } from '@/shared/guards/RequireGuest';
import { RequireProfile } from '@/shared/guards/RequireProfile';
import { AppLayout } from '@/shared/ui/layouts/AppLayout';
import { AuthLayout } from '@/shared/ui/layouts/AuthLayout';

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
import AssessmentPage from '@/pages/assessment/AssessmentPage';
import PraisePage from '@/pages/assessment/PraisePage';
import ResultLoadingPage from '@/pages/assessment/ResultLoadingPage';
import KnownProfessionSpheresPage from '@/pages/assessment/knownProfession/KnownProfessionSpheresPage';
import KnownProfessionListPage from '@/pages/assessment/knownProfession/KnownProfessionListPage';
import KnownProfessionQuizPage from '@/pages/assessment/knownProfession/KnownProfessionQuizPage';

// ── Main tabs (mobile: Home | Result | Profile) ───────────────────────────────
import HomePage from '@/pages/home/HomePage';
import ResultsPage from '@/pages/results/ResultsPage';
import ProfilePage from '@/pages/profile/ProfilePage';

// ── Detail screens (mobile: App stack) ───────────────────────────────────────
import UniversityListPage from '@/pages/results/UniversityListPage';
import ProgramDetailPage from '@/pages/results/ProgramDetailPage';
import GapAnalysisPage from '@/pages/results/GapAnalysisPage';
import DirectionRoadmapPage from '@/pages/roadmap/direction/DirectionRoadmapPage';
import SubjectReadinessPage from '@/pages/results/subjectReadiness/SubjectReadinessPage';

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminUserDetailPage from '@/pages/admin/AdminUserDetailPage';
import AdminFeedbackPage from '@/pages/admin/AdminFeedbackPage';

// ── Errors ────────────────────────────────────────────────────────────────────
import NotFoundPage from '@/pages/errors/NotFoundPage';

export const router = createBrowserRouter([
  // Root redirect — RequireProfile will handle the profile check at /home
  { path: '/', element: <Navigate to="/home" replace /> },

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

      // Subject-readiness quiz — full-screen/no chrome on purpose: keeping it
      // outside AppLayout means there's no sidebar/header nav link the student
      // can click to wander off (and silently lose the in-progress quiz —
      // nothing persists answers until the final submit, see
      // useSubjectReadiness.submit). The main assessment flow below doesn't
      // have this risk — the akinator engine saves progress per answer, so
      // it's safe to render inside AppLayout with the sidebar/header visible.
      {
        element: <RequireProfile />,
        children: [
          { path: '/results/directions/:slug/subject-readiness', element: <SubjectReadinessPage /> },
        ],
      },

      // Main app layout — sidebar/header always present once authenticated
      {
        element: <AppLayout />,
        children: [
          // Assessment flow (mobile: GoalSelection → Assessment → Praise → ResultLoading)
          // — not gated by RequireProfile: GoalSelectionPage tolerates a
          // missing profile (falls back to 'middle' age group) rather than
          // requiring one, same as before this moved under AppLayout.
          { path: '/assessment/goal', element: <GoalSelectionPage /> },
          { path: '/assessment/known-profession', element: <KnownProfessionSpheresPage /> },
          { path: '/assessment/known-profession/:sphereSlug', element: <KnownProfessionListPage /> },
          {
            path: '/assessment/known-profession/:sphereSlug/:professionSlug',
            element: <KnownProfessionQuizPage />,
          },
          { path: '/assessment', element: <AssessmentPage /> },
          { path: '/assessment/praise', element: <PraisePage /> },
          { path: '/assessment/loading', element: <ResultLoadingPage /> },

          // Guarded by profile; redirects to /welcome if profile not yet created
          {
            element: <RequireProfile />,
            children: [
              { path: '/home', element: <HomePage /> },
              { path: '/results', element: <ResultsPage /> },
              { path: '/profile', element: <ProfilePage /> },

              // Detail screens (mobile: App stack over tabs)
              { path: '/results/directions/:slug/roadmap', element: <DirectionRoadmapPage /> },
              { path: '/results/directions/:slug/universities', element: <UniversityListPage /> },
              {
                path: '/results/directions/:slug/universities/:programId',
                element: <ProgramDetailPage />,
              },
              {
                path: '/results/directions/:slug/universities/:programId/gap',
                element: <GapAnalysisPage />,
              },
            ],
          },

          // Admin — gated only by is_admin, not by having a student profile
          // (admin accounts aren't expected to go through onboarding).
          {
            element: <RequireAdmin />,
            children: [
              { path: '/admin', element: <Navigate to="/admin/users" replace /> },
              { path: '/admin/users', element: <AdminUsersPage /> },
              { path: '/admin/users/:userId', element: <AdminUserDetailPage /> },
              { path: '/admin/feedback', element: <AdminFeedbackPage /> },
            ],
          },

          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },

  // Catch-all
  { path: '*', element: <NotFoundPage /> },
]);
