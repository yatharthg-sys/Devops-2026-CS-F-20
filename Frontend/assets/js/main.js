const API_BASE = 'http://localhost:5000/api';

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
  themeButton.checked = true;
}

themeButton.addEventListener('change', () => {
  document.body.classList.toggle(darkTheme, themeButton.checked);
  localStorage.setItem('selected-theme', themeButton.checked ? 'dark' : 'light');
});

/*==================== TOAST ====================*/
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
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
document.getElementById('cart-toggle').addEventListener('click', () => {
  cartDrawer.classList.add('open');
  overlay.classList.add('show');
});
document.getElementById('cart-close').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
function closeCart() {
  cartDrawer.classList.remove('open');
  overlay.classList.remove('show');
}

// Checkout submit
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
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
    cart = [];
    saveCart();
    e.target.reset();
    closeCart();
  } catch (err) {
    showToast(err.message || 'Could not place order — is the backend running?', 'error');
  }
});

/*==================== LOAD MENU FROM BACKEND ====================*/
async function loadMenu() {
  const container = document.getElementById('menu-container');
  try {
    const res = await fetch(`${API_BASE}/menu`);
    const menu = await res.json();

    container.innerHTML = menu.map(item => `
  <div class="menu__card">
    <div class="menu__content">
      <div class="menu__face menu__face--front">
        <img src="${item.image}" alt="${item.name}" class="menu__img">
        <h3 class="menu__name">${item.name}</h3>
        <span class="menu__detail">Hover to see details</span>
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
    container.innerHTML = `<p class="menu__loading">Couldn't load the menu. Is the backend server running on port 5000?</p>`;
  }
}

/*==================== RESERVATION FORM ====================*/
document.getElementById('reservation-form').addEventListener('submit', async (e) => {
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
    showToast(err.message || 'Could not reserve — is the backend running?', 'error');
  }
});

/*==================== SCROLL REVEAL ====================*/
const sr = ScrollReveal({ origin: 'top', distance: '30px', duration: 1500, reset: true });
sr.reveal(`.home__data, .home__img, .about__data, .about__img,
           .services__content, .menu__content,
           .app__data, .app__img, .contact__data, .footer__content`, { interval: 150 });

/*==================== INIT ====================*/
renderCart();
loadMenu();
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