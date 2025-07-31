let requestId = 1000;
function getNextRequestId() {
  return requestId++;
}

let token = null;
let tokenExpireTime = 0;
let userName = null;

function saveAuthData(tokenValue, expireTimestamp, name) {
  token = tokenValue;
  tokenExpireTime = expireTimestamp;
  userName = name;
  chrome.storage.local.set({ token, tokenExpireTime, userName });
}

chrome.storage.local.get(["token", "tokenExpireTime", "userName"], (data) => {
  if (data.token) {
    token = data.token;
    tokenExpireTime = data.tokenExpireTime || 0;
    userName = data.userName || null;
  }
});

function notify(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon.png",
    title,
    message,
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "signInResponse") {
    const token = msg.data?.params || null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expireTime = payload.exp * 1000;
        // Извлечь кошелек из verifiedCredentials (если есть)
        let wallet = null;
        if (payload.verifiedCredentials && payload.verifiedCredentials.length > 0) {
          wallet = payload.verifiedCredentials[0].wallet || null;
        }
        const walletShort = wallet ? wallet.slice(-4) : "----";
        saveAuthData(token, expireTime, walletShort);
        console.log("Токен и данные пользователя сохранены");
      } catch (e) {
        console.error("Ошибка парсинга токена", e);
      }
    }
  }
});

chrome.runtime.onStartup.addListener(() => {
  if (tokenExpireTime && Date.now() > tokenExpireTime) {
    notify("🔑 Токен истёк", "Пожалуйста, заново залогиньтесь.");
  }
});

chrome.alarms.create("checkToken", { periodInMinutes: 1440 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkToken") {
    if (tokenExpireTime && Date.now() > tokenExpireTime) {
      notify("🔑 Токен истёк", "Пожалуйста, заново залогиньтесь.");
    }
  }
});
