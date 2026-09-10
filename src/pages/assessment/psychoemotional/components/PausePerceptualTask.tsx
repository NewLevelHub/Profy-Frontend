import { useState } from 'react';

/**
 * Нейтральное микро-задание паузы (§5.4 / `forpsy/psychoemotional-content.md`
 * §4). Разрешённый тип — «простое перцептивное микро-задание». Пять
 * ОДНОТОННЫХ СЕРЫХ фигур разного размера; тап по фигуре меняет её местами с
 * соседней слева. **Нет** цели, счёта, проверки «верно/неверно», финала —
 * это занятие на время паузы, не тест. Серый, чтобы не «настраивать»
 * цветовой выбор круга 2.
 */
const SIZES = [28, 44, 60, 76, 92];

export function PausePerceptualTask() {
  const [order, setOrder] = useState<number[]>(() =>
    [...SIZES.keys()].sort(() => Math.random() - 0.5),
  );

  function nudge(pos: number) {
    if (pos === 0) return;
    setOrder((o) => {
      const next = [...o];
      [next[pos - 1], next[pos]] = [next[pos], next[pos - 1]];
      return next;
    });
  }

  return (
    <div className="flex items-end justify-center gap-3" style={{ height: 100 }}>
      {order.map((sizeIdx, pos) => (
        <button
          key={sizeIdx}
          type="button"
          className="pe-shape rounded-md"
          style={{ width: SIZES[sizeIdx], height: SIZES[sizeIdx] }}
          aria-label="фигура"
          onClick={() => nudge(pos)}
        />
      ))}
    </div>
  );
}
