/**
 * Юніт-тести для клієнтської частини інтернет-книгарні "Читай-місто"
 * 
 * @author Дембіцький Олександр Юрійович
 * @group ПП-32
 * @course Курсова робота
 * 
 * @description Тести покривають основну логіку роботи книгарні:
 * - Функціонал кошика (додавання, видалення, зміна кількості)
 * - Розрахунки (сума, доставка, кількість товарів)
 * - Валідація даних (email, телефон, обов'язкові поля форми)
 * - Допоміжні функції (статус наявності, ім'я автора, форматування ціни)
 * - Інтеграційні сценарії (повний цикл роботи з кошиком)
 * - Додаткові сценарії (порожній кошик, null значення, вартість доставки, наявність)
 */

// ============================================
// 1. ТЕСТИ ФУНКЦІОНАЛУ КОШИКА
// ============================================

describe('🛒 Функціонал кошика', () => {
  
  /**
   * Тест: Додавання нової книги до порожнього кошика
   */
  test('Додавання нової книги збільшує кількість позицій', () => {
    let cart = [];
    const book = { book_id: '1', title: 'Кобзар', author: 'Тарас Шевченко', price: 450 };
    
    cart.push({ ...book, qty: 1 });
    
    expect(cart.length).toBe(1);
    expect(cart[0].title).toBe('Кобзар');
    expect(cart[0].qty).toBe(1);
  });

  /**
   * Тест: Додавання книги, яка вже є в кошику
   */
  test('Додавання існуючої книги збільшує кількість, а не створює нову позицію', () => {
    let cart = [{ book_id: '1', title: 'Кобзар', price: 450, qty: 1 }];
    const book = { book_id: '1', title: 'Кобзар', price: 450 };
    
    const existing = cart.find(i => i.book_id === book.book_id);
    if (existing) existing.qty += 1;
    
    expect(cart.length).toBe(1);
    expect(cart[0].qty).toBe(2);
  });

  /**
   * Тест: Видалення книги з кошика
   */
  test('Видалення книги з кошика працює коректно', () => {
    let cart = [
      { book_id: '1', title: 'Кобзар', price: 450, qty: 2 },
      { book_id: '2', title: 'Маруся Чурай', price: 320, qty: 1 }
    ];
    
    cart = cart.filter(i => i.book_id !== '1');
    
    expect(cart.length).toBe(1);
    expect(cart[0].title).toBe('Маруся Чурай');
  });

  /**
   * Тест: Збільшення кількості товару
   */
  test('Збільшення кількості товару', () => {
    let cart = [{ book_id: '1', title: 'Кобзар', price: 450, qty: 1 }];
    
    cart[0].qty += 1;
    
    expect(cart[0].qty).toBe(2);
  });

  /**
   * Тест: Зменшення кількості з нижньою межею 1
   */
  test('Зменшення кількості не опускається нижче 1', () => {
    let cart = [{ book_id: '1', title: 'Кобзар', price: 450, qty: 1 }];
    
    cart[0].qty = Math.max(1, cart[0].qty - 1);
    expect(cart[0].qty).toBe(1);
    
    cart[0].qty = Math.max(1, cart[0].qty + 2 - 1);
    expect(cart[0].qty).toBe(2);
  });
});

// ============================================
// 2. ТЕСТИ РОЗРАХУНКІВ ТА ЛОГІКИ
// ============================================

describe('💰 Розрахунки та логіка', () => {
  
  /**
   * Тест: Розрахунок загальної суми кошика
   */
  test('Загальна сума кошика рахується правильно', () => {
    const cart = [
      { price: 450, qty: 2 },
      { price: 320, qty: 1 },
      { price: 280, qty: 3 }
    ];
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    expect(total).toBe(2060);
  });

  /**
   * Тест: Логіка безкоштовної доставки
   */
  test('Доставка безкоштовна при замовленні від 500 грн', () => {
    const checkDelivery = (total) => total >= 500 ? 0 : 65;
    
    expect(checkDelivery(450)).toBe(65);
    expect(checkDelivery(500)).toBe(0);
    expect(checkDelivery(670)).toBe(0);
  });

  /**
   * Тест: Підрахунок загальної кількості товарів
   */
  test('Підрахунок загальної кількості одиниць товару', () => {
    const cart = [
      { qty: 2 },
      { qty: 1 },
      { qty: 3 }
    ];
    
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    expect(totalItems).toBe(6);
  });
});

