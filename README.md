# 📚 Читай-місто — Онлайн-книгарня

Повноцінна веб-орієнтована інформаційна система для книгарні «Читай-місто». Реалізовано каталог книг із зображеннями (Cloudinary), пошук і фільтрацію, кошик з розрахунком доставки, оформлення замовлень, систему відгуків, JWT-авторизацію з рольовим доступом та адміністративну панель. Замовнику і адміністратору автоматично надсилаються HTML-листи про кожне нове замовлення.

## 🚀 Онлайн доступ

- **Сайт (Production):** https://chytai-misto-bookstore.vercel.app
- **API (список книг):** https://chytai-misto-bookstore.vercel.app/api/books
- **Статистика:** https://chytai-misto-bookstore.vercel.app/api/stats
- **Health check:** https://chytai-misto-bookstore.vercel.app/api/health

## 🔑 Демо-доступ (для перевірки)

Для тестування адміністративної панелі можна увійти під готовим акаунтом адміністратора:

| Поле | Значення |
|------|----------|
| **Email** | 677sasha776@gmail.com |
| **Пароль** | admin123 |
| **Роль** | ⚙️ Адміністратор |

> Після входу стає доступна кнопка **«⚙️ Адмін»** у хедері — там можна додавати/редагувати/видаляти книги, керувати замовленнями, відгуками, авторами, категоріями та видавництвами.

> Для перевірки функціоналу покупця — достатньо зареєструватись через будь-яку електронну пошту прямо на сайті. Після реєстрації стає доступний особистий кабінет із історією замовлень, а також можливість залишати відгуки та оцінки на книги.

## 🛠 Технології

| Категорія | Інструменти |
|-----------|-------------|
| Backend | Node.js 18+, Express.js |
| База даних | MongoDB Atlas (хмарний кластер), Mongoose |
| Авторизація | JSON Web Token (JWT), bcryptjs |
| Зображення | Cloudinary + multer-storage-cloudinary |
| Email | Nodemailer (Gmail SMTP, HTML-листи) |
| Frontend | HTML5, CSS3 (Custom Properties, Grid, Flexbox), Vanilla JS SPA |
| Тестування | Jest 29 (юніт-тести) |
| Контейнеризація | Docker, Docker Compose (MongoDB + Mongo Express) |
| Деплой | Vercel (CI/CD) |
| Керування версіями | Git + GitHub (GitFlow) |

## 📁 Структура проєкту

```
chytai-misto-bookstore/
├── server.js              # Основний бекенд (маршрути, middleware, email)
├── public/
│   └── index.html         # Повний фронтенд (SPA — всі сторінки)
├── tests/
│   └── bookstore.test.js  # Юніт-тести (Jest)
├── docker-compose.yml     # MongoDB + Mongo Express для локальної розробки
├── vercel.json            # Конфігурація деплою на Vercel
├── package.json
├── .env                   # Змінні оточення (не в репозиторії)
├── .gitignore
└── README.md
```

## 📦 Локальний запуск

### Варіант 1 — зі своєю MongoDB Atlas (рекомендовано)

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

4. Створити файл `.env` у корені проєкту:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bookstore_crm
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GMAIL_USER=your_gmail@gmail.com
   GMAIL_PASS=your_app_password
   ADMIN_EMAIL=admin@example.com
   ```

5. Запустити сервер:
   ```bash
   npm start
   ```

6. Відкрити в браузері: http://localhost:3000

### Варіант 2 — через Docker (локальна MongoDB)

```bash
# Запустити MongoDB та Mongo Express
docker-compose up -d

# Mongo Express (веб-інтерфейс БД): http://localhost:8081
# Логін: admin / admin123
```

> У `.env` вказати `MONGODB_URI=mongodb://admin:secret123@localhost:27017/bookstore_crm?authSource=admin`

## 🔗 Основні API endpoints

### 🔐 Авторизація

| Метод | Endpoint | Опис |
|-------|----------|------|
| POST | /api/auth/register | Реєстрація |
| POST | /api/auth/login | Вхід, отримати JWT |
| GET | /api/auth/me | Дані поточного користувача |

### 📚 Книги

| Метод | Endpoint | Права | Опис |
|-------|----------|-------|------|
| GET | /api/books | Всі | Список всіх книг |
| GET | /api/books/:id | Всі | Деталі книги (з автором, видавництвом, категоріями) |
| GET | /api/books/search/:query | Всі | Пошук за назвою або автором |
| POST | /api/books | admin | Додати книгу (з фото) |
| PUT | /api/books/:id | admin | Оновити книгу |
| DELETE | /api/books/:id | admin | Видалити книгу |
| DELETE | /api/books/:id/image | admin | Видалити зображення книги |
| PATCH | /api/books/:id/stock | admin | Змінити кількість на складі |

