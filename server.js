// ============================================
// Сервер для книгарні "Читай-місто"
// Курсова робота 
// Виконав: Дембіцький О.Ю., група ПП-32
// ПОВНА ВЕРСІЯ з усіма даними з БД
// ============================================

const express = require('express');
const app = express();
const PORT = 3000;

// Middleware для парсингу JSON
app.use(express.json());

// Роздача статичних файлів (фронтенд)
app.use(express.static('public'));

// CORS налаштування
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  next();
});

// ============================================
// 1. АВТОРИ (authors) - 5 авторів
// ============================================

// Отримати всіх авторів
app.get("/api/authors", (req, res) => {
    const authors = [
        {
            author_id: "699e1aa4829aaaf395b22616",
            name: "Ліна Костенко",
            biography: "Видатна українська поетеса-шістдесятниця, письменниця",
            birth_year: 1930,
            country: "Україна"
        },
        {
            author_id: "699e1aa4829aaaf395b22617",
            name: "Сергій Жадан",
            biography: "Український письменник, поет, перекладач, музикант",
            birth_year: 1974,
            country: "Україна"
        },
        {
            author_id: "699e1aa4829aaaf395b22618",
            name: "Юрій Андрухович",
            biography: "Український поет, прозаїк, перекладач, есеїст",
            birth_year: 1960,
            country: "Україна"
        },
        {
            author_id: "699e1aa4829aaaf395b22619",
            name: "Оксана Забужко",
            biography: "Українська письменниця, поетеса, есеїстка, філософиня",
            birth_year: 1960,
            country: "Україна"
        },
        {
            author_id: "699e1aa4829aaaf395b2261a",
            name: "Тарас Шевченко",
            biography: "Національний поет України, художник, прозаїк",
            birth_year: 1814,
            country: "Україна"
        }
    ];
    res.json(authors);
});

// Отримати автора за ID
app.get("/api/authors/:id", (req, res) => {
    const authorId = req.params.id;
    
    const authors = {
        "699e1aa4829aaaf395b22616": {
            author_id: "699e1aa4829aaaf395b22616",
            name: "Ліна Костенко",
            biography: "Видатна українська поетеса-шістдесятниця, письменниця",
            birth_year: 1930,
            country: "Україна"
        },
        "699e1aa4829aaaf395b22617": {
            author_id: "699e1aa4829aaaf395b22617",
            name: "Сергій Жадан",
            biography: "Український письменник, поет, перекладач, музикант",
            birth_year: 1974,
            country: "Україна"
        },
        "699e1aa4829aaaf395b22618": {
            author_id: "699e1aa4829aaaf395b22618",
            name: "Юрій Андрухович",
            biography: "Український поет, прозаїк, перекладач, есеїст",
            birth_year: 1960,
            country: "Україна"
        },
        "699e1aa4829aaaf395b22619": {
            author_id: "699e1aa4829aaaf395b22619",
            name: "Оксана Забужко",
            biography: "Українська письменниця, поетеса, есеїстка, філософиня",
            birth_year: 1960,
            country: "Україна"
        },
        "699e1aa4829aaaf395b2261a": {
            author_id: "699e1aa4829aaaf395b2261a",
            name: "Тарас Шевченко",
            biography: "Національний поет України, художник, прозаїк",
            birth_year: 1814,
            country: "Україна"
        }
    };
    
    res.json(authors[authorId] || { error: "Автора не знайдено" });
});

// Додати нового автора
app.post("/api/authors", (req, res) => {
    const { name, biography, birth_year, country } = req.body;
    
    const newAuthor = {
        author_id: "699e1aa4829aaaf395b" + Math.floor(Math.random() * 1000),
        name: name,
        biography: biography,
        birth_year: birth_year,
        country: country
    };
    
    res.status(201).json({
        message: "Автора успішно додано",
        author: newAuthor
    });
});

// Оновити автора
app.put("/api/authors/:id", (req, res) => {
    const { name, biography, birth_year, country } = req.body;
    
    res.json({ 
        message: "Дані автора оновлено",
        author_id: req.params.id,
        updated_fields: { name, biography, birth_year, country }
    });
});

// Видалити автора
app.delete("/api/authors/:id", (req, res) => {
    res.json({ 
        message: "Автора видалено",
        deleted_id: req.params.id 
    });
});

// ============================================
// 2. ВИДАВНИЦТВА (publishers) - 5 видавництв
// ============================================

// Отримати всі видавництва
app.get("/api/publishers", (req, res) => {
    const publishers = [
        {
            publisher_id: "699e1b58829aaaf395b22620",
            name: "Видавництво Старого Лева",
            contact: "info@starylev.com.ua",
            website: "starylev.com.ua",
            city: "Львів"
        },
        {
            publisher_id: "699e1b58829aaaf395b22621",
            name: "Наш Формат",
            contact: "info@nashformat.ua",
            website: "nashformat.ua",
            city: "Київ"
        },
        {
            publisher_id: "699e1b58829aaaf395b22622",
            name: "Фоліо",
            contact: "folio@folio.com.ua",
            website: "folio.com.ua",
            city: "Харків"
        },
        {
            publisher_id: "699e1b58829aaaf395b22623",
            name: "А-БА-БА-ГА-ЛА-МА-ГА",
            contact: "ababahalamaha@gmail.com",
            website: "ababahalamaha.com.ua",
            city: "Київ"
        },
        {
            publisher_id: "699e1b58829aaaf395b22624",
            name: "Vivat",
            contact: "info@vivat-book.com.ua",
            website: "vivat-book.com.ua",
            city: "Харків"
        }
    ];
    res.json(publishers);
});

// Отримати видавництво за ID
app.get("/api/publishers/:id", (req, res) => {
    const publisherId = req.params.id;
    
    const publishers = {
        "699e1b58829aaaf395b22620": {
            publisher_id: "699e1b58829aaaf395b22620",
            name: "Видавництво Старого Лева",
            contact: "info@starylev.com.ua",
            website: "starylev.com.ua",
            city: "Львів",
            address: "м. Львів, вул. Коперника, 12",
            phone: "+380322456789"
        },
        "699e1b58829aaaf395b22621": {
            publisher_id: "699e1b58829aaaf395b22621",
            name: "Наш Формат",
            contact: "info@nashformat.ua",
            website: "nashformat.ua",
            city: "Київ",
            address: "м. Київ, вул. Володимирська, 45",
            phone: "+380442345678"
        },
        "699e1b58829aaaf395b22622": {
            publisher_id: "699e1b58829aaaf395b22622",
            name: "Фоліо",
            contact: "folio@folio.com.ua",
            website: "folio.com.ua",
            city: "Харків",
            address: "м. Харків, вул. Сумська, 78",
            phone: "+380572345678"
        },
        "699e1b58829aaaf395b22623": {
            publisher_id: "699e1b58829aaaf395b22623",
            name: "А-БА-БА-ГА-ЛА-МА-ГА",
            contact: "ababahalamaha@gmail.com",
            website: "ababahalamaha.com.ua",
            city: "Київ",
            address: "м. Київ, вул. Хрещатик, 15",
            phone: "+380442567890"
        },
        "699e1b58829aaaf395b22624": {
            publisher_id: "699e1b58829aaaf395b22624",
            name: "Vivat",
            contact: "info@vivat-book.com.ua",
            website: "vivat-book.com.ua",
            city: "Харків",
            address: "м. Харків, вул. Пушкінська, 23",
            phone: "+380573456789"
        }
    };
    
    res.json(publishers[publisherId] || { error: "Видавництво не знайдено" });
});

