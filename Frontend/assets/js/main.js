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
