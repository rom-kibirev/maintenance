import {localAPI} from "../data/rules";
import axios from "axios";

// Запрос получения категорий
// export const fetchCategories = async (token, includeSubcategories = false) => {
//     const response = await fetch(`${BASE_URL}/categories?subcategories=${includeSubcategories}`, {
//         method: "GET",
//         headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });
//     return response.json();
// };

// Запрос получения информации о пользователе
// export const fetchUserData = async (token) => {
//     const response = await fetch(`${BASE_URL}/user`, {
//         method: "GET",
//         headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });
//     return response.json();
// };

// Отправка измененных категорий
export const patchCategoriesLocal = async (token, items, type) => {

    const data = {
        token: `Bearer ${token}`,
        type,
        data: items
    };

    console.log('\n data', data);

    try {
        const response = await fetch(`${localAPI}/patch-tools.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Data sent successfully:', result);
        } else {
            console.error('Error sending data:', result);
        }
    } catch (error) {
        console.error('Request failed', error);
    }
};


export const getGoodsStatus = async (token) => {
    try {
        const response = await axios.get(`${localAPI}/goods/downloadGoods.php`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching status:', error);
    }
};

// async function checkDownloadStatus() {
//     try {
//         const response = await fetch('http://localhost:5001/goods/getDownloadStatus.php');
//         const data = await response.json();
//
//         // Логика обработки статуса
//         // if (data.status === 'in_progress') {
//         //     console.log(`Progress: Page ${data.current_page} of ${data.total_pages}`);
//         //     updateProgressUI(data.current_page, data.total_pages);
//         // } else if (data.status === 'completed') {
//         //     console.log('Download completed.');
//         //     updateProgressUI(data.total_pages, data.total_pages); // Полный прогресс
//         //     clearInterval(statusInterval); // Остановить опрос
//         // } else if (data.status === 'error') {
//         //     console.error('Error occurred during download.');
//         //     updateErrorUI('Error occurred. Please restart the process.');
//         // } else {
//         //     console.log('Download not started.');
//         //     updateProgressUI(0, 0); // Нулевой прогресс
//         // }
//     } catch (error) {
//         console.error('Error fetching status:', error);
//         // updateErrorUI('Unable to connect to server.');
//     }
// }

export const deleteFile = async (token) => {
    try {
        const response = await axios.get('/api/goods/status', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.data.success) {
            console.log('File deleted successfully');
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};
