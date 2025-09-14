// SPA loader and page router
document.addEventListener("DOMContentLoaded", () => {

    async function loadComponent(selector, file, scriptFile = null) {
        const res = await fetch(file);
        document.querySelector(selector).innerHTML = await res.text();

        if (scriptFile) {
            const script = document.createElement("script");
            script.src = scriptFile;
            script.defer = true;
            document.body.appendChild(script);
        }
    }

    // Load persistent components
    loadComponent(".header", "header.html");
    loadComponent(".marquee", "marquee.html");
    loadComponent(".sidebar", "sidebar.html", "js/music-player.js");

    // Function to initialize page-specific JS
    async function initPageScripts(newMain) {
        // Check if gallery exists in the new main
        if (newMain && newMain.querySelector(".gallery-card")) {
            // Load gallery.js dynamically if not already loaded
            if (!window.galleryLoaded) {
                await new Promise((resolve) => {
                    const script = document.createElement("script");
                    script.src = "js/gallery.js";
                    script.onload = () => {
                        window.galleryLoaded = true;
                        resolve();
                    };
                    document.body.appendChild(script);
                });
            }
            // Call initGallery after gallery.js is loaded
            if (typeof initGallery === "function") initGallery();
        }
    }

    // SPA navigation
    async function loadPage(href) {
        const res = await fetch(href);
        const html = await res.text();
        const temp = document.createElement("div");
        temp.innerHTML = html;

        const newMain = temp.querySelector(".main");
        if (newMain) {
            document.querySelector(".main").replaceWith(newMain);
            history.pushState(null, "", href);
            window.scrollTo(0, 0);

            await initPageScripts(newMain);
        }
    }

    // Intercept clicks
    document.body.addEventListener("click", async (e) => {
        const link = e.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href || href.startsWith("http") || href.startsWith("#")) return;

        if (href === "index.html") {
            window.location.href = href;
            return; // stop SPA loading
        }
        
        e.preventDefault();
        await loadPage(href);
    });

    // Handle browser back/forward
    window.addEventListener("popstate", async () => {
        await loadPage(location.pathname);
    });

    // Initialize first page
    initPageScripts(document.querySelector(".main"));
});

