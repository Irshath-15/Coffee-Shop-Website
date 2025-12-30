// Cart helpers
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function setCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Add product to cart (product: {id,name,price})
function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.qty = (existing.qty || 1) + 1;
    } else {
        cart.push(Object.assign({}, product, { qty: 1 }));
    }

    setCart(cart);
    updateCartCount();
    alert(product.name + " added to cart");
}

// Update cart count in navbar (shows total quantity)
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((s, i) => s + (i.qty || 1), 0);
    const cartCount = document.getElementById("cart-count");

    if (cartCount) cartCount.innerText = count;
}

// Render product details on product.html based on ?id=
function renderProductPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 'shirt';

    const products = {
        shirt: { id: 'shirt', name: 'Casual Shirt', price: 999, img: 'images/shirt.png', desc: 'Premium cotton, comfortable daily wear.' },
        jacket: { id: 'jacket', name: 'Winter Jacket', price: 2499, img: 'images/jacket.png', desc: 'Warm insulated jacket for cold days.' },
        dress: { id: 'dress', name: 'Summer Dress', price: 1799, img: 'images/dress.png', desc: 'Lightweight and breezy summer dress.' },
        jeans: { id: 'jeans', name: 'Denim Jeans', price: 1299, img: 'images/jeans.png', desc: 'Classic denim with a modern fit.' }
    };

    const p = products[id] || products.shirt;

    const imgEl = document.querySelector('.product-detail img');
    const titleEl = document.querySelector('.product-info h2');
    const priceEl = document.querySelector('.product-info p strong');
    const descEl = document.querySelector('.product-info p + p');
    const addBtn = document.querySelector('.product-info button');

    if (imgEl) imgEl.src = p.img;
    if (titleEl) titleEl.innerText = p.name;
    if (priceEl) priceEl.parentNode.innerHTML = '<strong>Price:</strong> ₹' + p.price;
    if (descEl) descEl.innerText = p.desc;

    if (addBtn) addBtn.onclick = function() { addToCart(p); };
}

// Checkout: render cart items into .checkout-cart container
function renderCheckoutCart() {
    const container = document.getElementById('checkout-cart');
    if (!container) return;

    const cart = getCart();
    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    let html = '<ul class="cart-list">';
    let total = 0;
    cart.forEach(item => {
        const qty = item.qty || 1;
        const line = qty * item.price;
        total += line;
        html += `<li class="cart-item" data-id="${item.id}">
            <img class="cart-thumb" src="${item.img || 'images/shirt.png'}" alt="${item.name}">
            <div class="cart-meta">
                <div class="cart-name">${item.name}</div>
                <div class="cart-controls">
                    <button class="qty-btn" data-action="decrease">-</button>
                    <span class="qty">${qty}</span>
                    <button class="qty-btn" data-action="increase">+</button>
                </div>
            </div>
            <div class="cart-line">₹${line}</div>
            <button class="remove-btn" data-id="${item.id}">Remove</button>
        </li>`;
    });
    html += `</ul><div class="cart-total">Total: <strong>₹${total}</strong></div>`;
    html += '<div class="cart-actions"><button id="clear-cart">Clear Cart</button></div>';

    container.innerHTML = html;

    // Attach handlers for clear, remove, and qty buttons
    const clearBtn = document.getElementById('clear-cart');
    if (clearBtn) clearBtn.onclick = function() { setCart([]); updateCartCount(); renderCheckoutCart(); };

    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            removeFromCart(id);
            renderCheckoutCart();
        });
    });

    container.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const li = this.closest('.cart-item');
            const id = li.getAttribute('data-id');
            changeQty(id, action === 'increase' ? 1 : -1);
            renderCheckoutCart();
        });
    });
}

// Remove item completely from cart
function removeFromCart(id) {
    const cart = getCart().filter(i => i.id !== id);
    setCart(cart);
    updateCartCount();
}

// Change quantity by delta (can be negative)
function changeQty(id, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = (item.qty || 1) + delta;
    if (item.qty <= 0) {
        // remove
        const idx = cart.findIndex(i => i.id === id);
        if (idx > -1) cart.splice(idx,1);
    }
    setCart(cart);
    updateCartCount();
}

// Place order handler used on checkout form
function placeOrder(event) {
    event.preventDefault();
    setCart([]);
    updateCartCount();
    renderCheckoutCart();
    alert('Order placed successfully!');
}

// Initialize on load
window.addEventListener('load', function() {
    updateCartCount();
    if (window.location.pathname.endsWith('product.html')) renderProductPage();
    if (window.location.pathname.endsWith('checkout.html')) renderCheckoutCart();
});

// CART MODAL & MINI-CART
function renderMiniCart() {
    const container = document.getElementById('mini-cart');
    if (!container) return;
    const cart = getCart();
    if (!cart || cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    let html = '<ul class="cart-list">';
    let total = 0;
    cart.forEach(item => {
        const qty = item.qty || 1;
        const line = qty * item.price;
        total += line;
        html += `<li class="cart-item">
            <img class="cart-thumb" src="${item.img||'images/shirt.png'}" alt="${item.name}">
            <div class="cart-meta">
                <div class="cart-name">${item.name}</div>
                <div class="cart-qty">Qty: ${qty}</div>
            </div>
            <div class="cart-line">₹${line}</div>
        </li>`;
    });
    html += `</ul><div class="cart-total">Total: <strong>₹${total}</strong></div>`;
    html += '<div style="text-align:right;margin-top:8px;"><a href="checkout.html" class="btn-primary">Go to Checkout</a></div>';
    container.innerHTML = html;
}

function openCartModal() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    renderMiniCart();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
}

// Wire up cart button and modal controls
document.addEventListener('click', function(e) {
    const target = e.target;
    if (target && target.id === 'cart-btn') { e.preventDefault(); openCartModal(); }
    if (target && target.id === 'close-cart') { e.preventDefault(); closeCartModal(); }
    if (target && target.id === 'checkout-redirect') { window.location.href = 'checkout.html'; }
});
