import {fetchCategoryData} from "../../../requests/api_v2";
import axios from "axios";

export async function fetchGoodsData(token, withoutCombine) {
    try {
        // Загружаем категории
        const categoriesResponse = await fetchCategoryData(token);
        const categories = categoriesResponse.success
            ? categoriesResponse.data.sort((a, b) => a.SORT - b.SORT)
            : []
        ;
        const lastFileNumber = 7;

        // Загружаем части товаров
        const filePromises = Array.from({ length: lastFileNumber }, (_, i) => {
            const fileName = `all_products_part_${i + 1}.json`;
            return axios
                .get(`./data/api_v2/goods/${fileName}`)
                .then((response) => response.data)
                .catch((error) => {
                    console.log(`Ошибка при загрузке ${fileName}:`, error);
                    return null;
                });
        });

        const responses = await Promise.all(filePromises);
        const allGoods = new Map();

        // Объединяем данные из частей
        responses.forEach((response) => {
            if (response) {
                response.forEach((good) => {
                    if (!allGoods.has(good.ID)) {
                        allGoods.set(good.ID, good);
                    }
                });
            }
        });

        // Загружаем данные фида
        const goodsByFeedUpdate = await axios
            .get(`./data/api_v2/goods/products.json`)
            .then((response) => response.data)
            .catch((error) => {
                console.log(`Ошибка при загрузке feed data`, error);
                return [];
            });

        const feedMap = new Map(goodsByFeedUpdate.map((f) => [f.VENDOR, f]));

        // Обрабатываем товары
        const sortedGoods = Array.from(allGoods.values())
            .map((g,i) => {
                const feedData = !withoutCombine && feedMap.get(g.VENDOR);
                const pictures = g.PICTURES ? [g.PREVIEW_PICTURE, ...g.PICTURES] : [g.PREVIEW_PICTURE];
                const categoryGoods = categories.find(c => c.ID === g.CATEGORY_ID);

                // if (i > 0 && i < 10) console.log(
                //     '\n category', categoryGoods,
                //     '\n g', g,
                // );

                return {
                    ...g,
                    COUNT: feedData?.count || 0,
                    WAREHOUSE: feedData?.warehouse?.length || 0,
                    PRICE: feedData?.price || 0,
                    PICTURES: pictures,
                    CODE: `${categoryGoods.CODE}/${g.CODE}`
                };
            })
            // .filter((g) => (withoutCombine && g.PRICE > 0))
        ;

        // Выполняем сортировку
        const finalGoods = sortAndUpdateProducts(sortedGoods);

        return { categories, goods: finalGoods, feed: goodsByFeedUpdate };
    } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        return { categories: [], goods: [] };
    }
}

export const sortAndUpdateProducts = (products) => {
    // Приоритет брендов
    const brandPriority = ["RUNTEC", "GARWIN", "Licota", "МЕТАЛЛСЕРВИС"];

    // Функция для получения индекса бренда
    function getBrandIndex(brand) {
        if (brand === null) return Infinity; // null всегда в конце
        const index = brandPriority.indexOf(brand.toUpperCase());
        return index === -1 ? Infinity : index; // Остальные бренды идут после приоритетных
    }

    // Основная сортировка
    const sortedProducts = products
        .slice() // Копируем массив, чтобы избежать мутации
        .sort((a, b) => {
            // Сортировка по бренду
            const brandAIndex = getBrandIndex(a.BRAND);
            const brandBIndex = getBrandIndex(b.BRAND);

            if (brandAIndex !== brandBIndex) {
                return brandAIndex - brandBIndex;
            }

            // Если бренды одинаковы, сортируем по COUNT от большего к меньшему
            return b.COUNT - a.COUNT;
        });

    // Пересчет SORT
    sortedProducts.forEach((product, index) => {
        product.SORT = 600 + index * 10;
    });

    return sortedProducts;
}

export const getDeclension = (count) => {
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return `${count} точках`;
    }

    const lastDigit = count % 10;
    switch (lastDigit) {
        case 1:
            return `${count} точке`;
        case 2:
        case 3:
        case 4:
            return `${count} точках`;
        default:
            return `${count} точках`;
    }
};

export const spellerYandex = async (text) => {

    try {
        const response = await axios.get(`https://speller.yandex.net/services/spellservice.json/checkText?text=${text}`);

        return response.data;
    }
    catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        return { categories: [], goods: [] };
    }
}