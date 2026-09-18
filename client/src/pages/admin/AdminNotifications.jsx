import { useEffect, useState } from "react";
import api from "../../config/axios";

import "./AdminNotifications.css";


function AdminNotifications() {

    const [users, setUsers] = useState([]);

    const [loadingUsers, setLoadingUsers] = useState(false);

    const [sending, setSending] = useState(false);


    const defaultForm = {

        title: "",

        message: "",

        recipient: "Everyone",

        userId: ""

    };


    const [form, setForm] = useState(defaultForm);


    /* =========================================
       LOAD USERS
    ========================================= */

    useEffect(() => {

        loadUsers();

    }, []);


    const loadUsers = async () => {

        try {

            setLoadingUsers(true);


            const response = await api.get(
                "/settings"
            );


            const usersData =

                response.data?.users ||

                response.data?.data ||

                response.data;


            setUsers(

                Array.isArray(usersData)

                    ? usersData

                    : []

            );

        }

        catch (error) {

            console.error(

                "LOAD USERS ERROR:",

                error.response?.data ||

                error.message

            );

            setUsers([]);

        }

        finally {

            setLoadingUsers(false);

        }

    };


    /* =========================================
       HANDLE INPUT CHANGE
    ========================================= */

    const handleChange = (e) => {

        const {

            name,

            value

        } = e.target;


        setForm((previous) => ({

            ...previous,

            [name]: value

        }));

    };


    /* =========================================
       SEND NOTIFICATION
    ========================================= */

    const sendNotification = async () => {

        if (!form.title.trim()) {

            alert("Notification title is required.");

            return;

        }


        if (!form.message.trim()) {

            alert("Notification message is required.");

            return;

        }


        if (

            form.recipient === "Specific User" &&

            !form.userId

        ) {

            alert("Please select a user.");

            return;

        }


        try {

            setSending(true);


            await api.post(

                "/admin/notifications/send",

                form

            );


            alert(
                "Notification sent successfully."
            );


            setForm({

                title: "",

                message: "",

                recipient: "Everyone",

                userId: ""

            });

        }

        catch (error) {

            console.error(

                "SEND NOTIFICATION ERROR:",

                error.response?.data ||

                error.message

            );


            alert(

                error.response?.data?.message ||

                "Unable to send notification."

            );

        }

        finally {

            setSending(false);

        }

    };


    return (

        <div className="admin-notifications">


            <h1>

                Send Notification

            </h1>


            <div className="notification-form">


                {/* NOTIFICATION TITLE */}

                <input

                    type="text"

                    name="title"

                    placeholder="Notification Title"

                    value={form.title}

                    onChange={handleChange}

                />


                {/* NOTIFICATION MESSAGE */}

                <textarea

                    name="message"

                    placeholder="Notification Message"

                    value={form.message}

                    onChange={handleChange}

                    rows="6"

                />


                {/* RECIPIENT */}

                <select

                    name="recipient"

                    value={form.recipient}

                    onChange={handleChange}

                >

                    <option value="Everyone">

                        Everyone

                    </option>

                    <option value="Buyers">

                        Buyers

                    </option>

                    <option value="Sellers">

                        Sellers

                    </option>

                    <option value="Administrators">

                        Administrators

                    </option>

                    <option value="Specific User">

                        Specific User

                    </option>

                </select>


                {/* SPECIFIC USER */}

                {

                    form.recipient === "Specific User" && (

                        <select

                            name="userId"

                            value={form.userId}

                            onChange={handleChange}

                            disabled={loadingUsers}

                        >

                            <option value="">

                                {

                                    loadingUsers

                                        ? "Loading users..."

                                        : "Select User"

                                }

                            </option>


                            {

                                users.map((user) => (

                                    <option

                                        key={user.id}

                                        value={user.id}

                                    >

                                        {user.name}

                                        {user.email

                                            ? ` (${user.email})`

                                            : ""

                                        }

                                    </option>

                                ))

                            }

                        </select>

                    )

                }


                {/* SEND BUTTON */}

                <button

                    type="button"

                    onClick={sendNotification}

                    disabled={sending}

                >

                    {

                        sending

                            ? "Sending..."

                            : "Send Notification"

                    }

                </button>


            </div>


        </div>

    );

}


export default AdminNotifications;