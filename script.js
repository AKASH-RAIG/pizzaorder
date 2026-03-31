// ── HELPER: safe number formatting ──
function fmt(val) {
  const n = Number(val);
  if (isNaN(n)) return '0.00';
  return n.toFixed(2);
}

// ── DATA (prices explicitly cast as Number) ──
const pizzas = [
  { id:1, name:"Pepperoni Feast",    emoji:"🍕", price:Number(13.99), old:Number(17.99), desc:"Loaded with premium pepperoni and mozzarella on our classic tomato sauce.",   badge:"Best Seller", bc:"badge-best" },
  { id:2, name:"Margherita Classic", emoji:"🫒", price:Number(11.99), old:null,          desc:"Fresh basil, premium mozzarella and our signature tomato sauce.",             badge:"Veg",         bc:"badge-veg"  },
  { id:3, name:"BBQ Chicken",        emoji:"🍗", price:Number(14.99), old:Number(18.99), desc:"Grilled chicken, red onions, BBQ sauce and mozzarella cheese.",               badge:"New",         bc:""           },
  { id:4, name:"Veggie Supreme",     emoji:"🥦", price:Number(12.99), old:null,          desc:"Bell peppers, mushrooms, olives, onions and sweet corn.",                     badge:"Veg",         bc:"badge-veg"  },
  { id:5, name:"Meat Lovers",        emoji:"🥩", price:Number(15.99), old:Number(19.99), desc:"Pepperoni, sausage, bacon, ham and beef meatballs.",                          badge:"Hot",         bc:"badge-hot"  },
  { id:6, name:"Hawaiian Delight",   emoji:"🍍", price:Number(12.99), old:null,          desc:"Ham and pineapple on a honey-glazed tomato sauce.",                           badge:"",            bc:""           },
  { id:7, name:"Truffle Mushroom",   emoji:"🍄", price:Number(16.99), old:null,          desc:"Wild mushrooms, truffle oil, parmesan and fresh thyme.",                     badge:"Premium",     bc:"badge-best" },
  { id:8, name:"Spicy Inferno",      emoji:"🌶️", price:Number(13.99), old:null,          desc:"Jalapeños, hot sauce base, spicy sausage and chilli flakes.",                badge:"Hot",         bc:"badge-hot"  },
];

const sides = [
  { id:101, name:"Garlic Bread",      emoji:"🥖", price:Number(3.99) },
  { id:102, name:"Chicken Wings",     emoji:"🍗", price:Number(6.99) },
  { id:103, name:"Mozzarella Sticks", emoji:"🧀", price:Number(5.49) },
  { id:104, name:"Caesar Salad",      emoji:"🥗", price:Number(5.99) },
  { id:105, name:"Potato Wedges",     emoji:"🍟", price:Number(3.49) },
  { id:106, name:"Onion Rings",       emoji:"🧅", price:Number(3.99) },
];

const drinks = [
  { id:201, name:"Cola (2L)",    emoji:"🥤", price:Number(2.99) },
  { id:202, name:"Diet Cola",    emoji:"🥤", price:Number(2.99) },
  { id:203, name:"Lemonade",     emoji:"🍋", price:Number(2.49) },
  { id:204, name:"Iced Tea",     emoji:"🧊", price:Number(2.49) },
  { id:205, name:"Orange Juice", emoji:"🍊", price:Number(2.99) },
  { id:206, name:"Water",        emoji:"💧", price:Number(1.49) },
];

