const products = [
  { name: "NOVA Pulse 7 Headphones", price: 120000, img: "images/headphones.png", rating: 4.9, reviews: 120, stock: "In Stock", badge: "New", category: "Electronics", description: "High-fidelity audio with noise cancellation and 24h battery life.", colors: ["#8B5CF6", "#1F2937", "#E5E7EB"], features: [["battery_charging_full", "24h"], ["bluetooth", "5.3"], ["scale", "250g"], ["verified", "1 Year"]] },
  { name: "NOVA Watch Pro", price: 150000, img: "images/watch.png", rating: 4.7, reviews: 94, stock: "In Stock", category: "Accessories", description: "A premium smartwatch built for fitness, productivity, and everyday style.", colors: ["#111827", "#D4AF37", "#E5E7EB"], features: [["battery_charging_full", "48h"], ["bluetooth", "5.2"], ["water_drop", "5 ATM"], ["verified", "1 Year"]] },
  { name: "NOVA Mechanical Keyboard", price: 80000, img: "images/keyboard.png", rating: 4.6, reviews: 76, stock: "In Stock", badge: "-10%", category: "Gaming", description: "Responsive mechanical switches with RGB lighting and a premium build.", colors: ["#111827", "#8B5CF6", "#E5E7EB"], features: [["keyboard", "RGB"], ["bolt", "USB-C"], ["speed", "1ms"], ["verified", "1 Year"]] },
  { name: "NOVA Gaming Mouse", price: 45000, img: "images/mouse.png", rating: 4.5, reviews: 61, stock: "Only 2 left", category: "Gaming", description: "Lightweight precision gaming mouse designed for fast and accurate movement.", colors: ["#111827", "#8B5CF6", "#EF4444"], features: [["speed", "1000Hz"], ["mouse", "26K DPI"], ["cable", "USB-C"], ["verified", "1 Year"]] },
  { name: "NOVA Smart Speaker", price: 95000, img: "images/speaker.png", rating: 4.8, reviews: 88, stock: "In Stock", badge: "Popular", category: "Electronics", description: "Immersive room-filling audio with intelligent voice controls.", colors: ["#111827", "#8B5CF6", "#E5E7EB"], features: [["volume_up", "360°"], ["wifi", "Wi-Fi"], ["mic", "Voice"], ["verified", "1 Year"]] },
  { name: "NOVA Phone Stand", price: 18000, img: "images/phonestand.png", rating: 4.4, reviews: 42, stock: "In Stock", category: "Accessories", description: "Minimal adjustable aluminum stand for your phone and desk setup.", colors: ["#111827", "#E5E7EB", "#D4AF37"], features: [["phone_iphone", "Universal"], ["rotate_right", "360°"], ["straighten", "Adjustable"], ["verified", "1 Year"]] },
  { name: "NOVA Gaming Controller", price: 70000, img: "images/keypad.png", rating: 4.7, reviews: 57, stock: "In Stock", badge: "Hot", category: "Gaming", description: "Responsive wireless controller with precision controls and low latency.", colors: ["#111827", "#8B5CF6", "#3B82F6"], features: [["sports_esports", "Wireless"], ["speed", "Low Latency"], ["battery_charging_full", "20h"], ["verified", "1 Year"]] },
  { name: "NOVA Desk Lamp", price: 32000, img: "images/desklamp.png", rating: 4.3, reviews: 31, stock: "Out of Stock", category: "Furniture", description: "A modern smart desk lamp with adjustable brightness and color temperature.", colors: ["#111827", "#E5E7EB"], features: [["light_mode", "Dimmable"], ["touch_app", "Touch"], ["schedule", "Smart"], ["verified", "1 Year"]] }
];

const views = ["images/front.png", "images/rightside.png", "images/leftside.png", "images/back.png"];

// --- State Variables ---
let selectedProduct = products[0];
let selectedCategory = "all";
let currentFilter = "all";
let maxPrice = 500000;
let minRating = 0;

