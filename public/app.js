const PRODUCTS = [
	{
		id: 'chiffon',
		name: 'Everyday Chiffon',
		description: 'Lightweight, floaty drape with a matte finish. No-slip grip.',
		price: 14.99,
		colors: [
			{ id: 'rose', name: 'Rose', hex: '#FF8CA3' },
			{ id: 'blush', name: 'Blush', hex: '#FFC6D3' },
			{ id: 'sand', name: 'Sand', hex: '#E3C4A0' },
			{ id: 'olive', name: 'Olive', hex: '#8C9A6D' },
			{ id: 'navy', name: 'Navy', hex: '#1D2951' },
			{ id: 'charcoal', name: 'Charcoal', hex: '#444444' },
		],
		image: null,
	},
	{
		id: 'jersey',
		name: 'Performance Jersey',
		description: 'Breathable stretch for workouts and daily comfort.',
		price: 16.99,
		colors: [
			{ id: 'berry', name: 'Berry', hex: '#B7094C' },
			{ id: 'peach', name: 'Peach', hex: '#FFB4A2' },
			{ id: 'sage', name: 'Sage', hex: '#A5BE9B' },
			{ id: 'sky', name: 'Sky', hex: '#87BFFF' },
			{ id: 'ink', name: 'Ink', hex: '#22223B' },
			{ id: 'cocoa', name: 'Cocoa', hex: '#6F4E37' },
		],
		image: null,
	},
	{
		id: 'silk',
		name: 'Luxe Silk',
		description: 'Elegant, glossy sheen for special moments.',
		price: 24.99,
		colors: [
			{ id: 'ruby', name: 'Ruby', hex: '#C81D25' },
			{ id: 'champagne', name: 'Champagne', hex: '#F7E7CE' },
			{ id: 'emerald', name: 'Emerald', hex: '#2ECC71' },
			{ id: 'sapphire', name: 'Sapphire', hex: '#0F52BA' },
			{ id: 'onyx', name: 'Onyx', hex: '#0B0B0D' },
			{ id: 'plum', name: 'Plum', hex: '#673147' },
		],
		image: null,
	},
];

const state = {
	cart: [], // { productId, colorId, colorHex, colorName, quantity, unitPrice }
};

function formatCurrency(value) {
	return `$${value.toFixed(2)}`;
}

function findProduct(productId) {
	return PRODUCTS.find(p => p.id === productId);
}

function renderCollections() {
	const container = document.getElementById('collections');
	container.innerHTML = '';

	PRODUCTS.forEach(product => {
		const card = document.createElement('div');
		card.className = 'product-card';

		const head = document.createElement('div');
		head.className = 'product-head';
		head.innerHTML = `
			<div>
				<div class="product-title">${product.name}</div>
				<p>${product.description}</p>
			</div>
			<div class="product-price">${formatCurrency(product.price)}</div>
		`;

		const swatches = document.createElement('div');
		swatches.className = 'swatches';

		product.colors.forEach(color => {
			const sw = document.createElement('button');
			sw.className = 'swatch';
			sw.style.background = color.hex;
			sw.setAttribute('aria-pressed', 'false');
			sw.title = `${product.name} — ${color.name}`;
			sw.innerHTML = `<span>+1</span>`;
			sw.addEventListener('click', () => addToCart(product.id, color));
			swatches.appendChild(sw);
		});

		const actions = document.createElement('div');
		actions.className = 'product-actions';
		actions.innerHTML = `
			<button class="secondary" data-action="view-${product.id}">View colors</button>
			<button class="primary" data-action="open-cart">Open cart</button>
		`;
		actions.querySelector('[data-action^="view-"]').addEventListener('click', () => {
			// Focus swatches area
			swatches.scrollIntoView({ behavior: 'smooth', block: 'center' });
		});
		actions.querySelector('[data-action="open-cart"]').addEventListener('click', openCart);

		card.appendChild(head);
		card.appendChild(swatches);
		card.appendChild(actions);
		container.appendChild(card);
	});
}

function openCart() {
	document.getElementById('cartDrawer').setAttribute('aria-hidden', 'false');
}

function closeCart() {
	document.getElementById('cartDrawer').setAttribute('aria-hidden', 'true');
}

function openCheckout() {
	document.getElementById('checkoutModal').setAttribute('aria-hidden', 'false');
}

function closeCheckout() {
	document.getElementById('checkoutModal').setAttribute('aria-hidden', 'true');
}

