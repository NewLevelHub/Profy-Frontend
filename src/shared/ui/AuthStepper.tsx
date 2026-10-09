import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AuthStepper({ current, kind = 'register' }: { current: number; kind?: 'register' | 'recovery' }) {
  const { t } = useTranslation('auth');
  const steps = kind === 'register' ? ['email', 'password', 'code'] : ['email', 'code', 'password'];
  return (
    <ol className="rd-auth-steps" aria-label={t('stepper.step', { current, total: steps.length })}>
      {steps.map((step, i) => (
        <li key={step} className={i + 1 === current ? 'is-current' : i + 1 < current ? 'is-done' : ''} aria-current={i + 1 === current ? 'step' : undefined}>
          <span aria-hidden="true">{i + 1 < current ? <Check size={14} /> : `0${i + 1}`}</span>
          <b>{t(`redesign.steps.${step}`)}</b>
        </li>
      ))}
    </ol>
  );
}
