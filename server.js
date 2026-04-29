// ============================================
// Сервер для книгарні "Читай-місто"
// Курсова робота
// Виконав: Дембіцький О.Ю., група ПП-32
// ============================================

require('dotenv').config();

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const dns = require('dns');

// Встановлюємо DNS сервер Google (вирішує проблему ENOTFOUND)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  next();
});

// Підключення до MongoDB Atlas (пароль з .env)
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ Помилка: MONGODB_URI не знайдено в .env файлі!');
  process.exit(1);
}

const client = new MongoClient(uri);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('bookstore_crm');
    console.log('✅ Підключено до MongoDB Atlas');
    console.log('📚 База даних: bookstore_crm');
  } catch (err) {
    console.error('❌ Помилка підключення до MongoDB:', err);
    process.exit(1);
  }
}

// ============================================
// EMAIL — БАЗОВИЙ HTML-ШАБЛОН
// ============================================
function emailBaseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Читай-місто</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#1a1008;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <div style="font-size:32px;margin-bottom:8px;">📚</div>
              <div style="font-family:'Georgia',serif;font-size:26px;font-weight:bold;color:#e8b84b;letter-spacing:2px;">
                Читай-місто
              </div>
              <div style="color:rgba(245,240,232,0.5);font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-top:4px;font-family:Arial,sans-serif;">
                Книгарня · Львів
              </div>
            </td>
          </tr>

          <!-- DECORATIVE STRIPE -->
          <tr>
            <td style="background:linear-gradient(90deg,#8b3a1e,#c8922a,#e8b84b,#c8922a,#8b3a1e);height:4px;"></td>
          </tr>

          <!-- MAIN CONTENT -->
          <tr>
            <td style="background-color:#fffdf8;padding:40px;border-radius:0 0 12px 12px;border:1px solid #ede5d0;border-top:none;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:28px 20px;text-align:center;">
              <p style="color:#7a6e5f;font-size:12px;font-family:Arial,sans-serif;margin:0 0 8px;">
                📍 вул. Книжкова, 7, Львів &nbsp;|&nbsp; 📞 +38 (032) 123-45-67 &nbsp;|&nbsp; ✉️ info@chytai-misto.ua
              </p>
              <p style="color:#a09080;font-size:11px;font-family:Arial,sans-serif;margin:0;">
                © 2026 Читай-місто. Усі права захищені.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================
