const categorySelect = document.getElementById('categorySelect');
const imageInput = document.getElementById('imageInput');
const uploadBtn = document.getElementById('uploadBtn');
const gallery = document.getElementById('gallery');
const fileName = document.getElementById('fileName');
const emptyState = document.getElementById('emptyState');

// LIGHTBOX ELEMENTS
let lightboxOverlay, lightboxImg, prevBtn, nextBtn, closeBtn;
let currentIndex = 0;
let visibleItems = [];
let zoomLevel = 1;

function validateUpload() {
  uploadBtn.disabled = !(categorySelect.value && imageInput.files.length);
}

function updateVisibleItems() {
  visibleItems = [...document.querySelectorAll('.gallery-item')].filter(
    item => item.style.display !== 'none'
  );
}

function checkEmptyState() {
  updateVisibleItems();
  emptyState.style.display = visibleItems.length ? 'none' : 'block';
}

categorySelect.addEventListener('change', validateUpload);

imageInput.addEventListener('change', () => {
  fileName.textContent = imageInput.files.length
    ? imageInput.files[0].name
    : 'No file selected';
  validateUpload();
});

uploadBtn.addEventListener('click', () => {
  const category = categorySelect.value;
  const file = imageInput.files[0];
  if (!file) return;

  const imageURL = URL.createObjectURL(file);

  const item = document.createElement('div');
  item.className = `gallery-item ${category}`;
  item.innerHTML = `
    <img src="${imageURL}">
    <div class="meta">
      <span class="tag">${category.replace('-', ' ')}</span>
    </div>
  `;

  gallery.prepend(item);

  categorySelect.value = '';
  imageInput.value = '';
  fileName.textContent = 'No file selected';
  uploadBtn.disabled = true;

  checkEmptyState();
  attachLightbox(item);
});

/* FILTER BUTTONS */
document.querySelectorAll('.filters button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach(b =>
      b.classList.remove('active')
    );
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    document.querySelectorAll('.gallery-item').forEach(item => {
      item.style.display =
        filter === 'all' || item.classList.contains(filter) ? 'block' : 'none';
    });

    checkEmptyState();
  });
});

checkEmptyState();

/* ================= LIGHTBOX ================= */
function createLightbox() {
  // overlay
  lightboxOverlay = document.createElement('div');
  lightboxOverlay.id = 'lightboxOverlay';
  lightboxOverlay.style.cssText = `
    position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center;
    z-index:9999; opacity:0; transition:0.3s;
    flex-direction: column;
  `;

  // image
  lightboxImg = document.createElement('img');
  lightboxImg.style.cssText = `
    max-width:95vw; max-height:95vh; object-fit:contain;
    border-radius:12px; box-shadow:0 12px 30px rgba(0,0,0,0.6);
    transition: transform 0.3s ease;
    cursor: grab;
  `;
  lightboxOverlay.appendChild(lightboxImg);

  // navigation buttons
  prevBtn = document.createElement('button');
  nextBtn = document.createElement('button');
  prevBtn.innerHTML = '&#10094;';
  nextBtn.innerHTML = '&#10095;';
  [prevBtn, nextBtn].forEach(btn => {
    btn.style.cssText = `
      position:absolute; top:50%; transform:translateY(-50%);
      font-size:2.5rem; color:#fff; background:none; border:none;
      cursor:pointer; user-select:none; padding:0 20px;
    `;
  });
  prevBtn.style.left = '20px';
  nextBtn.style.right = '20px';
  lightboxOverlay.appendChild(prevBtn);
  lightboxOverlay.appendChild(nextBtn);

  // close button
  closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&#10005;';
  closeBtn.style.cssText = `
    position:absolute; top:20px; right:30px;
    font-size:2rem; color:#fff; cursor:pointer; user-select:none;
  `;
  lightboxOverlay.appendChild(closeBtn);

  document.body.appendChild(lightboxOverlay);

  // EVENTS
  lightboxOverlay.addEventListener('click', e => {
    if (e.target === lightboxOverlay) hideLightbox();
  });
  closeBtn.addEventListener('click', hideLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // zoom
  lightboxImg.addEventListener('wheel', e => {
    e.preventDefault();
    zoomLevel += e.deltaY * -0.001;
    zoomLevel = Math.min(Math.max(0.5, zoomLevel), 3);
    lightboxImg.style.transform = `scale(${zoomLevel})`;
  });
  lightboxOverlay.addEventListener('dblclick', () => {
    zoomLevel = 1;
    lightboxImg.style.transform = `scale(${zoomLevel})`;
  });
}

function attachLightbox(item) {
  const img = item.querySelector('img');
  img.addEventListener('click', () => {
    updateVisibleItems();
    currentIndex = visibleItems.indexOf(item);
    zoomLevel = 1;
    showLightbox();
  });
}

function showLightbox() {
  lightboxImg.src = visibleItems[currentIndex].querySelector('img').src;
  lightboxImg.style.transform = `scale(${zoomLevel})`;
  lightboxOverlay.style.opacity = '1';
  lightboxOverlay.style.display = 'flex';
}

function hideLightbox() {
  lightboxOverlay.style.opacity = '0';
  setTimeout(() => (lightboxOverlay.style.display = 'none'), 300);
}

function showPrev() {
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  zoomLevel = 1;
  showLightbox();
}

function showNext() {
  currentIndex = (currentIndex + 1) % visibleItems.length;
  zoomLevel = 1;
  showLightbox();
}

// INITIALIZE LIGHTBOX
createLightbox();
document.querySelectorAll('.gallery-item').forEach(item => attachLightbox(item));