// Додати видавництво
app.post("/api/publishers", (req, res) => {
    const { name, contact, website, city } = req.body;
    
    res.status(201).json({
        publisher_id: "699e1b58829aaaf395b" + Math.floor(Math.random() * 1000),
        name: name,
        contact: contact,
        website: website,
        city: city,
        message: "Видавництво додано"
    });
});

// Оновити видавництво
app.put("/api/publishers/:id", (req, res) => {
    const { name, contact, website, city } = req.body;
    
    res.json({
        message: "Видавництво оновлено",
        publisher_id: req.params.id,
        updated_fields: { name, contact, website, city }
    });
});

// Видалити видавництво
app.delete("/api/publishers/:id", (req, res) => {
    res.json({
        message: "Видавництво видалено",
        deleted_id: req.params.id
    });
});

// ============================================
// 3. КАТЕГОРІЇ (categories) - 7 категорій
// ============================================

// Отримати всі категорії (оновлена версія з 10 категоріями)
app.get("/api/categories", (req, res) => {
    const categories = [
        { 
            category_id: "699e1c37829aaaf395b22627", 
            name: "Українська література", 
            description: "Твори українських авторів" 
        },
        { 
            category_id: "699e1c37829aaaf395b22628", 
            name: "Зарубіжна література", 
            description: "Світова класика та сучасна проза" 
        },
        { 
            category_id: "699e1c37829aaaf395b22629", 
            name: "Поезія", 
            description: "Вірші та поеми" 
        },
        { 
            category_id: "699e2626829aaaf395b2264a", 
            name: "Детектив", 
            description: "Пригодницькі та детективні романи" 
        },
        { 
            category_id: "699e2626829aaaf395b2264b", 
            name: "Фантастика", 
            description: "Наукова фантастика та фентезі" 
        },
        { 
            category_id: "699e2626829aaaf395b2264c", 
            name: "Нон-фікшн", 
            description: "Біографії, есе, публіцистика" 
        },
        { 
            category_id: "699e2626829aaaf395b2264d", 
            name: "Дитяча література", 
            description: "Книги для дітей та підлітків" 
        },
        { 
            category_id: "699e2626829aaaf395b2264e", 
            name: "Роман", 
            description: "Прозаїчні твори, романи" 
        },
        { 
            category_id: "699e2626829aaaf395b2264f", 
            name: "Класика", 
            description: "Класичні твори світової та української літератури" 
        },
        { 
            category_id: "699e2626829aaaf395b22650", 
            name: "Сучасна проза", 
            description: "Сучасна українська та зарубіжна проза" 
        }
    ];
    res.json(categories);
});

// Отримати категорію за ID
app.get("/api/categories/:id", (req, res) => {
    const categoryId = req.params.id;
    
    const categories = {
        "699e1c37829aaaf395b22627": { 
            category_id: "699e1c37829aaaf395b22627", 
            name: "Українська література", 
            description: "Твори українських авторів" 
        },
        "699e1c37829aaaf395b22628": { 
            category_id: "699e1c37829aaaf395b22628", 
            name: "Зарубіжна література", 
            description: "Світова класика та сучасна проза" 
        },
        "699e1c37829aaaf395b22629": { 
            category_id: "699e1c37829aaaf395b22629", 
            name: "Поезія", 
            description: "Вірші та поеми" 
        },
        "699e2626829aaaf395b2264a": { 
            category_id: "699e2626829aaaf395b2264a", 
            name: "Детектив", 
            description: "Пригодницькі та детективні романи" 
        },
        "699e2626829aaaf395b2264b": { 
            category_id: "699e2626829aaaf395b2264b", 
            name: "Фантастика", 
            description: "Наукова фантастика та фентезі" 
        },
        "699e2626829aaaf395b2264c": { 
            category_id: "699e2626829aaaf395b2264c", 
            name: "Нон-фікшн", 
            description: "Біографії, есе, публіцистика" 
        },
        "699e2626829aaaf395b2264d": { 
            category_id: "699e2626829aaaf395b2264d", 
            name: "Дитяча література", 
            description: "Книги для дітей та підлітків" 
        }
    };
    
    res.json(categories[categoryId] || { error: "Категорію не знайдено" });
});

// Додати категорію
app.post("/api/categories", (req, res) => {
    const { name, description } = req.body;
    
    res.status(201).json({
        category_id: "699e2626829aaaf395b" + Math.floor(Math.random() * 1000),
        name: name,
        description: description,
        message: "Категорію додано"
    });
});

// Оновити категорію
app.put("/api/categories/:id", (req, res) => {
    const { name, description } = req.body;
    
    res.json({
        message: "Категорію оновлено",
        category_id: req.params.id,
        updated_fields: { name, description }
    });
});

// Видалити категорію
app.delete("/api/categories/:id", (req, res) => {
    res.json({
        message: "Категорію видалено",
        deleted_id: req.params.id
    });
});

// Отримати всі книги категорії
app.get("/api/categories/:id/books", (req, res) => {
    const categoryId = req.params.id;
    
    let books = [];
    
    if (categoryId === "699e1c37829aaaf395b22627" || categoryId === "699e1c37829aaaf395b22629") {
        books = [
            { book_id: "699e2816829aaaf395b2264f", title: "Маруся Чурай", author: "Ліна Костенко", price: 320 },
            { book_id: "699e2816829aaaf395b22651", title: "Кобзар", author: "Тарас Шевченко", price: 450 }
        ];
    } else if (categoryId === "699e2626829aaaf395b2264a") {
        books = [
            { book_id: "699e2816829aaaf395b22650", title: "Ворошиловград", author: "Сергій Жадан", price: 280 },
            { book_id: "699e2816829aaaf395b22652", title: "Музей покинутих секретів", author: "Оксана Забужко", price: 390 },
            { book_id: "699e2816829aaaf395b22653", title: "Московіада", author: "Юрій Андрухович", price: 260 }
        ];
    }
    
    res.json({
        category_id: categoryId,
        books: books
    });
});

// ============================================
// 4. КЛІЄНТИ (customers) - 5 клієнтів
// ============================================