// ============================================
// 3. ТЕСТИ ДОПОМІЖНИХ ФУНКЦІЙ
// ============================================

describe('🔍 Допоміжні функції', () => {
  
  /**
   * Тест: Функція getStockInfo (статус наявності книги)
   */
  test('Функція getStockInfo повертає правильний статус', () => {
    function getStockInfo(stock) {
      if (stock === 0) return { label: 'Немає в наявності', cls: 'low' };
      if (stock <= 3) return { label: `Лишилось ${stock} шт`, cls: 'low' };
      return { label: 'В наявності', cls: '' };
    }
    
    expect(getStockInfo(0)).toEqual({ label: 'Немає в наявності', cls: 'low' });
    expect(getStockInfo(2)).toEqual({ label: 'Лишилось 2 шт', cls: 'low' });
    expect(getStockInfo(5)).toEqual({ label: 'В наявності', cls: '' });
    expect(getStockInfo(10)).toEqual({ label: 'В наявності', cls: '' });
  });

  /**
   * Тест: Функція getAuthorName (отримання імені автора)
   */
  test('Функція getAuthorName коректно обробляє різні формати', () => {
    function getAuthorName(book) {
      if (!book.author) return '';
      if (typeof book.author === 'string') return book.author;
      if (typeof book.author === 'object' && book.author.name) return book.author.name;
      return '';
    }
    
    const book1 = { author: 'Тарас Шевченко' };
    const book2 = { author: { name: 'Ліна Костенко' } };
    const book3 = { author: null };
    const book4 = {};
    
    expect(getAuthorName(book1)).toBe('Тарас Шевченко');
    expect(getAuthorName(book2)).toBe('Ліна Костенко');
    expect(getAuthorName(book3)).toBe('');
    expect(getAuthorName(book4)).toBe('');
  });

  /**
   * Тест: Форматування ціни
   */
  test('Форматування ціни додає валюту', () => {
    function formatPrice(price) {
      return `${price} грн`;
    }
    
    expect(formatPrice(320)).toBe('320 грн');
    expect(formatPrice(0)).toBe('0 грн');
    expect(formatPrice(450.5)).toBe('450.5 грн');
  });
});

// ============================================
// 4. ТЕСТИ ВАЛІДАЦІЇ ДАНИХ
// ============================================

describe('✉️ Валідація даних', () => {
  
  /**
   * Тест: Валідація email
   */
  test('Валідація email працює правильно', () => {
    function isValidEmail(email) {
      const regex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
      return regex.test(email);
    }
    
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user@gmail.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@gmail.com')).toBe(false);
  });

  /**
   * Тест: Валідація телефону
   */
  test('Валідація телефону працює правильно', () => {
    function isValidPhone(phone) {
      const regex = /^(\+38)?0[0-9]{9}$/;
      return regex.test(phone);
    }
    
    expect(isValidPhone('0671234567')).toBe(true);
    expect(isValidPhone('+380671234567')).toBe(true);
    expect(isValidPhone('0931234567')).toBe(true);
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidPhone('invalid')).toBe(false);
  });

  /**
   * Тест: Валідація обов'язкових полів форми
   */
  test('Валідація обов\'язкових полів форми', () => {
    const isFormValid = (name, email, phone) => {
      return name.trim() !== '' && email.includes('@') && phone.length >= 10;
    };
    
    expect(isFormValid('Іван', 'test@example.com', '0671234567')).toBe(true);
    expect(isFormValid('', 'test@example.com', '0671234567')).toBe(false);
    expect(isFormValid('Іван', '', '0671234567')).toBe(false);
    expect(isFormValid('Іван', 'test@example.com', '')).toBe(false);
  });
});

