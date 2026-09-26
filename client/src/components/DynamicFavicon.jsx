import { useEffect } from "react";
import api from "../config/axios";

function DynamicFavicon() {
    useEffect(() => {
        let cancelled = false;

        const loadFavicon = async () => {
            try {
                const response = await api.get("/settings");

                console.log(
                    "[FAVICON] SETTINGS RESPONSE:",
                    response.data
                );

                const settings =
                    response.data?.settings ||
                    response.data?.data?.settings ||
                    response.data?.data ||
                    response.data ||
                    {};

                const favicon =
                    settings.favicon ||
                    settings.faviconUrl ||
                    settings.branding?.favicon ||
                    settings.branding?.faviconUrl ||
                    "";

                if (!favicon) {
                    console.warn(
                        "[FAVICON] No favicon URL found."
                    );
                    return;
                }

                if (cancelled) return;

                let faviconLink =
                    document.querySelector(
                        'link[rel="icon"]'
                    );

                if (!faviconLink) {
                    faviconLink =
                        document.createElement("link");

                    faviconLink.rel = "icon";

                    document.head.appendChild(
                        faviconLink
                    );
                }

                faviconLink.type =
                    settings.faviconMimeType ||
                    "image/png";

                /*
                 * Cache-busting.
                 * This is important because browsers
                 * cache favicons very aggressively.
                 */
                const separator =
                    favicon.includes("?")
                        ? "&"
                        : "?";

                faviconLink.href =
                    `${favicon}${separator}v=${Date.now()}`;

                /*
                 * Remove old shortcut icon if present.
                 */
                const oldShortcut =
                    document.querySelector(
                        'link[rel="shortcut icon"]'
                    );

                if (oldShortcut) {
                    oldShortcut.remove();
                }

                console.log(
                    "[FAVICON] ACTIVE:",
                    faviconLink.href
                );

            } catch (error) {
                console.error(
                    "[FAVICON] LOAD ERROR:",
                    error.response?.data ||
                    error.message
                );
            }
        };

        loadFavicon();

        return () => {
            cancelled = true;
        };
    }, []);

    return null;
}

export default DynamicFavicon;