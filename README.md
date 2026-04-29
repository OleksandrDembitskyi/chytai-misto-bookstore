# 📚 Читай-місто — Онлайн-книгарня

Повноцінна веб-орієнтована інформаційна система для книгарні «Читай-місто». Сайт дозволяє переглядати каталог книг, шукати за назвою або автором, фільтрувати за категоріями та ціною, додавати книги до кошика та оформлювати замовлення з автоматичним розрахунком доставки.

## 🚀 Онлайн доступ

- **Сайт (Production):** https://chytai-misto-bookstore.vercel.app
- **API (список книг):** https://chytai-misto-bookstore.vercel.app/api/books
- **Статистика:** https://chytai-misto-bookstore.vercel.app/api/stats

## 🛠 Технології

- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (хмарна база даних)
- **Frontend:** HTML5 + CSS3 + Vanilla JS (SPA)
- **Email:** Nodemailer (Gmail SMTP)
- **Деплой:** Vercel (CI/CD)
- **Керування версіями:** Git + GitHub (GitFlow)

## 📦 Локальний запуск (для розробки)

1. Клонувати репозиторій:
   ```bash
   git clone https://github.com/OleksandrDembitskyi/chytai-misto-bookstore.git
   cd chytai-misto-bookstore
   ```

2. Перейти в гілку develop (актуальна версія):
   ```bash
   git checkout develop
   ```

3. Встановити залежності:
   ```bash
   npm install
   ```

4. Створити файл .env в корені проекту зі змінною:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@bookstore-cluster.mongodb.net/
   ```

5. Запустити сервер:
   ```bash
   npm start
   ```

6. Відкрити в браузері: http://localhost:3000

## 🔗 Основні API endpoints

| Метод | Endpoint | Опис |
|------|---------|------|
| GET | /api/books | Список всіх книг |
| GET | /api/books/:id | Деталі книги |
| GET | /api/books/search/:query | Пошук книг |
| GET | /api/authors | Список авторів |
| GET | /api/publishers | Список видавництв |
| GET | /api/categories | Список категорій |
| GET | /api/customers | Список клієнтів |
| GET | /api/orders | Список замовлень |
| POST | /api/orders | Створити замовлення |
| GET | /api/reviews | Список відгуків |
| GET | /api/stats | Статистика продажів |

## 🧪 Тестування

```bash
npm test
```

## 🌿 GitFlow

- main – стабільна продакшн-версія
- develop – актуальна розробка
- feature/server – розробка бекенду (базова версія)
- feature/client – розробка фронтенду (базова версія)

## 👨‍💻 Автор

Дембіцький Олександр, група ПП-32  
Курсова робота з дисципліни «Проектування та розробка інформаційних систем»  
Національний університет «Львівська політехніка», 2026