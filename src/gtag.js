window.dataLayer = window.dataLayer || [];
window.gtag = function () {
  dataLayer.push(arguments);
};

window.gtag?.("js", new Date());
window.gtag?.("config", "G-4FKY7GNNYY");

addEventListener("error", (event) => {
  window.gtag?.("event", "exception", {
    description: event.message,
    fatal: true,
  });
});

addEventListener("unhandledrejection", (event) => {
  window.gtag?.("event", "exception", {
    description: String(event.reason),
    fatal: false,
  });
});
