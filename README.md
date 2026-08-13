# Toko Sembako Ariesta — UCP1 (Sprint 1 & Sprint 2)

**Nama:** Lailansyahda Azalia
**NIM:** 20240140250

## Deskripsi Project

Toko Sembako Ariesta adalah aplikasi web full stack berbasis Node.js +
Express.js untuk membantu Ibu Aries mengelola produk sembako dan
menjawab pertanyaan pelanggan tanpa harus lewat WhatsApp manual.

- **Sprint 1** membangun fondasi: struktur halaman semantik dengan
  EJS + partials, styling responsif (Flexbox/Grid + media query),
  server Express dasar, dan endpoint baca data `GET /api/products`.
- **Sprint 2** melengkapi aplikasi jadi "hidup": REST API CRUD penuh
  untuk produk, sistem login admin/kasir dengan session, dashboard
  admin yang terhubung lewat Fetch API, serta fitur Tanya AI yang
  benar-benar memanggil endpoint balasan dummy di backend
  (`POST /api/chat`).

Tidak ada pemanggilan API AI eksternal (OpenAI/Anthropic/Gemini/dsb)
di project ini — logika balasan Tanya AI 100% keyword matching
sederhana yang berjalan di backend Express.

## Kredensial Admin (untuk pengecekan asisten)

| Field | Nilai |
|---|---|
| Username | `admin` |
| Password | `admin123` |

Kredensial ini diatur lewat file `.env` (tidak ikut ter-commit).
Contoh formatnya ada di `.env.example`.

## Cara Menjalankan Project Secara Lokal

```bash
npm install
cp .env.example .env    # lalu sesuaikan isinya jika perlu (opsional)
npm run dev              # menjalankan server via nodemon (auto-restart)
# atau
npm start                 # menjalankan server biasa (node app.js)
```

Setelah server berjalan, buka `http://localhost:3000` di browser.

## Struktur Project

```
toko-ariesta/
├── app.js                     # entry point server Express + session
├── .env.example                # contoh isi .env (bukan yang asli)
├── data/
│   ├── products.js             # sumber data produk: array in-memory
│   │                            # yang dipersist otomatis ke
│   │                            # products-data.json (fs bawaan Node)
│   └── admin.js                # kredensial admin (baca dari .env + bcrypt)
├── middlewares/
│   ├── logger.js                # middleware custom: request logger
│   └── auth.js                  # middleware custom: proteksi login
├── routes/
│   ├── pages.js                 # route halaman (server-rendered EJS)
│   ├── api.js                   # route REST API produk + chat
│   └── auth.js                  # route login & logout
├── views/
│   ├── partials/
│   │   ├── navbar.ejs             # navbar dinamis (login/dashboard/logout)
│   │   └── footer.ejs
│   ├── index.ejs                 # Beranda
│   ├── produk.ejs                # Daftar produk (fetch dinamis)
│   ├── produk-detail.ejs         # Detail produk (dinamis)
│   ├── tanya-ai.ejs              # Halaman chat Tanya AI
│   ├── login.ejs                 # Halaman login admin
│   └── dashboard.ejs             # Dashboard admin (CRUD produk)
├── public/
│   ├── css/style.css
│   ├── js/
│   │   ├── main.js                # hamburger menu, logout, chat Tanya AI
│   │   ├── produk.js              # fetch & render produk publik
│   │   ├── login.js               # fetch login
│   │   └── dashboard.js           # fetch CRUD produk + gambar di dashboard
│   └── img/
└── package.json
```

## Daftar Halaman (Route Server-Rendered)

| Method | Route | Deskripsi | Akses |
|---|---|---|---|
| GET | `/` | Beranda — hero section + preview produk | Publik |
| GET | `/produk` | Daftar produk (data diambil dinamis lewat fetch ke API) | Publik |
| GET | `/produk/:id` | Detail 1 produk; menampilkan pesan wajar jika ID tidak ditemukan | Publik |
| GET | `/tanya-ai` | Halaman chat Tanya AI | Publik |
| GET | `/login` | Halaman login admin/kasir | Publik |
| GET | `/dashboard` | Dashboard admin (tambah/edit/hapus produk) | **Wajib login** — redirect ke `/login` jika belum |

## Daftar Endpoint REST API

| Method | Endpoint | Deskripsi | Akses | Contoh Response |
|---|---|---|---|---|
| POST | `/api/login` | Login admin/kasir dengan username & password | Publik | `{ "status": "success", "message": "Login berhasil" }` |
| POST | `/api/logout` | Logout, menghapus sesi login | Login | `{ "status": "success", "message": "Logout berhasil" }` |
| GET | `/api/products` | Ambil semua produk, mendukung `?kategori=` & `?search=` | Publik | `{ "status": "success", "data": [...] }` |
| GET | `/api/products/:id` | Ambil 1 produk berdasarkan ID | Publik | `{ "status": "success", "data": { "id": 1, ... } }` |
| POST | `/api/products` | Tambah produk baru | **Login** | `{ "status": "success", "message": "Produk ditambahkan", "data": {...} }` |
| PUT | `/api/products/:id` | Update produk (termasuk harga & stok) | **Login** | `{ "status": "success", "message": "Produk diperbarui", "data": {...} }` |
| DELETE | `/api/products/:id` | Hapus produk | **Login** | `{ "status": "success", "message": "Produk dihapus" }` |
| POST | `/api/chat` | Kirim pertanyaan, terima balasan AI dummy dari backend | Publik | `{ "status": "success", "data": { "reply": "..." } }` |

