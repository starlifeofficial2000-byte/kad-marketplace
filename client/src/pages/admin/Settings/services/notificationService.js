import api from "../config/axios";


/* =========================================
   GET NOTIFICATIONS
========================================= */

export const getNotifications = () => {

    return api.get(
        "/notifications"
    );

};


/* =========================================
   MARK AS READ
========================================= */

export const markNotificationAsRead = (
    id
) => {

    return api.put(
        `/notifications/${id}/read`
    );

};


/* =========================================
   MARK ALL AS READ
========================================= */

export const markAllNotificationsAsRead = () => {

    return api.put(
        "/notifications/read-all"
    );

};


/* =========================================
   DELETE NOTIFICATION
========================================= */

export const deleteNotification = (
    id
) => {

    return api.delete(
        `/notifications/${id}`
    );

};