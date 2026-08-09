const express = require("express");
const router = express.Router();
const products = require("../data/products");
const { requireAuthPage } = require("../middlewares/auth");

router.get("/", (req, res) => {
  const previewProducts = products.slice(0, 4);
  res.render("index", {
    title: "Beranda - Toko Sembako Ariesta",
    activePage: "beranda",
    previewProducts
  });
});

router.get("/produk", (req, res) => {
  res.render("produk", {
    title: "Produk - Toko Sembako Ariesta",
    activePage: "produk"
  });
});

router.get("/produk/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).render("produk-detail", {
      title: "Produk Tidak Ditemukan - Toko Sembako Ariesta",
      activePage: "produk",
      product: null
    });
  }

  res.render("produk-detail", {
    title: `${product.name} - Toko Sembako Ariesta`,
    activePage: "produk",
    product
  });
});

router.get("/tanya-ai", (req, res) => {
  res.render("tanya-ai", {
    title: "Tanya AI - Toko Sembako Ariesta",
    activePage: "tanya-ai"
  });
});

router.get("/login", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/dashboard");
  }
  res.render("login", {
    title: "Login - Toko Sembako Ariesta",
    activePage: "login"
  });
});

router.get("/dashboard", requireAuthPage, (req, res) => {
  res.render("dashboard", {
    title: "Dashboard Admin - Toko Sembako Ariesta",
    activePage: "dashboard",
    adminUsername: req.session.user.username
  });
});

module.exports = router;