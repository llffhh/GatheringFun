export const getWhatsAppShareLink = (message) => {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
};

export const getLineShareLink = (message) => {
    return `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
};

export const generateShareMessage = (type, session) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const sessionUrl = `${baseUrl}?id=${session.id}`;

    switch (type) {
        case 'waiting':
            return `Join our gathering "${session.name}"! The fate is being decided soon. View here: ${sessionUrl}`;
        case 'voting':
            return `Hey! Please finish swiping your restaurant preferences for "${session.name}". Time is running out! ${sessionUrl}`;
        case 'result':
            const restaurantName = session.finalChoice?.name || 'a restaurant';
            const date = session.finalDate || session.startDate;
            const time = session.finalTime || 'TBD';
            return `We have a winner for "${session.name}"! 🥳\n\nWinner: ${restaurantName}\nDate: ${date}\nTime: ${time}\nCheck details: ${sessionUrl}`;
        default:
            return `Check out our gathering "${session.name}": ${sessionUrl}`;
    }
};
