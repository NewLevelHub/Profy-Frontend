# Маскот Profile

Рабочие изображения нового снежного барса находятся в `redesign/`.
Это прозрачные PNG 1254×1254 без подложки — исходники. Приложение их не
загружает: оно берёт WebP 840×840 из `src/assets/mascot/` через
`MASCOT` (`src/shared/ui/redesign/mascotArt.ts`) — ~70 КБ вместо ~0,85 МБ,
с хешем в имени файла. После правки PNG пересобрать WebP:

```
python3 -c "from PIL import Image; [Image.open(f'public/mascot/redesign/{n}.png').convert('RGBA').resize((840, 840), Image.LANCZOS).save(f'src/assets/mascot/{n}.webp', 'WEBP', quality=85, method=6, alpha_quality=100) for n in ['book', 'celebrate', 'graduate', 'greeting', 'notepad', 'rest']]"
```

| Роль на экране | Файл |
|---|---|
| welcome | `redesign/greeting.png` |
| transition | `redesign/notepad.png` |
| rest / pause | `redesign/rest.png` |
| completion | `redesign/celebrate.png` |
| waiting | `redesign/book.png` |
| graduate | `redesign/graduate.png` |

Отдельного компонента-маскота больше нет: экраны используют файлы
напрямую (`<img>`, `JourneyCheckpoint illustration`, `JourneyEmptyState
illustration`) с `object-fit: contain` и пустым `alt`, когда персонаж
декоративный. Нельзя обрезать хвост/лапы ради заполнения блока.

У нового персонажа отключены накладки мигания: координаты глаз старого
маскота к нему не подходят. Для новой анимации нужны откалиброванные слои.

Прежние PNG в корне и неиспользуемый набор профессий `pro/` сохранены как
исходные материалы. Они не являются рекомендованными ассетами для новых
экранов. Описание подготовки вырезок — `docs/mascot-cutouts.json`.