// EMAIL — ЛИСТ КЛІЄНТУ (підтвердження замовлення)
// ============================================
function buildClientOrderEmail(order) {
  const total = order.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const delivery = total >= 500 ? 0 : 65;
  const grandTotal = total + delivery;

  const itemsRows = order.items.map(i => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #ede5d0;font-family:Arial,sans-serif;font-size:14px;color:#1a1008;">
        📖 ${i.title}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #ede5d0;font-family:Arial,sans-serif;font-size:14px;color:#7a6e5f;text-align:center;">
        ${i.quantity} шт
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #ede5d0;font-family:Arial,sans-serif;font-size:14px;color:#8b3a1e;text-align:right;font-weight:bold;">
        ${i.quantity * i.price} грн
      </td>
    </tr>
  `).join('');

  const content = `
    <!-- GREETING -->
    <h2 style="font-family:'Georgia',serif;color:#1a1008;font-size:22px;margin:0 0 8px;">
      Дякуємо за замовлення! 🎉
    </h2>
    <p style="color:#7a6e5f;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;margin:0 0 28px;">
      Вітаємо, <strong style="color:#1a1008;">${order.customer_name}</strong>! Ваше замовлення успішно прийнято. 
      Ми зв'яжемося з вами найближчим часом для підтвердження.
    </p>

    <!-- ORDER NUMBER BADGE -->
    <div style="background:linear-gradient(135deg,#1a1008,#2d1f0e);border-radius:8px;padding:20px;text-align:center;margin-bottom:28px;">
      <div style="color:rgba(245,240,232,0.6);font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">
        Номер замовлення
      </div>
      <div style="color:#e8b84b;font-family:'Georgia',serif;font-size:24px;font-weight:bold;letter-spacing:2px;">
        ${order.order_number}
      </div>
    </div>

    <!-- BOOKS TABLE -->
    <div style="margin-bottom:24px;">
      <div style="font-family:'Georgia',serif;font-size:15px;color:#1a1008;font-weight:bold;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #c8922a;">
        📦 Ваші книги
      </div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <thead>
          <tr style="background-color:#f5f0e8;">
            <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#7a6e5f;text-transform:uppercase;letter-spacing:1px;text-align:left;">Назва</th>
            <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#7a6e5f;text-transform:uppercase;letter-spacing:1px;text-align:center;">Кіл-ть</th>
            <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#7a6e5f;text-transform:uppercase;letter-spacing:1px;text-align:right;">Сума</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
    </div>

    <!-- TOTALS -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:5px 0;">Товари:</td>
        <td style="font-family:Arial,sans-serif;font-size:13px;color:#1a1008;text-align:right;padding:5px 0;">${total} грн</td>
      </tr>
      <tr>
        <td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:5px 0;">Доставка:</td>
        <td style="font-family:Arial,sans-serif;font-size:13px;color:${delivery === 0 ? '#4a6741' : '#1a1008'};text-align:right;padding:5px 0;">
          ${delivery === 0 ? '🎁 Безкоштовно' : delivery + ' грн'}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="border-top:1px solid #ede5d0;padding-top:10px;"></td>
      </tr>
      <tr>
        <td style="font-family:'Georgia',serif;font-size:17px;color:#1a1008;font-weight:bold;padding:4px 0;">До сплати:</td>
        <td style="font-family:'Georgia',serif;font-size:17px;color:#8b3a1e;font-weight:bold;text-align:right;padding:4px 0;">${grandTotal} грн</td>
      </tr>
    </table>

    <!-- DELIVERY INFO -->
    <div style="background-color:#f5f0e8;border-radius:8px;padding:18px 20px;margin-bottom:20px;border-left:3px solid #c8922a;">
      <div style="font-family:'Georgia',serif;font-size:13px;font-weight:bold;color:#1a1008;margin-bottom:10px;">🚚 Деталі доставки</div>
      <div style="font-family:Arial,sans-serif;font-size:13px;color:#3d3020;line-height:1.8;">
        <span style="color:#7a6e5f;">Адреса:</span> ${order.delivery_address}<br>
        <span style="color:#7a6e5f;">Оплата:</span> ${order.payment_method}
      </div>
    </div>

    <p style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;line-height:1.6;margin:0;text-align:center;">
      Маєте питання? Звертайтесь: <a href="tel:+380321234567" style="color:#c8922a;text-decoration:none;">+38 (032) 123-45-67</a> або 
      <a href="mailto:orders@chytai-misto.ua" style="color:#c8922a;text-decoration:none;">orders@chytai-misto.ua</a>
    </p>
  `;

  return emailBaseTemplate(content);
}

// ============================================
// EMAIL — ЛИСТ АДМІНУ (нове замовлення)
// ============================================
function buildAdminOrderEmail(order) {
  const total = order.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const delivery = total >= 500 ? 0 : 65;
  const grandTotal = total + delivery;

  const itemsRows = order.items.map(i => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #ede5d0;font-family:Arial,sans-serif;font-size:14px;color:#1a1008;">
        📖 ${i.title}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #ede5d0;font-family:Arial,sans-serif;font-size:14px;color:#7a6e5f;text-align:center;">
        ${i.quantity} шт × ${i.price} грн
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #ede5d0;font-family:Arial,sans-serif;font-size:14px;color:#8b3a1e;text-align:right;font-weight:bold;">
        ${i.quantity * i.price} грн
      </td>
    </tr>
  `).join('');

  const content = `
    <!-- ALERT BADGE -->
    <div style="background:linear-gradient(135deg,#8b3a1e,#c8922a);border-radius:8px;padding:16px 20px;margin-bottom:28px;text-align:center;">
      <div style="color:#fff;font-family:Arial,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">
        🔔 Нове замовлення на сайті!
      </div>
    </div>

    <!-- ORDER NUMBER -->
    <div style="background:linear-gradient(135deg,#1a1008,#2d1f0e);border-radius:8px;padding:20px;text-align:center;margin-bottom:28px;">
      <div style="color:rgba(245,240,232,0.6);font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">
        Номер замовлення
      </div>
      <div style="color:#e8b84b;font-family:'Georgia',serif;font-size:24px;font-weight:bold;letter-spacing:2px;">
        ${order.order_number}
      </div>
    </div>

    <!-- CLIENT INFO -->
    <div style="margin-bottom:24px;">
      <div style="font-family:'Georgia',serif;font-size:15px;color:#1a1008;font-weight:bold;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #c8922a;">
        👤 Дані клієнта
      </div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:5px 0;width:120px;">Ім'я:</td>
          <td style="font-family:Arial,sans-serif;font-size:13px;color:#1a1008;padding:5px 0;font-weight:bold;">${order.customer_name}</td>
        </tr>
        <tr>
          <td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:5px 0;">Телефон:</td>
          <td style="font-family:Arial,sans-serif;font-size:13px;color:#1a1008;padding:5px 0;">${order.phone || '—'}</td>
        </tr>
        <tr>
          <td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:5px 0;">Email:</td>
          <td style="font-family:Arial,sans-serif;font-size:13px;color:#1a1008;padding:5px 0;">${order.email || '—'}</td>
        </tr>
        <tr>
          <td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:5px 0;">Доставка:</td>
          <td style="font-family:Arial,sans-serif;font-size:13px;color:#1a1008;padding:5px 0;">${order.delivery_address}</td>
        </tr>
        <tr>
          <td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:5px 0;">Оплата:</td>
          <td style="font-family:Arial,sans-serif;font-size:13px;color:#1a1008;padding:5px 0;">${order.payment_method}</td>
        </tr>
      </table>
    </div>

    <!-- BOOKS TABLE -->
    <div style="margin-bottom:24px;">
      <div style="font-family:'Georgia',serif;font-size:15px;color:#1a1008;font-weight:bold;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #c8922a;">
        📦 Замовлені товари
      </div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <thead>
          <tr style="background-color:#f5f0e8;">
            <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#7a6e5f;text-transform:uppercase;letter-spacing:1px;text-align:left;">Назва</th>
            <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#7a6e5f;text-transform:uppercase;letter-spacing:1px;text-align:center;">Кількість / ціна</th>
            <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#7a6e5f;text-transform:uppercase;letter-spacing:1px;text-align:right;">Сума</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
    </div>

    <!-- TOTALS -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:5px 0;">Сума товарів:</td>
        <td style="font-family:Arial,sans-serif;font-size:13px;color:#1a1008;text-align:right;padding:5px 0;">${total} грн</td>
      </tr>
      <tr>
        <td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:5px 0;">Доставка:</td>
        <td style="font-family:Arial,sans-serif;font-size:13px;color:${delivery === 0 ? '#4a6741' : '#1a1008'};text-align:right;padding:5px 0;">
          ${delivery === 0 ? 'Безкоштовно' : delivery + ' грн'}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="border-top:1px solid #ede5d0;padding-top:10px;"></td>
      </tr>
      <tr>
        <td style="font-family:'Georgia',serif;font-size:17px;color:#1a1008;font-weight:bold;padding:4px 0;">Разом до оплати:</td>
        <td style="font-family:'Georgia',serif;font-size:17px;color:#8b3a1e;font-weight:bold;text-align:right;padding:4px 0;">${grandTotal} грн</td>
      </tr>
    </table>
  `;

  return emailBaseTemplate(content);
}

