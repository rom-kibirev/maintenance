import {fetchCategories} from "../../../requests/api_v2";
import axios from "axios";
import {brandList} from "./templates";
import * as XLSX from 'xlsx';

// Функция для получения товаров
export async function fetchGoodsData(token, withoutCombine) {
    try {
        // Получаем категории
        const categories = await fetchCategories(token);

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
        const goods = Array.from(allGoods.values())
            .map((g, i) => {
                const feedData = !withoutCombine && feedMap.get(g.VENDOR);
                const pictures = g.PICTURES ? [g.PREVIEW_PICTURE, ...g.PICTURES] : [g.PREVIEW_PICTURE];
                const categoryGoods = categories.find(c => c.ID === g.CATEGORY_ID);

                return {
                    ...g,
                    COUNT: feedData?.count || null,
                    WAREHOUSE: feedData?.warehouse?.length || null,
                    PRICE: feedData?.price || null,
                    PICTURES: pictures,
                    LINK: `${categoryGoods?.CODE}/${g.CODE}`
                };
            })
            .sort((a, b) => b.SORT - a.SORT)
        ;

        // Выполняем сортировку
        // const finalGoods = sortAndUpdateProducts(goods);

        return { categories, goods: goods, feed: goodsByFeedUpdate };
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

export function sortProductsByBrand(products) {
    // Преобразуем список брендов в нижний регистр для консистентности
    const brandPriority = brandList.map((brand) => brand.toLowerCase());

    const getBrandPriority = (brand) => {
        const index = brandPriority.indexOf((brand || '').toLowerCase());
        return index === -1 ? Infinity : index; // Если бренда нет, отдаем самый низкий приоритет
    };

    // Создаем копию продуктов для сортировки
    const sortedProducts = [...products].sort((a, b) => {
        const priorityA = getBrandPriority(a.BRAND);
        const priorityB = getBrandPriority(b.BRAND);

        // Сначала сортируем по приоритету бренда
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        // Если приоритеты одинаковы, сортируем по исходному значению SORT
        return a.SORT - b.SORT;
    });

    // Переопределяем значение SORT для всех товаров
    let sortValue = 600;
    sortedProducts.forEach((product) => {
        product.SORT = sortValue;
        sortValue += 10;
    });

    // Лог результата для проверки
    // console.log("Sorted Products (by brand and SORT):", sortedProducts);

    return sortedProducts;
}


export function generateSortStatistics(products) {
    const statistics = {};

    products.forEach(product => {
        const brand = brandList.includes(product.BRAND?.toLowerCase())
            ? product.BRAND
            : "ПРОЧИЕ";
        const sortValue = product.SORT;

        if (!statistics[brand]) {
            statistics[brand] = [];
        }

        statistics[brand].push(sortValue);
    });

    // console.log("Statistics before ranges:", statistics);

    const result = Object.entries(statistics).map(([brand, values]) => {
        values.sort((a, b) => a - b);
        const ranges = [];
        let start = values[0], prev = values[0];

        for (let i = 1; i < values.length; i++) {
            if (values[i] !== prev + 10) {
                ranges.push(`${start}-${prev}`);
                start = values[i];
            }
            prev = values[i];
        }
        ranges.push(`${start}-${prev}`);

        return { brand, ranges };
    });

    // console.log("Final Statistics:", result);
    return result;
}

export function exportGoodsToXLSX(categories, goods, feed) {
    if (goods?.length && categories?.length) {

        // Предварительно создаем карту товаров для быстрого доступа по CATEGORY_ID
        const goodsMap = goods?.sort((a, b) => a.SORT - b.SORT).reduce((acc, g) => {
            if (!acc[g.CATEGORY_ID]) acc[g.CATEGORY_ID] = [];
            acc[g.CATEGORY_ID].push(g);
            return acc;
        }, {});

        // Карта товаров по VENDOR для быстрого поиска
        const goodsFeedMap = (feed || []).reduce((acc, f) => {
            acc[f.VENDOR] = f;
            return acc;
        }, {});

        // Основной экспорт данных
        const exportData = categories.reduce((acc, c) => {
            // Заголовок категории
            acc.push([
                'Категория',
                c.ID,
                c.XML_ID,
                '',
                '',
                c.NAME,
            ]);

            // Товары внутри категории
            const goods = (goodsMap[c.ID] || []).map(g => {
                const goodFeed = feed?.length ? goodsFeedMap[g.VENDOR] : {};
                return [
                    'Товар',
                    g.ID,
                    g.XML_ID,
                    g.BRAND,
                    g.SORT,
                    g.NAME,
                    g.PICTURES.filter(p => p).length,
                    g.PICTURES.map(p => p ? 'https://runtec-shop.ru/' + p : null).join(','),
                    '', // Стоимость на сайте (возможно, нужно доработать)
                    '', // Остатки на сайте (возможно, нужно доработать)
                    goodFeed.picture?.length || 0,
                    (goodFeed.picture || []).join(','),
                    goodFeed.price || '',
                    goodFeed.count || '',
                ];
            });

            // Добавляем товары в категорию
            acc.push(...goods);
            return acc;
        }, []);

        // Заголовок таблицы
        exportData.unshift([
            'Тип',
            'ID',
            'GUID 1C',
            'Бренд',
            'Сортировка',
            'Наименование',
            'Изображений на сайте',
            'Изображения',
            'Стоимость на сайте',
            'Остатки на сайте',
            'Изображений в фиде',
            'Изображения',
            'Стоимость в фиде',
            'Остатки в фиде',
        ]);

        // Создание рабочей книги и добавление листа
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Экспорт');

        // Генерация файла и скачивание
        return (
            XLSX.writeFile(workbook, 'Сравнение с фидом.xlsx')
        )

        // console.log('\n exportXLSX', {
        //     exportData,
        // });
    }
}

export function getCategoryDescendants(selectedCategory, categories) {
    const descendants = [];
    const visited = new Set();

    function findChildren(categoryId) {
        if (visited.has(categoryId)) return; // Избегаем зацикливания
        visited.add(categoryId);

        const children = categories.filter(category => category.IBLOCK_SECTION_ID === categoryId);
        // console.log(`Children of ${categoryId}:`, children);
        children.forEach(child => {
            descendants.push(child.ID);
            findChildren(child.ID); // Рекурсивный поиск
        });
    }

    // console.log('Selected Category:', selectedCategory);
    findChildren(selectedCategory);
    // console.log('Descendants:', descendants);
    return descendants;
}