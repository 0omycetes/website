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

    loadComponent(".header", "header.html");
    loadComponent(".marquee", "marquee.html");
    loadComponent(".sidebar", "sidebar.html", "js/music-player.js");

    async function initPageScripts(newMain) {
        if (newMain && newMain.querySelector(".gallery-card")) {
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
            if (typeof initGallery === "function") initGallery();
        }
    }

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

    document.body.addEventListener("click", async (e) => {
        const link = e.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href || href.startsWith("http") || href.startsWith("#")) return;

        if (href === "index.html") {
            window.location.href = href;
            return;
        }
        
        e.preventDefault();
        await loadPage(href);
    });

    window.addEventListener("popstate", async () => {
        await loadPage(location.pathname);
    });

    initPageScripts(document.querySelector(".main"));
});

