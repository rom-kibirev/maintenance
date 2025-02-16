import * as XLSX from 'xlsx';

// Функция форматирования рабочего времени
export const formatWorkingHours = (working_mode) => {
    if (!working_mode?.length) return '';
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return working_mode.map((mode, index) =>
        mode.start && mode.end ?
            `${days[index]}: ${mode.start.slice(0, 5)}-${mode.end.slice(0, 5)}` :
            `${days[index]}: выходной`
    ).join('\n');
};

// Функция форматирования контактов
export const formatContacts = (contacts) => {
    if (!contacts?.length) return '';
    return contacts.map(contact =>
        `${contact.type}: ${contact.value}`
    ).join('\n');
};

// Подготовка данных для экспорта
export const prepareDataForExport = (warehousesData) => {
    return warehousesData.map(warehouse => ({
        'GUID': warehouse.guid,
        'Название': warehouse.name,
        'Адрес': warehouse.address || '',
        'Широта': warehouse.position_lat,
        'Долгота': warehouse.position_lon,
        'Контакты': formatContacts(warehouse.contacts),
        'Режим работы': formatWorkingHours(warehouse.working_mode),
        'Предоплата': warehouse.prepayment ? 'Да' : 'Нет',
        'Оплата картой': warehouse.card_payment ? 'Да' : 'Нет',
        'Оплата наличными': warehouse.cash_payment ? 'Да' : 'Нет',
        'Доставка': warehouse.transfer_delivery ? 'Да' : 'Нет',
        'Самовывоз': warehouse.pickup ? 'Да' : 'Нет',
    }));
};

// Функция экспорта в Excel
export const exportToExcel = (data, filename) => {
    const exportData = prepareDataForExport(data);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Настройка ширины столбцов
    const colWidths = [
        { wch: 40 }, // GUID
        { wch: 30 }, // Название
        { wch: 40 }, // Адрес
        { wch: 10 }, // Широта
        { wch: 10 }, // Долгота
        { wch: 30 }, // Контакты
        { wch: 30 }, // Режим работы
        { wch: 12 }, // Предоплата
        { wch: 12 }, // Оплата картой
        { wch: 12 }, // Оплата наличными
        { wch: 12 }, // Доставка
        { wch: 12 }, // Самовывоз
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Склады');
    XLSX.writeFile(wb, `${filename}_${new Date().toLocaleDateString()}.xlsx`);
};

// Обработчики экспорта
export const handleExportAll = (data) => {
    exportToExcel(data, 'Все_склады');
};

export const handleExportFiltered = (data, name) => {
    exportToExcel(data, name);
};