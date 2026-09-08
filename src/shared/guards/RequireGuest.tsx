import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/shared/store/auth';
import { resolveReturnTo } from '@/shared/lib/returnTo';

export function RequireGuest() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const location = useLocation();

  if (!hasHydrated) {
    return (
      <div className="min-h-screen grid place-items-center bg-page">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  if (token) {
    // Сюда попадают двумя путями, и оба обязаны вести в одно место.
    //
    // 1. Вошедший человек сам открыл /login или / — вести некуда, кроме
    //    корня приложения. RequireProfile (он охраняет /results и
    //    остальное) сам решит, нужен ли ещё онбординг: /welcome давно не
    //    универсальная посадочная точка после входа, он показывается один
    //    раз перед первой диагностикой (см. useGoalSelection).
    // 2. Человека перехватила гварда на пути к конкретному экрану, он
    //    ввёл пароль — и здесь `token` появляется раньше, чем успевает
    //    отработать переход самой формы. Без учёта `from` этот
    //    <Navigate> перебивал форму и гасил возврат по прямой ссылке:
    //    куда бы человек ни шёл, он оказывался на /results.
    return <Navigate to={resolveReturnTo(location) ?? '/results'} replace />;
  }

  return <Outlet />;
}
