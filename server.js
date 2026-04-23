// ============================================
// Сервер для книгарні "Читай-місто"
// Курсова робота
// Виконав: Дембіцький О.Ю., група ПП-32
// ============================================

require('dotenv').config();

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
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
// API HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: !!db, port: PORT });
});

// ============================================
// ГОЛОВНА СТОРІНКА
// ============================================
app.get('/', (req, res) => {
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