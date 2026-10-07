import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Input, type InputProps } from './Input';

export type PasswordInputProps = Omit<InputProps, 'type' | 'rightSlot'>;

/** `Input` for passwords with its own show/hide toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, placeholder = '••••••••', ...props }, ref) => {
    const { t } = useTranslation('auth');
    const [isVisible, setIsVisible] = useState(false);

    return (
      <Input
        ref={ref}
        className={cn('pr-10', className)}
        type={isVisible ? 'text' : 'password'}
        placeholder={placeholder}
        rightSlot={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setIsVisible(v => !v)}
            className="text-muted hover:text-secondary transition-colors"
            aria-label={t(isVisible ? 'field.hidePassword' : 'field.showPassword')}
          >
            {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        }
        {...props}
      />
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
