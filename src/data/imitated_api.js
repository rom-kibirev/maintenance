export const user_data = {
    "id": 3,
    "type": "Администратор",
    "name": "Кибирев Роман",
    "email": "kibirev@gmail.com"
}

export const GoodsData = async () => {

    try {
        const files = [
            '/data/bitrix_29.07.24/data_part_1.json',
            '/data/bitrix_29.07.24/data_part_2.json',
            '/data/bitrix_29.07.24/data_part_3.json',
            '/data/bitrix_29.07.24/data_part_4.json',
            '/data/bitrix_29.07.24/data_part_5.json',
            '/data/bitrix_29.07.24/data_part_6.json'
        ];

        // Fetch all files
        const requests = files.map(file => fetch(file).then(response => response.json()));
        const responses = await Promise.all(requests);

        // Combine all arrays into one
        const combinedData = responses.flat();

        // console.log('\n combinedData', combinedData);

        return (combinedData?.length > 0 ? combinedData : null);
    }
    catch (error) {
        console.error('GoodsData:', error);
        return (`GoodsData:', ${String(error)}`);
    }
};