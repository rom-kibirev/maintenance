import axios from "axios";
import {api, headersRequests} from "../data/rules";
import {groupTypes} from "../components/UI/global/templates";

export const auth = async (login, password) => {
    try {
        const response = await axios.post(
            `${api}/auth/login`,
            JSON.stringify({ login, password })
        );

        if (response.data?.token) {
            return {
                success: true,
                token: response.data.token,
            };
        }

        return {
            success: false,
            message: response.data?.message || "Ошибка авторизации",
        };

    } catch (error) {
        console.error('Ошибка авторизации:', error.response ? error.response.data : error.message);

        return {
            success: false,
            message: error?.response?.data?.errors?.map((e, i) => `auth - attr: ${e.attr} detail: ${e.detail} code: ${e.code}`)
        };
    }
};

export const fetchUserData = async (token) => {
    try {

        const response = await axios.get(
            `${api}/user`,
            headersRequests('get', token)
        );

        return {
            success: true,
            data: response.data,
        };

    } catch (error) {
        console.error('fetchUserData:', error.response ? error.response.data : error.message);

        return {
            success: false,
            message: error?.response?.data?.errors?.map((e, i) => `fetchUserData - attr: ${e.attr} detail: ${e.detail} code: ${e.code}`)
        };
    }
};
export const fetchCategoryData = async (token) => {
    try {

        const response = await axios.get(
            `${api}/category`,
            headersRequests('get', token)
        );

        // console.log('\n response', response);
        return {
            success: true,
            data: response.data.data,
        };

    } catch (error) {
        console.error('fetchCategoryData:', error.response ? error.response.data : error.message);

        return {
            success: false,
            message: error?.response?.data?.errors?.map((e, i) => `fetchCategoryData - attr: ${e.attr} detail: ${e.detail} code: ${e.code}`)
        };
    }
};
export const fetchAllGoodsData = async (token) => {
    try {
        // Первый запрос для получения информации о страницах и данных первой страницы
        const firstResponse = await axios.get(
            `${api}/goods`,
            headersRequests('get', token)
        );

        const { count, total_count, data: firstPageData } = firstResponse.data;
        const totalPages = Math.ceil(total_count / count);  // Всего страниц
        let allGoodsData = [...firstPageData];  // Собираем данные первой страницы

        // Последовательный запрос для каждой страницы начиная со 2-ой
        for (let page = 2; page <= totalPages; page++) {
            try {
                const response = await axios.get(
                    `${api}/goods?page=${page}`,
                    headersRequests('get', token)
                );

                allGoodsData = allGoodsData.concat(response.data.data);  // Добавляем данные из следующей страницы
            } catch (error) {
                console.error(`Ошибка при загрузке страницы ${page}:`, error.response ? error.response.data : error.message);
                // Можно добавить стратегию ретрая при необходимости
                return {
                    success: false,
                    message: `Ошибка при загрузке страницы ${page}: ${error.message}`,
                };
            }
        }

        return {
            success: true,
            data: allGoodsData,
        };

    } catch (error) {
        console.error('fetchAllGoodsData:', error.response ? error.response.data : error.message);

        return {
            success: false,
            message: error?.response?.data?.errors?.map((e, i) => `fetchAllGoodsData - attr: ${e.attr} detail: ${e.detail} code: ${e.code}`)
        };
    }
};

export const sendCategories = async (token, categories) => {

    try {
        const getUserData = await fetchUserData(token);

        if (getUserData.success && categories.length > 0) {

            const checkAccess = getUserData?.data?.groups?.filter(id => {

                const readAccess = groupTypes[id];

                return readAccess?.agreement_read;
            });

            // console.log('\n checkAccess', checkAccess);

            if (checkAccess?.length > 0) {
                const data = categories.map(c => {

                    return {
                        ID: c.ID,
                        NAME: c.NAME,
                        ACTIVE: c.ACTIVE,
                        SORT: c.SORT,
                        CODE: c.CODE,
                    };
                });
                console.log('\n data', data);

                const response = await axios.patch(
                    `${api}/category`,
                    JSON.stringify({data}),
                    headersRequests('post', token)
                );

                return {
                    success: response.status === 200,
                    data: response.data,
                };
            }
        }
    }
    catch (error) {

        console.error('sendCategories:', error.response ? error.response.data : error.message);

        return {
            success: false,
            message: error?.response?.data?.errors?.map((e, i) => `sendCategories - attr: ${e.attr} detail: ${e.detail} code: ${e.code}`)
        };
    }
}