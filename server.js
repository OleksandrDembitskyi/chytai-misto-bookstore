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
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'readcity_secret_2026';

// ─── Cloudinary (зображення книг) ──────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'bookstore_crm/books',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 500, height: 700, crop: 'limit' }]
    }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Middleware ────────────────────────────
app.use(express.json());
app.use(express.static('public'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// ─── MongoDB ───────────────────────────────
const uri = process.env.MONGODB_URI;
if (!uri) { console.error('❌ MONGODB_URI не знайдено!'); process.exit(1); }
const client = new MongoClient(uri);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('bookstore_crm');
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        console.log('✅ Підключено до MongoDB Atlas — bookstore_crm');
    } catch (err) {
        console.error('❌ MongoDB:', err.message);
        process.exit(1);
    }
}

// ============================================
//  JWT MIDDLEWARE
// ============================================
function authMiddleware(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Необхідна авторизація' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Невалідний або прострочений токен' });
    }
}

function optionalAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
        try { req.user = jwt.verify(token, JWT_SECRET); } catch { }
    }
    next();
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role))
            return res.status(403).json({ error: 'Доступ заборонено' });
        next();
    };
}

// ============================================
//  EMAIL TEMPLATES
// ============================================
function emailBase(content) {
    return `<!DOCTYPE html><html lang="uk"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px;">
    <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <tr><td style="background:#1a1008;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
                <div style="font-size:32px;">📚</div>
                <div style="font-family:Georgia,serif;font-size:26px;font-weight:bold;color:#e8b84b;letter-spacing:2px;">Читай-місто</div>
                <div style="color:rgba(245,240,232,0.5);font-size:12px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Книгарня · Львів</div>
            </td></tr>
            <tr><td style="background:linear-gradient(90deg,#8b3a1e,#c8922a,#e8b84b,#c8922a,#8b3a1e);height:4px;"></td></tr>
            <tr><td style="background:#fffdf8;padding:40px;border-radius:0 0 12px 12px;border:1px solid #ede5d0;border-top:none;">${content}</td></tr>
            <tr><td style="padding:20px;text-align:center;">
                <p style="color:#7a6e5f;font-size:12px;font-family:Arial,sans-serif;margin:0;">
                    📍 вул. Книжкова, 7, Львів &nbsp;|&nbsp; 📞 +38 (032) 123-45-67 &nbsp;|&nbsp; ✉️ info@chytai-misto.ua
                </p>
                <p style="color:#a09080;font-size:11px;font-family:Arial,sans-serif;margin:4px 0 0;">© 2026 Читай-місто.</p>
            </td></tr>
        </table>
    </tr></table>
</tr>
</body></html>`;
}

function buildClientOrderEmail(order) {
    const total = order.items.reduce((s, i) => s + i.quantity * i.price, 0);
    const delivery = total >= 500 ? 0 : 65;
    const rows = order.items.map(i =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #ede5d0;font-family:Arial,sans-serif;font-size:14px;">📖 ${i.title}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #ede5d0;font-family:Arial,sans-serif;font-size:14px;text-align:center;">${i.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #ede5d0;font-family:Arial,sans-serif;font-size:14px;color:#8b3a1e;text-align:right;font-weight:bold;">${i.quantity * i.price} грн</td></tr>`
    ).join('');
    return emailBase(`
        <h2 style="font-family:Georgia,serif;color:#1a1008;font-size:22px;margin:0 0 8px;">Дякуємо за замовлення! 🎉</h2>
        <p style="color:#7a6e5f;font-family:Arial,sans-serif;font-size:14px;margin:0 0 24px;">Вітаємо, <strong>${order.customer_name}</strong>! Ваше замовлення прийнято.</p>
        <div style="background:#1a1008;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
            <div style="color:rgba(245,240,232,0.6);font-size:11px;letter-spacing:3px;font-family:Arial,sans-serif;">НОМЕР ЗАМОВЛЕННЯ</div>
            <div style="color:#e8b84b;font-family:Georgia,serif;font-size:24px;font-weight:bold;">${order.order_number}</div>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0"><thead><tr style="background:#f5f0e8;">
            <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#7a6e5f;text-align:left;">Назва</th>
            <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#7a6e5f;text-align:center;">Кіл-ть</th>
            <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#7a6e5f;text-align:right;">Сума</th>
        </tr></thead><tbody>${rows}</tbody></table>
        <div style="margin-top:16px;font-family:Arial,sans-serif;font-size:14px;">
            <div>Доставка: ${delivery === 0 ? '🎁 Безкоштовно' : delivery + ' грн'}</div>
            <div style="font-size:17px;font-weight:bold;color:#8b3a1e;">Разом: ${total + delivery} грн</div>
        </div>
        <div style="background:#f5f0e8;border-left:3px solid #c8922a;padding:14px 16px;margin-top:20px;border-radius:0 8px 8px 0;font-family:Arial,sans-serif;font-size:13px;">
            🚚 ${order.delivery_address}<br>💳 ${order.payment_method}
        </div>
    `);
}

