const express = require("express");
const router = express.Router();
const products = require("../data/products");
const { requireAuthApi } = require("../middlewares/auth");

router.get("/products", (req, res) => {
  const { kategori, search } = req.query;
  const data = products.getAll({ kategori, search });

  res.status(200).json({
    status: "success",
    message: "Data produk berhasil diambil",
    data
  });
});

router.get("/products/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.getById(id);

  if (!product) {
    return res.status(404).json({
      status: "error",
      message: "Produk tidak ditemukan"
    });
  }

  res.status(200).json({
    status: "success",
    message: "Produk ditemukan",
    data: product
  });
});

router.post("/products", requireAuthApi, (req, res) => {
  const { name, category, price, stock, description, image } = req.body;

  if (!name || !category || price === undefined || stock === undefined) {
    return res.status(400).json({
      status: "error",
      message: "Field name, category, price, dan stock wajib diisi"
    });
  }

  const newProduct = products.create({ name, category, price, stock, description, image });

  res.status(201).json({
    status: "success",
    message: "Produk ditambahkan",
    data: newProduct
  });
});

router.put("/products/:id", requireAuthApi, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, category, price, stock, description, image } = req.body;

  const updated = products.update(id, { name, category, price, stock, description, image });

  if (!updated) {
    return res.status(404).json({
      status: "error",
      message: "Produk tidak ditemukan"
    });
  }

  res.status(200).json({
    status: "success",
    message: "Produk diperbarui",
    data: updated
  });
});

router.delete("/products/:id", requireAuthApi, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const success = products.remove(id);

  if (!success) {
    return res.status(404).json({
      status: "error",
      message: "Produk tidak ditemukan"
    });
  }

  res.status(200).json({
    status: "success",
    message: "Produk dihapus"
  });
});

// ===== Tanya AI (dummy, 100% logika backend, bukan API eksternal) =====

// Kata-kata umum yang diabaikan saat mencocokkan nama produk,
// supaya "gula sekilo berapa" bisa match ke produk "Gula Pasir ...".
const STOPWORDS = [
  "apa", "aja", "saja", "ada", "berapa", "harga", "harganya", "dong",
  "ya", "nya", "yang", "untuk", "itu", "ini", "gimana", "bagaimana",
  "dan", "atau", "masih", "gak", "ga", "nggak", "enggak", "beli",
  "mau", "kah", "sih", "tolong", "min", "kak", "dengan", "toko",
  "stok", "stoknya", "tersedia", "sekilo", "kilo", "berapaan"
];

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[?.,!]/g, "")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOPWORDS.includes(word));
}

function formatRupiah(number) {
  return `Rp${Number(number).toLocaleString("id-ID")}`;
}

function findMatchingProducts(text) {
  const tokens = tokenize(text);
  if (tokens.length === 0) return [];

  const allProducts = products.getAll();
  return allProducts.filter((product) => {
    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();
    return tokens.some((token) => name.includes(token) || category === token);
  });
}

router.post("/chat", (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Pertanyaan tidak boleh kosong"
    });
  }

  const text = message.toLowerCase();
  let reply;

  // 1) Minta daftar semua produk
  const wantsFullList =
    (text.includes("produk apa") ||
      text.includes("jual apa") ||
      text.includes("ada apa") ||
      text.includes("apa aja") ||
      text.includes("apa saja") ||
      text.includes("daftar produk") ||
      text.includes("list produk")) &&
    !text.includes("harga");

  if (wantsFullList) {
    const allProducts = products.getAll();
    const list = allProducts.map((p) => p.name).join(", ");
    reply = `Produk yang kami jual saat ini: ${list}. Ketik nama produknya kalau mau tahu harga & stoknya!`;
  } else {
    // 2) Coba cocokkan dengan nama/kategori produk tertentu
    const matches = findMatchingProducts(text);

    if (matches.length === 1) {
      const p = matches[0];
      reply = `${p.name}: ${formatRupiah(p.price)}, stok tersedia ${p.stock}.`;
    } else if (matches.length > 1 && matches.length <= 5) {
      const list = matches
        .map((p) => `${p.name} (${formatRupiah(p.price)}, stok ${p.stock})`)
        .join("; ");
      reply = `Beberapa produk yang cocok: ${list}.`;
    } else if (matches.length > 5) {
      const names = matches.map((p) => p.name).join(", ");
      reply = `Ada banyak pilihan: ${names}. Sebutkan nama yang lebih spesifik ya biar aku kasih harganya.`;
    } else if (text.includes("jam") || text.includes("buka") || text.includes("tutup")) {
      reply = "Toko kami buka setiap hari jam 07.00 - 20.00!";
    } else if (text.includes("ongkir") || text.includes("antar") || text.includes("kirim")) {
      reply =
        "Kami melayani antar untuk wilayah sekitar toko, ongkir menyesuaikan jarak. Hubungi kasir untuk info lebih detail ya.";
    } else if (
      text.includes("bayar") ||
      text.includes("pembayaran") ||
      text.includes("cod") ||
      text.includes("transfer")
    ) {
      reply = "Pembayaran bisa tunai di tempat (COD) atau transfer bank saat barang diantar.";
    } else if (text.includes("stok") || text.includes("tersedia")) {
      reply =
        "Untuk cek stok terbaru, sebutkan nama produknya, atau lihat langsung di halaman Produk kami.";
    } else if (text.includes("harga") || text.includes("berapa")) {
      reply =
        "Sebutkan nama produknya ya (misal 'beras berapa?' atau 'gula sekilo berapa?') biar aku kasih harganya langsung.";
    } else {
      reply =
        "Maaf, saya belum paham pertanyaannya. Coba tanyakan nama produk (misal 'beras berapa'), jam buka, ongkir, atau cara pembayaran ya.";
    }
  }

  res.status(200).json({
    status: "success",
    data: { reply }
  });
});

module.exports = router;