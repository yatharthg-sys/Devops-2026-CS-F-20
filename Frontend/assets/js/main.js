const API_BASE = window.location.origin.includes(':5000')
  ? window.location.origin + '/api'
  : 'http://localhost:5000/api';

/*==================== SOCKET.IO CLIENT REAL-TIME INTEGRATION ====================*/
let socket = null;
try {
  if (typeof io !== 'undefined') {
    socket = io();
    socket.on('connect', () => {
      console.log('⚡ Connected to Shekhawat Dhaba real-time server');
    });

    socket.on('order:updated', (order) => {
      showToast(`Order #${order.id} is now ${order.status.replace(/_/g, ' ')}!`, 'info');
    });
  }
} catch (e) {
  console.log('Socket client running in standalone mode');
}

/*==================== SHOW MENU (mobile nav) ====================*/
const showMenu = (toggleId, navId) => {
  const toggle = document.getElementById(toggleId);
  const nav = document.getElementById(navId);
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('show-menu'));
  }
};
showMenu('nav-toggle', 'nav-menu');

const navLink = document.querySelectorAll('.nav__link');
function linkAction() {
  document.getElementById('nav-menu').classList.remove('show-menu');
}
navLink.forEach(n => n.addEventListener('click', linkAction));

/*==================== SCROLL ACTIVE LINK / HEADER / TOP BUTTON ====================*/
const sections = document.querySelectorAll('section[id]');
function scrollActive() {
  const scrollY = window.pageYOffset;
  sections.forEach(current => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 50;
    const sectionId = current.getAttribute('id');
    const link = document.querySelector('.nav__menu a[href*=' + sectionId + ']');
    if (!link) return;
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      link.classList.add('active-link');
    } else {
      link.classList.remove('active-link');
    }
  });
}
window.addEventListener('scroll', scrollActive);

function scrollHeader() {
  const nav = document.getElementById('header');
  if (this.scrollY >= 200) nav.classList.add('scroll-header'); else nav.classList.remove('scroll-header');
}
window.addEventListener('scroll', scrollHeader);

function scrollTop() {
  const scrollTopEl = document.getElementById('scroll-top');
  if (this.scrollY >= 560) scrollTopEl.classList.add('show-scroll'); else scrollTopEl.classList.remove('show-scroll');
}
window.addEventListener('scroll', scrollTop);

/*==================== LOADER ====================*/
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('loader--hidden'), 500);
  }
});

/*==================== CURSOR GLOW ====================*/
const cursorGlow = document.getElementById('cursor-glow');
if (cursorGlow) {
  window.addEventListener('mousemove', (e) => {
    cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });
}

/*==================== STATS COUNT-UP ====================*/
const statNumbers = document.querySelectorAll('.stats__number');
function animateCount(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1500;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}

if (statNumbers.length > 0) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(el => statsObserver.observe(el));
}

/*==================== DARK / LIGHT THEME ====================*/
const themeButton = document.getElementById('theme-button');
const darkTheme = 'dark-theme';
const selectedTheme = localStorage.getItem('selected-theme');

if (selectedTheme === 'dark') {
  document.body.classList.add(darkTheme);
  if (themeButton) themeButton.checked = true;
}

if (themeButton) {
  themeButton.addEventListener('change', () => {
    document.body.classList.toggle(darkTheme, themeButton.checked);
    localStorage.setItem('selected-theme', themeButton.checked ? 'dark' : 'light');
  });
}

/*==================== TOAST ====================*/
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(() => { toast.className = 'toast'; }, 3500);
}

/*==================== CART ====================*/
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function addToCart(item) {
  const existing = cart.find(i => i.id === item.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  saveCart();
  showToast(`${item.name} added to cart`);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const countBadge = document.getElementById('cart-count');
  const totalEl = document.getElementById('cart-total');
  if (!container || !countBadge || !totalEl) return;

  countBadge.textContent = cart.reduce((sum, i) => sum + i.qty, 0);

  if (cart.length === 0) {
    container.innerHTML = '<p class="cart-empty" id="cart-empty">Your cart is empty. Add something tasty!</p>';
    totalEl.textContent = '₹0';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    return `
      <div class="cart-item">
        <div>
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__qty">
            <button onclick="changeQty('${item.id}', -1)">-</button>
            <span>${item.qty}</span>
            <button onclick="changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <div style="text-align:right">
          <div class="cart-item__price">₹${lineTotal}</div>
          <i class='bx bx-trash cart-item__remove' onclick="removeFromCart('${item.id}')"></i>
        </div>
      </div>`;
  }).join('');

  totalEl.textContent = `₹${total}`;
}

// Cart drawer open/close
const cartDrawer = document.getElementById('cart-drawer');
const overlay = document.getElementById('overlay');
const cartToggle = document.getElementById('cart-toggle');
const cartClose = document.getElementById('cart-close');

if (cartToggle) {
  cartToggle.addEventListener('click', () => {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (overlay) overlay.classList.add('show');
  });
}
if (cartClose) cartClose.addEventListener('click', closeCart);
if (overlay) overlay.addEventListener('click', closeCart);

function closeCart() {
  if (cartDrawer) cartDrawer.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
}

