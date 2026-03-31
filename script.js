// ── DATA ──
const pizzas = [
  { id:1, name:"Pepperoni Feast",    emoji:"🍕", price:13.99, old:17.99, desc:"Loaded with premium pepperoni and mozzarella on our classic tomato sauce.",   badge:"Best Seller", bc:"badge-best" },
  { id:2, name:"Margherita Classic", emoji:"🫒", price:11.99, old:null,  desc:"Fresh basil, premium mozzarella and our signature tomato sauce.",             badge:"Veg",         bc:"badge-veg"  },
  { id:3, name:"BBQ Chicken",        emoji:"🍗", price:14.99, old:18.99, desc:"Grilled chicken, red onions, BBQ sauce and mozzarella cheese.",               badge:"New",         bc:""           },
  { id:4, name:"Veggie Supreme",     emoji:"🥦", price:12.99, old:null,  desc:"Bell peppers, mushrooms, olives, onions and sweet corn.",                     badge:"Veg",         bc:"badge-veg"  },
  { id:5, name:"Meat Lovers",        emoji:"🥩", price:15.99, old:19.99, desc:"Pepperoni, sausage, bacon, ham and beef meatballs.",                          badge:"Hot",         bc:"badge-hot"  },
  { id:6, name:"Hawaiian Delight",   emoji:"🍍", price:12.99, old:null,  desc:"Ham and pineapple on a honey-glazed tomato sauce.",                           badge:"",            bc:""           },
  { id:7, name:"Truffle Mushroom",   emoji:"🍄", price:16.99, old:null,  desc:"Wild mushrooms, truffle oil, parmesan and fresh thyme.",                     badge:"Premium",     bc:"badge-best" },
  { id:8, name:"Spicy Inferno",      emoji:"🌶️", price:13.99, old:null,  desc:"Jalapeños, hot sauce base, spicy sausage and chilli flakes.",                badge:"Hot",         bc:"badge-hot"  },
];

const sides = [
  { id:101, name:"Garlic Bread",      emoji:"🥖", price:3.99 },
  { id:102, name:"Chicken Wings",     emoji:"🍗", price:6.99 },
  { id:103, name:"Mozzarella Sticks", emoji:"🧀", price:5.49 },
  { id:104, name:"Caesar Salad",      emoji:"🥗", price:5.99 },
  { id:105, name:"Potato Wedges",     emoji:"🍟", price:3.49 },
  { id:106, name:"Onion Rings",       emoji:"🧅", price:3.99 },
];

const drinks = [
  { id:201, name:"Cola (2L)",    emoji:"🥤", price:2.99 },
  { id:202, name:"Diet Cola",    emoji:"🥤", price:2.99 },
  { id:203, name:"Lemonade",     emoji:"🍋", price:2.49 },
  { id:204, name:"Iced Tea",     emoji:"🧊", price:2.49 },
  { id:205, name:"Orange Juice", emoji:"🍊", price:2.99 },
  { id:206, name:"Water",        emoji:"💧", price:1.49 },
];

const desserts = [
  { id:301, name:"Choco Lava",     emoji:"🍫", price:4.99 },
  { id:302, name:"Cinnamon Rolls", emoji:"🥐", price:5.49 },
  { id:303, name:"Brownie",        emoji:"🟫", price:3.99 },
  { id:304, name:"Ice Cream",      emoji:"🍦", price:3.49 },
];

let cart = {};
let promoApplied = false;

