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