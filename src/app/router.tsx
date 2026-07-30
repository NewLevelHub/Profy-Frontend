import { createBrowserRouter, Navigate } from 'react-router';

import { RequireAuth } from '@/shared/guards/RequireAuth';
import { RequireAdmin } from '@/shared/guards/RequireAdmin';
import { RequireGuest } from '@/shared/guards/RequireGuest';
import { RequireProfile } from '@/shared/guards/RequireProfile';
import { AppLayout } from '@/shared/ui/layouts/AppLayout';
import { AuthLayout } from '@/shared/ui/layouts/AuthLayout';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import { ROUTES, ROUTE_PATTERNS } from './routes';

// Every leaf page below is loaded through `lazy` (react-router v7's own
// route-level code splitting) instead of React.lazy + <Suspense>: the router
// fetches a route's component *and* its loader/action data in parallel and
// only swaps the screen once both are ready, so there's no extra
// fallback/flash beyond what AppLayout's own `syncDone` spinner already
// shows. Guards and layouts stay eager — they're small, structural, and
// needed on every single route, so lazy-loading them would only add a
// waterfall with no payload-size benefit.

export const router = createBrowserRouter([
  {
    id: 'root',
    // Catches thrown Response()s, a failed lazy-chunk fetch (stale deploy),
    // and render errors from any matched route — see RouteErrorBoundary.
    errorElement: <RouteErrorBoundary />,
    children: [
      // Root redirect — RequireProfile will handle the profile check at /home
      { path: ROUTES.root, element: <Navigate to={ROUTES.home} replace /> },

      // ── Guest-only: AuthLayout (mobile: AuthNavigator) ─────────────────
      {
        element: <RequireGuest />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              {
                path: ROUTES.login,
                lazy: () => import('@/pages/auth/LoginPage').then(m => ({ Component: m.default })),
              },
              {
                path: ROUTES.register,
                lazy: () => import('@/pages/auth/RegisterPage').then(m => ({ Component: m.default })),
              },
              {
                path: ROUTES.verifyEmail,
                lazy: () => import('@/pages/auth/VerifyEmailPage').then(m => ({ Component: m.default })),
              },
              {
                path: ROUTES.forgotPassword,
                lazy: () => import('@/pages/auth/ForgotPasswordPage').then(m => ({ Component: m.default })),
              },
              {
                path: ROUTES.resetPassword,
                lazy: () => import('@/pages/auth/ResetPasswordPage').then(m => ({ Component: m.default })),
              },
            ],
          },
        ],
      },

      // ── Authenticated (mobile: AppNavigator) ────────────────────────────
      {
        element: <RequireAuth />,
        children: [
          // Onboarding flow — full-screen, no header (mobile: Welcome / ProfileSetup / ArtifactsSetup)
          {
            path: ROUTES.welcome,
            lazy: () => import('@/pages/onboarding/WelcomePage').then(m => ({ Component: m.default })),
          },
          {
            path: ROUTES.onboardingProfile,
            lazy: () => import('@/pages/onboarding/ProfileSetupPage').then(m => ({ Component: m.default })),
          },
          {
            path: ROUTES.onboardingArtifacts,
            lazy: () => import('@/pages/onboarding/ArtifactsSetupPage').then(m => ({ Component: m.default })),
          },

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
              {
                path: ROUTE_PATTERNS.subjectReadiness,
                lazy: () =>
                  import('@/pages/results/subjectReadiness/SubjectReadinessPage').then(m => ({ Component: m.default })),
              },
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
              {
                path: ROUTES.assessmentGoal,
                lazy: () => import('@/pages/assessment/GoalSelectionPage').then(m => ({ Component: m.default })),
              },
              {
                path: ROUTES.knownProfessionSpheres,
                lazy: () =>
                  import('@/pages/assessment/knownProfession/KnownProfessionSpheresPage').then(m => ({ Component: m.default })),
              },
              {
                path: ROUTE_PATTERNS.knownProfessionList,
                lazy: () =>
                  import('@/pages/assessment/knownProfession/KnownProfessionListPage').then(m => ({ Component: m.default })),
              },
              {
                path: ROUTE_PATTERNS.knownProfessionQuiz,
                lazy: () =>
                  import('@/pages/assessment/knownProfession/KnownProfessionQuizPage').then(m => ({ Component: m.default })),
              },
              {
                path: ROUTES.assessment,
                lazy: () => import('@/pages/assessment/AssessmentPage').then(m => ({ Component: m.default })),
              },
              {
                path: ROUTES.assessmentPraise,
                lazy: () => import('@/pages/assessment/PraisePage').then(m => ({ Component: m.default })),
              },
              {
                path: ROUTES.assessmentLoading,
                lazy: () => import('@/pages/assessment/ResultLoadingPage').then(m => ({ Component: m.default })),
              },

              // Guarded by profile; redirects to /welcome if profile not yet created
              {
                element: <RequireProfile />,
                children: [
                  {
                    path: ROUTES.home,
                    lazy: () => import('@/pages/home/HomePage').then(m => ({ Component: m.default })),
                  },
                  {
                    path: ROUTES.results,
                    lazy: () => import('@/pages/results/ResultsPage').then(m => ({ Component: m.default })),
                  },
                  {
                    path: ROUTES.profile,
                    lazy: () => import('@/pages/profile/ProfilePage').then(m => ({ Component: m.default })),
                  },

                  // Detail screens (mobile: App stack over tabs)
                  {
                    path: ROUTE_PATTERNS.directionRoadmap,
                    lazy: () =>
                      import('@/pages/roadmap/direction/DirectionRoadmapPage').then(m => ({ Component: m.default })),
                  },
                  {
                    path: ROUTE_PATTERNS.resultFeedback,
                    lazy: () =>
                      import('@/pages/results/feedback/ResultFeedbackPage').then(m => ({ Component: m.default })),
                  },
                  {
                    path: ROUTE_PATTERNS.universityList,
                    lazy: () => import('@/pages/results/UniversityListPage').then(m => ({ Component: m.default })),
                  },
                  {
                    path: ROUTE_PATTERNS.programDetail,
                    lazy: () => import('@/pages/results/ProgramDetailPage').then(m => ({ Component: m.default })),
                  },
                  {
                    path: ROUTE_PATTERNS.gapAnalysis,
                    lazy: () => import('@/pages/results/GapAnalysisPage').then(m => ({ Component: m.default })),
                  },
                ],
              },

              // Admin — gated only by is_admin, not by having a student profile
              // (admin accounts aren't expected to go through onboarding).
              {
                element: <RequireAdmin />,
                children: [
                  { path: ROUTES.admin, element: <Navigate to={ROUTES.adminUsers} replace /> },
                  {
                    path: ROUTES.adminUsers,
                    lazy: () => import('@/pages/admin/AdminUsersPage').then(m => ({ Component: m.default })),
                  },
                  {
                    path: ROUTE_PATTERNS.adminUserDetail,
                    lazy: () => import('@/pages/admin/AdminUserDetailPage').then(m => ({ Component: m.default })),
                  },
                  {
                    path: ROUTES.adminFeedback,
                    lazy: () => import('@/pages/admin/AdminFeedbackPage').then(m => ({ Component: m.default })),
                  },
                ],
              },

              {
                path: '*',
                lazy: () => import('@/pages/errors/NotFoundPage').then(m => ({ Component: m.default })),
              },
            ],
          },
        ],
      },

      // Catch-all for unauthenticated 404s (outside AppLayout, no sidebar/header)
      {
        path: '*',
        lazy: () => import('@/pages/errors/NotFoundPage').then(m => ({ Component: m.default })),
      },
    ],
  },
]);
