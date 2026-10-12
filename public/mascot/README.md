# Маскот Profile

Рабочие изображения нового снежного барса находятся в `redesign/`.
Это прозрачные PNG без подложки; они уже включены в репозиторий.

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
