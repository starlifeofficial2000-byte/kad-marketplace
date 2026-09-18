const sharp = require("sharp");

/* ==========================================
   AI IMAGE QUALITY CHECKER
========================================== */

exports.checkImageQuality = async (imagePath) => {

    try {

        const image = sharp(imagePath);

        const metadata = await image.metadata();

        const stats = await image.stats();

        let score = 100;

        const warnings = [];

        /* ======================================
           RESOLUTION
        ====================================== */

        if (

            metadata.width < 800 ||

            metadata.height < 800

        ) {

            score -= 20;

            warnings.push(

                "Low image resolution."

            );

        }

        /* ======================================
           BRIGHTNESS
        ====================================== */

        const brightness =

            stats.channels[0].mean;

        if (brightness < 60) {

            score -= 15;

            warnings.push(

                "Image is too dark."

            );

        }

        if (brightness > 240) {

            score -= 10;

            warnings.push(

                "Image is overexposed."

            );

        }

        /* ======================================
           FILE SIZE
        ====================================== */

        if (

            metadata.size &&

            metadata.size < 50000

        ) {

            score -= 10;

            warnings.push(

                "Image quality is too low."

            );

        }

        /* ======================================
           IMAGE FORMAT
        ====================================== */

        const allowed = [

            "jpeg",

            "jpg",

            "png",

            "webp"

        ];

        if (

            !allowed.includes(

                metadata.format

            )

        ) {

            score -= 20;

            warnings.push(

                "Unsupported image format."

            );

        }

        /* ======================================
           STATUS
        ====================================== */

        let status = "Excellent";

        if (score < 90)

            status = "Good";

        if (score < 75)

            status = "Fair";

        if (score < 50)

            status = "Poor";

        return {

            success: true,

            score,

            status,

            resolution:

                `${metadata.width} × ${metadata.height}`,

            brightness,

            warnings

        };

    }

    catch (error) {

        return {

            success: false,

            message: error.message

        };

    }

};