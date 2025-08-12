// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const mainContainer = document.getElementById('mainContainer');
const loginForm = document.getElementById('loginForm');
const classGroup = document.getElementById('classGroup');
const userInfo = document.getElementById('userInfo');
const displayName = document.getElementById('displayName');
const logoutBtn = document.getElementById('logoutBtn');
const tabLinks = document.querySelectorAll('nav ul li');
const tabContents = document.querySelectorAll('.tab-content');
const featuredEvents = document.getElementById('featuredEvents');
const featuredProducts = document.getElementById('featuredProducts');
const eventsList = document.getElementById('eventsList');
const productsList = document.getElementById('productsList');
const galleryGrid = document.getElementById('galleryGrid');
const eventModal = document.getElementById('eventModal');
const productModal = document.getElementById('productModal');
const closeButtons = document.querySelectorAll('.close-btn');
const yearButtons = document.querySelectorAll('.year-btn');

// Data variables
let eventsData = [];
let productsData = [];
let galleryData = [];

// Current user
let currentUser = null;

// Load data from JSON files
async function loadData() {
    try {
        const [eventsResponse, productsResponse, galleryResponse] = await Promise.all([
            fetch('data/events.json'),
            fetch('data/products.json'),
            fetch('data/galleries.json')
        ]);
        
        eventsData = await eventsResponse.json();
        productsData = await productsResponse.json();
        galleryData = await galleryResponse.json();
        
        // Initialize the app
        initApp();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Initialize the app
function initApp() {
    // Check if user is logged in
    const storedUser = localStorage.getItem('festamartUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        loginContainer.style.display = 'none';
        mainContainer.style.display = 'block';
        updateUserInfo();
        loadFeaturedItems();
        loadAllEvents();
        loadAllProducts();
        loadGalleryItems();
    }
}

// Login form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const userClass = document.getElementById('class').value;
    
    currentUser = {
        name: username,
        class: userClass
    };
    
    // Save user to localStorage
    localStorage.setItem('festamartUser', JSON.stringify(currentUser));
    
    // Hide login and show main container
    loginContainer.style.display = 'none';
    mainContainer.style.display = 'block';
    
    // Update user info
    updateUserInfo();
    
    // Load data
    loadFeaturedItems();
    loadAllEvents();
    loadAllProducts();
    loadGalleryItems();
});

// Logout button
logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('festamartUser');
    currentUser = null;
    mainContainer.style.display = 'none';
    loginContainer.style.display = 'flex';
    loginForm.reset();
});

// Update user info display
function updateUserInfo() {
    if (currentUser) {
        displayName.textContent = currentUser.class ? `${currentUser.name} (${currentUser.class})` : currentUser.name;
    }
}

