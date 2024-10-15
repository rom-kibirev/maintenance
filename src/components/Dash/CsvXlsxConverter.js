import React, { useState } from 'react';
import Papa from 'papaparse';
import { Box, Button } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Header from "../UI/Theme/Header";
import * as XLSX from 'xlsx';
import VisuallyHiddenInput from "../UI/Buttons/Button";

const CsvXlsxConverter = () => {
    const [jsonData, setJsonData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleCsvUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setLoading(true);
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                step: (results) => {
                    const row = results.data;
                    const transformedRow = {};
                    for (const key in row) {
                        if (row[key]) transformedRow[key] = row[key];
                    }
                    setJsonData(prevData => [...prevData, transformedRow]);
                },
                complete: () => {
                    setLoading(false);
                    console.log("Finished parsing");
                },
                error: (error) => {
                    console.error("Error parsing:", error);
                    setLoading(false);
                },
            });
        }
    };

    const handleXlsxUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                const sheetName = workbook.SheetNames[0]; // Получаем имя первого листа
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                console.log('JSON результат:', json);
            };
            reader.readAsArrayBuffer(file);
        }
    };


    // Функция для разделения данных на чанки
    // const chunkArray = (array, chunkSize) => {
    //     const chunks = [];
    //     for (let i = 0; i < array.length; i += chunkSize) {
    //         chunks.push(array.slice(i, i + chunkSize));
    //     }
    //     return chunks;
    // };

    // Выгрузка JSON по частям
    // const handleJsonExport = () => {
    //     if (jsonData.length > 0) {
    //         const chunkSize = 10000; // Размер чанка
    //         const chunks = chunkArray(jsonData, chunkSize);
    //         chunks.forEach((chunk, index) => {
    //             const jsonString = JSON.stringify(chunk, null, 2);
    //             const blob = new Blob([jsonString], { type: 'application/json' });
    //             saveAs(blob, `data_part_${index + 1}.json`);
    //         });
    //     } else {
    //         console.log("No data to export");
    //     }
    // };

    if (jsonData?.length > 0) console.log('\n jsonData', jsonData);

    return (
        <Box>
            <Header title="Данные" subtitle="Загрузить из bitrix CSV файл" />
            <Box>
                {loading && <p>Загрузка...</p>}
                <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                >
                    Загрузить файл
                    <VisuallyHiddenInput type="file" onChange={handleCsvUpload} />
                </Button>
                <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                >
                    Загрузить файл XLS
                    <VisuallyHiddenInput type="file" onChange={handleXlsxUpload} />
                </Button>
                <Button
                    variant="contained"
                    disabled={jsonData.length === 0}
                >
                    Выгрузить JSON
                </Button>
            </Box>
        </Box>
    );
};

export default CsvXlsxConverter;
