export const api = 'https://runtec-shop.ru/api/v2';

export const headersRequests = (type, token) => {
    const types = {
        get: {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        },
        // post: {
        //     headers: {
        //         'accept': '*/*',
        //         'Authorization': `Bearer ${token}`
        //     }
        // },
        // post_form: {
        //     headers: {
        //         'accept': 'application/json',
        //         'Content-Type': 'multipart/form-data',
        //         'Authorization': `Bearer ${token}`
        //     }
        // },
        // post_json: {
        //     headers: {
        //         'accept': 'application/json',
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${token}`
        //     }
        // }
    };

    return types[type];
};