// UTILITIES & DOM HELPERS
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// --- Local Storage Helpers ---
function load(key, fallback) { 
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } 
  catch { return fallback; } 
}
function save(key, value) { 
  localStorage.setItem(key, JSON.stringify(value)); 
}

// Load initial user data
let cart = load("novaCart", []);
let wishlist = load("novaWishlist", []);
let recent = load("novaRecent", []);

// --- Formatting Helpers ---
function money(n) { 
  return `₦${n.toLocaleString()}`; 
}

function toast(msg, type = "success") { 
  const t = document.createElement("div"); 
  t.className = `toast ${type}`; 
  t.innerHTML = `<span class="material-symbols-rounded">${type === "success" ? "check_circle" : "error"}</span>${msg}`; 
  $("#toastContainer").appendChild(t); 
  setTimeout(() => t.remove(), 2800); 
}

// DOM Elements
const grid = $("#grid");
const searchInput = $("#searchInput");
const detail = $("#detail");
const cartOverlay = $("#cartOverlay");
const wishlistOverlay = $("#wishlistOverlay");

// PRODUCT RENDERING & FILTERING
function renderProducts(list) {
  grid.innerHTML = "";
  $("#resultCount").textContent = list.length;
  
  if (!list.length) { 
    grid.innerHTML = `
      <div class="no-products">
        <span class="material-symbols-rounded">search_off</span>
        <h3>No products found</h3>
        <p>Try another search or clear your filters.</p>
      </div>`; 
    return; 
  }

  list.forEach((p, i) => {
    const liked = wishlist.some(x => x.name === p.name);
    const stockClass = p.stock === "Out of Stock" ? "out" : p.stock.includes("Only") ? "low" : "";
    
    grid.insertAdjacentHTML("beforeend", `
      <article class="product-card" data-name="${p.name}" style="animation-delay:${i * .04}s">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        <span class="material-symbols-rounded wish ${liked ? "liked" : ""}">${liked ? "favorite" : "favorite_border"}</span>
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <h4>${p.name}</h4>
        <div class="price">${money(p.price)}</div>
        <div class="rating-line"><span class="material-symbols-rounded">star</span>${p.rating} (${p.reviews})</div>
        <div class="stock ${stockClass}"><span class="material-symbols-rounded">circle</span>${p.stock}</div>
      </article>`);
  });
}

function filterProducts() {
  const term = searchInput.value.toLowerCase().trim();
  
  let list = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term);
    const matchCategory = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory;
    const matchDeals = currentFilter !== "deals" || p.badge;
    const matchPrice = p.price <= maxPrice;
    const matchRating = p.rating >= minRating;
    const matchStock = ($("#inStockFilter").checked && p.stock !== "Out of Stock") || 
                       ($("#outStockFilter").checked && p.stock === "Out of Stock");
    
    return matchSearch && matchCategory && matchDeals && matchPrice && matchRating && matchStock;
  });

  const sort = $("#sortSelect").value;
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);
  if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  
  renderProducts(list);
}

// PRODUCT DETAILS MODAL
function showProductDetail(p) {
  selectedProduct = p;
  $("#detailName").textContent = p.name;
  $("#detailRating").textContent = p.rating;
  $("#detailReviews").textContent = p.reviews;
  $("#detailPrice").textContent = money(p.price);
  $("#detailImg").src = p.img;
  $("#detailImg").alt = p.name;
  $("#detailDescription").textContent = p.description;
  $("#detailStock").textContent = p.stock;
  $("#detailStock").className = p.stock === "Out of Stock" ? "out" : "";
  $("#detailCategory").textContent = p.category;
  
  $("#detailColors").innerHTML = p.colors.map((c, i) => 
    `<div class="dot ${i === 0 ? "selected" : ""}" style="background:${c}" data-color="${c}"></div>`
  ).join("");
  
  $("#detailFeatures").innerHTML = p.features.map(f => 
    `<div class="feature"><span class="material-symbols-rounded">${f[0]}</span><br>${f[1]}</div>`
  ).join("");
  
  $("#addToCartBtn").disabled = p.stock === "Out of Stock";
  $("#addToCartBtn").style.opacity = p.stock === "Out of Stock" ? ".5" : "1";
  
  recent = [p, ...recent.filter(x => x.name !== p.name)].slice(0, 5); 
  save("novaRecent", recent);
}

