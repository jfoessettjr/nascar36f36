(function () {
  const PLACEHOLDER_ID = "navbar-placeholder";
  const BOTTOMBAR_ID = "bottombar-placeholder";

  const NAV_PARTIAL_URL = "/partials/navbar.html";
  const BOTTOM_PARTIAL_URL = "/partials/bottombar.html";

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
    const p = (path || "").split("?")[0].split("#")[0];
    const last = p.substring(p.lastIndexOf("/") + 1);
    return last || "index.html";
  }

  function setActiveLink(navRoot) {
    const current = normalizePath(window.location.pathname);

    const links = navRoot.querySelectorAll("a.nav-link[href]");
    links.forEach((a) => a.classList.remove("active"));

    links.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const target = normalizePath(href);
      if (target === current) a.classList.add("active");
    });
  }

  function hideAdminIfNoToken(navRoot) {
    const adminItem = navRoot.querySelector("#nav-admin-item");
    if (!adminItem) return;

    adminItem.style.display = hasAdminToken() ? "" : "none";
  }

  function enableShadowAfterScroll(navRoot) {
    const nav = navRoot.querySelector("#mainNav");
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle("nav-scrolled", window.scrollY > 10);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  async function injectPartialInto(id, url) {
    const el = document.getElementById(id);
    if (!el) return;

    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      console.error(`Partial fetch failed (${res.status}) for ${url}`);
      return;
    }

    el.innerHTML = await res.text();
  }

  async function init() {
    // 1) Navbar
    await injectPartialInto(PLACEHOLDER_ID, NAV_PARTIAL_URL);

    const navRoot = document.getElementById(PLACEHOLDER_ID);
    if (navRoot) {
      setActiveLink(navRoot);
      hideAdminIfNoToken(navRoot);
      enableShadowAfterScroll(navRoot);
    }

    // 2) Bottom bar (never allowed to break navbar)
    try {
      await injectPartialInto(BOTTOMBAR_ID, BOTTOM_PARTIAL_URL);
    } catch (e) {
      console.error("Bottom bar failed:", e);
    }
  }

  init().catch((err) => console.error("Navbar init failed:", err));
})();

