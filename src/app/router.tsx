import { createBrowserRouter, Navigate } from 'react-router';

import { RequireAuth } from '@/shared/guards/RequireAuth';
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

// ── Main tabs (mobile: Home | Result | Profile) ───────────────────────────────
import HomePage from '@/pages/home/HomePage';
import ResultsPage from '@/pages/results/ResultsPage';
import ProfilePage from '@/pages/profile/ProfilePage';

// ── Detail screens (mobile: App stack) ───────────────────────────────────────
import DirectionDetailPage from '@/pages/results/DirectionDetailPage';
import UniversityListPage from '@/pages/results/UniversityListPage';
import ProgramDetailPage from '@/pages/results/ProgramDetailPage';
import GapAnalysisPage from '@/pages/results/GapAnalysisPage';
import RoadmapPage from '@/pages/roadmap/RoadmapPage';

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

      // Assessment flow — full-screen wizard (mobile: GoalSelection → Assessment → Praise → ResultLoading)
      { path: '/assessment/goal', element: <GoalSelectionPage /> },
      { path: '/assessment', element: <AssessmentPage /> },
      { path: '/assessment/praise', element: <PraisePage /> },
      { path: '/assessment/loading', element: <ResultLoadingPage /> },

      // Main app — guarded by profile; redirects to /welcome if profile not yet created
      {
        element: <RequireProfile />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/home', element: <HomePage /> },
              { path: '/results', element: <ResultsPage /> },
              { path: '/profile', element: <ProfilePage /> },
              { path: '/roadmap', element: <RoadmapPage /> },

              // Detail screens (mobile: App stack over tabs)
              { path: '/results/directions/:slug', element: <DirectionDetailPage /> },
              { path: '/results/directions/:slug/universities', element: <UniversityListPage /> },
              {
                path: '/results/directions/:slug/universities/:programId',
                element: <ProgramDetailPage />,
              },
              {
                path: '/results/directions/:slug/universities/:programId/gap',
                element: <GapAnalysisPage />,
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