// Отримати всіх клієнтів
app.get("/api/customers", (req, res) => {
    const customers = [
        {
            customer_id: "699e1e25829aaaf395b22633",
            full_name: "Іван Петрович Коваль",
            email: "ivan.koval@email.com",
            phone: "+380671234567",
            delivery_address: "Нова Пошта, відділення №1, вул. Хрещатик, 25, м. Київ",
            registration_date: "2025-01-15",
            total_orders: 3
        },
        {
            customer_id: "699e1e25829aaaf395b22634",
            full_name: "Марія Олександрівна Шевченко",
            email: "maria.shevchenko@email.com",
            phone: "+380501112233",
            delivery_address: "Укрпошта, відділення №15, вул. Франка, 5, м. Львів",
            registration_date: "2025-02-20",
            total_orders: 1
        },
        {
            customer_id: "699e1e25829aaaf395b22635",
            full_name: "Олег Вікторович Бондар",
            email: "oleg.bondar@email.com",
            phone: "+380931234567",
            delivery_address: "Нова Пошта, відділення №7, вул. Дерибасівська, 12, м. Одеса",
            registration_date: "2025-03-05",
            total_orders: 2
        },
        {
            customer_id: "699e1e25829aaaf395b22636",
            full_name: "Наталія Ігорівна Мельник",
            email: "natalia.melnyk@email.com",
            phone: "+380971112233",
            delivery_address: "Укрпошта, відділення №22, вул. Сумська, 45, м. Харків",
            registration_date: "2025-04-10",
            total_orders: 0
        },
        {
            customer_id: "699e1e25829aaaf395b22637",
            full_name: "Андрій Петрович Лисенко",
            email: "andriy.lysenko@email.com",
            phone: "+380631234567",
            delivery_address: "Нова Пошта, відділення №5, вул. Центральна, 8, м. Дніпро",
            registration_date: "2025-05-22",
            total_orders: 1
        }
    ];
    res.json(customers);
});

// Реєстрація нового клієнта
app.post("/api/customers/register", (req, res) => {
    const { full_name, email, phone, password, delivery_address } = req.body;
    
    const newCustomer = {
        customer_id: "699e1e25829aaaf395b" + Math.floor(Math.random() * 1000),
        full_name: full_name,
        email: email,
        phone: phone,
        delivery_address: delivery_address,
        role: "customer",
        registration_date: new Date().toISOString().split('T')[0],
        total_orders: 0
    };
    
    res.status(201).json({
        message: "Клієнта успішно зареєстровано",
        customer: newCustomer
    });
});

// Вхід в систему
app.post("/api/customers/login", (req, res) => {
    const { email, password } = req.body;
    
    if (email === "ivan.koval@email.com" && password === "123456") {
        res.json({
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            customer_id: "699e1e25829aaaf395b22633",
            full_name: "Іван Петрович Коваль",
            role: "customer"
        });
    } else {
        res.status(401).json({ message: "Невірний email або пароль" });
    }
});

// Отримати клієнта за ID
app.get("/api/customers/:id", (req, res) => {
    const customerId = req.params.id;
    
    const customers = {
        "699e1e25829aaaf395b22633": {
            customer_id: "699e1e25829aaaf395b22633",
            full_name: "Іван Петрович Коваль",
            email: "ivan.koval@email.com",
            phone: "+380671234567",
            delivery_address: "Нова Пошта, відділення №1, вул. Хрещатик, 25, м. Київ",
            registration_date: "2025-01-15",
            total_orders: 3
        },
        "699e1e25829aaaf395b22634": {
            customer_id: "699e1e25829aaaf395b22634",
            full_name: "Марія Олександрівна Шевченко",
            email: "maria.shevchenko@email.com",
            phone: "+380501112233",
            delivery_address: "Укрпошта, відділення №15, вул. Франка, 5, м. Львів",
            registration_date: "2025-02-20",
            total_orders: 1
        },
        "699e1e25829aaaf395b22635": {
            customer_id: "699e1e25829aaaf395b22635",
            full_name: "Олег Вікторович Бондар",
            email: "oleg.bondar@email.com",
            phone: "+380931234567",
            delivery_address: "Нова Пошта, відділення №7, вул. Дерибасівська, 12, м. Одеса",
            registration_date: "2025-03-05",
            total_orders: 2
        },
        "699e1e25829aaaf395b22636": {
            customer_id: "699e1e25829aaaf395b22636",
            full_name: "Наталія Ігорівна Мельник",
            email: "natalia.melnyk@email.com",
            phone: "+380971112233",
            delivery_address: "Укрпошта, відділення №22, вул. Сумська, 45, м. Харків",
            registration_date: "2025-04-10",
            total_orders: 0
        },
        "699e1e25829aaaf395b22637": {
            customer_id: "699e1e25829aaaf395b22637",
            full_name: "Андрій Петрович Лисенко",
            email: "andriy.lysenko@email.com",
            phone: "+380631234567",
            delivery_address: "Нова Пошта, відділення №5, вул. Центральна, 8, м. Дніпро",
            registration_date: "2025-05-22",
            total_orders: 1
        }
    };
    
    res.json(customers[customerId] || { error: "Клієнта не знайдено" });
});

// Оновити дані клієнта
app.put("/api/customers/:id", (req, res) => {
    const { full_name, phone, delivery_address } = req.body;
    
    res.json({
        message: "Дані клієнта успішно оновлено",
        customer_id: req.params.id,
        updated_fields: { full_name, phone, delivery_address }
    });
});

// Видалити клієнта
app.delete("/api/customers/:id", (req, res) => {
    res.json({ 
        message: "Клієнта видалено",
        deleted_id: req.params.id 
    });
});

// ============================================
// 5. КНИГИ (books) - всі 5 книг
// ============================================

// Отримати всі книги
app.get("/api/books", (req, res) => {
    const books = [
        {
            book_id: "699e2816829aaaf395b2264f",
            title: "Маруся Чурай",
            author: "Ліна Костенко",
            price: 320,
            stock: 15,
            category: "Українська література, Поезія",
            year: 2020,
            isbn: "978-966-7047-23-4"
        },
        {
            book_id: "699e2816829aaaf395b22650",
            title: "Ворошиловград",
            author: "Сергій Жадан",
            price: 280,
            stock: 8,
            category: "Українська література, Сучасна проза",
            year: 2019,
            isbn: "978-966-03-7512-9"
        },
        {
            book_id: "699e2816829aaaf395b22651",
            title: "Кобзар",
            author: "Тарас Шевченко",
            price: 450,
            stock: 25,
            category: "Українська література, Поезія, Класика",
            year: 2021,
            isbn: "978-617-7552-45-6"
        },
        {
            book_id: "699e2816829aaaf395b22652",
            title: "Музей покинутих секретів",
            author: "Оксана Забужко",
            price: 390,
            stock: 5,
            category: "Українська література, Сучасна проза",
            year: 2018,
            isbn: "978-966-679-932-1"
        },
        {
            book_id: "699e2816829aaaf395b22653",
            title: "Московіада",
            author: "Юрій Андрухович",
            price: 260,
            stock: 12,
            category: "Українська література, Сучасна проза",
            year: 2017,
            isbn: "978-617-7246-89-8"
        }
    ];
    res.json(books);
});

