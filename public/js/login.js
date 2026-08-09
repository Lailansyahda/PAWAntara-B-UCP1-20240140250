document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    loginError.textContent = "";

    if (!username || !password) {
      loginError.textContent = "Username dan password wajib diisi.";
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        loginError.textContent = result.message || "Login gagal.";
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      loginError.textContent = "Terjadi kesalahan koneksi ke server.";
    }
  });
});