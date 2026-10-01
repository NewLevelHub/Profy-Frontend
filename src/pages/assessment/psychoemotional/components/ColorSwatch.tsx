import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { PsychoColor } from '../data/colors';

interface ColorSwatchProps {
  color: PsychoColor;
  onSelect: (id: number) => void;
  disabled?: boolean;
}

/**
 * Одна цветовая плашка. HEX — инлайном из таблицы §4. Никаких hover-эффектов,
 * CSS-фильтров, изменения яркости/прозрачности, цветных теней — всё это
 * запрещено и заблокировано в `psychoemotional.css` (`.pe-swatch`).
 */
function ColorSwatchBase({ color, onSelect, disabled }: ColorSwatchProps) {
  const { t } = useTranslation('assessment');
  return (
    <button
      type="button"
      className="pe-swatch"
      style={{ backgroundColor: color.hex, width: '100%', aspectRatio: '1 / 1' }}
      aria-label={t('psychoemotional.colorSwatchAria', { name: t(`psychoemotional.color.${color.id}`) })}
      disabled={disabled}
      onClick={() => onSelect(color.id)}
    />
  );
}

export const ColorSwatch = memo(ColorSwatchBase);
