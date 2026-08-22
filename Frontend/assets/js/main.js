/*==================== SHOW MENU ====================*/
const showMenu = (toggleId, navId) =>{
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId)
    
    if(toggle && nav){
        toggle.addEventListener('click', ()=>{
            nav.classList.toggle('show-menu')
        })
    }
}
showMenu('nav-toggle','nav-menu')

/*==================== MENU DATA FETCH & RENDER ====================*/
const menuContainer = document.getElementById('menu-container');

async function loadMenu() {
    if (!menuContainer) return;
    try {
        const res = await fetch('http://localhost:5000/api/menu');
        if (!res.ok) throw new Error('Network error');
        const items = await res.json();
        
        if (!items || items.length === 0) {
            menuContainer.innerHTML = '<p class="menu__loading">No dishes available at the moment.</p>';
            return;
        }

        menuContainer.innerHTML = items.map(dish => `
            <div class="menu__content">
                <img src="${dish.image}" alt="${dish.name}" class="menu__img" onerror="this.src='assets/img/dish.svg'">
                <h3 class="menu__name">${dish.name}</h3>
                <span class="menu__detail">${dish.category || 'Specialty'}</span>
                <span class="menu__preci">₹${dish.price}</span>
                <a href="#contact" class="button menu__button"><i class='bx bx-cart-alt'></i></a>
            </div>
        `).join('');
    } catch (err) {
        console.warn('API fetch failed, fallback', err);
    }
}
loadMenu();

/*==================== ANIMATED COUNTER ====================*/
function animateCounters() {
    const statsSection = document.getElementById('stats');
    if (!statsSection) return;

    let started = false;
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !started) {
            started = true;
            document.querySelectorAll('.stats__number').forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const duration = 1600;
                const step = target / (duration / 16);
                let current = 0;

                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        counter.textContent = target.toLocaleString();
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.floor(current).toLocaleString();
                    }
                }, 16);
            });
        }
    }, { threshold: 0.4 });

    observer.observe(statsSection);
}
animateCounters();

/*==================== RESERVATION FORM ====================*/
const resForm = document.getElementById('reservation-form');

if (resForm) {
    resForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = resForm.querySelector('button[type="submit"]');
        const origText = btn.textContent;
        btn.textContent = 'Booking…';
        btn.disabled = true;

        const data = {
            name: document.getElementById('res-name').value.trim(),
            email: document.getElementById('res-email').value.trim(),
            phone: document.getElementById('res-phone').value.trim(),
            guests: document.getElementById('res-guests').value,
            date: document.getElementById('res-date').value,
            time: document.getElementById('res-time').value,
            message: document.getElementById('res-message').value.trim()
        };

        try {
            const res = await fetch('http://localhost:5000/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to book');
            showToast(result.message || 'Table reserved successfully! See you soon. 🎉');
            resForm.reset();
        } catch (err) {
            showToast(err.message || 'Could not connect to server. Please try again.', 'error');
        } finally {
            btn.textContent = origText;
            btn.disabled = false;
        }
    });
}
