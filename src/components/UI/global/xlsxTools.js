import * as XLSX from 'xlsx';

/**
 * Функция для скачивания данных в формате XLSX
 * @param {Array<Array>} exportData - Массив массивов с данными для экспорта
 * @param {string} fileName - Имя файла без расширения
 */
export const downloadXLSX = (exportData, fileName) => {
    // Создаем книгу Excel
    const workbook = XLSX.utils.book_new();

    // Создаем лист с данными
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);

    // Добавляем лист в книгу
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Генерируем XLSX файл и инициируем скачивание
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};