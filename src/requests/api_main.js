const API_BASE_URL = "https://maintenance.runtec-shop.com/api";

/**
 * Fetch feed data.
 * @returns {Promise<object>} API response
 */
export const fetchFeedData = async () => {
    const url = `${API_BASE_URL}/feed_handler.php`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching feed data: ${response.status}`);
    }

    return await response.json();
};

/**
 * Fetch goods data.
 * @param {string} token - Access token for authentication
 * @param {number} limit - Limit of goods to fetch
 * @returns {Promise<object>} API response
 */
export const fetchGoodsMainData = async (token, limit = 10) => {

    const url = `${API_BASE_URL}/goods_handler.php?access=${token}&limit=${limit}`;

    // const test = await fetch("https://maintenance.runtec-shop.com/test.php", {
    //     method: "OPTIONS", // Для теста отправляем OPTIONS
    //     headers: {
    //         "Content-Type": "application/json",
    //         "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    //     },
    // });
    //
    // console.log('\n test', test);


    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching goods data: ${response.status}`);
    }

    return await response.json();
};
