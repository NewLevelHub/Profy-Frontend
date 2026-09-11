import { Navigate, Outlet, useLocation } from 'react-router';
import { homePathForUser } from '@/shared/lib/homePath';
import { useAuthStore } from '@/shared/store/auth';
import { resolveReturnTo } from '@/shared/lib/returnTo';

export function RequireGuest() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
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
    //    домашнего экрана его роли: у админа и психолога он свой, ученик
    //    идёт на /results, где RequireProfile сам решит, нужен ли ещё
    //    онбординг (/welcome давно не универсальная посадочная точка, он
    //    показывается один раз перед первой диагностикой, см.
    //    useGoalSelection).
    // 2. Человека перехватила гварда на пути к конкретному экрану, он ввёл
    //    пароль — и здесь `token` появляется раньше, чем успевает
    //    отработать переход самой формы. Без учёта `from` этот <Navigate>
    //    перебивал форму и гасил возврат по прямой ссылке: куда бы человек
    //    ни шёл, он оказывался на домашнем экране.
    //
    // Поэтому явный возврат важнее роли: на него человек шёл осознанно.
    return <Navigate to={resolveReturnTo(location) ?? homePathForUser(user)} replace />;
  }

  return <Outlet />;
}