// Отримати книгу за ID
app.get("/api/books/:id", (req, res) => {
    const bookId = req.params.id;
    
    const books = {
        "699e2816829aaaf395b2264f": {
            book_id: "699e2816829aaaf395b2264f",
            title: "Маруся Чурай",
            author: {
                name: "Ліна Костенко",
                author_id: "699e1aa4829aaaf395b22616"
            },
            publisher: {
                name: "А-БА-БА-ГА-ЛА-МА-ГА",
                publisher_id: "699e1b58829aaaf395b22623"
            },
            price: 320,
            purchase_price: 220,
            stock: 15,
            isbn: "978-966-7047-23-4",
            year: 2020,
            pages: 320,
            description: "Історичний роман у віршах про драматичну долю легендарної дівчини",
            categories: [
                { name: "Українська література", category_id: "699e1c37829aaaf395b22627" },
                { name: "Поезія", category_id: "699e1c37829aaaf395b22629" }
            ]
        },
        "699e2816829aaaf395b22650": {
            book_id: "699e2816829aaaf395b22650",
            title: "Ворошиловград",
            author: {
                name: "Сергій Жадан",
                author_id: "699e1aa4829aaaf395b22617"
            },
            publisher: {
                name: "Фоліо",
                publisher_id: "699e1b58829aaaf395b22622"
            },
            price: 280,
            purchase_price: 190,
            stock: 8,
            isbn: "978-966-03-7512-9",
            year: 2019,
            pages: 360,
            description: "Роман про пошуки брата, донецькі степи та справжні цінності",
            categories: [
                { name: "Українська література", category_id: "699e1c37829aaaf395b22627" },
                { name: "Детектив", category_id: "699e2626829aaaf395b2264a" },
                { name: "Нон-фікшн", category_id: "699e2626829aaaf395b2264c" }
            ]
        },
        "699e2816829aaaf395b22651": {
            book_id: "699e2816829aaaf395b22651",
            title: "Кобзар",
            author: {
                name: "Тарас Шевченко",
                author_id: "699e1aa4829aaaf395b2261a"
            },
            publisher: {
                name: "Наш Формат",
                publisher_id: "699e1b58829aaaf395b22621"
            },
            price: 450,
            purchase_price: 300,
            stock: 25,
            isbn: "978-617-7552-45-6",
            year: 2021,
            pages: 680,
            description: "Головна книга української літератури з ілюстраціями",
            categories: [
                { name: "Українська література", category_id: "699e1c37829aaaf395b22627" },
                { name: "Поезія", category_id: "699e1c37829aaaf395b22629" },
                { name: "Фантастика", category_id: "699e2626829aaaf395b2264b" }
            ]
        },
        "699e2816829aaaf395b22652": {
            book_id: "699e2816829aaaf395b22652",
            title: "Музей покинутих секретів",
            author: {
                name: "Оксана Забужко",
                author_id: "699e1aa4829aaaf395b22619"
            },
            publisher: {
                name: "Видавництво Старого Лева",
                publisher_id: "699e1b58829aaaf395b22620"
            },
            price: 390,
            purchase_price: 260,
            stock: 5,
            isbn: "978-966-679-932-1",
            year: 2018,
            pages: 830,
            description: "Епічний роман про три покоління українців",
            categories: [
                { name: "Українська література", category_id: "699e1c37829aaaf395b22627" },
                { name: "Детектив", category_id: "699e2626829aaaf395b2264a" },
                { name: "Нон-фікшн", category_id: "699e2626829aaaf395b2264c" }
            ]
        },
        "699e2816829aaaf395b22653": {
            book_id: "699e2816829aaaf395b22653",
            title: "Московіада",
            author: {
                name: "Юрій Андрухович",
                author_id: "699e1aa4829aaaf395b22618"
            },
            publisher: {
                name: "Vivat",
                publisher_id: "699e1b58829aaaf395b22624"
            },
            price: 260,
            purchase_price: 170,
            stock: 12,
            isbn: "978-617-7246-89-8",
            year: 2017,
            pages: 280,
            description: "Роман-фантасмагорія про життя в Москві кінця 80-х",
            categories: [
                { name: "Українська література", category_id: "699e1c37829aaaf395b22627" },
                { name: "Детектив", category_id: "699e2626829aaaf395b2264a" },
                { name: "Нон-фікшн", category_id: "699e2626829aaaf395b2264c" }
            ]
        }
    };
    
    res.json(books[bookId] || { error: "Книгу не знайдено" });
});

// Додати нову книгу
app.post("/api/books", (req, res) => {
    const { title, author_id, publisher_id, price, stock, year, pages, isbn, description } = req.body;
    
    const newBook = {
        book_id: "699e2816829aaaf395b" + Math.floor(Math.random() * 1000),
        title: title,
        author_id: author_id,
        publisher_id: publisher_id,
        price: price,
        stock: stock,
        isbn: isbn,
        year: year,
        pages: pages,
        description: description
    };
    
    res.status(201).json({
        message: "Книгу успішно додано",
        book: newBook
    });
});

// Оновити книгу
app.put("/api/books/:id", (req, res) => {
    const updates = req.body;
    
    res.json({ 
        message: "Дані книги оновлено",
        book_id: req.params.id,
        updated_fields: updates
    });
});

// Видалити книгу
app.delete("/api/books/:id", (req, res) => {
    res.json({ 
        message: "Книгу видалено",
        deleted_id: req.params.id 
    });
});

// Пошук книг
app.get("/api/books/search/:query", (req, res) => {
    const searchQuery = req.params.query.toLowerCase();
    
    const allBooks = [
        { book_id: "699e2816829aaaf395b2264f", title: "Маруся Чурай", author: "Ліна Костенко" },
        { book_id: "699e2816829aaaf395b22650", title: "Ворошиловград", author: "Сергій Жадан" },
        { book_id: "699e2816829aaaf395b22651", title: "Кобзар", author: "Тарас Шевченко" },
        { book_id: "699e2816829aaaf395b22652", title: "Музей покинутих секретів", author: "Оксана Забужко" },
        { book_id: "699e2816829aaaf395b22653", title: "Московіада", author: "Юрій Андрухович" }
    ];
    
    const results = allBooks.filter(book => 
        book.title.toLowerCase().includes(searchQuery) || 
        book.author.toLowerCase().includes(searchQuery)
    );
    
    res.json({
        query: searchQuery,
        count: results.length,
        results: results
    });
});

// ============================================
// 6. ЗАМОВЛЕННЯ (orders) - 4 замовлення
// ============================================

