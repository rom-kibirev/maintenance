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

// get
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
export const fetchGoodsSelfApiData = async (token) => {
    try {
        // URL фида
        const feedUrl = "https://feeds.garwin.ru/6462f219-94a8-4b31-9a04-439c654adcb2/yandex.xml";

        // Шаг 1: Отправляем запрос для запуска обработки
        await axios.post(
            "https://maintenance.runtec-shop.com/api/feedReport.php",
            new URLSearchParams({ feed_url: feedUrl }),
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        console.log("Обработка началась. Ожидание завершения...");

        // Шаг 2: Проверяем статус обработки в цикле
        while (true) {
            // Ждем 1 секунду перед запросом статуса
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Получаем статус обработки
            const response = await axios.get("https://maintenance.runtec-shop.com/api/feedReport.php", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const status = response.data;
            console.log("Текущий статус:", status);

            // Если прогресс завершен, возвращаем результат
            if (status.progress === 100) {
                console.log("Обработка завершена.");
                return status; // Возвращаем финальный результат обработки
            }

            // Логирование текущего прогресса
            console.log(`Прогресс: ${status.progress}% (${status.status})`);
        }
    } catch (err) {
        console.error("Ошибка в fetchGoodsSelfApiData:", err.response?.data || err.message);
        throw new Error(err.response?.data || "Не удалось завершить обработку");
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

// patch
export const patchCategories = async (token, categories) => {

    try {
        const getUserData = await fetchUserData(token);

        if (getUserData.success && categories.length > 0) {

            const checkAccess = getUserData?.data?.groups?.filter(id => {

                const readAccess = groupTypes[id];

                return readAccess?.agreement_read;
            });

            if (checkAccess?.length > 0) {

                const response = await axios.patch(
                    `${api}/category`,
                    {"data":categories},
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

export const updateGoodsInBatches = async (token, goods) => {
    const batchSize = 100; // Размер партии
    const totalBatches = Math.ceil(goods.length / batchSize); // Общее количество партий
    const apiUrl = `${api}/goods`;
    let updatedCount = 0;

    console.log(`Начало обновления товаров. Всего товаров: ${goods.length}, партий: ${totalBatches}`);

    for (let i = 0; i < totalBatches; i++) {
        const batch = goods.slice(i * batchSize, (i + 1) * batchSize); // Выделяем текущую партию
        console.log(`Отправка партии ${i + 1} из ${totalBatches}. Количество товаров в партии: ${batch.length}`);

        try {
            const response = await axios.patch(
                apiUrl,
                { data: batch },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );

            if (response.status === 200) {
                updatedCount += batch.length;
                console.log(`Партия ${i + 1} успешно обновлена. Обновлено товаров: ${updatedCount}`);
            } else {
                console.warn(`Проблема с обновлением партии ${i + 1}. Статус: ${response.status}`);
            }
        } catch (error) {
            console.error(`Ошибка при обновлении партии ${i + 1}:`, error.response ? error.response.data : error.message);
            break; // Прекращаем выполнение при ошибке
        }
    }

    console.log(`Обновление завершено. Всего успешно обновлено товаров: ${updatedCount}`);
};
