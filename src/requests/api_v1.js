// File: api_v1.js
import axios from 'axios';

const login = "api";
const password = "c200ta4wqm5l4sHWVILzr995qRBMPMia";

// Функция для инъекции данных складов
export const injectWarehouses = async (warehouses) => {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://runtec-shop.ru/api/v1/Catalog:ImportStores',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${login}:${password}`)
            },
            data: warehouses
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Ошибка при инъекции данных:', error);
        return {
            success: false,
            error: error.response ? error.response.data : error.message
        };
    }
};