// Отримати всі замовлення
app.get("/api/orders", (req, res) => {
    const orders = [
        {
            order_id: "699e2816829aaaf395b22660",
            order_number: "ORD-2025-001",
            customer_name: "Іван Коваль",
            customer_id: "699e1e25829aaaf395b22633",
            status: "доставлено",
            total_amount: 1220,
            order_date: "2025-02-10",
            payment_method: "картка онлайн",
            payment_status: "оплачено"
        },
        {
            order_id: "699e2816829aaaf395b22661",
            order_number: "ORD-2025-002",
            customer_name: "Олег Бондар",
            customer_id: "699e1e25829aaaf395b22635",
            status: "в обробці",
            total_amount: 280,
            order_date: "2025-03-15",
            payment_method: "готівка при отриманні",
            payment_status: "очікується"
        },
        {
            order_id: "699e2816829aaaf395b22662",
            order_number: "ORD-2025-003",
            customer_name: "Марія Шевченко",
            customer_id: "699e1e25829aaaf395b22634",
            status: "доставлено",
            total_amount: 390,
            order_date: "2025-03-20",
            payment_method: "картка онлайн",
            payment_status: "оплачено"
        },
        {
            order_id: "699e2816829aaaf395b22663",
            order_number: "ORD-2025-004",
            customer_name: "Андрій Лисенко",
            customer_id: "699e1e25829aaaf395b22637",
            status: "нове",
            total_amount: 540,
            order_date: "2025-05-25",
            payment_method: "готівка при отриманні",
            payment_status: "очікується"
        }
    ];
    res.json(orders);
});

// Створити нове замовлення
app.post("/api/orders", (req, res) => {
    const { customer_id, items, delivery_address, payment_method } = req.body;
    
    let total = 0;
    items.forEach(item => {
        total += item.price * item.quantity;
    });
    
    const orderNumber = "ORD-2026-" + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    
    const newOrder = {
        order_id: "699e2816829aaaf395b" + Math.floor(Math.random() * 1000),
        order_number: orderNumber,
        customer_id: customer_id,
        status: "нове",
        total_amount: total,
        order_date: new Date().toISOString().split('T')[0],
        items: items,
        delivery_address: delivery_address,
        payment_method: payment_method,
        payment_status: "очікується"
    };
    
    res.status(201).json({
        message: "Замовлення створено",
        order: newOrder
    });
});

// Отримати замовлення за ID
app.get("/api/orders/:id", (req, res) => {
    const orderId = req.params.id;
    
    const orders = {
        "699e2816829aaaf395b22660": {
            order_id: "699e2816829aaaf395b22660",
            order_number: "ORD-2025-001",
            customer: {
                name: "Іван Коваль",
                customer_id: "699e1e25829aaaf395b22633",
                phone: "+380671234567",
                email: "ivan.koval@email.com"
            },
            order_date: "2025-02-10",
            status: "доставлено",
            items: [
                { 
                    book_id: "699e2816829aaaf395b2264f",
                    book_title: "Маруся Чурай", 
                    quantity: 1, 
                    price: 320 
                },
                { 
                    book_id: "699e2816829aaaf395b22651",
                    book_title: "Кобзар", 
                    quantity: 2, 
                    price: 450 
                }
            ],
            total_amount: 1220,
            payment_method: "картка онлайн",
            payment_status: "оплачено",
            delivery_address: "Нова Пошта, відділення №1, вул. Хрещатик, 25, м. Київ"
        },
        "699e2816829aaaf395b22661": {
            order_id: "699e2816829aaaf395b22661",
            order_number: "ORD-2025-002",
            customer: {
                name: "Олег Бондар",
                customer_id: "699e1e25829aaaf395b22635",
                phone: "+380931234567",
                email: "oleg.bondar@email.com"
            },
            order_date: "2025-03-15",
            status: "в обробці",
            items: [
                { 
                    book_id: "699e2816829aaaf395b22650",
                    book_title: "Ворошиловград", 
                    quantity: 1, 
                    price: 280 
                }
            ],
            total_amount: 280,
            payment_method: "готівка при отриманні",
            payment_status: "очікується",
            delivery_address: "Нова Пошта, відділення №7, вул. Дерибасівська, 12, м. Одеса"
        },
        "699e2816829aaaf395b22662": {
            order_id: "699e2816829aaaf395b22662",
            order_number: "ORD-2025-003",
            customer: {
                name: "Марія Шевченко",
                customer_id: "699e1e25829aaaf395b22634",
                phone: "+380501112233",
                email: "maria.shevchenko@email.com"
            },
            order_date: "2025-03-20",
            status: "доставлено",
            items: [
                { 
                    book_id: "699e2816829aaaf395b22652",
                    book_title: "Музей покинутих секретів", 
                    quantity: 1, 
                    price: 390 
                }
            ],
            total_amount: 390,
            payment_method: "картка онлайн",
            payment_status: "оплачено",
            delivery_address: "Укрпошта, відділення №15, вул. Франка, 5, м. Львів"
        },
        "699e2816829aaaf395b22663": {
            order_id: "699e2816829aaaf395b22663",
            order_number: "ORD-2025-004",
            customer: {
                name: "Андрій Лисенко",
                customer_id: "699e1e25829aaaf395b22637",
                phone: "+380631234567",
                email: "andriy.lysenko@email.com"
            },
            order_date: "2025-05-25",
            status: "нове",
            items: [
                { 
                    book_id: "699e2816829aaaf395b22653",
                    book_title: "Московіада", 
                    quantity: 1, 
                    price: 260 
                },
                { 
                    book_id: "699e2816829aaaf395b22650",
                    book_title: "Ворошиловград", 
                    quantity: 1, 
                    price: 280 
                }
            ],
            total_amount: 540,
            payment_method: "готівка при отриманні",
            payment_status: "очікується",
            delivery_address: "Нова Пошта, відділення №5, вул. Центральна, 8, м. Дніпро"
        }
    };
    
    res.json(orders[orderId] || { error: "Замовлення не знайдено" });
});

// Отримати замовлення клієнта
app.get("/api/orders/customer/:customerId", (req, res) => {
    const customerId = req.params.customerId;
    
    const allOrders = [
        {
            order_id: "699e2816829aaaf395b22660",
            order_number: "ORD-2025-001",
            customer_id: "699e1e25829aaaf395b22633",
            order_date: "2025-02-10",
            status: "доставлено",
            total_amount: 1220,
            items_count: 3
        },
        {
            order_id: "699e2816829aaaf395b22661",
            order_number: "ORD-2025-002",
            customer_id: "699e1e25829aaaf395b22635",
            order_date: "2025-03-15",
            status: "в обробці",
            total_amount: 280,
            items_count: 1
        },
        {
            order_id: "699e2816829aaaf395b22662",
            order_number: "ORD-2025-003",
            customer_id: "699e1e25829aaaf395b22634",
            order_date: "2025-03-20",
            status: "доставлено",
            total_amount: 390,
            items_count: 1
        },
        {
            order_id: "699e2816829aaaf395b22663",
            order_number: "ORD-2025-004",
            customer_id: "699e1e25829aaaf395b22637",
            order_date: "2025-05-25",
            status: "нове",
            total_amount: 540,
            items_count: 2
        }
    ];
    
    const customerOrders = allOrders.filter(order => order.customer_id === customerId);
    
    res.json(customerOrders);
});

