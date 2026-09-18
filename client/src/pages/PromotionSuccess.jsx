import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../config/axios";

function PromotionSuccess() {

    const [params] = useSearchParams();

    const navigate = useNavigate();


    useEffect(() => {

        verifyPromotion();

    }, []);


    const verifyPromotion = async () => {

        try {

            const reference = params.get("reference");


            if (!reference) {

                alert("Invalid payment reference.");

                navigate("/dashboard");

                return;

            }


            const response = await api.get(

                `/promotions/verify/${reference}`

            );


            alert(

                response.data?.message ||

                "Promotion payment verified successfully."

            );


            navigate("/dashboard");


        }

        catch (error) {

            console.error(

                "PROMOTION VERIFICATION ERROR:",

                error.response?.data || error.message

            );


            alert(

                error.response?.data?.message ||

                "Unable to verify payment."

            );


            navigate("/dashboard");

        }

    };


    return (

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontSize: "28px"
            }}
        >

            <div>

                Verifying Promotion Payment...

            </div>

        </div>

    );

}


export default PromotionSuccess;