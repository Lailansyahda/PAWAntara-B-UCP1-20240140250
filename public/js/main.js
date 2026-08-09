document.addEventListener("DOMContentLoaded", function () {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navMenu = document.getElementById("navMenu");

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", function () {
      const isOpen = navMenu.classList.toggle("show");
      hamburgerBtn.classList.toggle("open", isOpen);
      hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("show");
        hamburgerBtn.classList.remove("open");
        hamburgerBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async function (event) {
      event.preventDefault();
      try {
        await fetch("/api/logout", { method: "POST" });
      } catch (err) {

      }
      window.location.href = "/";
    });
  }

  const chatForm = document.getElementById("chatForm");
  const chatBox = document.getElementById("chatBox");

  if (chatForm && chatBox) {
    chatForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const input = document.getElementById("pertanyaan");
      const question = input.value.trim();

      if (question === "") {
        return;
      }

      const userBubble = document.createElement("p");
      userBubble.className = "chat-bubble chat-bubble-user";
      userBubble.textContent = question;
      chatBox.appendChild(userBubble);
      chatBox.scrollTop = chatBox.scrollHeight;
      input.value = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question })
        });
        const result = await response.json();

        const botBubble = document.createElement("p");
        botBubble.className = "chat-bubble chat-bubble-bot";
        botBubble.textContent =
          result.data && result.data.reply
            ? result.data.reply
            : "Maaf, terjadi kesalahan pada server.";
        chatBox.appendChild(botBubble);
      } catch (err) {
        const errorBubble = document.createElement("p");
        errorBubble.className = "chat-bubble chat-bubble-bot";
        errorBubble.textContent = "Gagal menghubungi server, coba lagi ya.";
        chatBox.appendChild(errorBubble);
      }

      chatBox.scrollTop = chatBox.scrollHeight;
    });
  }
});