// Оновити замовлення
app.put("/api/orders/:id", (req, res) => {
    const updates = req.body;
    
    res.json({
        message: "Замовлення оновлено",
        order_id: req.params.id,
        updated_fields: updates
    });
});

// Змінити статус замовлення
app.patch("/api/orders/:id/status", (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    
    res.json({
        order_id: orderId,
        new_status: status,
        message: `Статус замовлення змінено на "${status}"`
    });
});

// Видалити замовлення
app.delete("/api/orders/:id", (req, res) => {
    res.json({
        message: "Замовлення видалено",
        deleted_id: req.params.id
    });
});

// ============================================
// 7. ВІДГУКИ (reviews) - 7 відгуків
// ============================================

// Отримати всі відгуки
app.get("/api/reviews", (req, res) => {
    const reviews = [
        {
            review_id: "699e2816829aaaf395b22670",
            book_id: "699e2816829aaaf395b2264f",
            book_title: "Маруся Чурай",
            customer_name: "Іван Коваль",
            rating: 5,
            comment: "Неймовірна книга! Ліна Костенко — геній. Читала на одному подиху.",
            date: "2025-02-15"
        },
        {
            review_id: "699e2816829aaaf395b22671",
            book_id: "699e2816829aaaf395b2264f",
            book_title: "Маруся Чурай",
            customer_name: "Марія Шевченко",
            rating: 5,
            comment: "Маруся Чурай — це шедевр української літератури. Дуже зворушливо.",
            date: "2025-03-02"
        },
        {
            review_id: "699e2816829aaaf395b22672",
            book_id: "699e2816829aaaf395b22650",
            book_title: "Ворошиловград",
            customer_name: "Олег Бондар",
            rating: 4,
            comment: "Жадан як завжди на висоті. Але трохи затягнуто в середині.",
            date: "2025-03-20"
        },
        {
            review_id: "699e2816829aaaf395b22673",
            book_id: "699e2816829aaaf395b22651",
            book_title: "Кобзар",
            customer_name: "Наталія Мельник",
            rating: 5,
            comment: "Кобзар має бути в кожній українській домівці. Вічна класика.",
            date: "2025-04-05"
        },
        {
            review_id: "699e2816829aaaf395b22674",
            book_id: "699e2816829aaaf395b22651",
            book_title: "Кобзар",
            customer_name: "Іван Коваль",
            rating: 5,
            comment: "Дуже гарне видання, якісний папір, зручно читати.",
            date: "2025-04-10"
        },
        {
            review_id: "699e2816829aaaf395b22675",
            book_id: "699e2816829aaaf395b22652",
            book_title: "Музей покинутих секретів",
            customer_name: "Андрій Лисенко",
            rating: 5,
            comment: "Забужко — сила. Дуже глибока книга про Україну і пам'ять.",
            date: "2025-04-22"
        },
        {
            review_id: "699e2816829aaaf395b22676",
            book_id: "699e2816829aaaf395b22653",
            book_title: "Московіада",
            customer_name: "Олег Бондар",
            rating: 4,
            comment: "Андрухович як завжди провокує. Стильно, смішно, гірко.",
            date: "2025-05-28"
        }
    ];
    res.json(reviews);
});

// Додати відгук
app.post("/api/reviews", (req, res) => {
    const { book_id, customer_id, rating, comment } = req.body;
    
    const newReview = {
        review_id: "699e2816829aaaf395b" + Math.floor(Math.random() * 1000),
        book_id: book_id,
        customer_id: customer_id,
        rating: rating,
        comment: comment,
        created_at: new Date().toISOString()
    };
    
    res.status(201).json({
        message: "Відгук додано",
        review: newReview
    });
});

// Отримати відгуки про книгу
app.get("/api/reviews/book/:bookId", (req, res) => {
    const bookId = req.params.bookId;
    
    const allReviews = {
        "699e2816829aaaf395b2264f": [
            {
                review_id: "699e2816829aaaf395b22670",
                customer: "Іван Коваль",
                rating: 5,
                comment: "Неймовірна книга! Ліна Костенко — геній. Читала на одному подиху.",
                date: "2025-02-15"
            },
            {
                review_id: "699e2816829aaaf395b22671",
                customer: "Марія Шевченко",
                rating: 5,
                comment: "Маруся Чурай — це шедевр української літератури. Дуже зворушливо.",
                date: "2025-03-02"
            }
        ],
        "699e2816829aaaf395b22650": [
            {
                review_id: "699e2816829aaaf395b22672",
                customer: "Олег Бондар",
                rating: 4,
                comment: "Жадан як завжди на висоті. Але трохи затягнуто в середині.",
                date: "2025-03-20"
            }
        ],
        "699e2816829aaaf395b22651": [
            {
                review_id: "699e2816829aaaf395b22673",
                customer: "Наталія Мельник",
                rating: 5,
                comment: "Кобзар має бути в кожній українській домівці. Вічна класика.",
                date: "2025-04-05"
            },
            {
                review_id: "699e2816829aaaf395b22674",
                customer: "Іван Коваль",
                rating: 5,
                comment: "Дуже гарне видання, якісний папір, зручно читати.",
                date: "2025-04-10"
            }
        ],
        "699e2816829aaaf395b22652": [
            {
                review_id: "699e2816829aaaf395b22675",
                customer: "Андрій Лисенко",
                rating: 5,
                comment: "Забужко — сила. Дуже глибока книга про Україну і пам'ять.",
                date: "2025-04-22"
            }
        ],
        "699e2816829aaaf395b22653": [
            {
                review_id: "699e2816829aaaf395b22676",
                customer: "Олег Бондар",
                rating: 4,
                comment: "Андрухович як завжди провокує. Стильно, смішно, гірко.",
                date: "2025-05-28"
            }
        ]
    };
    
    const bookReviews = allReviews[bookId] || [];
    
    let averageRating = 0;
    if (bookReviews.length > 0) {
        const sum = bookReviews.reduce((acc, review) => acc + review.rating, 0);
        averageRating = sum / bookReviews.length;
    }
    
    res.json({
        book_id: bookId,
        average_rating: averageRating,
        total_reviews: bookReviews.length,
        reviews: bookReviews
    });
});

