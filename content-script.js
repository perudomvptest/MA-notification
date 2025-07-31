(function() {
  const originalFetch = window.fetch;
  window.fetch = function() {
    return originalFetch.apply(this, arguments).then(async (response) => {
      const url = response.url || "";
      if (url.includes("/v0/sign-in") && response.status === 200) {
        const clone = response.clone();
        const data = await clone.json();
        chrome.runtime.sendMessage({ type: "signInResponse", data });
      }
      return response;
    });
  };
})();
