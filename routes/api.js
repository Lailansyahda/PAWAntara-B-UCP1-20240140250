const express = require("express");
const router = express.Router();
const products = require("../data/products");
const { requireAuthApi } = require("../middlewares/auth");

function getNextId() {
  const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
  return maxId + 1;
}

router.get("/products", (req, res) => {
  const { kategori, search } = req.query;
  let filtered = products;

  if (kategori) {
    filtered = filtered.filter((p) => p.category.toLowerCase() === kategori.toLowerCase());
  }
  if (search) {
    const keyword = search.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(keyword));
  }

  res.status(200).json({
    status: "success",
    message: "Data produk berhasil diambil",
    data: filtered
  });
});

router.get("/products/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ status: "error", message: "Produk tidak ditemukan" });
  }

  res.status(200).json({ status: "success", message: "Produk ditemukan", data: product });
});

router.post("/products", requireAuthApi, (req, res) => {
  const { name, category, price, stock, description, image } = req.body;

  if (!name || !category || price === undefined || stock === undefined) {
    return res.status(400).json({
      status: "error",
      message: "Field name, category, price, dan stock wajib diisi"
    });
  }

  const newProduct = {
    id: getNextId(),
    name,
    category,
    price: Number(price),
    stock: Number(stock),
    image: image || "",
    description: description || ""
  };

  products.push(newProduct);

  res.status(201).json({ status: "success", message: "Produk ditambahkan", data: newProduct });
});

router.put("/products/:id", requireAuthApi, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ status: "error", message: "Produk tidak ditemukan" });
  }

  const { name, category, price, stock, description, image } = req.body;

  if (name !== undefined) product.name = name;
  if (category !== undefined) product.category = category;
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (description !== undefined) product.description = description;
  if (image !== undefined) product.image = image;

  res.status(200).json({ status: "success", message: "Produk diperbarui", data: product });
});

router.delete("/products/:id", requireAuthApi, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ status: "error", message: "Produk tidak ditemukan" });
  }

  products.splice(index, 1);

  res.status(200).json({ status: "success", message: "Produk dihapus" });
});

router.post("/chat", (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ status: "error", message: "Pertanyaan tidak boleh kosong" });
  }

  const text = message.toLowerCase();
  let reply;

  if (text.includes("jam") || text.includes("buka") || text.includes("tutup")) {
    reply = "Toko kami buka setiap hari jam 07.00 - 20.00!";
  } else if (text.includes("ongkir") || text.includes("antar") || text.includes("kirim")) {
    reply = "Kami melayani antar untuk wilayah sekitar toko, ongkir menyesuaikan jarak. Hubungi kasir untuk info lebih detail ya.";
  } else if (text.includes("bayar") || text.includes("pembayaran") || text.includes("cod") || text.includes("transfer")) {
    reply = "Pembayaran bisa tunai di tempat (COD) atau transfer bank saat barang diantar.";
  } else if (text.includes("stok") || text.includes("ada") || text.includes("tersedia")) {
    reply = "Untuk cek stok terbaru, silakan lihat halaman Produk kami, datanya selalu ter-update sesuai stok toko.";
  } else if (text.includes("harga") || text.includes("berapa")) {
    reply = "Harga tiap produk bisa dicek langsung di halaman Produk, ya. Kalau ada produk spesifik yang kamu cari, sebutkan namanya!";
  } else {
    reply = "Maaf, saya belum paham pertanyaannya. Coba tanyakan soal jam buka, ongkir, cara pembayaran, atau ketersediaan stok ya.";
  }

  res.status(200).json({ status: "success", data: { reply } });
});

module.exports = router;