Endpoint dengan akses **Login** menolak request yang belum login
dengan response `{ "status": "error", "message": "Unauthorized, silakan login terlebih dahulu" }`
dan HTTP status code `401` — pengecekan dilakukan di server (middleware
`requireAuthApi`), bukan cuma disembunyikan di frontend.

## Penjelasan Tampilan (UI)

- **Navbar**: partial yang sama di semua halaman, menampilkan menu berbeda tergantung status login — link "Login" untuk pengunjung, atau "Dashboard" + "Logout" untuk admin yang sudah login. Di layar mobile pakai hamburger menu yang dibuka/tutup dengan vanilla JS (`addEventListener` + toggle class), jadi menu horizontal biasa di layar desktop (≥1024px).
<img width="1366" height="720" alt="image" src="https://github.com/user-attachments/assets/6bbf916d-f8c7-4c77-acbc-92ff11099d3b" />
- **Beranda**: hero section (kartu navy besar) + banner info toko + grid preview produk dengan gambar/ikon kategori.
<img width="1366" height="720" alt="image" src="https://github.com/user-attachments/assets/c31ef3ea-231e-48b4-abc1-06c16ca3e71f" />
- **Produk** (publik): form filter kategori/pencarian yang di-`preventDefault()` lalu memanggil `GET /api/products` lewat Fetch API — hasil dirender ulang ke DOM tanpa reload halaman. Setiap kartu produk menampilkan gambar (fallback ke ikon emoji kategori kalau gambar kosong/gagal dimuat).
<img width="1366" height="720" alt="image" src="https://github.com/user-attachments/assets/a4a189ed-19ef-443f-8934-548830391206" />
- **Detail Produk**: menampilkan info lengkap 1 produk beserta gambarnya; ID tidak valid menampilkan halaman "Produk Tidak Ditemukan" yang rapi.
<img width="1366" height="720" alt="image" src="https://github.com/user-attachments/assets/949a4d82-2a8a-4e21-ad34-4a37ba19cc25" />
- **Login**: form username & password, validasi kosong di frontend sebelum dikirim, submit lewat `fetch POST /api/login`; kredensial salah menampilkan pesan error tanpa reload halaman.
<img width="1366" height="720" alt="image" src="https://github.com/user-attachments/assets/ef4ab912-5b80-4a77-9579-455de1722379" />
- **Dashboard** (khusus admin, wajib login): form tambah/edit produk (termasuk field URL gambar produk, dengan tombol bantu "Cari Gambar di Google" dan "Hapus Gambar") dan daftar produk dengan tombol Edit/Hapus — semua operasi CRUD dilakukan lewat Fetch API (`POST`/`PUT`/`DELETE`) tanpa reload halaman, dan perubahan langsung terlihat di halaman Produk publik.
<img width="1366" height="720" alt="image" src="https://github.com/user-attachments/assets/7e3a971e-93d2-4250-b55e-b0a9433b8185" />
- **Tanya AI**: tampilan chat bubble; form submit memanggil `POST /api/chat`, balasan dari backend (mencocokkan nama produk untuk harga & stok, plus keyword umum: jam buka, ongkir, cara pembayaran) muncul otomatis di DOM.
- Styling menggunakan Tailwind CDN untuk utility dasar dikombinasikan dengan CSS custom (`public/css/style.css`), tema warna navy blue + orange + cream dengan shadow lembut dan rounded corner, 2 breakpoint media query (mobile & desktop).

## Autentikasi & Keamanan

- Session-based auth menggunakan `express-session`.
- Password admin di-hash dengan `bcryptjs` (tidak pernah dibandingkan
  dalam bentuk plain text), dan disimpan lewat `.env` yang di-ignore
  git (`.gitignore`), bukan hardcode langsung di file yang ter-commit.
- Middleware `requireAuthPage` melindungi halaman `/dashboard`
  (redirect ke `/login` jika belum login).
- Middleware `requireAuthApi` melindungi endpoint `POST/PUT/DELETE
  /api/products` (response `401` jika belum login, dicek di server —
  bukan cuma disembunyikan di frontend).

## Data & Persistensi

- Data produk disimpan sebagai array in-memory yang dipersist
  otomatis ke file `data/products-data.json` menggunakan modul `fs`
  bawaan Node.js (tanpa dependency database eksternal).
- Setiap operasi tambah/ubah/hapus produk lewat dashboard langsung
  ditulis ke file ini, sehingga data **tidak hilang** saat server
  di-restart.
- `data/products-data.json` sengaja tidak ikut ter-commit (lihat
  `.gitignore`) karena file ini otomatis ter-generate ulang dari data
  awal (`seedData` di `data/products.js`) saat server pertama kali
  dijalankan.
- Endpoint `GET /api/products` dan endpoint mutasi
  (`POST/PUT/DELETE`) membaca & mengubah sumber data array yang sama
  (bukan dua sumber terpisah), sehingga perubahan dari dashboard
  langsung terlihat di halaman Produk publik tanpa restart server.

## Middleware Custom

1. **`middlewares/logger.js`** — mencatat method, endpoint, dan
   waktu setiap request yang masuk ke terminal (aktif sejak Sprint 1,
   tetap dipakai di Sprint 2).
2. **`middlewares/auth.js`** — melindungi halaman dashboard & endpoint
   mutasi produk dari akses tanpa login (ditambahkan di Sprint 2).

## Catatan

- Tidak ada pemanggilan API AI eksternal apa pun di project ini.
- Registrasi akun publik sengaja tidak dibuat — akun admin cukup satu,
  dibuat lewat seed `.env`, sesuai ruang lingkup tugas.