// ============================================
// EMAIL — ЗВОРОТНІЙ ЗВ'ЯЗОК (адміну)
// ============================================
function buildContactEmail(name, email, message) {
  const content = `
    <!-- BADGE -->
    <div style="background:linear-gradient(135deg,#4a6741,#6a8f60);border-radius:8px;padding:16px 20px;margin-bottom:28px;text-align:center;">
      <div style="color:#fff;font-family:Arial,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">
        ✉️ Нове повідомлення від відвідувача
      </div>
    </div>

    <h2 style="font-family:'Georgia',serif;color:#1a1008;font-size:20px;margin:0 0 24px;">
      Хтось написав вам із сайту!
    </h2>

    <!-- SENDER INFO -->
    <div style="background-color:#f5f0e8;border-radius:8px;padding:18px 20px;margin-bottom:24px;border-left:3px solid #c8922a;">
      <div style="font-family:'Georgia',serif;font-size:13px;font-weight:bold;color:#1a1008;margin-bottom:12px;">👤 Відправник</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:4px 0;width:80px;">Ім'я:</td>
          <td style="font-family:Arial,sans-serif;font-size:13px;color:#1a1008;padding:4px 0;font-weight:bold;">${name}</td>
        </tr>
        <tr>
          <td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:4px 0;">Email:</td>
          <td style="font-family:Arial,sans-serif;font-size:13px;padding:4px 0;">
            ${email
              ? `<a href="mailto:${email}" style="color:#c8922a;text-decoration:none;">${email}</a>`
              : '<span style="color:#a09080;">не вказано</span>'
            }
          </td>
        </tr>
      </table>
    </div>

    <!-- MESSAGE -->
    <div style="margin-bottom:20px;">
      <div style="font-family:'Georgia',serif;font-size:15px;color:#1a1008;font-weight:bold;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #c8922a;">
        💬 Повідомлення
      </div>
      <div style="background-color:#fffdf8;border:1px solid #ede5d0;border-radius:8px;padding:20px;font-family:Arial,sans-serif;font-size:14px;color:#3d3020;line-height:1.8;white-space:pre-wrap;">
${message}
      </div>
    </div>

    <p style="font-family:Arial,sans-serif;font-size:12px;color:#a09080;text-align:center;margin:0;">
      Повідомлення надіслано через форму зворотного зв'язку на сайті chytai-misto.ua
    </p>
  `;

  return emailBaseTemplate(content);
}

