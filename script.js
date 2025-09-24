// Initialize products array from localStorage
let products = JSON.parse(localStorage.getItem('labelStockProducts')) || [];
let editingIndex = -1;

// Function to save products to localStorage
function saveProducts() {
    localStorage.setItem('labelStockProducts', JSON.stringify(products));
}

// Function to render product list
function renderProducts() {
    const ul = document.getElementById('products-ul');
    ul.innerHTML = '';

    products.forEach((product, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" class="product-checkbox" data-index="${index}">
            <span>${product.name} - Цена: ${product.price} руб. - Кол-во: ${product.quantity}</span>
            ${product.barcode ? ` - Штрих-код: ${product.barcode}` : ''}
            <button class="edit-btn" data-index="${index}">Редактировать</button>
            <button class="delete-btn" data-index="${index}">Удалить</button>
        `;
        ul.appendChild(li);
    });

    // Add event listeners after rendering
    addEventListeners();
}

// Function to add event listeners for edit and delete
function addEventListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            editingIndex = index;
            const product = products[index];

            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-quantity').value = product.quantity;
            document.getElementById('product-barcode').value = product.barcode || '';

            document.querySelector('#product-form button[type="submit"]').textContent = 'Обновить';
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (confirm('Удалить товар?')) {
                products.splice(index, 1);
                saveProducts();
                renderProducts();
            }
        });
    });
}

// Handle form submission
document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('product-quantity').value);
    const barcode = document.getElementById('product-barcode').value || null;

    const productData = { name, price, quantity, barcode };

    if (editingIndex >= 0) {
        // Update existing product
        products[editingIndex] = productData;
        editingIndex = -1;
        document.querySelector('#product-form button[type="submit"]').textContent = 'Добавить';
    } else {
        // Add new product
        products.push(productData);
    }

    saveProducts();
    renderProducts();

    // Reset form
    e.target.reset();
});

// Generate labels for selected products
document.getElementById('generate-labels').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.product-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('Выберите товары для генерации этикеток.');
        return;
    }

    const preview = document.getElementById('labels-preview');
    preview.innerHTML = '';

    checkboxes.forEach(checkbox => {
        const index = parseInt(checkbox.dataset.index);
        const product = products[index];

        const labelDiv = document.createElement('div');
        labelDiv.className = 'label';
        labelDiv.innerHTML = `
            <h3>${product.name}</h3>
            <p>Цена: ${product.price} руб.</p>
            ${product.quantity > 0 ? `<p>Количество: ${product.quantity}</p>` : ''}
            ${product.barcode ? `<p>Штрих-код: ${product.barcode}</p>` : ''}
        `;
        preview.appendChild(labelDiv);
    });

    document.getElementById('print-labels').style.display = 'block';
});

// Print labels
document.getElementById('print-labels').addEventListener('click', () => {
    window.print();
    // Optionally clear preview after print
    // document.getElementById('labels-preview').innerHTML = '';
    // document.getElementById('print-labels').style.display = 'none';
});

// Initial render
renderProducts();