import { useEffect } from "react";

function GoogleVerification({ verificationCode }) {

    useEffect(() => {

        const existingTag =
            document.querySelector(
                'meta[name="google-site-verification"]'
            );

        /*
        =====================================================
        REMOVE EXISTING TAG
        =====================================================
        */

        if (existingTag) {
            existingTag.remove();
        }


        /*
        =====================================================
        NO VERIFICATION CODE
        =====================================================
        */

        if (
            !verificationCode ||
            !String(verificationCode).trim()
        ) {
            return;
        }


        /*
        =====================================================
        CREATE GOOGLE VERIFICATION TAG
        =====================================================
        */

        const meta =
            document.createElement("meta");

        meta.name =
            "google-site-verification";

        meta.content =
            String(verificationCode).trim();


        /*
        =====================================================
        ADD TO HEAD
        =====================================================
        */

        document.head.appendChild(meta);


        /*
        =====================================================
        CLEANUP
        =====================================================
        */

        return () => {

            const tag =
                document.querySelector(
                    'meta[name="google-site-verification"]'
                );

            if (tag) {
                tag.remove();
            }

        };

    }, [verificationCode]);


    return null;
}

export default GoogleVerification;