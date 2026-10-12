import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input, type InputProps } from '../Input';

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'rightSlot'>>(
  (props, ref) => {
    const { t } = useTranslation('auth');
    const [visible, setVisible] = useState(false);
    return (
      <Input
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        rightSlot={
          <button
            type="button"
            className="rd-password-toggle"
            onClick={() => setVisible(value => !value)}
            aria-label={t(visible ? 'field.hidePassword' : 'field.showPassword')}
            aria-pressed={visible}
          >
            {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        }
      />
    );
  },
);
PasswordInput.displayName = 'PasswordInput';