// Отримати відгуки клієнта
app.get("/api/reviews/customer/:customerId", (req, res) => {
    const customerId = req.params.customerId;
    
    const allReviews = [
        {
            review_id: "699e2816829aaaf395b22670",
            customer_id: "699e1e25829aaaf395b22633",
            book_title: "Маруся Чурай",
            rating: 5,
            comment: "Неймовірна книга! Ліна Костенко — геній.",
            date: "2025-02-15"
        },
        {
            review_id: "699e2816829aaaf395b22671",
            customer_id: "699e1e25829aaaf395b22634",
            book_title: "Маруся Чурай",
            rating: 5,
            comment: "Маруся Чурай — це шедевр української літератури.",
            date: "2025-03-02"
        },
        {
            review_id: "699e2816829aaaf395b22672",
            customer_id: "699e1e25829aaaf395b22635",
            book_title: "Ворошиловград",
            rating: 4,
            comment: "Жадан як завжди на висоті. Але трохи затягнуто в середині.",
            date: "2025-03-20"
        },
        {
            review_id: "699e2816829aaaf395b22673",
            customer_id: "699e1e25829aaaf395b22636",
            book_title: "Кобзар",
            rating: 5,
            comment: "Кобзар має бути в кожній українській домівці. Вічна класика.",
            date: "2025-04-05"
        },
        {
            review_id: "699e2816829aaaf395b22674",
            customer_id: "699e1e25829aaaf395b22633",
            book_title: "Кобзар",
            rating: 5,
            comment: "Дуже гарне видання, якісний папір, зручно читати.",
            date: "2025-04-10"
        },
        {
            review_id: "699e2816829aaaf395b22675",
            customer_id: "699e1e25829aaaf395b22637",
            book_title: "Музей покинутих секретів",
            rating: 5,
            comment: "Забужко — сила. Дуже глибока книга про Україну і пам'ять.",
            date: "2025-04-22"
        },
        {
            review_id: "699e2816829aaaf395b22676",
            customer_id: "699e1e25829aaaf395b22635",
            book_title: "Московіада",
            rating: 4,
            comment: "Андрухович як завжди провокує. Стильно, смішно, гірко.",
            date: "2025-05-28"
        }
    ];
    
    const customerReviews = allReviews.filter(review => review.customer_id === customerId);
    
    res.json(customerReviews);
});

// Оновити відгук
app.put("/api/reviews/:id", (req, res) => {
    const { rating, comment } = req.body;
    
    res.json({
        message: "Відгук оновлено",
        review_id: req.params.id,
        updated_fields: { rating, comment }
    });
});

// Видалити відгук
app.delete("/api/reviews/:id", (req, res) => {
    res.json({ 
        message: "Відгук видалено",
        deleted_id: req.params.id 
    });
});

// ============================================
// 8. СКЛАД (inventory) - 12 операцій
// ============================================

// Отримати весь складський облік
app.get("/api/inventory", (req, res) => {
    const inventory = [
        {
            operation_id: "699e2816829aaaf395b22680",
            book_id: "699e2816829aaaf395b2264f",
            book_title: "Маруся Чурай",
            operation_type: "надходження",
            quantity: 20,
            date: "2025-01-10",
            note: "Початковий залишок"
        },
        {
            operation_id: "699e2816829aaaf395b22681",
            book_id: "699e2816829aaaf395b2264f",
            book_title: "Маруся Чурай",
            operation_type: "продаж",
            quantity: -1,
            date: "2025-02-10",
            order_id: "ORD-2025-001",
            note: "Продаж у замовленні ORD-2025-001"
        },
        {
            operation_id: "699e2816829aaaf395b22682",
            book_id: "699e2816829aaaf395b22650",
            book_title: "Ворошиловград",
            operation_type: "надходження",
            quantity: 10,
            date: "2025-01-15",
            note: "Початковий залишок"
        },
        {
            operation_id: "699e2816829aaaf395b22683",
            book_id: "699e2816829aaaf395b22650",
            book_title: "Ворошиловград",
            operation_type: "продаж",
            quantity: -1,
            date: "2025-03-15",
            order_id: "ORD-2025-002",
            note: "Продаж у замовленні ORD-2025-002"
        },
        {
            operation_id: "699e2816829aaaf395b22684",
            book_id: "699e2816829aaaf395b22650",
            book_title: "Ворошиловград",
            operation_type: "продаж",
            quantity: -1,
            date: "2025-05-25",
            order_id: "ORD-2025-004",
            note: "Продаж у замовленні ORD-2025-004"
        },
        {
            operation_id: "699e2816829aaaf395b22685",
            book_id: "699e2816829aaaf395b22651",
            book_title: "Кобзар",
            operation_type: "надходження",
            quantity: 30,
            date: "2025-01-05",
            note: "Початковий залишок"
        },
        {
            operation_id: "699e2816829aaaf395b22686",
            book_id: "699e2816829aaaf395b22651",
            book_title: "Кобзар",
            operation_type: "продаж",
            quantity: -2,
            date: "2025-02-10",
            order_id: "ORD-2025-001",
            note: "Продаж у замовленні ORD-2025-001"
        },
        {
            operation_id: "699e2816829aaaf395b22687",
            book_id: "699e2816829aaaf395b22652",
            book_title: "Музей покинутих секретів",
            operation_type: "надходження",
            quantity: 6,
            date: "2025-01-20",
            note: "Початковий залишок"
        },
        {
            operation_id: "699e2816829aaaf395b22688",
            book_id: "699e2816829aaaf395b22652",
            book_title: "Музей покинутих секретів",
            operation_type: "продаж",
            quantity: -1,
            date: "2025-03-20",
            order_id: "ORD-2025-003",
            note: "Продаж у замовленні ORD-2025-003"
        },
        {
            operation_id: "699e2816829aaaf395b22689",
            book_id: "699e2816829aaaf395b22653",
            book_title: "Московіада",
            operation_type: "надходження",
            quantity: 15,
            date: "2025-01-12",
            note: "Початковий залишок"
        },
        {
            operation_id: "699e2816829aaaf395b22690",
            book_id: "699e2816829aaaf395b22653",
            book_title: "Московіада",
            operation_type: "продаж",
            quantity: -1,
            date: "2025-05-25",
            order_id: "ORD-2025-004",
            note: "Продаж у замовленні ORD-2025-004"
        },
        {
            operation_id: "699e2816829aaaf395b22691",
            book_id: "699e2816829aaaf395b2264f",
            book_title: "Маруся Чурай",
            operation_type: "резерв",
            quantity: -2,
            date: "2025-05-26",
            note: "Зарезервовано під нове замовлення"
        }
    ];
    res.json(inventory);
});

// Отримати операцію за ID
app.get("/api/inventory/:id", (req, res) => {
    const operationId = req.params.id;
    
    const operations = {
        "699e2816829aaaf395b22680": {
            operation_id: "699e2816829aaaf395b22680",
            book_id: "699e2816829aaaf395b2264f",
            book_title: "Маруся Чурай",
            operation_type: "надходження",
            quantity: 20,
            date: "2025-01-10",
            note: "Початковий залишок"
        },
        "699e2816829aaaf395b22681": {
            operation_id: "699e2816829aaaf395b22681",
            book_id: "699e2816829aaaf395b2264f",
            book_title: "Маруся Чурай",
            operation_type: "продаж",
            quantity: -1,
            date: "2025-02-10",
            order_id: "ORD-2025-001",
            note: "Продаж у замовленні ORD-2025-001"
        }
    };
    
    res.json(operations[operationId] || { error: "Операцію не знайдено" });
});