// --- Grid Interactions ---
grid.addEventListener("click", e => {
  const card = e.target.closest(".product-card"); 
  if (!card) return;
  
  const p = products.find(x => x.name === card.dataset.name); 
  if (!p) return;
  
  // Toggle wishlist if clicking heart
  if (e.target.closest(".wish")) { 
    toggleWishlist(p); 
    return; 
  }
  
  // Otherwise open detail modal
  showProductDetail(p);
  detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

// WISHLIST LOGIC
function toggleWishlist(p) {
  const exists = wishlist.some(x => x.name === p.name);
  wishlist = exists ? wishlist.filter(x => x.name !== p.name) : [...wishlist, p];
  
  save("novaWishlist", wishlist); 
  updateWishlistCount(); 
  filterProducts(); 
  renderWishlist();
  
  toast(exists ? "Removed from wishlist" : "Added to wishlist");
}

function updateWishlistCount() { 
  $("#wishlistCount").textContent = wishlist.length || ""; 
}

function renderWishlist() {
  $("#wishlistLabel").textContent = `${wishlist.length} saved`;
  
  if (!wishlist.length) { 
    $("#wishlistItems").innerHTML = `
      <div class="empty-wishlist">
        <span class="material-symbols-rounded">favorite_border</span>
        <p>Your wishlist is empty</p>
      </div>`; 
    return; 
  }
  
  $("#wishlistItems").innerHTML = wishlist.map(p => `
    <div class="wishlist-item">
      <img src="${p.img}" alt="${p.name}">
      <div class="wishlist-info">
        <h4>${p.name}</h4>
        <div class="price">${money(p.price)}</div>
        <button class="btn btn-ghost wish-cart" data-name="${p.name}">Add to cart</button>
      </div>
      <button class="remove-wishlist" data-name="${p.name}"><span class="material-symbols-rounded">delete</span></button>
    </div>`).join("");
}

function openWishlist() { 
  $("#wishlistOverlay").classList.add("show"); 
  renderWishlist(); 
}

function closeWishlist() { 
  $("#wishlistOverlay").classList.remove("show"); 
}

// --- Wishlist Event Listeners ---
$("#wishlistIcon").addEventListener("click", openWishlist);
$("#closeWishlist").addEventListener("click", closeWishlist);
wishlistOverlay.addEventListener("click", e => { if (e.target === wishlistOverlay) closeWishlist(); });

$("#wishlistItems").addEventListener("click", e => {
  const remove = e.target.closest(".remove-wishlist");
  const add = e.target.closest(".wish-cart");
  
  if (remove) { 
    wishlist = wishlist.filter(p => p.name !== remove.dataset.name); 
    save("novaWishlist", wishlist); 
    updateWishlistCount(); 
    renderWishlist(); 
    filterProducts(); 
    toast("Removed from wishlist"); 
  }
  
  if (add) { 
    const p = products.find(x => x.name === add.dataset.name); 
    addToCart(p); 
  }
});

// CART LOGIC
function addToCart(p) {
  if (p.stock === "Out of Stock") { 
    toast("This product is out of stock", "error"); 
    return; 
  }
  
  const item = cart.find(x => x.name === p.name);
  item ? item.quantity++ : cart.push({ ...p, quantity: 1 });
  
  save("novaCart", cart); 
  updateCartCount(); 
  renderCart(); 
  openCart(); 
  toast(`${p.name} added to cart`);
}

function updateCartCount() { 
  const n = cart.reduce((total, item) => total + item.quantity, 0); 
  $("#cartCount").textContent = n || ""; 
  $("#cartItemLabel").textContent = `${n} item${n !== 1 ? "s" : ""}`; 
}

function renderCart() {
  if (!cart.length) { 
    $("#cartItems").innerHTML = `
      <div class="empty-cart">
        <span class="material-symbols-rounded">shopping_cart</span>
        <p>Your cart is empty</p>
      </div>`; 
    $("#cartSubtotal").textContent = "0"; 
    $("#cartTotal").textContent = "0"; 
    $("#shippingCost").textContent = "₦0"; 
    $("#shippingProgress").style.width = "0"; 
    $("#shippingText").textContent = "Add items for free shipping"; 
    return; 
  }
  
  let subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  let shipping = subtotal >= 200000 ? 0 : 10000;
  let total = subtotal + shipping;
  
  $("#cartItems").innerHTML = cart.map((p, i) => `
    <div class="cart-item">
      <img src="${p.img}" alt="${p.name}">
      <div class="cart-info">
        <h4>${p.name}</h4>
        <p>${money(p.price)}</p>
        <div class="qty">
          <button class="quantity-btn" data-i="${i}" data-action="decrease">−</button>
          <span>${p.quantity}</span>
          <button class="quantity-btn" data-i="${i}" data-action="increase">+</button>
          <button class="remove-btn" data-i="${i}">Remove</button>
        </div>
      </div>
    </div>`).join("");
    
  $("#cartSubtotal").textContent = subtotal.toLocaleString();
  $("#shippingCost").textContent = shipping ? money(shipping) : "FREE";
  $("#cartTotal").textContent = total.toLocaleString();
  
  const progress = Math.min((subtotal / 200000) * 100, 100);
  $("#shippingProgress").style.width = `${progress}%`;
  $("#shippingText").textContent = shipping ? `Add ${money(200000 - subtotal)} for free shipping` : "You unlocked free shipping 🎉";
}

function openCart() { 
  $("#cartOverlay").classList.add("show"); 
  renderCart(); 
}

function closeCart() { 
  $("#cartOverlay").classList.remove("show"); 
}

// --- Cart Event Listeners ---
$("#cartIcon").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", e => { if (e.target === cartOverlay) closeCart(); });

$("#cartItems").addEventListener("click", e => {
  const q = e.target.closest(".quantity-btn");
  const remove = e.target.closest(".remove-btn"); 
  if (!q && !remove) return;
  
  const i = Number((q || remove).dataset.i);
  
  if (q) { 
    q.dataset.action === "increase" ? cart[i].quantity++ : cart[i].quantity--; 
    if (cart[i].quantity <= 0) cart.splice(i, 1);
  }
  if (remove) {
    cart.splice(i, 1);
  }
  
  save("novaCart", cart); 
  updateCartCount(); 
  renderCart();
});

$("#addToCartBtn").addEventListener("click", () => addToCart(selectedProduct));
$("#closeDetail").addEventListener("click", () => detail.classList.add("hidden"));

// Color selector inside product detail
$("#detailColors").addEventListener("click", e => { 
  const d = e.target.closest(".dot"); 
  if (!d) return; 
  $$(".dot").forEach(x => x.classList.remove("selected")); 
  d.classList.add("selected"); 
});

// FILTER INPUT & EVENTS
searchInput.addEventListener("input", filterProducts);
$("#sortSelect").addEventListener("change", filterProducts);
$("#inStockFilter").addEventListener("change", filterProducts);
$("#outStockFilter").addEventListener("change", filterProducts);

$("#priceRange").addEventListener("input", e => { 
  maxPrice = Number(e.target.value); 
  $("#priceValue").textContent = money(maxPrice); 
  filterProducts(); 
});

$$('input[name="rating"]').forEach(r => r.addEventListener("change", () => { 
  minRating = Number(r.value); 
  filterProducts(); 
}));

$$(".tab").forEach(tab => tab.addEventListener("click", () => { 
  $$(".tab").forEach(x => x.classList.remove("active")); 
  tab.classList.add("active"); 
  selectedCategory = tab.dataset.category; 
  currentFilter = "all"; 
  filterProducts(); 
}));

$("#clearFilters").addEventListener("click", () => { 
  $("#priceRange").value = 500000; 
  maxPrice = 500000; 
  minRating = 0; 
  $("#inStockFilter").checked = true; 
  $("#outStockFilter").checked = false; 
  $('input[name="rating"][value="0"]').checked = true; 
  $("#sortSelect").value = "default"; 
  searchInput.value = ""; 
  selectedCategory = "all"; 
  currentFilter = "all"; 
  $$(".tab").forEach(x => x.classList.toggle("active", x.dataset.category === "all")); 
  filterProducts(); 
  toast("Filters cleared"); 
});

// NAVIGATION & UI
function setNav(active) { 
  $$(".nav-links a").forEach(x => x.classList.remove("active")); 
  active.classList.add("active"); 
}

$("#homeLink").addEventListener("click", e => { 
  e.preventDefault(); setNav(e.currentTarget); 
  $("#aboutSection").classList.remove("show"); 
  window.scrollTo({ top: 0, behavior: "smooth" }); 
});

$("#shopLink").addEventListener("click", e => { 
  e.preventDefault(); setNav(e.currentTarget); 
  $("#aboutSection").classList.remove("show"); 
  $("#shopSection").scrollIntoView({ behavior: "smooth" }); 
});

$("#dealsLink").addEventListener("click", e => { 
  e.preventDefault(); setNav(e.currentTarget); 
  currentFilter = "deals"; filterProducts(); 
  $("#shopSection").scrollIntoView({ behavior: "smooth" }); 
});

$("#aboutLink").addEventListener("click", e => { 
  e.preventDefault(); setNav(e.currentTarget); 
  $("#aboutSection").classList.add("show"); 
  $("#aboutSection").scrollIntoView({ behavior: "smooth" }); 
});

$("#exploreBtn").addEventListener("click", () => $("#shopSection").scrollIntoView({ behavior: "smooth" }));
$("#featuresBtn").addEventListener("click", () => { 
  showProductDetail(products[0]); 
  detail.scrollIntoView({ behavior: "smooth" }); 
});

$("#menuBtn").addEventListener("click", () => { 
  const open = $("#navLinks").classList.toggle("show"); 
  $("#menuBtn span").textContent = open ? "close" : "menu"; 
});

// THEME & GLOBAL EVENTS
$("#themeToggle").addEventListener("click", () => { 
  document.body.classList.toggle("light"); 
  const light = document.body.classList.contains("light"); 
  localStorage.setItem("novaTheme", light ? "light" : "dark"); 
  $("#themeToggle span").textContent = light ? "light_mode" : "dark_mode"; 
});

if (localStorage.getItem("novaTheme") === "light") { 
  document.body.classList.add("light"); 
  $("#themeToggle span").textContent = "light_mode"; 
}

document.addEventListener("keydown", e => { 
  if ((e.ctrlKey || e.metaKey) && e.key === "/") { 
    e.preventDefault(); 
    searchInput.focus(); 
  } 
  if (e.key === "Escape") { 
    $$(".cart-overlay.show, .wishlist-overlay.show, .checkout-overlay.show, .success-overlay.show")
      .forEach(x => x.classList.remove("show")); 
    $("#navLinks").classList.remove("show"); 
  } 
});

// CHECKOUT & NEWSLETTER
$("#checkoutBtn").addEventListener("click", () => { 
  if (!cart.length) { 
    toast("Your cart is empty", "error"); 
    return; 
  } 
  const subtotal = cart.reduce((a, b) => a + b.price * b.quantity, 0);
  const shipping = subtotal >= 200000 ? 0 : 10000; 
  
  $("#checkoutSummary").innerHTML = `<b>${cart.reduce((a, b) => a + b.quantity, 0)} items</b><br>Order total: <strong>${money(subtotal + shipping)}</strong>`; 
  $("#checkoutOverlay").classList.add("show"); 
});

$("#closeCheckout").addEventListener("click", () => $("#checkoutOverlay").classList.remove("show"));

$("#checkoutForm").addEventListener("submit", e => { 
  e.preventDefault(); 
  const order = `NOVA-${Date.now().toString().slice(-6)}`; 
  $("#orderNumber").textContent = order; 
  
  cart = []; 
  save("novaCart", cart); 
  updateCartCount(); 
  renderCart(); 
  
  $("#checkoutOverlay").classList.remove("show"); 
  $("#successOverlay").classList.add("show"); 
  toast("Order placed successfully"); 
});

$("#continueShopping").addEventListener("click", () => { 
  $("#successOverlay").classList.remove("show"); 
  window.scrollTo({ top: 0, behavior: "smooth" }); 
});

$("#newsletterForm").addEventListener("submit", e => { 
  e.preventDefault(); 
  const email = $("#newsletterEmail").value.trim(); 
  if (email) { 
    localStorage.setItem("novaSubscriber", email); 
    $("#newsletterEmail").value = ""; 
    toast("You're on the NOVA list ✨"); 
  } 
});

window.addEventListener("scroll", () => $("#backTop").classList.toggle("show", scrollY > 500));
$("#backTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// 3D HERO INTERACTION
let currentView = 0, rotX = 0, rotY = 0, dragging = false, lastX = 0, lastY = 0;
const hero3d = $("#hero3d"), heroImg = $("#heroImg");

function updateRotation() { 
  gsap.set(hero3d, { rotationX: rotX, rotationY: rotY }); 
}

hero3d.addEventListener("pointerdown", e => { 
  dragging = true; lastX = e.clientX; lastY = e.clientY; 
  hero3d.setPointerCapture(e.pointerId); 
});

hero3d.addEventListener("pointermove", e => { 
  if (!dragging) return; 
  const dx = e.clientX - lastX, dy = e.clientY - lastY; 
  rotY += dx * .45; 
  rotX = Math.max(-25, Math.min(25, rotX - dy * .35)); 
  updateRotation(); 
  lastX = e.clientX; lastY = e.clientY; 
});

hero3d.addEventListener("pointerup", e => { 
  dragging = false; 
  hero3d.releasePointerCapture?.(e.pointerId); 
  gsap.to(hero3d, { rotationX: 0, rotationY: 0, duration: .5, ease: "power3.out" }); 
  rotX = 0; rotY = 0; 
});

hero3d.addEventListener("pointercancel", () => { dragging = false; });

$("#heroThumbs").addEventListener("click", e => { 
  const thumb = e.target.closest(".thumb"); 
  if (!thumb) return; 
  const i = [...$$(".thumb")].indexOf(thumb); 
  changeImg(i); 
});

function changeImg(i) { 
  currentView = i; 
  heroImg.src = views[i]; 
  $$(".thumb").forEach((x, n) => x.classList.toggle("active", n === i)); 
  rotX = rotY = 0; 
  updateRotation(); 
}

// Auto-rotate product view
let autoView = setInterval(() => { 
  if (!dragging) changeImg((currentView + 1) % views.length); 
}, 5000);
hero3d.addEventListener("pointerdown", () => clearInterval(autoView), { once: true });



// INITIALIZATION

function startAnimations() { 
  gsap.from(".hero-text", { opacity: 0, x: -30, duration: .8, ease: "power3.out" }); 
  gsap.from(heroImg, { opacity: 0, scale: .8, y: 30, duration: 1, ease: "power3.out" }); 
  gsap.to(heroImg, { y: -7, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" }); 
  gsap.to(".glow-base", { scale: 1.08, opacity: .75, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut" }); 
}

// Boot up app
renderProducts(products); 
showProductDetail(products[0]); 
updateCartCount(); 
updateWishlistCount(); 
renderCart();
startAnimations(); 

// Dashboard Stats
document.querySelector("#totalProductsStat").textContent = products.length;
document.querySelector("#inStockStat").textContent = products.filter(p => p.stock !== "Out of Stock").length;
document.querySelector("#outStockStat").textContent = products.filter(p => p.stock === "Out of Stock").length;