function buildAdminOrderEmail(order) {
    const total = order.items.reduce((s, i) => s + i.quantity * i.price, 0);
    const delivery = total >= 500 ? 0 : 65;
    const rows = order.items.map(i =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #ede5d0;font-family:Arial,sans-serif;font-size:14px;">📖 ${i.title}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #ede5d0;font-family:Arial,sans-serif;font-size:14px;text-align:center;">${i.quantity} × ${i.price} грн</td>
        <td style="padding:8px 12px;border-bottom:1px solid #ede5d0;font-family:Arial,sans-serif;font-size:14px;color:#8b3a1e;text-align:right;font-weight:bold;">${i.quantity * i.price} грн</td></tr>`
    ).join('');
    return emailBase(`
        <div style="background:linear-gradient(135deg,#8b3a1e,#c8922a);border-radius:8px;padding:14px;margin-bottom:24px;text-align:center;color:#fff;font-family:Arial,sans-serif;font-size:13px;letter-spacing:2px;font-weight:bold;">🔔 НОВЕ ЗАМОВЛЕННЯ</div>
        <div style="background:#1a1008;border-radius:8px;padding:16px;text-align:center;margin-bottom:20px;">
            <div style="color:rgba(245,240,232,0.6);font-size:11px;font-family:Arial,sans-serif;">НОМЕР</div>
            <div style="color:#e8b84b;font-family:Georgia,serif;font-size:22px;font-weight:bold;">${order.order_number}</div>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:4px 0;width:100px;">Клієнт:</td><td style="font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">${order.customer_name}</td></tr>
            <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:4px 0;">Телефон:</td><td style="font-family:Arial,sans-serif;font-size:13px;">${order.phone || '—'}</td></tr>
            <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:4px 0;">Email:</td><td style="font-family:Arial,sans-serif;font-size:13px;">${order.email || '—'}</td></tr>
            <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:4px 0;">Доставка:</td><td style="font-family:Arial,sans-serif;font-size:13px;">${order.delivery_address}</td></tr>
            <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#7a6e5f;padding:4px 0;">Оплата:</td><td style="font-family:Arial,sans-serif;font-size:13px;">${order.payment_method}</td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0"><thead><tr style="background:#f5f0e8;">
            <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#7a6e5f;text-align:left;">Книга</th>
            <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#7a6e5f;text-align:center;">Кількість</th>
            <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#7a6e5f;text-align:right;">Сума</th>
        </tr></thead><tbody>${rows}</tbody></table>
        <div style="margin-top:14px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#8b3a1e;">
            Разом: ${total + delivery} грн ${delivery === 0 ? '(доставка безкоштовна)' : `(доставка ${delivery} грн)`}
        </div>
    `);
}

function buildContactEmail(name, email, message) {
    return emailBase(`
        <div style="background:linear-gradient(135deg,#4a6741,#6a8f60);border-radius:8px;padding:14px;margin-bottom:24px;text-align:center;color:#fff;font-family:Arial,sans-serif;font-size:13px;letter-spacing:2px;font-weight:bold;">✉️ НОВЕ ПОВІДОМЛЕННЯ З САЙТУ</div>
        <div style="background:#f5f0e8;border-left:3px solid #c8922a;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;font-family:Arial,sans-serif;font-size:13px;">
            <div><strong>Ім'я:</strong> ${name}</div>
            <div><strong>Email:</strong> ${email || '—'}</div>
        </div>
        <div style="background:#fffdf8;border:1px solid #ede5d0;border-radius:8px;padding:20px;font-family:Arial,sans-serif;font-size:14px;color:#3d3020;line-height:1.8;white-space:pre-wrap;">${message}</div>
    `);
}

// ─── Nodemailer ────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
});

async function sendOrderEmails(order) {
    await transporter.sendMail({
        from: `"Читай-місто" <${process.env.GMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `📦 Нове замовлення ${order.order_number} від ${order.customer_name}`,
        html: buildAdminOrderEmail(order)
    });
    if (order.email) {
        await transporter.sendMail({
            from: `"Читай-місто" <${process.env.GMAIL_USER}>`,
            to: order.email,
            subject: `✅ Замовлення ${order.order_number} прийнято — Читай-місто`,
            html: buildClientOrderEmail(order)
        });
    }
}