// Оприбуткувати товар
app.post("/api/inventory/arrival", (req, res) => {
    const { book_id, quantity, note } = req.body;
    
    res.status(201).json({
        message: "Товар оприбутковано",
        operation_id: "699e2816829aaaf395b" + Math.floor(Math.random() * 1000),
        book_id: book_id,
        added_quantity: quantity,
        note: note,
        operation_date: new Date().toISOString().split('T')[0]
    });
});

// Додати операцію на складі
app.post("/api/inventory", (req, res) => {
    const { book_id, operation_type, quantity, note } = req.body;
    
    res.status(201).json({
        operation_id: "699e2816829aaaf395b" + Math.floor(Math.random() * 1000),
        book_id: book_id,
        operation_type: operation_type,
        quantity: quantity,
        date: new Date().toISOString().split('T')[0],
        note: note,
        message: "Операцію додано"
    });
});

// Оновити складську операцію
app.put("/api/inventory/:id", (req, res) => {
    const updates = req.body;
    
    res.json({
        message: "Операцію оновлено",
        operation_id: req.params.id,
        updated_fields: updates
    });
});

// Видалити складську операцію
app.delete("/api/inventory/:id", (req, res) => {
    res.json({
        message: "Операцію видалено",
        deleted_id: req.params.id
    });
});

// Отримати історію руху товару
app.get("/api/inventory/book/:bookId", (req, res) => {
    const bookId = req.params.bookId;
    
    const historyData = {
        "699e2816829aaaf395b2264f": {
            book_title: "Маруся Чурай",
            operations: [
                { date: "2025-01-10", operation: "надходження", quantity: 20, note: "Початковий залишок" },
                { date: "2025-02-10", operation: "продаж", quantity: -1, note: "Замовлення ORD-2025-001" },
                { date: "2025-05-26", operation: "резерв", quantity: -2, note: "Зарезервовано під нове замовлення" }
            ]
        },
        "699e2816829aaaf395b22650": {
            book_title: "Ворошиловград",
            operations: [
                { date: "2025-01-15", operation: "надходження", quantity: 10, note: "Початковий залишок" },
                { date: "2025-03-15", operation: "продаж", quantity: -1, note: "Замовлення ORD-2025-002" },
                { date: "2025-05-25", operation: "продаж", quantity: -1, note: "Замовлення ORD-2025-004" }
            ]
        },
        "699e2816829aaaf395b22651": {
            book_title: "Кобзар",
            operations: [
                { date: "2025-01-05", operation: "надходження", quantity: 30, note: "Початковий залишок" },
                { date: "2025-02-10", operation: "продаж", quantity: -2, note: "Замовлення ORD-2025-001" }
            ]
        },
        "699e2816829aaaf395b22652": {
            book_title: "Музей покинутих секретів",
            operations: [
                { date: "2025-01-20", operation: "надходження", quantity: 6, note: "Початковий залишок" },
                { date: "2025-03-20", operation: "продаж", quantity: -1, note: "Замовлення ORD-2025-003" }
            ]
        },
        "699e2816829aaaf395b22653": {
            book_title: "Московіада",
            operations: [
                { date: "2025-01-12", operation: "надходження", quantity: 15, note: "Початковий залишок" },
                { date: "2025-05-25", operation: "продаж", quantity: -1, note: "Замовлення ORD-2025-004" }
            ]
        }
    };
    
    const data = historyData[bookId];
    
    if (!data) {
        return res.json({ error: "Книгу не знайдено" });
    }
    
    let currentStock = 0;
    data.operations.forEach(item => {
        currentStock += item.quantity;
    });
    
    res.json({
        book_id: bookId,
        book_title: data.book_title,
        current_stock: currentStock,
        history: data.operations
    });
});

// ============================================
// 9. СТАТИСТИКА ТА АНАЛІТИКА
// ============================================

// Отримати статистику
app.get("/api/stats", (req, res) => {
    res.json({
        total_books: 5,
        total_customers: 5,
        total_orders: 4,
        total_revenue: 2430,
        total_reviews: 7,
        inventory_operations: 12,
        popular_books: [
            { title: "Кобзар", author: "Тарас Шевченко", sales: 2 },
            { title: "Маруся Чурай", author: "Ліна Костенко", sales: 1 },
            { title: "Ворошиловград", author: "Сергій Жадан", sales: 2 },
            { title: "Музей покинутих секретів", author: "Оксана Забужко", sales: 1 },
            { title: "Московіада", author: "Юрій Андрухович", sales: 1 }
        ],
        popular_categories: [
            { name: "Українська література", count: 5 },
            { name: "Поезія", count: 2 },
            { name: "Детектив", count: 3 },
            { name: "Нон-фікшн", count: 3 },
            { name: "Фантастика", count: 1 }
        ],
        orders_by_status: {
            нове: 1,
            "в обробці": 1,
            доставлено: 2
        }
    });
});

// ============================================
// 10. ГОЛОВНА СТОРІНКА (ФРОНТЕНД)
// ============================================

// Головна сторінка - віддає фронтенд
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================

app.listen(PORT, () => {
    console.log(`============================================`);
    console.log(`Сервер книгарні "Читай-місто" запущено!`);
    console.log(`Порт: ${PORT}`);
    console.log(`Адреса: http://localhost:${PORT}`);
    console.log(`============================================`);
    console.log(`СТАТИСТИКА БАЗИ ДАНИХ:`);
    console.log(`- Автори: 5`);
    console.log(`- Видавництва: 5`);
    console.log(`- Категорії: 7`);
    console.log(`- Клієнти: 5`);
    console.log(`- Книги: 5`);
    console.log(`- Замовлення: 4`);
    console.log(`- Відгуки: 7`);
    console.log(`- Складські операції: 12`);
    console.log(`============================================`);
    console.log(`Доступні endpoints:`);
    console.log(`- http://localhost:${PORT}/api/authors`);
    console.log(`- http://localhost:${PORT}/api/publishers`);
    console.log(`- http://localhost:${PORT}/api/categories`);
    console.log(`- http://localhost:${PORT}/api/customers`);
    console.log(`- http://localhost:${PORT}/api/books`);
    console.log(`- http://localhost:${PORT}/api/orders`);
    console.log(`- http://localhost:${PORT}/api/reviews`);
    console.log(`- http://localhost:${PORT}/api/inventory`);
    console.log(`- http://localhost:${PORT}/api/stats`);
    console.log(`============================================`);
    console.log(`Студент: Дембіцький О.Ю., група ПП-32`);
    console.log(`============================================`);
});