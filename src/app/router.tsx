import { createBrowserRouter, Navigate } from 'react-router';

import { RequireAuth } from '@/shared/guards/RequireAuth';
import { RequireAdmin } from '@/shared/guards/RequireAdmin';
import { RequireGuest } from '@/shared/guards/RequireGuest';
import { RequireProfile } from '@/shared/guards/RequireProfile';
import { AppLayout } from '@/shared/ui/layouts/AppLayout';
import { AuthLayout } from '@/shared/ui/layouts/AuthLayout';
import { AdminLayout } from '@/shared/ui/layouts/AdminLayout';
import { AdminContentLayout } from '@/shared/ui/layouts/AdminContentLayout';

// ── Landing (публичный корень) ───────────────────────────────────────────────
import LandingPage from '@/pages/landing/LandingPage';

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

// ── Assessment flow (mobile: GoalSelection → Assessment → RestStop → ResultLoading)
import GoalSelectionPage from '@/pages/assessment/GoalSelectionPage';
import GoalCheckPage from '@/pages/assessment/GoalCheckPage';
import AssessmentPage from '@/pages/assessment/AssessmentPage';
import PairAssessmentPage from '@/pages/assessment/pairs/PairAssessmentPage';
import MotivationAssessmentPage from '@/pages/assessment/motivation/MotivationAssessmentPage';
import RestStopPage from '@/pages/assessment/RestStopPage';
import ResultLoadingPage from '@/pages/assessment/ResultLoadingPage';

// ── Main tabs (mobile: Home | Result | Profile) ───────────────────────────────
import ResultsPage from '@/pages/results/ResultsPage';
import ResultPrintPage from '@/pages/results/print/ResultPrintPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import CertificatesEditPage from '@/pages/profile/certificates/CertificatesEditPage';

// ── Detail screens (mobile: App stack) ───────────────────────────────────────
import DirectionDetailPage from '@/pages/results/DirectionDetailPage';
import DirectionInquiryPage from '@/pages/results/inquiry/DirectionInquiryPage';
import UniversityListPage from '@/pages/results/UniversityListPage';
import ProgramDetailPage from '@/pages/results/ProgramDetailPage';
import RoadmapPage from '@/pages/roadmap/RoadmapPage';
import UniversitiesPage from '@/pages/universities/UniversitiesPage';
import UniversityDetailPage from '@/pages/universities/UniversityDetailPage';
import DirectionRoadmapPage from '@/pages/roadmap/direction/DirectionRoadmapPage';

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminUserDetailPage from '@/pages/admin/AdminUserDetailPage';
import AdminFeedbackPage from '@/pages/admin/AdminFeedbackPage';
import AdminUniversitiesPage from '@/pages/admin/AdminUniversitiesPage';
import AdminUniversityDetailPage from '@/pages/admin/AdminUniversityDetailPage';
import AdminProgramDetailPage from '@/pages/admin/AdminProgramDetailPage';
import AdminQuestionsPage from '@/pages/admin/content/AdminQuestionsPage';
import AdminQuestionDetailPage from '@/pages/admin/content/AdminQuestionDetailPage';
import AdminQuestionPairsPage from '@/pages/admin/content/AdminQuestionPairsPage';
import AdminQuestionPairDetailPage from '@/pages/admin/content/AdminQuestionPairDetailPage';
import AdminMotivationStatementsPage from '@/pages/admin/content/AdminMotivationStatementsPage';
import AdminMotivationStatementDetailPage from '@/pages/admin/content/AdminMotivationStatementDetailPage';
import AdminMotivationPairsPage from '@/pages/admin/content/AdminMotivationPairsPage';
import AdminMotivationPairDetailPage from '@/pages/admin/content/AdminMotivationPairDetailPage';
import AdminDirectionsPage from '@/pages/admin/content/AdminDirectionsPage';
import AdminDirectionDetailPage from '@/pages/admin/content/AdminDirectionDetailPage';

// ── Errors ────────────────────────────────────────────────────────────────────
import NotFoundPage from '@/pages/errors/NotFoundPage';