// ============================================
//  AUTH ENDPOINTS
// ============================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ error: 'Заповніть усі поля' });
        if (password.length < 6)
            return res.status(400).json({ error: 'Пароль мінімум 6 символів' });

        const count = await db.collection('users').countDocuments();
        const role = count === 0 ? 'admin' : 'user';

        const passwordHash = await bcrypt.hash(password, 12);
        const result = await db.collection('users').insertOne({
            name, email: email.toLowerCase(), passwordHash, role,
            createdAt: new Date().toISOString()
        });
        const token = jwt.sign(
            { userId: result.insertedId.toString(), email: email.toLowerCase(), name, role },
            JWT_SECRET, { expiresIn: '7d' }
        );
        res.status(201).json({ token, user: { id: result.insertedId.toString(), name, email, role } });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: 'Email вже зареєстровано' });
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Введіть email та пароль' });

        const user = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ error: 'Невірний email або пароль' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Невірний email або пароль' });

        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email, name: user.name, role: user.role },
            JWT_SECRET, { expiresIn: '7d' }
        );
        res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
        if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });
        res.json({ id: user._id.toString(), name: user.name, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
//  АВТОРИ
// ============================================
app.get('/api/authors', async (req, res) => {
    try {
        const authors = await db.collection('authors').find().toArray();
        res.json(authors.map(a => ({
            author_id: a._id.toString(), name: a.name,
            biography: a.biography, birth_year: a.birth_year, country: a.country
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/authors/:id', async (req, res) => {
    try {
        const a = await db.collection('authors').findOne({ _id: new ObjectId(req.params.id) });
        if (!a) return res.json({ error: 'Не знайдено' });
        res.json({ author_id: a._id.toString(), name: a.name, biography: a.biography, birth_year: a.birth_year, country: a.country });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/authors', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { name, biography, birth_year, country } = req.body;
        if (!name || String(name).trim().length < 2)
            return res.status(400).json({ error: "Ім'я автора обов'язкове (мін. 2 символи)" });

        const doc = {
            name: String(name).trim(),
            biography: biography || '',
            birth_year: birth_year ? Number(birth_year) : null,
            country: country || '',
            createdAt: new Date().toISOString()
        };
        const result = await db.collection('authors').insertOne(doc);
        res.status(201).json({ message: 'Автора додано', author_id: result.insertedId.toString(), ...doc });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/authors/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { name, biography, birth_year, country } = req.body;
        if (!name || String(name).trim().length < 2)
            return res.status(400).json({ error: "Ім'я автора обов'язкове" });

        const update = {
            name: String(name).trim(),
            biography: biography || '',
            birth_year: birth_year ? Number(birth_year) : null,
            country: country || '',
            updatedAt: new Date().toISOString()
        };
        await db.collection('authors').updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
        res.json({ message: 'Автора оновлено', author_id: req.params.id, ...update });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/authors/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const a = await db.collection('authors').findOne({ _id: new ObjectId(req.params.id) });
        if (!a) return res.status(404).json({ error: 'Автора не знайдено' });
        await db.collection('authors').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Автора видалено', author_id: req.params.id, name: a.name });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
//  ВИДАВНИЦТВА
// ============================================
app.get('/api/publishers', async (req, res) => {
    try {
        const p = await db.collection('publishers').find().toArray();
        res.json(p.map(x => ({
            publisher_id: x._id.toString(),
            name: x.name,
            contact: x.contact || '',
            website: x.website || '',
            city: x.city || ''
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/publishers/:id', async (req, res) => {
    try {
        const p = await db.collection('publishers').findOne({ _id: new ObjectId(req.params.id) });
        if (!p) return res.json({ error: 'Не знайдено' });
        res.json({
            publisher_id: p._id.toString(),
            name: p.name,
            contact: p.contact || '',
            website: p.website || '',
            city: p.city || ''
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/publishers', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { name, contact, website, city } = req.body;
        if (!name || String(name).trim().length < 2)
            return res.status(400).json({ error: 'Назва видавництва обов\'язкова (мін. 2 символи)' });

        const existing = await db.collection('publishers').findOne({
            name: { $regex: new RegExp(`^${String(name).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
        if (existing) return res.status(409).json({ error: 'Видавництво з такою назвою вже існує' });

        const doc = {
            name: String(name).trim(),
            contact: contact || '',
            website: website || '',
            city: city || '',
            createdAt: new Date().toISOString()
        };
        const result = await db.collection('publishers').insertOne(doc);
        res.status(201).json({ message: 'Видавництво додано', publisher_id: result.insertedId.toString(), ...doc });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/publishers/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { name, contact, website, city } = req.body;
        if (!name || String(name).trim().length < 2)
            return res.status(400).json({ error: 'Назва видавництва обов\'язкова' });

        const update = {
            name: String(name).trim(),
            contact: contact || '',
            website: website || '',
            city: city || '',
            updatedAt: new Date().toISOString()
        };
        const result = await db.collection('publishers').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: update }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Видавництво не знайдено' });
        res.json({ message: 'Видавництво оновлено', publisher_id: req.params.id, ...update });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/publishers/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const p = await db.collection('publishers').findOne({ _id: new ObjectId(req.params.id) });
        if (!p) return res.status(404).json({ error: 'Видавництво не знайдено' });
        await db.collection('publishers').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Видавництво видалено', publisher_id: req.params.id, name: p.name });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
//  КАТЕГОРІЇ
// ============================================
app.get('/api/categories', async (req, res) => {
    try {
        const cats = await db.collection('categories').find().toArray();
        res.json(cats.map(c => ({ category_id: c._id.toString(), name: c.name, description: c.description })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/categories/:id', async (req, res) => {
    try {
        const c = await db.collection('categories').findOne({ _id: new ObjectId(req.params.id) });
        if (!c) return res.json({ error: 'Не знайдено' });
        res.json({ category_id: c._id.toString(), name: c.name, description: c.description });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/categories', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || String(name).trim().length < 2)
            return res.status(400).json({ error: 'Назва категорії обов\'язкова (мін. 2 символи)' });

        const existing = await db.collection('categories').findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
        if (existing) return res.status(409).json({ error: 'Категорія з такою назвою вже існує' });

        const doc = {
            name: String(name).trim(),
            description: description || '',
            createdAt: new Date().toISOString()
        };
        const result = await db.collection('categories').insertOne(doc);
        res.status(201).json({ message: 'Категорію додано', category_id: result.insertedId.toString(), ...doc });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/categories/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const c = await db.collection('categories').findOne({ _id: new ObjectId(req.params.id) });
        if (!c) return res.status(404).json({ error: 'Категорію не знайдено' });
        await db.collection('categories').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Категорію видалено', category_id: req.params.id, name: c.name });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
//  КЛІЄНТИ
// ============================================
app.get('/api/customers', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const list = await db.collection('customers').find().toArray();
        res.json(list.map(c => ({
            customer_id: c._id.toString(), full_name: c.full_name, email: c.email,
            phone: c.phone, delivery_address: c.delivery_address,
            registration_date: c.registration_date, total_orders: c.total_orders
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
//  КНИГИ — GET (публічні)
// ============================================
app.get('/api/books', async (req, res) => {
    try {
        const books = await db.collection('books').find().toArray();
        const authors = await db.collection('authors').find().toArray();
        const aMap = {};
        authors.forEach(a => { aMap[a._id.toString()] = a.name; });

        res.json(books.map(b => ({
            book_id: b._id.toString(),
            title: b.title,
            author: aMap[b.author_id?.toString()] || b.author || 'Невідомий автор',
            price: b.price,
            stock: b.stock,
            year: b.year,
            isbn: b.isbn,
            imageUrl: b.imageUrl || ''
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/books/search/:query', async (req, res) => {
    try {
        const q = req.params.query.toLowerCase();
        const books = await db.collection('books').find().toArray();
        const auth = await db.collection('authors').find().toArray();
        const aMap = {};
        auth.forEach(a => { aMap[a._id.toString()] = a.name; });

        const results = books.filter(b => {
            const t = b.title.toLowerCase();
            const an = (aMap[b.author_id?.toString()] || b.author || '').toLowerCase();
            return t.includes(q) || an.includes(q);
        });
        res.json({
            query: q, count: results.length,
            results: results.map(b => ({
                book_id: b._id.toString(), title: b.title,
                author: aMap[b.author_id?.toString()] || b.author || '',
                price: b.price, stock: b.stock, imageUrl: b.imageUrl || ''
            }))
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
        if (!book) return res.json({ error: 'Книгу не знайдено' });

        const author = book.author_id ? await db.collection('authors').findOne({ _id: book.author_id }) : null;
        const publisher = book.publisher_id ? await db.collection('publishers').findOne({ _id: book.publisher_id }) : null;
        const cats = book.category_ids?.length
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
            imageUrl: book.imageUrl || '',
            author: author
                ? { author_id: author._id.toString(), name: author.name, biography: author.biography, birth_year: author.birth_year, country: author.country }
                : (book.author ? { name: book.author } : null),
            publisher: publisher
                ? { publisher_id: publisher._id.toString(), name: publisher.name, city: publisher.city, website: publisher.website, contact: publisher.contact }
                : null,
            categories: cats.map(c => ({ category_id: c._id.toString(), name: c.name }))
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
//  КНИГИ — CRUD (тільки admin)
// ============================================
function validateBook(data) {
    const errors = [];
    if (!data.title || String(data.title).trim().length < 2) errors.push('Назва книги обов\'язкова (мін. 2 символи)');
    if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0) errors.push('Ціна має бути числом > 0');
    if (data.stock !== undefined && (isNaN(Number(data.stock)) || Number(data.stock) < 0)) errors.push('Кількість не може бути від\'ємною');
    if (data.year && (isNaN(Number(data.year)) || Number(data.year) < 1000 || Number(data.year) > 2100)) errors.push('Рік має бути від 1000 до 2100');
    if (data.pages && (isNaN(Number(data.pages)) || Number(data.pages) < 1)) errors.push('Кількість сторінок має бути > 0');
    return errors;
}

function parseCategoryIds(body) {
    let raw = body['category_ids[]'] || body['category_ids'] || [];
    if (!Array.isArray(raw)) raw = [raw];
    return raw.filter(Boolean).map(id => {
        try { return new ObjectId(id); } catch { return null; }
    }).filter(Boolean);
}

app.post('/api/books', authMiddleware, requireRole('admin'), upload.single('image'), async (req, res) => {
    try {
        const body = req.body;
        const errors = validateBook(body);
        if (errors.length) return res.status(400).json({ error: errors.join('; ') });

        const categoryIds = parseCategoryIds(body);

        const doc = {
            title: String(body.title).trim(),
            author: String(body.author || '').trim(),
            price: Number(body.price),
            purchase_price: body.purchase_price ? Number(body.purchase_price) : undefined,
            stock: body.stock !== undefined ? Number(body.stock) : 0,
            isbn: body.isbn || '',
            year: body.year ? Number(body.year) : undefined,
            pages: body.pages ? Number(body.pages) : undefined,
            description: body.description || '',
            imageUrl: req.file ? req.file.path : (body.imageUrl || ''),
            category_ids: categoryIds,
            createdAt: new Date().toISOString()
        };

        if (body.author_id) {
            try {
                doc.author_id = new ObjectId(body.author_id);
                const a = await db.collection('authors').findOne({ _id: doc.author_id });
                if (a) doc.author = a.name;
            } catch { }
        }

        if (body.publisher_id) {
            try {
                doc.publisher_id = new ObjectId(body.publisher_id);
            } catch { }
        }

        const result = await db.collection('books').insertOne(doc);
        res.status(201).json({ message: 'Книгу додано', book_id: result.insertedId.toString(), title: doc.title, ...doc });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/books/:id', authMiddleware, requireRole('admin'), upload.single('image'), async (req, res) => {
    try {
        const body = req.body;
        const errors = validateBook(body);
        if (errors.length) return res.status(400).json({ error: errors.join('; ') });

        const existing = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
        if (!existing) return res.status(404).json({ error: 'Книгу не знайдено' });

        const categoryIds = parseCategoryIds(body);

        const update = {
            title: String(body.title).trim(),
            author: String(body.author || '').trim(),
            price: Number(body.price),
            purchase_price: body.purchase_price ? Number(body.purchase_price) : existing.purchase_price,
            stock: body.stock !== undefined ? Number(body.stock) : existing.stock,
            isbn: body.isbn || existing.isbn || '',
            year: body.year ? Number(body.year) : existing.year,
            pages: body.pages ? Number(body.pages) : existing.pages,
            description: body.description !== undefined ? body.description : existing.description,
            category_ids: categoryIds.length > 0 ? categoryIds : (existing.category_ids || []),
            updatedAt: new Date().toISOString()
        };

        if (body.author_id) {
            try {
                update.author_id = new ObjectId(body.author_id);
                const a = await db.collection('authors').findOne({ _id: update.author_id });
                if (a) update.author = a.name;
            } catch { }
        }

        if (body.publisher_id) {
            try {
                update.publisher_id = new ObjectId(body.publisher_id);
            } catch { }
        } else if (body.publisher_id === '') {
            update.publisher_id = null;
        } else {
            update.publisher_id = existing.publisher_id || null;
        }

        if (req.file) {
            update.imageUrl = req.file.path;
        } else if (body._removeImage === 'true') {
            update.imageUrl = '';
        } else {
            update.imageUrl = existing.imageUrl || '';
        }

        await db.collection('books').updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
        res.json({ message: 'Книгу оновлено', book_id: req.params.id, ...update });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/books/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
        if (!book) return res.status(404).json({ error: 'Книгу не знайдено' });
        await db.collection('books').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Книгу видалено', book_id: req.params.id, title: book.title });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── НОВИЙ ENDPOINT: Видалення зображення книги ───
app.delete('/api/books/:id/image', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
        if (!book) return res.status(404).json({ error: 'Книгу не знайдено' });

        if (!book.imageUrl) {
            return res.status(400).json({ error: 'У книги немає зображення для видалення' });
        }

        await db.collection('books').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { imageUrl: '', updatedAt: new Date().toISOString() } }
        );

        res.json({ message: 'Зображення книги видалено', book_id: req.params.id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/books/:id/stock', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { quantity } = req.body;
        if (typeof quantity !== 'number' || quantity === 0)
            return res.status(400).json({ error: 'Вкажіть кількість (не нуль)' });

        const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
        if (!book) return res.status(404).json({ error: 'Книгу не знайдено' });
        const newStock = book.stock + quantity;
        if (newStock < 0)
            return res.status(400).json({ error: `Недостатньо на складі: ${book.stock} шт` });

        await db.collection('books').updateOne({ _id: new ObjectId(req.params.id) }, { $inc: { stock: quantity } });
        res.json({ message: 'Склад оновлено', old_stock: book.stock, new_stock: newStock });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
//  ЗАМОВЛЕННЯ
// ============================================
app.get('/api/orders', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const orders = await db.collection('orders').find().sort({ order_date: -1 }).toArray();
        res.json(orders.map(o => ({ order_id: o._id.toString(), ...o, _id: undefined })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/orders/my', authMiddleware, async (req, res) => {
    try {
        const orders = await db.collection('orders')
            .find({ user_id: req.user.userId })
            .sort({ order_date: -1 })
            .toArray();
        res.json(orders.map(o => ({ order_id: o._id.toString(), ...o, _id: undefined })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/orders/:id', authMiddleware, async (req, res) => {
    try {
        const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });
        if (!order) return res.json({ error: 'Не знайдено' });
        if (req.user.role !== 'admin' && order.user_id !== req.user.userId)
            return res.status(403).json({ error: 'Доступ заборонено' });
        res.json({ order_id: order._id.toString(), ...order, _id: undefined });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customer_id, items, delivery_address, payment_method, customer_name, phone, email } = req.body;

        let userId = null;
        const authHeader = req.headers.authorization || '';
        if (authHeader.startsWith('Bearer ')) {
            try {
                const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
                userId = decoded.userId;
            } catch { }
        }

        for (const item of (items || [])) {
            let book;
            try { book = await db.collection('books').findOne({ _id: new ObjectId(item.book_id) }); }
            catch { return res.status(400).json({ error: `Невірний ID: ${item.book_id}` }); }

            if (!book) return res.status(400).json({ error: `Книгу "${item.title}" не знайдено` });
            if (book.stock < item.quantity) {
                return res.status(400).json({
                    error: book.stock === 0
                        ? `Книга "${item.title}" закінчилась на складі`
                        : `"${item.title}": доступно ${book.stock} шт, замовлено ${item.quantity}`
                });
            }
        }

        for (const item of (items || [])) {
            await db.collection('books').updateOne(
                { _id: new ObjectId(item.book_id) },
                { $inc: { stock: -item.quantity } }
            );
        }

        const total = (items || []).reduce((s, i) => s + i.price * i.quantity, 0);
        const orderNumber = 'ORD-2026-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');

        const newOrder = {
            order_number: orderNumber,
            user_id: userId,
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

        try { await sendOrderEmails(newOrder); }
        catch (e) { console.warn('⚠️ Email:', e.message); }

        res.status(201).json({
            message: 'Замовлення створено',
            order: { ...newOrder, order_id: result.insertedId.toString() }
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const ALLOWED_STATUSES = ['нове', 'в обробці', 'підтверджено', 'передано в доставку', 'доставлено', 'скасовано'];

app.patch('/api/orders/:id/status', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!ALLOWED_STATUSES.includes(status))
            return res.status(400).json({ error: `Допустимі статуси: ${ALLOWED_STATUSES.join(', ')}` });

        const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });
        if (!order) return res.status(404).json({ error: 'Замовлення не знайдено' });

        await db.collection('orders').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status, updatedAt: new Date().toISOString() } }
        );
        res.json({ message: 'Статус оновлено', order_id: req.params.id, status });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/orders/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });
        if (!order) return res.status(404).json({ error: 'Замовлення не знайдено' });

        await db.collection('orders').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Замовлення видалено', order_id: req.params.id, order_number: order.order_number });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
//  ВІДГУКИ
// ============================================
app.get('/api/reviews/all', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const reviews = await db.collection('reviews').find().sort({ created_at: -1 }).toArray();

        const bookIds = [...new Set(reviews.map(r => r.book_id?.toString()).filter(Boolean))];
        const books = bookIds.length
            ? await db.collection('books').find({
                _id: { $in: bookIds.map(id => { try { return new ObjectId(id); } catch { return null; } }).filter(Boolean) }
            }).toArray()
            : [];
        const bookMap = {};
        books.forEach(b => { bookMap[b._id.toString()] = b.title; });

        const customers = await db.collection('customers').find().toArray();
        const users = await db.collection('users').find().toArray();
        const cMap = {};
        customers.forEach(c => { cMap[c._id.toString()] = c.full_name; });
        users.forEach(u => { cMap[u._id.toString()] = u.name; });

        res.json(reviews.map(r => ({
            review_id: r._id.toString(),
            book_id: r.book_id?.toString() || '',
            book_title: bookMap[r.book_id?.toString()] || '—',
            customer: cMap[r.customer_id?.toString()] || r.customer_name || 'Покупець',
            rating: r.rating,
            comment: r.comment,
            date: r.date || r.created_at?.split('T')[0] || ''
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/reviews/book/:bookId', async (req, res) => {
    try {
        let bookOid;
        try { bookOid = new ObjectId(req.params.bookId); }
        catch { return res.status(400).json({ error: 'Невірний ID книги' }); }

        const reviews = await db.collection('reviews').find({ book_id: bookOid }).sort({ created_at: -1 }).toArray();
        const customers = await db.collection('customers').find().toArray();
        const users = await db.collection('users').find().toArray();
        const cMap = {};
        customers.forEach(c => { cMap[c._id.toString()] = c.full_name; });
        users.forEach(u => { cMap[u._id.toString()] = u.name; });

        const enriched = reviews.map(r => ({
            review_id: r._id.toString(),
            customer: cMap[r.customer_id?.toString()] || r.customer_name || 'Покупець',
            rating: r.rating,
            comment: r.comment,
            date: r.date || r.created_at?.split('T')[0] || ''
        }));
        const avg = enriched.length ? enriched.reduce((s, r) => s + r.rating, 0) / enriched.length : 0;
        res.json({ book_id: req.params.bookId, average_rating: avg, total_reviews: enriched.length, reviews: enriched });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reviews', authMiddleware, async (req, res) => {
    try {
        const { book_id, rating, comment } = req.body;

        if (!book_id) return res.status(400).json({ error: 'Вкажіть book_id' });
        if (!rating || rating < 1 || rating > 5)
            return res.status(400).json({ error: 'Оцінка має бути від 1 до 5' });
        if (!comment || String(comment).trim().length < 3)
            return res.status(400).json({ error: 'Відгук занадто короткий (мін. 3 символи)' });

        let bookOid;
        try { bookOid = new ObjectId(book_id); }
        catch { return res.status(400).json({ error: 'Невірний ID книги' }); }

        const book = await db.collection('books').findOne({ _id: bookOid });
        if (!book) return res.status(404).json({ error: 'Книгу не знайдено' });

        const userId = req.user.userId;
        const existing = await db.collection('reviews').findOne({
            book_id: bookOid,
            customer_id: new ObjectId(userId)
        });
        if (existing) return res.status(409).json({ error: 'Ви вже залишали відгук на цю книгу' });

        const doc = {
            book_id: bookOid,
            customer_id: new ObjectId(userId),
            customer_name: req.user.name,
            rating: Number(rating),
            comment: String(comment).trim(),
            created_at: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };

        const result = await db.collection('reviews').insertOne(doc);
        res.status(201).json({
            message: 'Відгук додано',
            review_id: result.insertedId.toString(),
            ...doc,
            book_id: book_id,
            customer_id: userId
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/reviews/:id', authMiddleware, async (req, res) => {
    try {
        let reviewOid;
        try { reviewOid = new ObjectId(req.params.id); }
        catch { return res.status(400).json({ error: 'Невірний ID відгуку' }); }

        const review = await db.collection('reviews').findOne({ _id: reviewOid });
        if (!review) return res.status(404).json({ error: 'Відгук не знайдено' });

        const isAdmin = req.user.role === 'admin';
        const isOwner = review.customer_id?.toString() === req.user.userId;
        if (!isAdmin && !isOwner)
            return res.status(403).json({ error: 'Немає прав для видалення цього відгуку' });

        await db.collection('reviews').deleteOne({ _id: reviewOid });
        res.json({ message: 'Відгук видалено', review_id: req.params.id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await db.collection('reviews').find().sort({ created_at: -1 }).toArray();
        res.json(reviews.map(r => ({ review_id: r._id.toString(), ...r, _id: undefined })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
//  СКЛАД / СТАТИСТИКА / КОНТАКТИ
// ============================================
app.get('/api/inventory', authMiddleware, requireRole('admin'), async (req, res) => {
    try { res.json(await db.collection('inventory').find().toArray()); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/stats', async (req, res) => {
    try {
        const [totalBooks, totalAuthors, totalCategories, totalPublishers, totalCustomers, totalOrders, totalReviews] = await Promise.all([
            db.collection('books').countDocuments(),
            db.collection('authors').countDocuments(),
            db.collection('categories').countDocuments(),
            db.collection('publishers').countDocuments(),
            db.collection('customers').countDocuments(),
            db.collection('orders').countDocuments(),
            db.collection('reviews').countDocuments()
        ]);
        const paidOrders = await db.collection('orders').find({ payment_status: 'оплачено' }).toArray();
        const totalRevenue = paidOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
        res.json({
            total_books: totalBooks,
            total_authors: totalAuthors,
            total_categories: totalCategories,
            total_publishers: totalPublishers,
            total_customers: totalCustomers,
            total_orders: totalOrders,
            total_reviews: totalReviews,
            total_revenue: totalRevenue
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !message) return res.status(400).json({ error: 'Заповніть усі поля' });
        await transporter.sendMail({
            from: `"Читай-місто" <${process.env.GMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `✉️ Повідомлення від ${name} — Читай-місто`,
            html: buildContactEmail(name, email, message)
        });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: !!db, port: PORT }));

// Fallback
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ============================================
//  ЗАПУСК
// ============================================
async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log('════════════════════════════════════');
        console.log('  📚 Читай-місто — сервер запущено');
        console.log(`  http://localhost:${PORT}`);
        console.log('════════════════════════════════════');
    });
}
startServer();