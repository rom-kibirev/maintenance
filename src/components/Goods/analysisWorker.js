/* eslint-disable no-restricted-globals */
self.onmessage = (e) => {
    const { siteGoods, goods1C, categories } = e.data;

    // Фильтрация товаров с пустыми или некорректными XML_ID и guid
    const validSiteGoods = siteGoods.filter(g => g.XML_ID && g.XML_ID.trim() !== '');
    const validGoods1C = goods1C.filter(g => g.guid && g.guid.trim() !== '');

    // Функция для получения статусов
    const getGoodStatus = (good, xmlIdGroups, guidGroups) => {
        const statuses = [];
        if (!validGoods1C.some(g => g.guid === good.XML_ID)) statuses.push({ label: "Нет в 1С", color: "error" });
        if (!good.ACTIVE) statuses.push({ label: "Не активен", color: "default" });
        if (!good.CATEGORY_ID) statuses.push({ label: "Без категории", color: "warning" });
        if (xmlIdGroups[good.XML_ID]?.length > 1) statuses.push({ label: "Дубликат", color: "warning" });
        return statuses.length > 0 ? statuses : [{ label: "OK", color: "success" }];
    };

    // Группировка товаров по XML_ID для сайта
    const xmlIdGroups = {};
    validSiteGoods.forEach(good => {
        xmlIdGroups[good.XML_ID] = xmlIdGroups[good.XML_ID] || [];
        xmlIdGroups[good.XML_ID].push({ id: good.ID, name: good.NAME, ACTIVE: good.ACTIVE });
    });

    const duplicateXmlIdsDetails = Object.entries(xmlIdGroups)
        .filter(([_, goodsList]) => goodsList.length > 1)
        .reduce((acc, [xmlId, goodsList]) => {
            acc[xmlId] = goodsList;
            return acc;
        }, {});

    // Группировка товаров по guid для 1С
    const guidGroups = {};
    validGoods1C.forEach(good => {
        guidGroups[good.guid] = guidGroups[good.guid] || [];
        guidGroups[good.guid].push({ guid: good.guid, name: good.name });
    });

    const duplicateGuidsDetails = Object.entries(guidGroups)
        .filter(([_, goodsList]) => goodsList.length > 1)
        .reduce((acc, [guid, goodsList]) => {
            acc[guid] = goodsList;
            return acc;
        }, {});

    // Обогащение товаров статусами
    const enrichedGoods = validSiteGoods.map(good => ({
        ...good,
        statuses: getGoodStatus(good, xmlIdGroups, guidGroups),
    }));

    // Анализ товаров
    const uniqueSiteXmlIdsSet = new Set(validSiteGoods.map(g => g.XML_ID));
    const unique1CGuidsSet = new Set(validGoods1C.map(g => g.guid));

    const goodsMatchSite1C = validSiteGoods.filter(good => unique1CGuidsSet.has(good.XML_ID));
    const goodsInSiteWithout1C = validSiteGoods.filter(good => !unique1CGuidsSet.has(good.XML_ID));
    const goodsIn1CWithoutSite = validGoods1C.filter(good => !uniqueSiteXmlIdsSet.has(good.guid));
    const goodsWithoutCategory = validSiteGoods.filter(item => !item.CATEGORY_ID || item.CATEGORY_ID === 0 || item.CATEGORY_ID === null);
    const goodsDisabled = validSiteGoods.filter(good => !good.ACTIVE);

    // Подсчёт статусов
    const statusCounts = {};
    enrichedGoods.forEach(good => {
        good.statuses.forEach(status => {
            statusCounts[status.label] = (statusCounts[status.label] || 0) + 1;
        });
    });

    self.postMessage({
        enrichedGoods,
        goods1C: validGoods1C,
        categories,
        goodsDisabled,
        goodsMatchSite1C,
        goodsInSiteWithout1C,
        goodsIn1CWithoutSite,
        goodsWithoutCategory,
        duplicateXmlIdsDetails,
        duplicateGuidsDetails,
        statusCounts,
    });
};