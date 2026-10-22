import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate, redirect } from 'react-router';
import { FullPageSpinner } from '@/shared/ui/Spinner';
import RouteErrorPage from '@/pages/errors/RouteErrorPage';
import { loadStaffCatalogs } from '@/shared/i18n';

import { RequireAuth } from '@/shared/guards/RequireAuth';
import { RequireRole } from '@/shared/guards/RequireRole';
import { RequireStudent } from '@/shared/guards/RequireStudent';
import { RequireGuest } from '@/shared/guards/RequireGuest';
import { RequireProfile } from '@/shared/guards/RequireProfile';
import { AppLayout } from '@/shared/ui/layouts/AppLayout';
import { StudentRail } from '@/shared/ui/navigation/StudentRail';
import { AuthLayout } from '@/shared/ui/layouts/AuthLayout';
import { AdminLayout } from '@/shared/ui/layouts/AdminLayout';

/**
 * Every page is its own chunk, fetched when its route matches; guards and
 * the student/auth layouts stay in the entry bundle. The staff shells
 * (AdminArea, PsychologistArea) are lazy too, so their navigation and
 * stylesheets don't ship to students. A guest no longer downloads the admin panel, and a
 * student no longer downloads the psychologist cabinet.
 */
const page = (load: () => Promise<{ default: ComponentType }>, before?: () => Promise<unknown>) => ({
  lazy: async () => {
    const [module] = await Promise.all([load(), before?.()]);
    return { Component: module.default };
  },
});

/** Staff cabinets (and the DEV previews that render their parts) also wait
 *  for the staff translation namespaces, which students never download. */
const staffPage = (load: () => Promise<{ default: ComponentType }>) => page(load, loadStaffCatalogs);

