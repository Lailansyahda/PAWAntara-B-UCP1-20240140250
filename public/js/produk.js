document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("productContainer");
  const filterForm = document.getElementById("filterForm");
  const kategoriSelect = document.getElementById("kategori");
  const searchInput = document.getElementById("search");

  if (!container || !filterForm) return;

  function renderProducts(list) {
    if (!list || list.length === 0) {
      container.innerHTML = '<p class="empty-state">Produk tidak ditemukan untuk filter ini.</p>';
      return;
    }

    container.innerHTML = "";
    list.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <h2>${product.name}</h2>
        <p class="product-category">${product.category}</p>
        <p class="product-price">Rp${Number(product.price).toLocaleString("id-ID")}</p>
        <p class="product-stock">Stok: ${product.stock}</p>
        <a href="/produk/${product.id}" class="btn-secondary">Lihat Detail</a>
      `;
      container.appendChild(card);
    });
  }

  function populateCategories(list) {
    const categories = [...new Set(list.map((p) => p.category))];
    const currentValue = kategoriSelect.value;
    kategoriSelect.innerHTML = '<option value="">Semua kategori</option>';
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      kategoriSelect.appendChild(opt);
    });
    kategoriSelect.value = currentValue;
  }

  async function loadProducts(params) {
    container.innerHTML = "<p>Memuat produk...</p>";
    try {
      const query = new URLSearchParams();
      if (params && params.kategori) query.set("kategori", params.kategori);
      if (params && params.search) query.set("search", params.search);

      const response = await fetch(`/api/products?${query.toString()}`);
      const result = await response.json();

      renderProducts(result.data);

      if (!params || (!params.kategori && !params.search)) {
        populateCategories(result.data);
      }
    } catch (err) {
      container.innerHTML = '<p class="empty-state">Gagal memuat data produk.</p>';
    }
  }

  filterForm.addEventListener("submit", function (event) {
    event.preventDefault();
    loadProducts({
      kategori: kategoriSelect.value,
      search: searchInput.value.trim()
    });
  });

  loadProducts();
});