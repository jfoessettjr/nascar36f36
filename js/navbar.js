(function () {
  const PLACEHOLDER_ID = "navbar-placeholder";

  // Try a few common keys so you don't get stuck if your admin.js used a different name
  const TOKEN_KEYS = ["adminToken", "ADMIN_TOKEN", "yt_admin_token", "ytse_admin_token"];

  function hasAdminToken() {
    try {
      return TOKEN_KEYS.some((k) => {
        const v = sessionStorage.getItem(k);
        return v && String(v).trim().length > 0;
      });
    } catch {
      return false;
    }
  }

  function normalizePath(path) {
    // "/folder/index.html" -> "index.html"
    const p = (path || "").split("?")[0].split("#")[0];
    const last = p.substring(p.lastIndexOf("/") + 1);
    return last || "index.html";
  }

  function setActiveLink(navRoot) {
    const current = normalizePath(window.location.pathname);

    const links = navRoot.querySelectorAll("a.nav-link[href]");
    links.forEach((a) => a.classList.remove("active"));

    // Match by last path segment
    links.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const target = normalizePath(href);
      if (target === current) a.classList.add("active");
    });
  }

  function hideAdminIfNoToken(navRoot) {
    const adminItem = navRoot.querySelector("#nav-admin-item");
    if (!adminItem) return;

    if (!hasAdminToken()) {
      adminItem.style.display = "none";
    } else {
      adminItem.style.display = "";
    }
  }

  function enableShadowAfterScroll(navRoot) {
    const nav = navRoot.querySelector("#mainNav");
    if (!nav) return;

    const onScroll = () => {
      if (window.scrollY > 10) nav.classList.add("nav-scrolled");
      else nav.classList.remove("nav-scrolled");
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  async function injectNavbar() {
    const placeholder = document.getElementById(PLACEHOLDER_ID);
    if (!placeholder) return;

    const res = await fetch("/partials/navbar.html", { cache: "no-cache" });
    const html = await res.text();
    placeholder.innerHTML = html;

    const navRoot = placeholder; // injected DOM lives here
    setActiveLink(navRoot);
    hideAdminIfNoToken(navRoot);
    enableShadowAfterScroll(navRoot);
  }

  injectNavbar().catch((err) => {
    console.error("Navbar load failed:", err);
  });
})();