function addToCart(productId, color) {
	const product = findProduct(productId);
	if (!product) return;

	const key = `${productId}:${color.id}`;
	const existing = state.cart.find(item => item.key === key);
	if (existing) {
		existing.quantity += 1;
	} else {
		state.cart.push({
			key,
			productId,
			colorId: color.id,
			colorHex: color.hex,
			colorName: color.name,
			quantity: 1,
			unitPrice: product.price,
			productName: product.name,
		});
	}
	updateCartUI();
}

function removeFromCart(key) {
	state.cart = state.cart.filter(item => item.key !== key);
	updateCartUI();
}

function changeQuantity(key, delta) {
	const item = state.cart.find(it => it.key === key);
	if (!item) return;
	item.quantity += delta;
	if (item.quantity <= 0) {
		removeFromCart(key);
	} else {
		updateCartUI();
	}
}

function cartTotals() {
	const subtotal = state.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
	return { subtotal };
}

function updateCartUI() {
	const cartCount = state.cart.reduce((count, item) => count + item.quantity, 0);
	document.getElementById('cartCount').textContent = String(cartCount);
	document.getElementById('stickyCount').textContent = String(cartCount);

	const { subtotal } = cartTotals();
	document.getElementById('cartSubtotal').textContent = formatCurrency(subtotal);

	const itemsContainer = document.getElementById('cartItems');
	itemsContainer.innerHTML = '';

	state.cart.forEach(item => {
		const row = document.createElement('div');
		row.className = 'cart-item';
		row.innerHTML = `
			<div class="dot" style="background:${item.colorHex}"></div>
			<div>
				<div><strong>${item.productName}</strong> — ${item.colorName}</div>
				<div class="muted">${formatCurrency(item.unitPrice)} each</div>
			</div>
			<div style="display:grid; gap:6px; justify-items:end;">
				<div>${formatCurrency(item.unitPrice * item.quantity)}</div>
				<div class="qty">
					<button data-action="dec">−</button>
					<span>${item.quantity}</span>
					<button data-action="inc">+</button>
				</div>
				<button class="icon-btn" data-action="remove">Remove</button>
			</div>
		`;
		row.querySelector('[data-action="dec"]').addEventListener('click', () => changeQuantity(item.key, -1));
		row.querySelector('[data-action="inc"]').addEventListener('click', () => changeQuantity(item.key, 1));
		row.querySelector('[data-action="remove"]').addEventListener('click', () => removeFromCart(item.key));
		itemsContainer.appendChild(row);
	});
}

async function submitCheckout(event) {
	event.preventDefault();

	const form = event.currentTarget;
	const data = {
		customer: {
			name: form.name.value.trim(),
			phone: form.phone.value.trim(),
			address: form.address.value.trim(),
		},
		cart: state.cart,
	};

	if (!data.customer.name || !data.customer.phone || !data.customer.address || data.cart.length === 0) {
		alert('Please complete your details and add at least one item.');
		return;
	}

	try {
		const response = await fetch('/api/checkout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});
		const result = await response.json();
		if (!response.ok) throw new Error(result.error || 'Checkout failed');

		alert('Thank you! Your order has been received. We will contact you.');
		state.cart = [];
		updateCartUI();
		closeCheckout();
		closeCart();
	} catch (err) {
		console.error(err);
		alert('Sorry, something went wrong. Please try again.');
	}
}

function renderOrderSummary() {
	const { subtotal } = cartTotals();
	const summary = document.getElementById('orderSummary');
	summary.innerHTML = `
		<div><strong>Items:</strong> ${state.cart.reduce((c,i)=>c+i.quantity,0)}</div>
		<div><strong>Subtotal:</strong> ${formatCurrency(subtotal)}</div>
		<div class="muted">Cash on delivery or phone confirmation.</div>
	`;
}

function wireEvents() {
	document.getElementById('openCartBtn').addEventListener('click', openCart);
	document.getElementById('closeCartBtn').addEventListener('click', closeCart);
	document.getElementById('checkoutBtn').addEventListener('click', () => {
		if (state.cart.length === 0) { alert('Your cart is empty.'); return; }
		renderOrderSummary();
		openCheckout();
	});
	document.getElementById('closeCheckoutBtn').addEventListener('click', closeCheckout);
	document.getElementById('backToCartBtn').addEventListener('click', () => { closeCheckout(); openCart(); });
	document.getElementById('checkoutForm').addEventListener('submit', submitCheckout);
	document.getElementById('stickyCheckout').addEventListener('click', () => {
		if (state.cart.length === 0) { openCart(); return; }
		renderOrderSummary();
		openCheckout();
	});

	document.getElementById('year').textContent = String(new Date().getFullYear());
}

// Init
renderCollections();
updateCartUI();
wireEvents();