// ============================================
// NODEMAILER — налаштування
// ============================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

async function sendOrderEmails(order) {
  // Лист адміну
  await transporter.sendMail({
    from: `"Читай-місто" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `📦 Нове замовлення ${order.order_number} від ${order.customer_name}`,
    html: buildAdminOrderEmail(order)
  });

  // Лист клієнту (тільки якщо вказав email)
  if (order.email) {
    await transporter.sendMail({
      from: `"Читай-місто" <${process.env.GMAIL_USER}>`,
      to: order.email,
      subject: `✅ Ваше замовлення ${order.order_number} прийнято — Читай-місто`,
      html: buildClientOrderEmail(order)
    });
  }
}

// ============================================
// 1. АВТОРИ
// ============================================
app.get('/api/authors', async (req, res) => {
  try {
    const authors = await db.collection('authors').find().toArray();
    res.json(authors.map(a => ({
      author_id: a._id.toString(),
      name: a.name,
      biography: a.biography,
      birth_year: a.birth_year,
      country: a.country
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/authors/:id', async (req, res) => {
  try {
    const author = await db.collection('authors').findOne({ _id: new ObjectId(req.params.id) });
    if (!author) return res.json({ error: 'Автора не знайдено' });
    res.json({
      author_id: author._id.toString(),
      name: author.name,
      biography: author.biography,
      birth_year: author.birth_year,
      country: author.country
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 2. ВИДАВНИЦТВА
// ============================================
app.get('/api/publishers', async (req, res) => {
  try {
    const publishers = await db.collection('publishers').find().toArray();
    res.json(publishers.map(p => ({
      publisher_id: p._id.toString(),
      name: p.name,
      contact: p.contact,
      website: p.website,
      city: p.city
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/publishers/:id', async (req, res) => {
  try {
    const publisher = await db.collection('publishers').findOne({ _id: new ObjectId(req.params.id) });
    if (!publisher) return res.json({ error: 'Видавництво не знайдено' });
    res.json({
      publisher_id: publisher._id.toString(),
      name: publisher.name,
      contact: publisher.contact,
      website: publisher.website,
      city: publisher.city
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 3. КАТЕГОРІЇ
// ============================================
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.collection('categories').find().toArray();
    res.json(categories.map(c => ({
      category_id: c._id.toString(),
      name: c.name,
      description: c.description
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const category = await db.collection('categories').findOne({ _id: new ObjectId(req.params.id) });
    if (!category) return res.json({ error: 'Категорію не знайдено' });
    res.json({
      category_id: category._id.toString(),
      name: category.name,
      description: category.description
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 4. КЛІЄНТИ
// ============================================
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await db.collection('customers').find().toArray();
    res.json(customers.map(c => ({
      customer_id: c._id.toString(),
      full_name: c.full_name,
      email: c.email,
      phone: c.phone,
      delivery_address: c.delivery_address,
      registration_date: c.registration_date,
      total_orders: c.total_orders
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await db.collection('customers').findOne({ _id: new ObjectId(req.params.id) });
    if (!customer) return res.json({ error: 'Клієнта не знайдено' });
    res.json({
      customer_id: customer._id.toString(),
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      delivery_address: customer.delivery_address,
      registration_date: customer.registration_date,
      total_orders: customer.total_orders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 5. КНИГИ — ГОЛОВНИЙ СПИСОК
// ============================================
app.get('/api/books', async (req, res) => {
  try {
    const books = await db.collection('books').find().toArray();
    const authors = await db.collection('authors').find().toArray();
    const authorMap = {};
    authors.forEach(a => { authorMap[a._id.toString()] = a.name; });

    const result = books.map(book => ({
      book_id: book._id.toString(),
      title: book.title,
      author: authorMap[book.author_id?.toString()] || 'Невідомий автор',
      price: book.price,
      stock: book.stock,
      category: book.category_ids ? 'Категорії' : '',
      year: book.year,
      isbn: book.isbn
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 5b. ПОШУК КНИГ
// ============================================
app.get('/api/books/search/:query', async (req, res) => {
  try {
    const q = req.params.query.toLowerCase();
    const books = await db.collection('books').find().toArray();
    const authors = await db.collection('authors').find().toArray();
    const authorMap = {};
    authors.forEach(a => { authorMap[a._id.toString()] = a.name; });

    const results = books.filter(b => {
      const titleMatch = b.title.toLowerCase().includes(q);
      const authorName = authorMap[b.author_id?.toString()] || '';
      const authorMatch = authorName.toLowerCase().includes(q);
      return titleMatch || authorMatch;
    });

    res.json({
      query: q,
      count: results.length,
      results: results.map(b => ({
        book_id: b._id.toString(),
        title: b.title,
        author: authorMap[b.author_id?.toString()] || '',
        price: b.price,
        stock: b.stock
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 5c. ОДНА КНИГА З ДЕТАЛЯМИ
// ============================================
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.json({ error: 'Книгу не знайдено' });

    const author = book.author_id ? await db.collection('authors').findOne({ _id: book.author_id }) : null;
    const publisher = book.publisher_id ? await db.collection('publishers').findOne({ _id: book.publisher_id }) : null;
    const categories = book.category_ids?.length
      ? await db.collection('categories').find({ _id: { $in: book.category_ids } }).toArray()
      : [];

    res.json({
      book_id: book._id.toString(),
      title: book.title,
      price: book.price,
      purchase_price: book.purchase_price,
      stock: book.stock,
      isbn: book.isbn,
      year: book.year,
      pages: book.pages,
      description: book.description,
      author: author ? {
        author_id: author._id.toString(),
        name: author.name,
        biography: author.biography,
        birth_year: author.birth_year,
        country: author.country
      } : null,
      publisher: publisher ? {
        publisher_id: publisher._id.toString(),
        name: publisher.name,
        city: publisher.city,
        website: publisher.website
      } : null,
      categories: categories.map(c => ({
        category_id: c._id.toString(),
        name: c.name
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 5d. ПОПОВНЕННЯ СКЛАДУ (для менеджера)
// ============================================
app.patch('/api/books/:id/stock', async (req, res) => {
  try {
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity === 0) {
      return res.status(400).json({ error: 'Вкажіть кількість (число, не нуль)' });
    }

    const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.status(404).json({ error: 'Книгу не знайдено' });

    const newStock = book.stock + quantity;
    if (newStock < 0) {
      return res.status(400).json({
        error: `Неможливо зменшити склад: зараз ${book.stock} шт, ви намагаєтесь зняти ${Math.abs(quantity)} шт`
      });
    }

    await db.collection('books').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { stock: quantity } }
    );

    res.json({
      message: 'Склад оновлено',
      book_id: req.params.id,
      title: book.title,
      old_stock: book.stock,
      change: quantity > 0 ? `+${quantity}` : `${quantity}`,
      new_stock: newStock
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 6. ЗАМОВЛЕННЯ
// ============================================
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.collection('orders').find().toArray();
    res.json(orders.map(o => ({
      order_id: o._id.toString(),
      ...o,
      _id: undefined
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });
    if (!order) return res.json({ error: 'Замовлення не знайдено' });
    res.json({
      order_id: order._id.toString(),
      ...order,
      _id: undefined
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_id, items, delivery_address, payment_method, customer_name, phone, email } = req.body;

    // ПЕРЕВІРКА НАЯВНОСТІ КНИГ НА СКЛАДІ
    for (const item of (items || [])) {
      let book;
      try {
        book = await db.collection('books').findOne({ _id: new ObjectId(item.book_id) });
      } catch {
        return res.status(400).json({ error: `Невірний ID книги: ${item.book_id}` });
      }

      if (!book) {
        return res.status(400).json({ error: `Книгу "${item.title}" не знайдено` });
      }

      if (book.stock < item.quantity) {
        if (book.stock === 0) {
          return res.status(400).json({
            error: `Книга "${item.title}" закінчилась на складі`
          });
        }
        return res.status(400).json({
          error: `Книга "${item.title}": доступно лише ${book.stock} шт, а ви замовили ${item.quantity} шт`
        });
      }
    }

    // ЗМЕНШУЄМО STOCK ДЛЯ КОЖНОЇ КНИГИ
    for (const item of (items || [])) {
      await db.collection('books').updateOne(
        { _id: new ObjectId(item.book_id) },
        { $inc: { stock: -item.quantity } }
      );
    }

    // СТВОРЮЄМО ЗАМОВЛЕННЯ
    const total = (items || []).reduce((s, i) => s + (i.price * i.quantity), 0);
    const orderNumber = 'ORD-2026-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0');

    const newOrder = {
      order_number: orderNumber,
      customer_id: customer_id || 'guest',
      customer_name: customer_name || 'Гість',
      phone: phone || '',
      email: email || '',
      status: 'нове',
      total_amount: total,
      order_date: new Date().toISOString().split('T')[0],
      items: items || [],
      delivery_address: delivery_address || '',
      payment_method: payment_method || 'готівка при отриманні',
      payment_status: 'очікується'
    };

    const result = await db.collection('orders').insertOne(newOrder);

    // Відправка email сповіщень
    try {
      await sendOrderEmails(newOrder);
      console.log('✅ Emails відправлено для замовлення', newOrder.order_number);
    } catch (emailErr) {
      console.warn('⚠️ Помилка відправки email:', emailErr.message);
    }

    res.status(201).json({
      message: 'Замовлення створено',
      order: { ...newOrder, order_id: result.insertedId.toString() }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 7. ВІДГУКИ
// ============================================
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await db.collection('reviews').find().toArray();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reviews/book/:bookId', async (req, res) => {
  try {
    const bookOid = new ObjectId(req.params.bookId);
    const reviews = await db.collection('reviews').find({ book_id: bookOid }).toArray();
    const customers = await db.collection('customers').find().toArray();
    const customerMap = {};
    customers.forEach(c => { customerMap[c._id.toString()] = c.full_name; });

    const enriched = reviews.map(r => ({
      customer: customerMap[r.customer_id?.toString()] || 'Покупець',
      rating: r.rating,
      comment: r.comment,
      date: r.date || r.created_at?.split('T')[0] || ''
    }));

    const avgRating = enriched.length
      ? enriched.reduce((s, r) => s + r.rating, 0) / enriched.length
      : 0;

    res.json({
      book_id: req.params.bookId,
      average_rating: avgRating,
      total_reviews: enriched.length,
      reviews: enriched
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 8. СКЛАД
// ============================================
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await db.collection('inventory').find().toArray();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 9. СТАТИСТИКА
// ============================================
app.get('/api/stats', async (req, res) => {
  try {
    const [totalBooks, totalCustomers, totalOrders, totalReviews] = await Promise.all([
      db.collection('books').countDocuments(),
      db.collection('customers').countDocuments(),
      db.collection('orders').countDocuments(),
      db.collection('reviews').countDocuments()
    ]);

    const orders = await db.collection('orders').find({ payment_status: 'оплачено' }).toArray();
    const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);

    res.json({
      total_books: totalBooks,
      total_customers: totalCustomers,
      total_orders: totalOrders,
      total_reviews: totalReviews,
      total_revenue: totalRevenue,
      inventory_operations: 12
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 10. ФОРМА КОНТАКТІВ
// ============================================
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !message) return res.status(400).json({ error: 'Заповніть усі поля' });

    await transporter.sendMail({
      from: `"Читай-місто" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `✉️ Нове повідомлення від ${name} — Читай-місто`,
      html: buildContactEmail(name, email, message)
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// API HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: !!db, port: PORT });
});

// ============================================
// ГОЛОВНА СТОРІНКА (має бути ОСТАННІМ)
// ============================================
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log('============================================');
    console.log('Сервер книгарні "Читай-місто" запущено!');
    console.log(`Порт: ${PORT}`);
    console.log(`Адреса: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api/books`);
    console.log('============================================');
  });
}

startServer();