export const router = createBrowserRouter([
  // ── Guest-only (mobile: AuthNavigator) ─────────────────────────────────────
  {
    element: <RequireGuest />,
    children: [
      // Корень отдаёт посадочную страницу. Отдельного редиректа на /results
      // здесь больше нет: RequireGuest сам уводит вошедшего в приложение, а
      // гость видит лендинг — то есть «/» ведёт себя по-разному для разных
      // посетителей, чего статический Navigate не умел.
      { path: '/', element: <LandingPage /> },
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

      // Assessment flow — full-screen wizard (mobile: GoalSelection → Assessment → RestStop → ResultLoading)
      { path: '/assessment/goal', element: <GoalSelectionPage /> },
      { path: '/assessment', element: <AssessmentPage /> },
      { path: '/assessment/pairs', element: <PairAssessmentPage /> },
      { path: '/assessment/motivation', element: <MotivationAssessmentPage /> },
      { path: '/assessment/rest', element: <RestStopPage /> },
      { path: '/assessment/loading', element: <ResultLoadingPage /> },
      { path: '/assessment/goal-check', element: <GoalCheckPage /> },

      // Main app — guarded by profile; redirects to /welcome if profile not yet created
      {
        element: <RequireProfile />,
        children: [
          // Chrome-free, own full-screen shell — same reasoning as
          // /onboarding/artifacts's edit-mode branch: a focused edit screen,
          // not a tab inside AppLayout. Sits under RequireProfile (unlike
          // /onboarding/artifacts) because editing certificates only makes
          // sense once a profile already exists.
          { path: '/profile/certificates', element: <CertificatesEditPage /> },
          // Printable/PDF result — chrome-free for the same reason: a
          // document view, not a tab. Sits outside AppLayout so the nav
          // rail never lands in the exported PDF.
          { path: '/results/print', element: <ResultPrintPage /> },
          {
            element: <AppLayout />,
            children: [
              { path: '/results', element: <ResultsPage /> },
              { path: '/profile', element: <ProfilePage /> },
              { path: '/roadmap', element: <RoadmapPage /> },

              // Standalone university catalogue (PRO-265) — a top-level tab,
              // deliberately outside /results: unlike the direction-scoped
              // picker below it needs no assessment and no senior gate.
              { path: '/universities', element: <UniversitiesPage /> },
              { path: '/universities/:universityId', element: <UniversityDetailPage /> },

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
                    // Persistent admin chrome (section rail) for every admin page
                    element: <AdminLayout />,
                    children: [
                      { path: '/admin/users', element: <AdminUsersPage /> },
                      { path: '/admin/users/:userId', element: <AdminUserDetailPage /> },
                      { path: '/admin/feedback', element: <AdminFeedbackPage /> },
                      { path: '/admin/universities', element: <AdminUniversitiesPage /> },
                      { path: '/admin/universities/:universityId', element: <AdminUniversityDetailPage /> },
                      { path: '/admin/programs/:programId', element: <AdminProgramDetailPage /> },
                      {
                        path: '/admin/content',
                        element: <AdminContentLayout />,
                        children: [
                          { index: true, element: <Navigate to="/admin/content/questions" replace /> },
                          { path: 'questions', element: <AdminQuestionsPage /> },
                          { path: 'questions/:questionId', element: <AdminQuestionDetailPage /> },
                          { path: 'question-pairs', element: <AdminQuestionPairsPage /> },
                          { path: 'question-pairs/:pairId', element: <AdminQuestionPairDetailPage /> },
                          { path: 'motivation-statements', element: <AdminMotivationStatementsPage /> },
                          { path: 'motivation-statements/:statementId', element: <AdminMotivationStatementDetailPage /> },
                          { path: 'motivation-pairs', element: <AdminMotivationPairsPage /> },
                          { path: 'motivation-pairs/:pairId', element: <AdminMotivationPairDetailPage /> },
                          { path: 'directions', element: <AdminDirectionsPage /> },
                          { path: 'directions/:directionId', element: <AdminDirectionDetailPage /> },
                        ],
                      },
                    ],
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
  { path: '*', element: <NotFoundPage /> },
]);