export const router = createBrowserRouter([{
  // Pathless root: one error boundary and one first-load fallback for the
  // whole tree. Without an errorElement react-router shows its own bare
  // «Unexpected Application Error!» instead of our screen.
  errorElement: <RouteErrorPage />,
  HydrateFallback: FullPageSpinner,
  children: [
    // Local design review uses fixtures and never calls assessment APIs.
    ...(import.meta.env.DEV ? [
      { path: '/design/finishing', ...staffPage(() => import('@/pages/assessment/design/FinishingDesignPreview')) },
      { path: '/design/assessment', ...staffPage(() => import('@/pages/assessment/design/AssessmentDesignPreview')) },
      { path: '/design/special-assessments', ...staffPage(() => import('@/pages/assessment/design/SpecialAssessmentDesignPreview')) },
      { path: '/design/student', ...staffPage(() => import('@/pages/results/design/StudentDesignPreview')) },
      { path: '/design/universities', ...staffPage(() => import('@/pages/universities/design/CatalogDesignPreview')) },
    ] : []),
    // ── Guest-only (mobile: AuthNavigator) ─────────────────────────────────────
    {
      element: <RequireGuest />,
      children: [
        // Корень отдаёт посадочную страницу. Отдельного редиректа на /results
        // здесь больше нет: RequireGuest сам уводит вошедшего в приложение, а
        // гость видит лендинг — то есть «/» ведёт себя по-разному для разных
        // посетителей, чего статический Navigate не умел.
        { path: '/', ...page(() => import('@/pages/landing/LandingPage')) },
        {
          element: <AuthLayout />,
          children: [
            { path: '/login', ...page(() => import('@/pages/auth/LoginPage')) },
            { path: '/register', ...page(() => import('@/pages/auth/RegisterPage')) },
            { path: '/verify-email', ...page(() => import('@/pages/auth/VerifyEmailPage')) },
            { path: '/forgot-password', ...page(() => import('@/pages/auth/ForgotPasswordPage')) },
            { path: '/reset-password', ...page(() => import('@/pages/auth/ResetPasswordPage')) },
          ],
        },
      ],
    },

    // ── Staff invitation (web-only, PRO-465) ───────────────────────────────────
    // Outside RequireGuest on purpose: a signed-in visitor must see whose
    // session would be replaced instead of being silently sent to a cabinet,
    // and the page itself decides when to sign in after Google.
    {
      element: <AuthLayout />,
      children: [{ path: '/invite', ...page(() => import('@/pages/auth/invite/InvitePage')) }],
    },
    // ── Student invitation from the CRM (ТЗ §4.4) ──────────────────────────────
    // Open to guests and signed-in students alike: a guest signs up first,
    // a student is tied to the deal right on the page.
    {
      element: <AuthLayout />,
      children: [{ path: '/student-invite', ...page(() => import('@/pages/auth/student-invite/StudentInvitePage')) }],
    },

    // ── Authenticated (mobile: AppNavigator) ───────────────────────────────────
    {
      element: <RequireAuth />,
      children: [
        // Staff cabinets — outside RequireProfile: staff have no student Profile
        // and student APIs would 403 them. Gated by role alone.
        // ── Psychologist cabinet ──
        // The owner shares the cabinet shell for the schedule only (ТЗ §4.1);
        // every other page stays psychologist-only.
        // The invited specialist's name, before the cabinet (PsychologistArea
        // sends a nameless account here).
        {
          element: <RequireRole role={['psychologist', 'owner']} />,
          children: [
            {
              element: <AuthLayout />,
              children: [{ path: '/staff/name', ...page(() => import('@/pages/auth/staff-name/StaffNamePage')) }],
            },
          ],
        },
        {
          element: <RequireRole role={['psychologist', 'owner']} />,
          children: [
            {
              ...staffPage(() => import('@/shared/ui/layouts/PsychologistArea')),
              children: [
                {
                  path: '/psychologist/schedule',
                  ...page(() => import('@/pages/psychologist/schedule/PsychologistSchedulePage')),
                },
                {
                  element: <RequireRole role="psychologist" />,
                  children: [
                    // The review queue is the cabinet's front page (it's where work starts).
                    { path: '/psychologist', element: <Navigate to="/psychologist/reviews" replace /> },
                    { path: '/psychologist/students', ...page(() => import('@/pages/psychologist/PsychologistStudentsPage')) },
                    {
                      path: '/psychologist/students/:studentId',
                      ...page(() => import('@/pages/psychologist/PsychologistStudentDetailPage')),
                    },
                    {
                      path: '/psychologist/students/:studentId/assessments/:assessmentId/report',
                      ...page(() => import('@/pages/psychologist/PsychologistReportPage')),
                    },
                    {
                      path: '/psychologist/students/:studentId/assessments/:assessmentId/report/history',
                      ...page(() => import('@/pages/psychologist/PsychologistReportHistoryPage')),
                    },
                    { path: '/psychologist/reviews', ...page(() => import('@/pages/psychologist/PsychologistReviewQueuePage')) },
                    {
                      path: '/psychologist/students/:studentId/results/:assessmentId/review',
                      ...page(() => import('@/pages/psychologist/PsychologistResultReviewPage')),
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ── CRM-only roles (sales, marketing): their cabinet is Profy-CRM ──
        {
          element: <RequireRole role={['sales_head', 'sales_manager', 'marketer']} />,
          children: [{ path: '/staff', ...page(() => import('@/pages/staff/CrmOnlyPage')) }],
        },
        // ── Admin ──
        {
          element: <RequireRole role="admin" />,
          children: [
            {
              // Dedicated admin navigation; keeps the shared scroll restoration.
              ...staffPage(() => import('@/shared/ui/layouts/AdminArea')),
              children: [
                { path: '/admin', element: <Navigate to="/admin/users" replace /> },
                {
                  element: <AdminLayout />,
                  children: [
                    { path: '/admin/users', ...page(() => import('@/pages/admin/AdminUsersPage')) },
                    { path: '/admin/users/:userId', ...page(() => import('@/pages/admin/AdminUserDetailPage')) },
                    { path: '/admin/invitations', ...page(() => import('@/pages/admin/invitations/AdminInvitationsPage')) },
                    { path: '/admin/feedback', ...page(() => import('@/pages/admin/AdminFeedbackPage')) },
                    { path: '/admin/universities', ...page(() => import('@/pages/admin/AdminUniversitiesPage')) },
                    { path: '/admin/universities/:universityId', ...page(() => import('@/pages/admin/AdminUniversityDetailPage')) },
                    { path: '/admin/programs/:programId', ...page(() => import('@/pages/admin/AdminProgramDetailPage')) },
                    {
                      // No layout of its own: the content sections live in the admin side rail.
                      path: '/admin/content',
                      children: [
                        { index: true, element: <Navigate to="/admin/content/questions" replace /> },
                        { path: 'questions', ...page(() => import('@/pages/admin/content/AdminQuestionsPage')) },
                        { path: 'questions/:questionId', ...page(() => import('@/pages/admin/content/AdminQuestionDetailPage')) },
                        { path: 'question-pairs', ...page(() => import('@/pages/admin/content/AdminQuestionPairsPage')) },
                        { path: 'question-pairs/:pairId', ...page(() => import('@/pages/admin/content/AdminQuestionPairDetailPage')) },
                        { path: 'motivation-statements', ...page(() => import('@/pages/admin/content/AdminMotivationStatementsPage')) },
                        { path: 'motivation-statements/:statementId', ...page(() => import('@/pages/admin/content/AdminMotivationStatementDetailPage')) },
                        { path: 'directions', ...page(() => import('@/pages/admin/content/AdminDirectionsPage')) },
                        { path: 'directions/:directionId', ...page(() => import('@/pages/admin/content/AdminDirectionDetailPage')) },
                        { path: 'belbin', ...page(() => import('@/pages/admin/content/AdminBelbinEditorPage')) },
                        { path: 'tests', ...page(() => import('@/pages/admin/content/astur/AdminAsturVersionsPage')) },
                        { path: 'tests/versions/:versionId', ...page(() => import('@/pages/admin/content/astur/AdminAsturVersionPage')) },
                        { path: 'tests/versions/:versionId/analytics', ...page(() => import('@/pages/admin/content/astur/AdminAsturAnalyticsPage')) },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // Student-only surfaces — staff bounce to their cabinet home.
        {
          element: <RequireStudent />,
          children: [
            // Onboarding flow — full-screen, no header (mobile: Welcome / ProfileSetup / ArtifactsSetup)
            { path: '/welcome', ...page(() => import('@/pages/onboarding/WelcomePage')) },
            { path: '/onboarding/profile', ...page(() => import('@/pages/onboarding/ProfileSetupPage')) },
            { path: '/onboarding/artifacts', ...page(() => import('@/pages/onboarding/ArtifactsSetupPage')) },

            // Assessment flow — full-screen wizard (mobile: GoalSelection → Assessment → RestStop → ResultLoading)
            { path: '/assessment/goal', ...page(() => import('@/pages/assessment/GoalSelectionPage')) },
            { path: '/assessment', ...page(() => import('@/pages/assessment/AssessmentPage')) },
            // Preserve old bookmarked/session URLs after pair questions moved
            // into the unified assessment sequence.
            { path: '/assessment/pairs', element: <Navigate to="/assessment" replace /> },
            { path: '/assessment/motivation', ...page(() => import('@/pages/assessment/motivation/MotivationTripletFlow')) },
            { path: '/assessment/psychoemotional-start', ...page(() => import('@/pages/assessment/psychoemotional/PsychoColorStartPage')) },
            { path: '/assessment/psychoemotional', ...page(() => import('@/pages/assessment/psychoemotional/PsychoEmotionalPage')) },
            { path: '/assessment/rest', ...page(() => import('@/pages/assessment/RestStopPage')) },
            { path: '/assessment/loading', ...page(() => import('@/pages/assessment/ResultLoadingPage')) },
            { path: '/assessment/goal-check', ...page(() => import('@/pages/assessment/GoalCheckPage')) },

            // Assessment flow — Belbin & ASTUR (PRO-338 Ф2.6/Ф3.6) follow Motivation directly
            { path: '/assessment/belbin/:assessmentId?', ...page(() => import('@/pages/assessment/belbin/BelbinPage')) },
            { path: '/assessment/astur/:assessmentId?', ...page(() => import('@/pages/assessment/astur/AsturPage')) },
            // Old links that psychologists handed out by hand before blocks
            // were assigned in the cabinet (PRO-338) — same screens.
            {
              path: '/assessment/extended/:block/:assessmentId',
              loader: ({ params }) => redirect(`/assessment/${params.block}/${params.assessmentId}`),
            },

            // Main app — guarded by profile; redirects to /onboarding/profile if it isn't created yet
            {
              element: <RequireProfile />,
              children: [
                // Chrome-free, own full-screen shell — same reasoning as
                // /onboarding/artifacts's edit-mode branch: a focused edit screen,
                // not a tab inside AppLayout. Sits under RequireProfile (unlike
                // /onboarding/artifacts) because editing certificates only makes
                // sense once a profile already exists.
                { path: '/profile/certificates', ...page(() => import('@/pages/profile/certificates/CertificatesEditPage')) },
                // Printable/PDF result — chrome-free for the same reason: a
                // document view, not a tab. Sits outside AppLayout so the nav
                // rail never lands in the exported PDF.
                { path: '/results/print', ...page(() => import('@/pages/results/print/ResultPrintPage')) },
                {
                  element: <AppLayout area="student" rail={<StudentRail />} />,
                  children: [
                    // Main tabs (mobile: Home | Result | Profile)
                    { path: '/results', ...page(() => import('@/pages/results/ResultsPage')) },
                    { path: '/profile', ...page(() => import('@/pages/profile/ProfilePage')) },

                    // Standalone university catalogue (PRO-265) — a top-level tab,
                    // deliberately outside /results: unlike the direction-scoped
                    // picker below it needs no assessment and no senior gate.
                    { path: '/universities', ...page(() => import('@/pages/universities/UniversitiesPage')) },
                    { path: '/universities/:universityId', ...page(() => import('@/pages/universities/UniversityDetailPage')) },

                    // Detail screens (mobile: App stack over tabs)
                    { path: '/results/directions/:slug', ...page(() => import('@/pages/results/DirectionDetailPage')) },
                    { path: '/results/directions/:slug/universities', ...page(() => import('@/pages/results/UniversityListPage')) },
                    {
                      path: '/results/directions/:slug/universities/:programId',
                      ...page(() => import('@/pages/results/ProgramDetailPage')),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // Единственный 404 на всё приложение.
    //
    // Раньше их было два: этот и такой же `*` внутри AppLayout. У обоих
    // одинаковый путь, поэтому побеждал вложенный — а он лежит под
    // RequireAuth и RequireProfile, и несуществующий адрес оборачивался
    // не сообщением «страница не найдена», а редиректом: гостя уводило на
    // /login, человека без профиля — на онбординг. Увидеть 404 мог только
    // полностью настроенный пользователь. Один маршрут снаружи гвард даёт
    // всем один и тот же честный ответ; выход с него NotFoundPage
    // подбирает по тому, вошёл человек или нет.
    { path: '*', ...page(() => import('@/pages/errors/NotFoundPage')) },
  ],
}]);
