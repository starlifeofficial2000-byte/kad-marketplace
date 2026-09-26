import { useEffect } from "react";
import api from "../config/axios";

function DynamicFavicon() {
    useEffect(() => {
        const loadFavicon = async () => {
            try {
                const response = await api.get("/settings");

                const settings =
                    response.data?.settings ||
                    response.data?.data?.settings ||
                    response.data?.data ||
                    {};

                const favicon =
                    settings.favicon ||
                    settings.faviconUrl ||
                    settings.branding?.favicon ||
                    settings.branding?.faviconUrl;

                if (!favicon) {
                    console.warn("No favicon URL found in marketplace settings.");
                    return;
                }

                let faviconLink =
                    document.querySelector('link[rel="icon"]');

                if (!faviconLink) {
                    faviconLink = document.createElement("link");
                    faviconLink.rel = "icon";
                    document.head.appendChild(faviconLink);
                }

                faviconLink.type = "image/png";
                faviconLink.href =
                    `${favicon}${favicon.includes("?") ? "&" : "?"}v=${Date.now()}`;

                console.log("FAVICON LOADED:", favicon);
            } catch (error) {
                console.error(
                    "FAILED TO LOAD FAVICON:",
                    error.response?.data || error.message
                );
            }
        };

        loadFavicon();
    }, []);

    return null;
}

export default DynamicFavicon;