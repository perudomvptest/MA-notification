document.addEventListener("DOMContentLoaded", () => {
  const userDiv = document.getElementById("user");
  const loginBtn = document.getElementById("loginBtn");
  const statusDiv = document.getElementById("status");

  chrome.storage.local.get(["userName"], (data) => {
    if (data.userName) {
      userDiv.textContent = `Пользователь: ${data.userName}`;
      loginBtn.style.display = "none";
    } else {
      userDiv.textContent = "Не авторизован";
      loginBtn.style.display = "block";
    }
  });

  loginBtn.onclick = () => {
    statusDiv.textContent = "Войдите через страницу игры...";
    chrome.tabs.create({ url: "https://stage.magicalchemy.org/world" });
  };
});