const desserts = [
  { id:301, name:"Choco Lava",     emoji:"🍫", price:Number(4.99) },
  { id:302, name:"Cinnamon Rolls", emoji:"🥐", price:Number(5.49) },
  { id:303, name:"Brownie",        emoji:"🟫", price:Number(3.99) },
  { id:304, name:"Ice Cream",      emoji:"🍦", price:Number(3.49) },
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
            
$${ fmt(p.price)}
            ${p.old ? `<del>
$${ fmt(p.old)}</del>` : ''}
          </div>
          <div id="ctrl-${p.id}">${renderCtrl(p.id)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// ── RENDER SMALL GRID (sides / drinks / desserts) ──
function renderSmallGrid(gridId, arr) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = arr.map(s => {
    const price = Number(s.price);           // ← force Number here
    return `
      <div class="side-card">
        <div class="side-img">${s.emoji}</div>
        <div class="side-body">
          <div class="side-name">${s.name}</div>
          <div class="side-price">
$${ fmt(price)}</div>
          <button class="side-add" onclick="addExtra(${s.id}, '${s.name}', ${price}, '${s.emoji}')">+ Add</button>
        </div>
      </div>`;
  }).join('');
}

// ── RENDER ADD / QTY CONTROL ──
function renderCtrl(id) {
  const qty = cart[id] ? cart[id].qty : 0;
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
  if (!item) return;
  if (!cart[id]) {
    cart[id] = {
      id:    item.id,
      name:  item.name,
      emoji: item.emoji,
      price: Number(item.price),
      qty:   0
    };
  }
  cart[id].qty++;
  refreshCtrl(id);
  updateCartUI();
  showToast(`🍕 ${item.name} added!`);
}

// ── ADD EXTRA (sides / drinks / desserts) ──
function addExtra(id, name, price, emoji) {
  if (!cart[id]) {
    cart[id] = {
      id:    id,
      name:  name,
      emoji: emoji,
      price: Number(price),
      qty:   0
    };
  }
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
  const el = document.getElementById('ctrl-' + id);
  if (el) el.innerHTML = renderCtrl(id);
}

// ── UPDATE CART UI ──
function updateCartUI() {
  const items    = Object.values(cart);
  const totalQty = items.reduce(function(sum, i) { return sum + i.qty; }, 0);

  document.getElementById('cartCount').textContent = totalQty;

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

  // ── CART ITEMS ──
  body.innerHTML = items.map(function(item) {
    const itemPrice = Number(item.price);
    const lineTotal = itemPrice * item.qty;
    return `
      <div class="cart-item">
        <div class="ci-emoji">${item.emoji}</div>
        <div class="ci-info">
          <h4>${item.name}</h4>
          <p>
$${ fmt(itemPrice)} each</p>
        </div>
        <div class="ci-right">
          <span class="ci-price">
$${ fmt(lineTotal)}</span>
          <div class="ci-qty">
            <button class="cq-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <span class="cq-num">${item.qty}</span>
            <button class="cq-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
          <button class="ci-remove" onclick="removeItem(${item.id})">✕ Remove</button>
        </div>
      </div>`;
  }).join('');

  // ── PRICE CALCULATIONS ──
  const subtotal   = items.reduce(function(sum, i) { return sum + Number(i.price) * i.qty; }, 0);
  const discount   = promoApplied ? subtotal * 0.20 : 0;
  const discounted = subtotal - discount;
  const delivery   = subtotal >= 20 ? 0 : 2.99;
  const tax        = discounted * 0.08;
  const grandTotal = discounted + delivery + tax;

  // ── SUMMARY HTML ──
  var summaryHTML = `
    <div class="summary-row">
      <span>Subtotal (${totalQty} item${totalQty > 1 ? 's' : ''})</span>
      <span>
$${ fmt(subtotal)}</span>
    </div>`;

  if (discount > 0) {
    summaryHTML += `
      <div class="summary-row discount">
        <span>🎟️ Promo PIZZA20 (−20%)</span>
        <span>−
$${ fmt(discount)}</span>
      </div>`;
  }

  summaryHTML += `
    <div class="summary-row">
      <span>🛵 Delivery</span>
      <span>${delivery === 0 ? '<span class="free-tag">FREE</span>' : '$' + fmt(delivery)}</span>
    </div>
    <div class="summary-row">
      <span>🧾 Tax (8%)</span>
      <span>
$${ fmt(tax)}</span>
    </div>
    <div class="summary-row total">
      <span>Grand Total</span>
      <span>
$${ fmt(grandTotal)}</span>
    </div>`;

  if (delivery > 0) {
    summaryHTML += `
      <div class="free-delivery-hint">
        🎯 Add <strong>
$${ fmt(20 - subtotal)}</strong> more for FREE delivery!
      </div>`;
  }

  document.getElementById('cartSummary').innerHTML = summaryHTML;
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
  document.querySelectorAll('.delivery-tab').forEach(function(t) {
    t.classList.remove('active');
  });
  el.classList.add('active');
  showToast('Mode: ' + name);
}

// ── SCROLL TO SECTION ──
function scrollToSection(id, el) {
  document.querySelectorAll('.cat-item').forEach(function(c) {
    c.classList.remove('active');
  });
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
    ? pizzas.filter(function(p) {
        return p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
      })
    : pizzas;
  renderPizzas(filtered);
}

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(function() {
    t.classList.remove('show');
  }, 2500);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', function() {
  renderPizzas(pizzas);
  renderSmallGrid('sidesGrid',    sides);
  renderSmallGrid('drinksGrid',   drinks);
  renderSmallGrid('dessertsGrid', desserts);
  updateCartUI();
});