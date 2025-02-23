// Нормализация строки для поиска
export const normalizeSearchString = (str) => {
    if (!str) return '';
    return str.toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
};

// Поиск по имени и артикулу
export const searchByNameAndVendor = (items, searchQuery) => {
    if (!searchQuery) return items;

    const normalizedQuery = normalizeSearchString(searchQuery);

    return items.filter(item => {
        const normalizedName = normalizeSearchString(item.NAME || item.name);
        const normalizedVendor = normalizeSearchString(item.VENDOR || item.vendor_code);

        return normalizedName.includes(normalizedQuery) ||
            normalizedVendor.includes(normalizedQuery);
    });
};

// Поиск товаров 1С
export const searchGoods1C = (goods1C, searchQuery) => {
    if (!searchQuery) return goods1C;

    const normalizedQuery = normalizeSearchString(searchQuery);

    return goods1C.filter(item => {
        const normalizedName = normalizeSearchString(item.name);
        const normalizedVendor = normalizeSearchString(item.vendor_code);

        return normalizedName.includes(normalizedQuery) ||
            normalizedVendor.includes(normalizedQuery);
    });
};