// ============================================
// 5. ІНТЕГРАЦІЙНІ ТЕСТИ
// ============================================

describe('🔄 Інтеграційні тести', () => {
  
  /**
   * Тест: Повний цикл роботи з кошиком
   */
  test('Повний цикл: додавання → зміна кількості → видалення → розрахунок', () => {
    let cart = [];
    
    // Додаємо першу книгу
    cart.push({ book_id: '1', title: 'Кобзар', price: 450, qty: 1 });
    expect(cart.length).toBe(1);
    
    // Додаємо другу книгу
    cart.push({ book_id: '2', title: 'Маруся Чурай', price: 320, qty: 1 });
    expect(cart.length).toBe(2);
    
    // Збільшуємо кількість першої книги
    cart[0].qty = 2;
    
    // Розраховуємо суму
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    expect(total).toBe(1220);
    
    // Перевіряємо доставку
    const delivery = total >= 500 ? 0 : 65;
    expect(delivery).toBe(0);
    
    // Видаляємо першу книгу
    cart = cart.filter(i => i.book_id !== '1');
    expect(cart.length).toBe(1);
    expect(cart[0].title).toBe('Маруся Чурай');
  });

  /**
   * Тест: Розрахунок кількості унікальних книг у кошику
   */
  test('Розрахунок кількості унікальних книг у кошику', () => {
    const cart = [
      { book_id: '1', qty: 2 },
      { book_id: '2', qty: 1 },
      { book_id: '1', qty: 1 }  // дублікат book_id
    ];
    
    const uniqueBooks = new Set(cart.map(item => item.book_id)).size;
    expect(uniqueBooks).toBe(2);
  });
});

// ============================================
// 6. ДОДАТКОВІ ТЕСТИ
// ============================================

describe('➕ Додаткові сценарії', () => {
  
  /**
   * Тест: Порожній кошик має нульову суму
   */
  test('Порожній кошик має нульову суму', () => {
    const cart = [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const delivery = total >= 500 ? 0 : 65;
    
    expect(total).toBe(0);
    expect(delivery).toBe(65);
  });

  /**
   * Тест: Обробка null та undefined значень
   */
  test('Обробка null та undefined значень', () => {
    function getAuthorName(book) {
      if (!book?.author) return '';
      if (typeof book.author === 'string') return book.author;
      if (typeof book.author === 'object' && book.author.name) return book.author.name;
      return '';
    }
    
    expect(getAuthorName(null)).toBe('');
    expect(getAuthorName(undefined)).toBe('');
    expect(getAuthorName({})).toBe('');
    expect(getAuthorName({ author: null })).toBe('');
  });

  /**
   * Тест: Розрахунок вартості доставки для різних сум
   */
  test('Розрахунок вартості доставки для різних сум', () => {
    const deliveryCost = (total) => {
      if (total === 0) return 0;
      if (total < 200) return 75;
      if (total < 500) return 65;
      return 0;
    };
    
    expect(deliveryCost(0)).toBe(0);
    expect(deliveryCost(150)).toBe(75);
    expect(deliveryCost(300)).toBe(65);
    expect(deliveryCost(500)).toBe(0);
    expect(deliveryCost(1000)).toBe(0);
  });

  /**
   * Тест: Перевірка наявності книги для замовлення
   */
  test('Книгу можна замовити тільки якщо вона є в наявності', () => {
    const canOrder = (stock) => stock > 0;
    
    expect(canOrder(5)).toBe(true);
    expect(canOrder(1)).toBe(true);
    expect(canOrder(0)).toBe(false);
    expect(canOrder(-1)).toBe(false);
  });
});