// Tab navigation
tabLinks.forEach(link => {
    link.addEventListener('click', function() {
        // Remove active class from all tabs
        tabLinks.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Load featured events and products
function loadFeaturedItems() {
    // Featured events (show 3 upcoming events)
    const upcomingEvents = [...eventsData]
        .filter(event => new Date(event.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);
    
    featuredEvents.innerHTML = '';
    upcomingEvents.forEach(event => {
        featuredEvents.appendChild(createEventCard(event));
    });
    
    // Featured products (show 4 random products)
    const randomProducts = [...productsData]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
    
    featuredProducts.innerHTML = '';
    randomProducts.forEach(product => {
        featuredProducts.appendChild(createProductCard(product));
    });
}

// Load all events
function loadAllEvents() {
    eventsList.innerHTML = '';
    const sortedEvents = [...eventsData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedEvents.forEach(event => {
        eventsList.appendChild(createEventCard(event));
    });
}

// Load all products
function loadAllProducts() {
    productsList.innerHTML = '';
    
    productsData.forEach(product => {
        productsList.appendChild(createProductCard(product));
    });
}

// Load gallery items
function loadGalleryItems(year = 'all') {
    galleryGrid.innerHTML = '';
    
    const filteredGallery = year === 'all' 
        ? galleryData 
        : galleryData.filter(item => item.year === year);
    
    filteredGallery.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        galleryItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="gallery-caption">
                <p>${item.title}</p>
                <small>${item.year}</small>
            </div>
        `;
        
        galleryGrid.appendChild(galleryItem);
    });
}

// Create event card
function createEventCard(event) {
    const eventCard = document.createElement('div');
    eventCard.className = 'card';
    
    eventCard.innerHTML = `
        <img src="${event.image}" class="card-img" alt="${event.title}">
        <div class="card-body">
            <h3 class="card-title">${event.title}</h3>
            <p class="card-text"><i class="fas fa-calendar-day"></i> ${formatDate(event.date)}</p>
            <p class="card-text"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
        </div>
    `;
    
    eventCard.addEventListener('click', () => openEventModal(event));
    return eventCard;
}

// Create product card
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'card';
    
    productCard.innerHTML = `
        <img src="${product.image}" class="card-img" alt="${product.name}">
        <div class="card-body">
            <h3 class="card-title">${product.name}</h3>
            <p class="card-text"><i class="fas fa-store"></i> ${product.class}</p>
            <p class="card-price">Rp ${product.price.toLocaleString()}</p>
        </div>
    `;
    
    productCard.addEventListener('click', () => openProductModal(product));
    return productCard;
}

// Open event modal
function openEventModal(event) {
    document.getElementById('modalEventTitle').textContent = event.title;
    document.getElementById('modalEventImage').src = event.image;
    document.getElementById('modalEventDate').textContent = formatDate(event.date) + ' - ' + event.time;
    document.getElementById('modalEventLocation').textContent = event.location;
    document.getElementById('modalEventDescription').textContent = event.description;
    document.getElementById('modalEventContact').textContent = event.contact;
    
    eventModal.style.display = 'flex';
}

// Open product modal
function openProductModal(product) {
    document.getElementById('modalProductTitle').textContent = product.name;
    document.getElementById('modalProductImage').src = product.image;
    document.getElementById('modalProductClass').textContent = product.class;
    document.getElementById('modalProductPrice').textContent = 'Rp ' + product.price.toLocaleString();
    document.getElementById('modalProductDescription').textContent = product.description;
    
    productModal.style.display = 'flex';
}

// Close modals
closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        eventModal.style.display = 'none';
        productModal.style.display = 'none';
    });
});

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === eventModal) {
        eventModal.style.display = 'none';
    }
    if (e.target === productModal) {
        productModal.style.display = 'none';
    }
});

// Year filter for gallery
yearButtons.forEach(button => {
    button.addEventListener('click', function() {
        yearButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        const year = this.getAttribute('data-year');
        loadGalleryItems(year);
    });
});

// Order button
document.getElementById('orderBtn').addEventListener('click', function() {
    const quantity = document.getElementById('productQuantity').value;
    alert(`Terima kasih! Pesanan Anda untuk ${quantity} item telah diterima.`);
    productModal.style.display = 'none';
});

// Format date
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Event search
document.getElementById('eventSearch').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredEvents = eventsData.filter(event => 
        event.title.toLowerCase().includes(searchTerm) || 
        event.description.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm)
    );
    
    eventsList.innerHTML = '';
    filteredEvents.forEach(event => {
        eventsList.appendChild(createEventCard(event));
    });
});

// Product search
document.getElementById('productSearch').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = productsData.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm) ||
        product.class.toLowerCase().includes(searchTerm)
    );
    
    productsList.innerHTML = '';
    filteredProducts.forEach(product => {
        productsList.appendChild(createProductCard(product));
    });
});

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadData);
// Dark Mode Elements
const darkModeToggle = document.getElementById('darkModeToggle');

// Check for saved dark mode preference
const savedDarkMode = localStorage.getItem('festamartDarkMode') === 'true';
if (savedDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Dark mode toggle
darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('festamartDarkMode', 'true');
    } else {
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('festamartDarkMode', 'false');
    }
});