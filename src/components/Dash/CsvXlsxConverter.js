import React, { useState } from 'react';
import Papa from 'papaparse';
import { Box, Button, styled } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { saveAs } from 'file-saver';
import Header from "../UI/Theme/Header";

const CsvXlsxConverter = () => {
    const [jsonData, setJsonData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Обработка загрузки файла CSV
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

    // Функция для разделения данных на чанки
    const chunkArray = (array, chunkSize) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    };

    // Выгрузка JSON по частям
    const handleJsonExport = () => {
        if (jsonData.length > 0) {
            const chunkSize = 10000; // Размер чанка
            const chunks = chunkArray(jsonData, chunkSize);
            chunks.forEach((chunk, index) => {
                const jsonString = JSON.stringify(chunk, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                saveAs(blob, `data_part_${index + 1}.json`);
            });
        } else {
            console.log("No data to export");
        }
    };

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    if (jsonData?.length > 0) console.log('\n jsonData', jsonData);

    return (
        <Box>
            <Header title="Данные по товарам" subtitle="Загрузить из bitrix CSV файл" />
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
            {loading && <p>Загрузка...</p>}
            <Button
                variant="contained"
                onClick={handleJsonExport}
                disabled={jsonData.length === 0}
                style={{ marginTop: '20px' }}
            >
                Выгрузить JSON
            </Button>
        </Box>
    );
};

export default CsvXlsxConverter;
