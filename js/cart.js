/**
 * Retrieves the cart from localStorage.
 * @returns {Array} The cart items.
 */
function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart'));
        return Array.isArray(cart) ? cart : [];
    } catch (e) {
        return [];
    }
}

/**
 * Saves the cart to localStorage.
 * @param {Array} cart - The cart items to save.
 */
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Adds an item to the shopping cart.
 * @param {string} id - The product ID.
 * @param {string} name - The product name.
 * @param {number} price - The product price.
 * @param {string} image - The product image URL.
 * @param {object} options - Additional options like size and color.
 */
function addToCart(id, name, price, image, options = {}) {
    const cart = getCart();
    // Create a unique ID for the cart item based on product ID and options
    const cartItemId = `${id}-${options.size || ''}-${options.color || ''}`;
    const existingItem = cart.find(item => item.cartItemId === cartItemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ cartItemId, id, name, price, image, options, quantity: 1 });
    }

    saveCart(cart);
    updateCartIcon();
    // In a real app, you'd show a more user-friendly notification
    console.log(`Added "${name}" to cart.`);
    alert(`"${name}" has been added to your cart!`);
}

/**
 * Removes an item from the cart.
 * @param {string} cartItemId - The unique ID of the item in the cart.
 */
function removeFromCart(cartItemId) {
    let cart = getCart();
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    saveCart(cart);
    updateCartIcon();
}

/**
 * Updates the quantity of a specific item in the cart.
 * @param {string} cartItemId - The unique ID of the item in the cart.
 * @param {number} quantity - The new quantity.
 */
function updateItemQuantity(cartItemId, quantity) {
    let cart = getCart();
    const item = cart.find(item => item.cartItemId === cartItemId);
    if (item) {
        if (quantity > 0) {
            item.quantity = quantity;
        } else {
            // If quantity is 0 or less, remove the item
            cart = cart.filter(i => i.cartItemId !== cartItemId);
        }
        saveCart(cart);
        updateCartIcon();
    }
}

/**
 * Updates the cart count in the header.
 */
function updateCartIcon() {
    const cart = getCart();
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        if (cartCount > 0) {
            cartCountElement.style.display = 'flex';
        } else {
            cartCountElement.style.display = 'none';
        }
    }
}

/**
 * Renders the items in the cart page.
 */
function renderCartPage() {
    const cartTableBody = document.querySelector('.cart-table tbody');
    const cartSummary = document.querySelector('.cart-summary');
    if (!cartTableBody || !cartSummary) return; // Only run on cart page

    const cart = getCart();
    cartTableBody.innerHTML = ''; // Clear existing items

    if (cart.length === 0) {
        cartTableBody.innerHTML = '<tr class="empty-cart-row"><td colspan="5" data-lang="empty_cart_message">Your cart is empty.</td></tr>';
    } else {
        let subtotal = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            const itemRow = document.createElement('tr');
            itemRow.className = 'cart-item';
            itemRow.innerHTML = `
                <td class="product-info-cell">
                    <img src="${item.image}" alt="${item.name}" style="background-color:#eee;">
                    <div>
                        <h4 class="cart-item-name">${item.name}</h4>
                        <p class="cart-item-meta">${item.options.color || ''} ${item.options.size ? `, Size: ${item.options.size}` : ''}</p>
                    </div>
                </td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <div class="quantity-selector-cart">
                        <button class="quantity-change" data-id="${item.cartItemId}" data-change="-1">-</button>
                        <input type="text" value="${item.quantity}" readonly>
                        <button class="quantity-change" data-id="${item.cartItemId}" data-change="1">+</button>
                    </div>
                </td>
                <td>$${itemTotal.toFixed(2)}</td>
                <td><button class="remove-item-btn" data-id="${item.cartItemId}">×</button></td>
            `;
            cartTableBody.appendChild(itemRow);
        });

        // Update summary
        const summarySubtotal = cartSummary.querySelector('.summary-row:nth-child(2) span:last-child');
        const summaryTotal = cartSummary.querySelector('.summary-total span:last-child');
        summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
        summaryTotal.textContent = `$${subtotal.toFixed(2)}`; // Assuming no shipping/taxes for now
    }

    // Add event listeners for remove and quantity buttons
    cartTableBody.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const cartItemId = e.target.dataset.id;
            removeFromCart(cartItemId);
            renderCartPage(); // Re-render the cart
        });
    });

    cartTableBody.querySelectorAll('.quantity-change').forEach(button => {
        button.addEventListener('click', (e) => {
            const cartItemId = e.target.dataset.id;
            const change = parseInt(e.target.dataset.change, 10);
            const item = getCart().find(i => i.cartItemId === cartItemId);
            if (item) {
                updateItemQuantity(cartItemId, item.quantity + change);
                renderCartPage(); // Re-render the cart
            }
        });
    });
}

// Initial update of the cart icon and render cart page if applicable
document.addEventListener('DOMContentLoaded', () => {
    updateCartIcon();
    renderCartPage();
});
