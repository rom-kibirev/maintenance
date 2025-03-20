// Основные режимы анализа
export const ANALYSIS_MODES = {
    MATCHING: 'Совпадающие товары',
    ONLY_SITE: 'Только на сайте',
    ONLY_1C: 'Только в 1С'
};

// Статусы для режима совпадающих товаров
export const MATCHING_STATUSES = {
    CATEGORY_MISMATCH: 'Не совпадает категория',
    NAME_MISMATCH: 'Не совпадают наименования',
    NO_PROBLEMS: 'Перечисленных проблем не обнаружено'
};

// Статусы для товаров только на сайте
export const ONLY_SITE_STATUSES = {
    NAME_MATCH: 'Совпадают имена',
    NO_MATCHES: 'Нет совпадений',
    NO_ARTICLE: 'Нет артикула'
};

// Статусы для товаров только в 1С
export const ONLY_1C_STATUSES = {
    NAME_MATCH: 'Совпадают имена',
    NO_MATCHES: 'Нет совпадений',
    NO_ARTICLE: 'Нет артикула'
};

// Цвета для статусов
export const STATUS_COLORS = {
    // Статусы для совпадающих товаров
    [MATCHING_STATUSES.CATEGORY_MISMATCH]: '#ff9800',
    [MATCHING_STATUSES.NAME_MISMATCH]: '#ff9800',
    [MATCHING_STATUSES.NO_PROBLEMS]: '#ff9800',
    
    // Статусы для товаров только на сайте
    [ONLY_SITE_STATUSES.NAME_MATCH]: '#ff9800',
    [ONLY_SITE_STATUSES.NO_MATCHES]: '#ff9800',
    [ONLY_SITE_STATUSES.NO_ARTICLE]: '#ff9800',
    
    // Статусы для товаров только в 1С
    [ONLY_1C_STATUSES.NAME_MATCH]: '#ff9800',
    [ONLY_1C_STATUSES.NO_MATCHES]: '#ff9800',
    [ONLY_1C_STATUSES.NO_ARTICLE]: '#ff9800',
    
    // Строковые ключи для надежности
    'Не совпадает категория': '#ff9800',
    'Совпадают имена': '#ff9800',
    'Не совпадают наименования': '#ff9800',
    'Нет совпадений': '#ff9800',
    'Нет артикула': '#ff9800',
    'Перечисленных проблем не обнаружено': '#ff9800',
    
    // Режимы анализа
    'Совпадающие товары': '#ff9800',
    'Только на сайте': '#ff9800',
    'Только в 1С': '#ff9800'
};

// Темная тема для компонентов MUI
export const darkThemeStyles = {
    paper: {
        backgroundColor: '#1e1e1e',
        color: '#ffffff'
    },
    textField: {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#ff9800',
            },
        },
        '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
        },
        '& .MuiInputBase-input': {
            color: '#ffffff',
        }
    },
    select: {
        '& .MuiSelect-select': {
            color: '#ffffff',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.23)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.4)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ff9800',
        }
    },
    table: {
        '& .MuiTableCell-root': {
            color: '#ffffff',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
        '& .MuiTableHead-root .MuiTableCell-root': {
            backgroundColor: '#2e2e2e',
        }
    }
}; 