export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notification");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const showNotification = (title, options = {}) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
        return null;
    }

    const defaultOptions = {
        icon: '/vite.svg', // Fallback to vite logo if no specific icon
        badge: '/vite.svg',
        vibrate: [200, 100, 200]
    };

    try {
        return new Notification(title, { ...defaultOptions, ...options });
    } catch (e) {
        // Fallback for some mobile browsers that require ServiceWorker registration for Notifications
        console.error("Browser notification failed:", e);
        return null;
    }
};
