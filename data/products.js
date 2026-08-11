const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "products-data.json");

const seedData = [
  { id: 1, name: "Beras Pandan Wangi 5kg", category: "sembako", price: 68000, stock: 24, image: "https://i.pinimg.com/1200x/83/c0/b2/83c0b28d336480784850aacffa3bf3fb.jpg", description: "Beras pulen kualitas premium, cocok untuk kebutuhan harian keluarga." },
  { id: 2, name: "Minyak Goreng Sania 2L", category: "sembako", price: 32000, stock: 40, image: "https://i.pinimg.com/1200x/44/5f/89/445f89a70a12647668a2e89e831cce4c.jpg", description: "Minyak goreng kemasan 2 liter, jernih dan tidak mudah tengik." },
  { id: 3, name: "Gula Pasir Gulaku 1kg", category: "sembako", price: 16000, stock: 55, image: "https://i.pinimg.com/1200x/b7/ed/7f/b7ed7ff25e3d5c56d412d10b74ff3b5f.jpg", description: "Gula pasir putih bersih, kemasan 1 kilogram." },
  { id: 4, name: "Telur Ayam Negeri 1kg", category: "protein", price: 28000, stock: 30, image: "https://i.pinimg.com/1200x/4a/eb/2a/4aeb2aacaac27eecae96244b94c7cfba.jpg", description: "Telur ayam negeri segar, isi kurang lebih 16 butir per kilogram." },
  { id: 5, name: "Tepung Terigu Segitiga Biru 1kg", category: "sembako", price: 13000, stock: 18, image: "https://i.pinimg.com/1200x/e3/3e/d3/e33ed33203edffb28cc8a61ef039bd8d.jpg", description: "Tepung terigu serbaguna untuk gorengan, kue, dan roti." },
  { id: 6, name: "Kecap Manis ABC 600ml", category: "bumbu", price: 21000, stock: 26, image: "https://i.pinimg.com/1200x/0c/a1/f7/0ca1f7f5f027561e14c5769238ed7fec.jpg", description: "Kecap manis kental, cocok untuk masakan sehari-hari." },
  { id: 7, name: "Garam Dapur Beryodium 500g", category: "bumbu", price: 5000, stock: 60, image: "https://i.pinimg.com/736x/01/31/5b/01315bf9623a08537b13674d7e9b6d0a.jpg", description: "Garam beryodium halus untuk kebutuhan memasak." },
  { id: 8, name: "Mie Instan Indomie Goreng (1 dus)", category: "instan", price: 110000, stock: 12, image: "https://i.pinimg.com/736x/fe/8a/34/fe8a34be01091ccf238a27b5c47d65c4.jpg", description: "1 dus isi 40 bungkus, favorit sejuta umat." }
];

function loadData() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2));
    return [...seedData];
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(raw);
}

function saveData() {
  fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2));
}

// Array in-memory - sumber data yang sama dipakai semua fungsi di bawah
let products = loadData();

function getNextId() {
  const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
  return maxId + 1;
}

function getAll({ kategori, search } = {}) {
  let filtered = products;

  if (kategori) {
    filtered = filtered.filter((p) => p.category.toLowerCase() === kategori.toLowerCase());
  }
  if (search) {
    const keyword = search.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(keyword));
  }

  return filtered;
}

function getById(id) {
  return products.find((p) => p.id === id);
}

function create(data) {
  const newProduct = {
    id: getNextId(),
    name: data.name,
    category: data.category,
    price: Number(data.price),
    stock: Number(data.stock),
    image: data.image || "",
    description: data.description || ""
  };
  products.push(newProduct);
  saveData();
  return newProduct;
}

function update(id, data) {
  const product = products.find((p) => p.id === id);
  if (!product) return null;

  if (data.name !== undefined) product.name = data.name;
  if (data.category !== undefined) product.category = data.category;
  if (data.price !== undefined) product.price = Number(data.price);
  if (data.stock !== undefined) product.stock = Number(data.stock);
  if (data.image !== undefined) product.image = data.image;
  if (data.description !== undefined) product.description = data.description;

  saveData();
  return product;
}

function remove(id) {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  saveData();
  return true;
}

module.exports = { getAll, getById, create, update, remove };