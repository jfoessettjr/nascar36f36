(function () {
  const PLACEHOLDER_ID = "navbar-placeholder";
  const NAV_PARTIAL_URL = "/partials/navbar.html";

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

  async function injectNavbar() {
    const placeholder = document.getElementById(PLACEHOLDER_ID);
    if (!placeholder) {
      console.warn(`Missing #${PLACEHOLDER_ID} on this page`);
      return;
    }

    // Fetch partial
    const res = await fetch(NAV_PARTIAL_URL, { cache: "no-cache" });

    if (!res.ok) {
      // Make failure obvious
      const msg = `Navbar partial not found (${res.status}). Expected: ${NAV_PARTIAL_URL}`;
      console.error(msg);
      placeholder.innerHTML = `
        <div style="padding:10px;margin:10px;border:1px solid #f5c2c7;background:#f8d7da;color:#842029;">
          ${msg}
        </div>
      `;
      return;
    }

    const html = await res.text();

    // Inject
    placeholder.innerHTML = html;

    // Run enhancements
    const navRoot = placeholder;
    setActiveLink(navRoot);
    hideAdminIfNoToken(navRoot);
    enableShadowAfterScroll(navRoot);
  }

  injectNavbar().catch((err) => {
    console.error("Navbar load failed:", err);
  });
})();