### ✍️ Автори, категорії, видавництва

| Метод | Endpoint | Опис |
|-------|----------|------|
| GET/POST | /api/authors | Список / Додати |
| PUT/DELETE | /api/authors/:id | Оновити / Видалити |
| GET/POST | /api/categories | Список / Додати |
| DELETE | /api/categories/:id | Видалити |
| GET/POST | /api/publishers | Список / Додати |
| PUT/DELETE | /api/publishers/:id | Оновити / Видалити |

### 📦 Замовлення

| Метод | Endpoint | Права | Опис |
|-------|----------|-------|------|
| POST | /api/orders | Всі | Оформити замовлення |
| GET | /api/orders | admin | Всі замовлення |
| GET | /api/orders/my | авторизований | Мої замовлення |
| GET | /api/orders/:id | admin / власник | Деталі замовлення |
| PATCH | /api/orders/:id/status | admin | Змінити статус |
| DELETE | /api/orders/:id | admin | Видалити замовлення |

### 💬 Відгуки

| Метод | Endpoint | Права | Опис |
|-------|----------|-------|------|
| GET | /api/reviews/book/:bookId | Всі | Відгуки на книгу |
| POST | /api/reviews | авторизований | Залишити відгук |
| DELETE | /api/reviews/:id | admin / автор | Видалити відгук |
| GET | /api/reviews/all | admin | Всі відгуки |

### 📊 Інше

| Метод | Endpoint | Опис |
|-------|----------|------|
| GET | /api/stats | Загальна статистика |
| GET | /api/customers | Список клієнтів (admin) |
| POST | /api/contact | Форма зворотного зв'язку |
| GET | /api/health | Статус сервера та БД |

## 🗃️ Колекції MongoDB

| Колекція | Призначення |
|----------|-------------|
| `users` | Користувачі (ролі: admin, user) |
| `books` | Книги (ціна, склад, зображення, зв'язки) |
| `authors` | Автори книг |
| `categories` | Категорії (жанри) |
| `publishers` | Видавництва |
| `orders` | Замовлення покупців |
| `customers` | Клієнтська база |
| `reviews` | Відгуки та оцінки |
| `inventory` | Складський облік |

## 🔐 Система авторизації та ролі

Перший зареєстрований користувач автоматично отримує роль **admin**. Усі наступні — роль **user**.

| Роль | Можливості |
|------|-----------|
| `admin` | Повний доступ: CRUD книг, керування замовленнями, відгуками, авторами, категоріями, видавництвами |
| `user` | Перегляд каталогу, замовлення, написання відгуків, особистий кабінет |
| Гість | Перегляд каталогу, оформлення замовлення без реєстрації |

## 📧 Email-сповіщення

При оформленні замовлення система автоматично надсилає два HTML-листи:

- **Адміністратору** — деталі замовлення: клієнт, телефон, email, перелік книг, сума, адреса доставки
- **Клієнту** — підтвердження із номером замовлення, переліком позицій та підсумком

Форма зворотного зв'язку (/api/contact) також надсилає повідомлення адміністратору.

## 🛒 Логіка кошика та доставки

- Доставка **безкоштовна** при замовленні від 500 грн
- При меншій сумі — 65 грн
- Замовлення перевіряє наявність товару на складі перед оформленням
- Після успішного замовлення склад автоматично зменшується

## 🧪 Тестування

```bash
npm test
```

Юніт-тести (Jest) покривають:

- Функціонал кошика (додавання, видалення, зміна кількості)
- Розрахунок суми та вартості доставки
- Валідацію форм (email, телефон, обов'язкові поля)
- Допоміжні функції (`getStockInfo`, `getAuthorName`, `getBookImageUrl`)
- Інтеграційні сценарії (повний цикл замовлення)

## 🌿 GitFlow

| Гілка | Призначення |
|-------|------------|
| `main` | Стабільна продакшн-версія |
| `develop` | Актуальна розробка |
| `feature/server` | Розробка бекенду |
| `feature/client` | Розробка фронтенду |

## 👨‍💻 Автор

Дембіцький Олександр Юрійович, група ПП-32  
Курсова робота з дисципліни «Проектування та розробка інформаційних систем»  
Національний університет «Львівська політехніка», 2026