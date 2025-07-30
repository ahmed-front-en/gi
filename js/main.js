document.addEventListener('DOMContentLoaded', () => {

    // --- THEME (DARK/LIGHT MODE) TOGGLE ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Function to apply the theme
    const applyTheme = (theme) => {
        // Remove existing theme classes
        body.removeAttribute('data-theme');
        // Add the new theme
        body.setAttribute('data-theme', theme);

        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
    };

    // Check for saved theme in localStorage or user's OS preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    // Apply the initial theme
    applyTheme(initialTheme);

    // Event listener for the toggle button
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });


    // --- LANGUAGE (AR/EN) SWITCHER ---
    const langToggle = document.getElementById('lang-toggle');
    let currentLang = localStorage.getItem('lang') || 'en'; // Default to English

    // Function to update all text content based on the current language
    const updateTexts = (lang) => {
        if (!translations[lang]) return; // Exit if language not found

        currentLang = lang;
        localStorage.setItem('lang', lang);

        const elements = document.querySelectorAll('[data-lang]');
        elements.forEach(el => {
            const key = el.getAttribute('data-lang');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        const placeholderElements = document.querySelectorAll('[data-lang-placeholder]');
        placeholderElements.forEach(el => {
            const key = el.getAttribute('data-lang-placeholder');
             if (translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });

        // Update HTML tag attributes
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        // Update the language toggle button text
        langToggle.textContent = lang === 'ar' ? 'EN' : 'عربي';
    };

    // Initial text update on page load
    updateTexts(currentLang);

    // Event listener for the language toggle button
    langToggle.addEventListener('click', () => {
        const newLang = currentLang === 'en' ? 'ar' : 'en';
        updateTexts(newLang);
    });


    // --- SHOPPING CART LOGIC (EVENT LISTENERS) ---
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (card) {
                const id = card.dataset.id;
                const name = card.dataset.name;
                const price = parseFloat(card.dataset.price);
                const image = card.dataset.image;

                addToCart(id, name, price, image);
            }
        });
    });


    // --- PRODUCT DETAILS PAGE LOGIC ---
    if (document.querySelector('.product-details-layout')) {
        // Image Gallery
        const mainImage = document.getElementById('main-product-image');
        const thumbnails = document.querySelectorAll('.thumbnail-images img');

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // In a real site, you'd swap for a high-res image
                mainImage.src = thumb.src.replace('-thumb', '-main');

                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });

        // Add to Cart from Details Page
        const detailsAddToCartBtn = document.querySelector('.product-info .btn');
        detailsAddToCartBtn.addEventListener('click', () => {
            const productInfo = document.querySelector('.product-info');
            const id = productInfo.closest('.product-details-section').dataset.id || 'p-details'; // Placeholder ID
            const name = productInfo.querySelector('.product-title').textContent;
            const price = parseFloat(productInfo.querySelector('.product-price-details').textContent.replace('$', ''));
            const image = document.getElementById('main-product-image').src;

            const selectedSize = document.querySelector('.size-selector span.active')?.textContent;
            const selectedColor = document.querySelector('.color-selector span.active')?.title;

            const options = { size: selectedSize, color: selectedColor };

            addToCart(id, name, price, image, options);
        });
    }

    // --- OFFERS PAGE LOGIC ---
    if (document.getElementById('countdown-timer')) {
        // Set the date we're counting down to (e.g., 3 days from now)
        const countDownDate = new Date();
        countDownDate.setDate(countDownDate.getDate() + 3);

        const timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = countDownDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

            if (distance < 0) {
                clearInterval(timerInterval);
                document.getElementById('countdown-timer').innerHTML = "<h4 data-lang='deal_expired'>Deal Expired!</h4>";
            }
        }, 1000);
    }

    // --- PRODUCT FILTERING LOGIC ---
    if (document.querySelector('.products-layout')) {
        const productCards = document.querySelectorAll('.product-card');
        const categoryFilters = document.querySelectorAll('.filter-list input[name="category"]');
        const priceSlider = document.querySelector('.price-slider');
        const priceValue = document.querySelector('.price-value');

        function filterProducts() {
            const selectedCategories = Array.from(categoryFilters)
                .filter(input => input.checked)
                .map(input => input.value);

            const maxPrice = parseFloat(priceSlider.value);
            priceValue.textContent = `$50 - $${maxPrice}`;

            productCards.forEach(card => {
                const cardCategory = card.dataset.category;
                const cardPrice = parseFloat(card.dataset.price);

                const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(cardCategory);
                const priceMatch = cardPrice <= maxPrice;

                if (categoryMatch && priceMatch) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        categoryFilters.forEach(input => input.addEventListener('change', filterProducts));
        priceSlider.addEventListener('input', filterProducts);

        // Initial filter on page load
        filterProducts();
    }
});
