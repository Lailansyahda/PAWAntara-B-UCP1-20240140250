// public/js/dashboard.js
document.addEventListener("DOMContentLoaded", function () {
  const listContainer = document.getElementById("adminProductList");
  const form = document.getElementById("productForm");
  const messageBox = document.getElementById("dashboardMessage");
  const submitBtn = document.getElementById("submitBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const clearImageBtn = document.getElementById("clearImageBtn");
  const productIdInput = document.getElementById("productId");
  const imageInput = document.getElementById("image");

  if (!listContainer || !form) return;

  const categoryIcons = { sembako: "🌾", protein: "🥚", bumbu: "🧂", instan: "🍜" };

  function getIcon(category) {
    return categoryIcons[category] || "🛒";
  }

  function mediaHtml(product) {
    const icon = getIcon(product.category);
    if (product.image) {
      return `
        <img
          src="${product.image}"
          alt="${product.name}"
          class="product-image"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="product-icon" aria-hidden="true" style="display:none;">${icon}</div>
      `;
    }
    return `<div class="product-icon" aria-hidden="true">${icon}</div>`;
  }

  async function loadProducts() {
    listContainer.innerHTML = "<p>Memuat data produk...</p>";
    try {
      const response = await fetch("/api/products");
      const result = await response.json();

      if (!result.data || result.data.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">Belum ada produk.</p>';
        return;
      }

      listContainer.innerHTML = "";
      result.data.forEach((product) => {
        const card = document.createElement("article");
        card.className = "product-card";
        card.innerHTML = `
          <div class="product-media">${mediaHtml(product)}</div>
          <h3>${product.name}</h3>
          <p class="product-category">${product.category}</p>
          <p class="product-price">Rp${Number(product.price).toLocaleString("id-ID")}</p>
          <p class="product-stock">Stok: ${product.stock}</p>
          <div class="dashboard-actions">
            <button type="button" class="btn-secondary" data-action="edit" data-id="${product.id}">Edit</button>
            <button type="button" class="btn-danger" data-action="delete" data-id="${product.id}">Hapus</button>
          </div>
        `;
        listContainer.appendChild(card);
      });
    } catch (err) {
      listContainer.innerHTML = '<p class="empty-state">Gagal memuat data produk.</p>';
    }
  }

  function resetForm() {
    form.reset();
    productIdInput.value = "";
    submitBtn.textContent = "Tambah Produk";
    cancelEditBtn.hidden = true;
    messageBox.textContent = "";
  }

  cancelEditBtn.addEventListener("click", resetForm);

  // Tombol "Hapus Gambar" -> kosongkan field URL gambar (produk akan tampil pakai ikon lagi)
  clearImageBtn.addEventListener("click", function () {
    imageInput.value = "";
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    messageBox.textContent = "";

    const name = document.getElementById("name").value.trim();
    const category = document.getElementById("category").value.trim();
    const price = document.getElementById("price").value;
    const stock = document.getElementById("stock").value;
    const description = document.getElementById("description").value.trim();
    const image = imageInput.value.trim();

    if (!name || !category || price === "" || stock === "") {
      messageBox.textContent = "Nama, kategori, harga, dan stok wajib diisi.";
      return;
    }

    const payload = { name, category, price, stock, description, image };
    const id = productIdInput.value;

    try {
      const response = await fetch(id ? `/api/products/${id}` : "/api/products", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        messageBox.textContent = result.message || "Gagal menyimpan produk.";
        return;
      }

      resetForm();
      loadProducts();
    } catch (err) {
      messageBox.textContent = "Terjadi kesalahan koneksi ke server.";
    }
  });

  listContainer.addEventListener("click", async function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = button.getAttribute("data-id");
    const action = button.getAttribute("data-action");

    if (action === "delete") {
      const confirmed = window.confirm("Yakin ingin menghapus produk ini?");
      if (!confirmed) return;

      try {
        const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
        const result = await response.json();

        if (!response.ok || result.status !== "success") {
          messageBox.textContent = result.message || "Gagal menghapus produk.";
          return;
        }
        loadProducts();
      } catch (err) {
        messageBox.textContent = "Terjadi kesalahan koneksi ke server.";
      }
      return;
    }

    if (action === "edit") {
      try {
        const response = await fetch(`/api/products/${id}`);
        const result = await response.json();

        if (!result.data) return;

        const product = result.data;
        productIdInput.value = product.id;
        document.getElementById("name").value = product.name;
        document.getElementById("category").value = product.category;
        document.getElementById("price").value = product.price;
        document.getElementById("stock").value = product.stock;
        document.getElementById("description").value = product.description || "";
        imageInput.value = product.image || "";

        submitBtn.textContent = "Simpan Perubahan";
        cancelEditBtn.hidden = false;
        window.scrollTo({ top: form.offsetTop - 100, behavior: "smooth" });
      } catch (err) {
        messageBox.textContent = "Gagal mengambil data produk.";
      }
    }
  });

  loadProducts();
});