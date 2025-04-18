import {fetchCategories} from "../../../requests/api_v2";
import axios from "axios";
import {brandList} from "./templates";
import * as XLSX from 'xlsx';

// Функция для получения товаров с сайта и из 1С с отслеживанием прогресса
export async function fetchAllGoods(onProgress, token) {
    try {
        // Загрузка категорий
        onProgress?.({
            stage: 'categories',
            status: 'Загрузка категорий...'
        });

        const categoriesResponse = await fetchCategories(token);
        const categories = categoriesResponse || [];

        onProgress?.({
            stage: 'categories',
            status: `Загружено категорий: ${categories.length}`
        });

        // Загрузка товаров с сайта
        let partNumber = 1;
        const allGoods = new Map();
        
        while (true) {
            try {
                onProgress?.({
                    stage: 'site',
                    currentPart: partNumber,
                    status: `Загрузка товаров с сайта (часть ${partNumber})...`
                });

                const response = await axios.get(`./data/api_v2/goods/all_products_part_${partNumber}.json`);
                const data = response.data;
                
                if (data && Array.isArray(data)) {
                    data.forEach((good) => {
                        if (!allGoods.has(good.ID)) {
                            allGoods.set(good.ID, good);
                        }
                    });
                    
                    onProgress?.({
                        stage: 'site',
                        currentPart: partNumber,
                        siteGoods: allGoods.size,
                        status: `Загружена часть ${partNumber} с сайта, всего товаров: ${allGoods.size}`
                    });

                    partNumber++;
                } else {
                    break;
                }
            } catch (error) {
                break;
            }
        }

        const siteGoods = [...allGoods.values()];

        // Загрузка товаров из 1С
        onProgress?.({
            stage: '1c',
            currentPart: 0,
            siteGoods: siteGoods.length,
            status: 'Начинаем загрузку товаров из 1С...'
        });

        const allGoods1C = new Map();
        partNumber = 1;
        
        while (true) {
            try {
                onProgress?.({
                    stage: '1c',
                    currentPart: partNumber,
                    siteGoods: siteGoods.length,
                    status: `Загрузка товаров из 1С (часть ${partNumber})...`
                });

                const response = await axios.get(`/data/1c_goods/goods_part_${partNumber}.json`);
                const data = response.data;
                
                if (data && Array.isArray(data)) {
                    data.forEach((good) => {
                        if (!allGoods1C.has(good.guid)) {
                            allGoods1C.set(good.guid, good);
                        }
                    });
                    
                    onProgress?.({
                        stage: '1c',
                        currentPart: partNumber,
                        siteGoods: siteGoods.length,
                        totalItems: allGoods1C.size,
                        status: `Загружена часть ${partNumber} из 1С, всего товаров: ${allGoods1C.size}`
                    });

                    partNumber++;
                } else {
                    break;
                }
            } catch (error) {
                onProgress?.({
                    stage: '1c',
                    currentPart: partNumber,
                    siteGoods: siteGoods.length,
                    totalItems: allGoods1C.size,
                    status: `Загрузка завершена, товаров из 1С: ${allGoods1C.size}`
                });
                break;
            }
        }

        const goods1C = [...allGoods1C.values()];

        return {
            categories,
            siteGoods,
            goods1C
        };
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        throw error;
    }
}

// Функция для получения товаров
export async function fetchGoodsData(token) {
    try {
        // Получаем категории
        const categories = await fetchCategories(token);

        // Загружаем все части товаров
        const allGoods = new Map();
        let partNumber = 1;
        
        while (true) {
            try {
                const fileName = `all_products_part_${partNumber}.json`;
                const response = await axios.get(`./data/api_v2/goods/${fileName}`);
                const data = response.data;
                
                if (data && Array.isArray(data)) {
                    data.forEach((good) => {
                        if (!allGoods.has(good.ID)) {
                            allGoods.set(good.ID, good);
                        }
                    });
                    console.log(`Загружена часть ${partNumber}, добавлено ${data.length} товаров, всего: ${allGoods.size}`);
                    partNumber++;
                } else {
                    console.error(`Некорректные данные в файле ${fileName}`);
                    break;
                }
            } catch (error) {
                console.log(`Загрузка завершена на части ${partNumber}, всего загружено товаров: ${allGoods.size}`);
                break; // Прерываем загрузку при первой ошибке
            }
        }

        // Загружаем данные фида
        const feed = await axios
            .get(`./data/api_v2/goods/products.json`)
            .then((response) => response.data)
            .catch((error) => {
                console.error(`Ошибка при загрузке feed data:`, error);
                return [];
            });

        // Обрабатываем товары
        const goods = [...allGoods.values()]
            .map((g) => {
                const pictures = g.PICTURES ? [g.PREVIEW_PICTURE, ...g.PICTURES] : [g.PREVIEW_PICTURE];
                const categoryGoods = categories.find(c => c.ID === g.CATEGORY_ID);

                return {
                    ...g,
                    PICTURES: pictures,
                    LINK: `${categoryGoods?.CODE}/${g.CODE}`
                };
            });

        return { categories, goods, feed };
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

export function sortProductsByBrand(products, type) {
    // console.log(`\n `, products, type === "count");

    // Преобразуем список брендов в нижний регистр для консистентности
    const brandPriority = brandList.map((brand) => brand.toLowerCase());

    const getBrandPriority = (brand) => {
        const index = brandPriority.indexOf((brand || '').toLowerCase());
        return index === -1 ? Infinity : index; // Если бренда нет, отдаем самый низкий приоритет
    };

    // Создаем копию продуктов для сортировки
    let sortedProducts = [...products];

    if (type === "count") {
        // Сортировка по цене от большего к меньшему
        sortedProducts.sort((a, b) => b.PRICE - a.PRICE);

        // Сортировка по количеству пунктов выдачи от большего к меньшему
        sortedProducts.sort((a, b) => b.WAREHOUSE - a.WAREHOUSE);
    }

    // Сортировка по бренду
    sortedProducts.sort((a, b) => {
        const priorityA = getBrandPriority(a.BRAND);
        const priorityB = getBrandPriority(b.BRAND);

        // Сначала сортируем по приоритету бренда
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        // Если приоритеты одинаковы, сортируем по количеству пунктов выдачи
        if (a.WAREHOUSE !== b.WAREHOUSE) {
            return b.WAREHOUSE - a.WAREHOUSE;
        }

        // Если количество пунктов выдачи одинаковое, сортируем по цене
        if (a.PRICE !== b.PRICE) {
            return b.PRICE - a.PRICE;
        }

        // Если всё остальное одинаково, сортируем по исходному значению SORT
        return a.SORT - b.SORT;
    });

    // Переопределяем значение SORT для всех товаров
    let sortValue = 100;
    sortedProducts.forEach((product) => {
        product.SORT = sortValue;
        sortValue += 10;
    });

    // Удаляем дубликаты
    return [...new Set(sortedProducts)];
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

export const mergeFeed = (goods, feed) => {

    const feedMap = new Map(feed?.map((f) => [f.VENDOR, f]));

    const goodsModificate = goods.map((g) => {
        const feedData = feedMap?.get(g.VENDOR);

        return {
            ...g,
            COUNT: feedData?.count || 0,
            WAREHOUSE: feedData?.warehouse?.length || 0,
            PRICE: feedData?.price || 0,
            PICTURES: feedData?.picture || g.PICTURES,
        };
    });

    return goodsModificate
}