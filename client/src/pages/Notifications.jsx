import { useEffect, useState } from "react";
import api from "../config/axios";
import Layout from "../components/Layout";
import {
    FaBell,
    FaCheckCircle,
    FaTrash,
    FaSearch
} from "react-icons/fa";

import "./Notifications.css";

function Notifications() {

    const user = JSON.parse(localStorage.getItem("user"));

    const [notifications, setNotifications] = useState([]);

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("All");


    useEffect(() => {

        if (user) {

            loadNotifications();

        }

    }, []);


    const loadNotifications = async () => {

        try {

            const response = await api.get(
                "/notifications"
            );

            setNotifications(
                response.data.notifications ||
                response.data ||
                []
            );

        }

        catch (error) {

            console.log(
                "LOAD NOTIFICATIONS ERROR:",
                error.response?.data || error.message
            );

        }

    };


    const markAsRead = async (id) => {

        try {

            await api.put(
                `/notifications/read/${id}`
            );

            loadNotifications();

        }

        catch (error) {

            console.log(
                "MARK AS READ ERROR:",
                error.response?.data || error.message
            );

        }

    };


    const deleteNotification = async (id) => {

        if (!window.confirm("Delete notification?")) return;

        try {

            await api.delete(
                `/notifications/${id}`
            );

            loadNotifications();

        }

        catch (error) {

            console.log(
                "DELETE NOTIFICATION ERROR:",
                error.response?.data || error.message
            );

        }

    };


    const markAllRead = async () => {

        try {

            await api.put(
                "/notifications/read-all"
            );

            loadNotifications();

        }

        catch (error) {

            console.log(
                "MARK ALL READ ERROR:",
                error.response?.data || error.message
            );

        }

    };


    const filtered = notifications.filter(item => {

        const matchesSearch =

            item.title
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||

            item.message
                ?.toLowerCase()
                .includes(search.toLowerCase());


        const matchesFilter =

            filter === "All" ||

            item.type === filter;


        return matchesSearch && matchesFilter;

    });


    const unread = notifications.filter(
        n => !n.isRead
    ).length;


    return (

        <Layout>

            <div className="notifications-page">


                <div className="notifications-header">

                    <div>

                        <h1>

                            <FaBell />

                            Notifications

                        </h1>

                        <p>

                            {unread} unread notification(s)

                        </p>

                    </div>


                    <button

                        className="read-all-btn"

                        onClick={markAllRead}

                    >

                        Mark All Read

                    </button>

                </div>


                <div className="notification-tools">


                    <div className="search-box">

                        <FaSearch />

                        <input

                            type="text"

                            placeholder="Search..."

                            value={search}

                            onChange={(e) =>
                                setSearch(e.target.value)
                            }

                        />

                    </div>


                    <select

                        value={filter}

                        onChange={(e) =>
                            setFilter(e.target.value)
                        }

                    >

                        <option>All</option>
                        <option>Message</option>
                        <option>Product</option>
                        <option>Store</option>
                        <option>Subscription</option>
                        <option>Admin</option>

                    </select>

                </div>


                {

                    filtered.length === 0

                        ?

                        (

                            <div className="empty">

                                <FaBell />

                                <h2>
                                    No Notifications
                                </h2>

                                <p>
                                    You're all caught up.
                                </p>

                            </div>

                        )

                        :

                        (

                            filtered.map(notification => (

                                <div

                                    key={notification.id}

                                    className={`notification-card ${
                                        notification.isRead
                                            ? ""
                                            : "unread"
                                    }`}

                                >


                                    <div className="notification-content">

                                        <h3>

                                            {notification.title}

                                        </h3>


                                        <p>

                                            {notification.message}

                                        </p>


                                        <small>

                                            {notification.createdAt}

                                        </small>

                                    </div>


                                    <div className="notification-actions">


                                        {

                                            !notification.isRead &&

                                            <button

                                                onClick={() =>
                                                    markAsRead(
                                                        notification.id
                                                    )
                                                }

                                            >

                                                <FaCheckCircle />

                                            </button>

                                        }


                                        <button

                                            onClick={() =>
                                                deleteNotification(
                                                    notification.id
                                                )
                                            }

                                        >

                                            <FaTrash />

                                        </button>


                                    </div>


                                </div>

                            ))

                        )

                }


            </div>

        </Layout>

    );

}

export default Notifications;