// ── RENDER PIZZAS ──
function renderPizzas(list) {
  const grid = document.getElementById('pizzaGrid');
  if (!list.length) {
    grid.innerHTML = `<p style="color:#666;padding:1rem 0">No pizzas found 😔</p>`;
    return;
  }
  grid.innerHTML = list.map(p => `
    <div class="pizza-card">
      <div class="pizza-img">
        ${p.badge ? `<div class="pizza-badge ${p.bc}">${p.badge}</div>` : ''}
        ${p.emoji}
      </div>
      <div class="pizza-body">
        <div class="pizza-name">${p.name}</div>
        <div class="pizza-desc">${p.desc}</div>
        <div class="pizza-footer">
          <div class="pizza-price">
            
$$
{p.price.toFixed(2)}
            ${p.old ? `<del>
$$
{p.old.toFixed(2)}</del>` : ''}
          </div>
          <div id="ctrl-${p.id}">${renderCtrl(p.id)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// ── RENDER SMALL GRID (sides / drinks / desserts) ──
function renderSmallGrid(gridId, arr) {
  document.getElementById(gridId).innerHTML = arr.map(s => `
    <div class="side-card">
      <div class="side-img">${s.emoji}</div>
      <div class="side-body">
        <div class="side-name">${s.name}</div>
        <div class="side-price">
$$
{s.price.toFixed(2)}</div>
        <button class="side-add" onclick="addExtra(${s.id},'${s.name}',${s.price},'${s.emoji}')">+ Add</button>
      </div>
    </div>
  `).join('');
}

// ── RENDER ADD / QTY CONTROL ──
function renderCtrl(id) {
  const qty = cart[id]?.qty || 0;
  if (qty === 0) {
    return `<button class="add-btn" onclick="addPizza(${id})">+ Add</button>`;
  }
  return `
    <div class="qty-control">
      <button class="qty-btn" onclick="changeQty(${id}, -1)">−</button>
      <span class="qty-num">${qty}</span>
      <button class="qty-btn" onclick="changeQty(${id}, 1)">+</button>
    </div>`;
}

// ── ADD PIZZA ──
function addPizza(id) {
  const item = pizzas.find(p => p.id === id);
  if (!cart[id]) cart[id] = { ...item, qty: 0 };
  cart[id].qty++;
  refreshCtrl(id);
  updateCartUI();
  showToast(`🍕 ${item.name} added!`);
}

// ── ADD EXTRA (sides / drinks / desserts) ──
function addExtra(id, name, price, emoji) {
  if (!cart[id]) cart[id] = { id, name, price, emoji, qty: 0 };
  cart[id].qty++;
  updateCartUI();
  showToast(`${emoji} ${name} added!`);
}

// ── CHANGE QTY ──
function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  refreshCtrl(id);
  updateCartUI();
}

// ── REMOVE ITEM ──
function removeItem(id) {
  delete cart[id];
  refreshCtrl(id);
  updateCartUI();
}

// ── REFRESH PIZZA CARD CONTROL ──
function refreshCtrl(id) {
  const el = document.getElementById(`ctrl-${id}`);
  if (el) el.innerHTML = renderCtrl(id);
}

// ── UPDATE CART UI ──
function updateCartUI() {
  const items  = Object.values(cart);
  const total  = items.reduce((s, i) => s + i.qty, 0);

  document.getElementById('cartCount').textContent = total;

  const body   = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');

  if (!items.length) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="e-icon">🍕</div>
        <h4>Your cart is empty</h4>
        <p>Add some delicious items to get started!</p>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  body.innerHTML = items.map(item => `
    <div class="cart-item">
      <div class="ci-emoji">${item.emoji}</div>
      <div class="ci-info">
        <h4>${item.name}</h4>
        <p>
$$
{item.price.toFixed(2)} each</p>
      </div>
      <div class="ci-right">
        <span class="ci-price">
$$
{(item.price * item.qty).toFixed(2)}</span>
        <div class="ci-qty">
          <button class="cq-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="cq-num">${item.qty}</span>
          <button class="cq-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        <button class="ci-remove" onclick="removeItem(${item.id})">✕ Remove</button>
      </div>
    </div>
  `).join('');

  const subtotal   = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery   = subtotal >= 20 ? 0 : 2.99;
  const discount   = promoApplied ? subtotal * 0.2 : 0;
  const tax        = (subtotal - discount) * 0.08;
  const grandTotal = subtotal - discount + delivery + tax;

  document.getElementById('cartSummary').innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>
$$
{subtotal.toFixed(2)}</span></div>
    ${discount > 0 ? `<div class="summary-row" style="color:green"><span>Promo (PIZZA20)</span><span>−
$$
{discount.toFixed(2)}</span></div>` : ''}
    <div class="summary-row"><span>Delivery</span><span>${delivery === 0 ? '🎉 FREE' : '$' + delivery.toFixed(2)}</span></div>
    <div class="summary-row"><span>Tax (8%)</span><span>
$$
{tax.toFixed(2)}</span></div>
    <div class="summary-row total"><span>Total</span><span>$${grandTotal.toFixed(2)}</span></div>`;

  footer.style.display = 'block';
}

// ── APPLY PROMO ──
function applyPromo() {
  const code = document.getElementById('promoInput').value.trim().toUpperCase();
  if (code === 'PIZZA20') {
    promoApplied = true;
    updateCartUI();
    showToast('🎉 20% promo applied!');
  } else {
    showToast('❌ Invalid promo code');
  }
}

// ── CHECKOUT ──
function checkout() {
  if (!Object.keys(cart).length) return;
  const num = '#PIZ-' + Math.floor(100000 + Math.random() * 900000);
  document.getElementById('orderNum').textContent = num;
  document.getElementById('modalOverlay').classList.add('open');
  cart = {};
  promoApplied = false;
  updateCartUI();
  toggleCart();
  renderPizzas(pizzas);
}

// ── CLOSE MODAL ──
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// ── TOGGLE CART ──
function toggleCart() {
  document.getElementById('cartPanel').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}

// ── DELIVERY TAB ──
function setDeliveryTab(el, name) {
  document.querySelectorAll('.delivery-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  showToast(`Mode: ${name}`);
}

// ── SCROLL TO SECTION ──
function scrollToSection(id, el) {
  document.querySelectorAll('.cat-item').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const target = document.getElementById(id);
  if (target) {
    const offset = target.getBoundingClientRect().top + window.pageYOffset - 130;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
}

// ── SEARCH ──
function handleSearch() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const filtered = q
    ? pizzas.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
      )
    : pizzas;
  renderPizzas(filtered);
}

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  renderPizzas(pizzas);
  renderSmallGrid('sidesGrid',    sides);
  renderSmallGrid('drinksGrid',   drinks);
  renderSmallGrid('dessertsGrid', desserts);
  updateCartUI();
});