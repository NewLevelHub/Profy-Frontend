import { memo } from 'react';
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
  return (
    <button
      type="button"
      className="pe-swatch"
      style={{ backgroundColor: color.hex, width: '100%', aspectRatio: '1 / 1' }}
      aria-label={`цвет ${color.name}`}
      disabled={disabled}
      onClick={() => onSelect(color.id)}
    />
  );
}

export const ColorSwatch = memo(ColorSwatchBase);