// Checkout submit
const checkoutForm = document.getElementById('checkout-form');
if (checkoutForm) {
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cart.length === 0) { showToast('Your cart is empty', 'error'); return; }

    const payload = {
      customer: {
        name: document.getElementById('checkout-name').value,
        phone: document.getElementById('checkout-phone').value,
        address: document.getElementById('checkout-address').value
      },
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty }))
    };

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed');

      showToast(`Order placed! Confirmation #${data.order.id}`);
      if (socket) {
        socket.emit('join:order', data.order.id);
      }
      cart = [];
      saveCart();
      e.target.reset();
      closeCart();

      // Pre-fill tracker input with recent order ID
      const trackerInput = document.getElementById('track-order-id');
      if (trackerInput) trackerInput.value = data.order.id;
    } catch (err) {
      showToast(err.message || 'Could not place order — is the backend running?', 'error');
    }
  });
}

/*==================== LOAD MENU & CATEGORY FILTERING ====================*/
let fullMenu = [];

async function loadMenu(category = 'all') {
  const container = document.getElementById('menu-container');
  if (!container) return;

  try {
    const url = category && category !== 'all' ? `${API_BASE}/menu?category=${category}` : `${API_BASE}/menu`;
    const res = await fetch(url);
    const menu = await res.json();
    fullMenu = menu;

    if (!menu || menu.length === 0) {
      container.innerHTML = `<p class="menu__loading">No dishes found in this category.</p>`;
      return;
    }

    container.innerHTML = menu.map(item => `
      <div class="menu__card">
        <div class="menu__content">
          <div class="menu__face menu__face--front">
            <img src="${item.image}" alt="${item.name}" class="menu__img">
            <h3 class="menu__name">${item.name}</h3>
            <span class="menu__detail"><i class='bx bx-info-circle'></i> Hover for recipe details</span>
            <span class="menu__preci">₹${item.price}</span>
          </div>
          <div class="menu__face menu__face--back">
            <h3 class="menu__name">${item.name}</h3>
            <p class="menu__desc">${item.description}</p>
            <span class="menu__preci">₹${item.price}</span>
            <button class="button menu__button" onclick='event.stopPropagation(); addToCart(${JSON.stringify(item)})'>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="menu__loading">Couldn't load menu items from ${API_BASE}.</p>`;
  }
}

// Category Dropdown & Button Handlers (using jQuery & DOM)
if (typeof $ !== 'undefined') {
  $(document).ready(function() {
    $('#category-dropdown').on('change', function() {
      const selected = $(this).val();
      $('.filter-btn').removeClass('active');
      $(`.filter-btn[data-category="${selected}"]`).addClass('active');
      loadMenu(selected);
    });

    $('.filter-btn').on('click', function() {
      $('.filter-btn').removeClass('active');
      $(this).addClass('active');
      const cat = $(this).data('category');
      $('#category-dropdown').val(cat);
      loadMenu(cat);
    });
  });
}

/*==================== ORDER TRACKER (AJAX / REST) ====================*/
const trackForm = document.getElementById('track-order-form');
if (trackForm) {
  trackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const orderId = document.getElementById('track-order-id').value.trim();
    const resultBox = document.getElementById('tracker-result');
    if (!orderId) return;

    try {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `<em>Checking status for #${orderId}...</em>`;

      const res = await fetch(`${API_BASE}/orders/${orderId}`);
      if (!res.ok) {
        resultBox.innerHTML = `<span style="color:#e11d48;"><i class='bx bx-error-circle'></i> Order #${orderId} not found. Please verify your order number.</span>`;
        return;
      }

      const order = await res.json();
      resultBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>Order #${order.id}</strong>
          <span style="background:var(--first-color); color:#fff; padding:0.2rem 0.6rem; border-radius:1rem; font-size:0.75rem; text-transform:uppercase;">
            ${order.status.replace(/_/g, ' ')}
          </span>
        </div>
        <p style="margin-top:0.5rem; font-size:0.85rem;">Customer: ${order.customer?.name} · Total: ₹${order.total}</p>
        <p style="font-size:0.75rem; color:var(--text-color-light);">Placed: ${new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
      `;
    } catch (err) {
      resultBox.innerHTML = `<span style="color:#e11d48;">Could not fetch order status.</span>`;
    }
  });
}

/*==================== RESERVATION FORM ====================*/
const resForm = document.getElementById('reservation-form');
if (resForm) {
  resForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('res-name').value,
      email: document.getElementById('res-email').value,
      phone: document.getElementById('res-phone').value,
      guests: document.getElementById('res-guests').value,
      date: document.getElementById('res-date').value,
      time: document.getElementById('res-time').value,
      message: document.getElementById('res-message').value
    };

    try {
      const res = await fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reservation failed');

      showToast(`Table reserved! Confirmation #${data.reservation.id}`);
      e.target.reset();
    } catch (err) {
      showToast(err.message || 'Could not reserve table.', 'error');
    }
  });
}

/*==================== SCROLL REVEAL ====================*/
if (typeof ScrollReveal !== 'undefined') {
  const sr = ScrollReveal({ origin: 'top', distance: '30px', duration: 1500, reset: true });
  sr.reveal(`.home__data, .home__img, .about__data, .about__img,
             .services__content, .menu__content,
             .app__data, .app__img, .contact__data, .footer__content`, { interval: 150 });
}

/*==================== INIT ====================*/
renderCart();
loadMenu('all');

/*==================== MAGNETIC BUTTONS ====================*/
document.querySelectorAll('.button').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.3}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0,0)';
  });
});
