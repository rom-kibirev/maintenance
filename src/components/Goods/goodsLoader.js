// Функция для загрузки части товаров из 1С
export const loadGoodsRange = async (startPart, endPart) => {
    try {
        const parts = [];
        for (let i = startPart; i <= endPart; i++) {
            const response = await fetch(`/data/1c_goods/goods_part_${i}.json`);
            if (!response.ok) {
                throw new Error(`Ошибка загрузки части ${i}`);
            }
            const data = await response.json();
            parts.push(data);
        }
        return parts.flat();
    } catch (error) {
        console.error('Ошибка при загрузке товаров из 1С:', error);
        return [];
    }
};

// Функция для получения общего количества частей
export const getTotalParts = async () => {
    try {
        const response = await fetch('/data/1c_goods/index.json');
        if (!response.ok) {
            throw new Error('Ошибка загрузки индекса');
        }
        const data = await response.json();
        return data.totalParts || 1;
    } catch (error) {
        console.error('Ошибка при получении количества частей:', error);
        return 1;
    }
}; 