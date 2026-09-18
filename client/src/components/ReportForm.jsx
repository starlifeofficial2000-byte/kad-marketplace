import { useState } from "react";
import api from "../config/axios";
import "./ReportForm.css";

function ReportForm({ productId }) {

    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);


    /* =========================================
       SUBMIT REPORT
    ========================================= */

    const submitReport = async (e) => {

        e.preventDefault();


        const user = JSON.parse(
            localStorage.getItem("user")
        );


        /* CHECK LOGIN */

        if (!user) {

            alert("Please login first.");

            return;

        }


        /* CHECK PRODUCT */

        if (!productId) {

            alert("Product information is missing.");

            return;

        }


        /* CHECK REASON */

        if (!reason) {

            alert("Please select a reason.");

            return;

        }


        try {

            setLoading(true);


            await api.post(

                "/reports",

                {

                    productId,

                    userId: user.id,

                    reason,

                    description: description.trim()

                }

            );


            alert(
                "Report submitted successfully."
            );


            /* RESET FORM */

            setReason("");

            setDescription("");

        }

        catch (error) {

            console.error(
                "REPORT ERROR:",
                error.response?.data || error.message
            );


            alert(

                error.response?.data?.message ||

                "Unable to submit report."

            );

        }

        finally {

            setLoading(false);

        }

    };


    return (

        <div className="report-form">

            <h3>
                🚩 Report this Product
            </h3>


            <form onSubmit={submitReport}>


                {/* REPORT REASON */}

                <select

                    value={reason}

                    onChange={(e) =>
                        setReason(e.target.value)
                    }

                    disabled={loading}

                >

                    <option value="">
                        Select Reason
                    </option>

                    <option value="Scam">
                        Scam
                    </option>

                    <option value="Fake Product">
                        Fake Product
                    </option>

                    <option value="Wrong Category">
                        Wrong Category
                    </option>

                    <option value="Spam">
                        Spam
                    </option>

                    <option value="Offensive Content">
                        Offensive Content
                    </option>

                    <option value="Other">
                        Other
                    </option>

                </select>


                {/* DESCRIPTION */}

                <textarea

                    placeholder="Describe the problem (optional)..."

                    value={description}

                    onChange={(e) =>
                        setDescription(e.target.value)
                    }

                    disabled={loading}

                    maxLength="1000"

                />


                <small>

                    {description.length}/1000 Characters

                </small>


                {/* SUBMIT BUTTON */}

                <button
                    type="submit"
                    disabled={loading}
                >

                    {

                        loading

                            ? "Submitting..."

                            : "Submit Report"

                    }

                </button>


            </form>

        </div>

    );

}

export default ReportForm;