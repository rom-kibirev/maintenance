import Page from "../UI/Theme/Page";
import React, { useEffect, useState } from "react";
import { fetchGoodsData } from "../UI/global/sortTools";
import { fetchUserData } from "../../requests/api_v2";
import { Alert, Box, CircularProgress, TextField, Button } from "@mui/material";
import * as XLSX from "xlsx";

export default function ResearchWantedGoods({ token }) {
    const [answer, setAnswer] = useState(null);
    const [inProgress, setInProgress] = useState(false);
    const [goods, setGoods] = useState([]);
    const [excelData, setExcelData] = useState(null);

    // Загрузка данных о товарах с сайта при монтировании компонента
    useEffect(() => {
        const getData = async () => {
            setInProgress(true);
            setAnswer(null);

            try {
                const [goodsData] = await Promise.all([
                    fetchGoodsData(token),
                    fetchUserData(token),
                ]);

                const { categories, goods } = goodsData;

                if (goods?.length) {
                    const validGoods = goods.filter(
                        (good) => good.CATEGORY_ID && good.CATEGORY_ID !== 0
                    );
                    const goodsWithCategory = validGoods.map((good) => {
                        const CATEGORY = categories?.find(
                            (category) => category.ID === good.CATEGORY_ID
                        );
                        return { ...good, CATEGORY };
                    });

                    setGoods(goodsWithCategory);
                }
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
                setAnswer({
                    severity: "error",
                    message: "Ошибка при загрузке данных с сайта",
                });
            } finally {
                setInProgress(false);
            }
        };

        getData();
    }, [token]);

    // Обработка загрузки Excel-файла
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setAnswer({ severity: "error", message: "Файл не выбран" });
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                setExcelData(jsonData);
                setAnswer({
                    severity: "success",
                    message: "Файл успешно загружен",
                });
            } catch (error) {
                console.error("Ошибка при чтении Excel файла:", error);
                setAnswer({
                    severity: "error",
                    message: "Ошибка при чтении Excel файла",
                });
            }
        };

        reader.readAsArrayBuffer(file);
    };

    // Обработка данных и создание нового Excel-файла
    const processExcelFile = () => {
        if (!excelData || excelData.length === 0) {
            setAnswer({
                severity: "error",
                message: "Загрузите Excel-файл перед обработкой",
            });
            return;
        }
        if (!goods.length) {
            setAnswer({
                severity: "error",
                message: "Данные о товарах с сайта не загружены",
            });
            return;
        }

        try {
            // Функция для нормализации строк
            const normalizeString = (str) => str?.toString().toLowerCase().trim() || "";

            // Создаем карту товаров с сайта по нормализованному NAME
            const goodsMapByName = new Map();
            goods.forEach((good) => {
                const nameKey = normalizeString(good.NAME);
                if (nameKey) {
                    goodsMapByName.set(nameKey, good);
                }
            });

            let foundCount = 0;

            // Обрабатываем строки из Excel
            const processedData = excelData.map((row) => {
                const nomenclature = normalizeString(row["Номенклатура"]);
                const foundGood = nomenclature ? goodsMapByName.get(nomenclature) : null;

                if (foundGood) {
                    foundCount++;
                }

                return {
                    "Артикул": row["Артикул"] || "",
                    "Артикул на сайте": foundGood?.VENDOR || "",
                    "Номенклатура": row["Номенклатура"] || "",
                    "Цена": row["Цена"] || "",
                    "Количество": row["Количество"] || "",
                    "Ед изм": row["Ед изм"] || "",
                    "Валюта": row["Валюта"] || "",
                    "Дата установки": row["Дата установки"] || "",
                    "Есть на сайте": nomenclature ? (foundGood ? "Да" : "Нет") : "",
                    "XML_ID": foundGood?.XML_ID || "",
                    "ID": foundGood?.ID || "",
                };
            });

            // Создаем новый Excel-файл
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([
                [
                    `Количество товаров в Excel: ${excelData.length}, найдено на сайте: ${foundCount}`,
                ],
            ]);
            XLSX.utils.sheet_add_json(ws, processedData, {
                origin: "A2",
                skipHeader: false,
            });
            XLSX.utils.book_append_sheet(wb, ws, "Обработанные данные");
            XLSX.writeFile(wb, "Обработанный_прайс-лист.xlsx");

            setAnswer({
                severity: "success",
                message: "Файл успешно обработан и сохранен",
            });
        } catch (error) {
            console.error("Ошибка при обработке Excel файла:", error);
            setAnswer({
                severity: "error",
                message: "Ошибка при обработке данных",
            });
        }
    };

    return (
        <Page label="Наши товары">
            <Box
                className={`flex flex-col gap-4 p-3 border bg-zinc-900/50 border-amber-500/20 rounded`}
            >
                <Box className="flex items-center gap-4">
                    {inProgress && (
                        <Box className="flex items-center gap-2">
                            <CircularProgress color="info" size={20} sx={{ marginY: "auto" }} />
                        </Box>
                    )}
                    {!!answer && (
                        <Alert severity={answer?.severity || "info"}>
                            {answer?.message || ""}
                        </Alert>
                    )}
                    <TextField
                        label="Количество товаров"
                        disabled
                        value={goods.length || 0}
                        size="small"
                        sx={{ width: 120 }}
                    />
                </Box>

                <Box className="flex gap-4">
                    <Button variant="contained" component="label" size="small">
                        Загрузить Excel файл
                        <input
                            type="file"
                            hidden
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                        />
                    </Button>
                    <Button
                        variant="contained"
                        onClick={processExcelFile}
                        size="small"
                        disabled={!excelData || inProgress}
                    >
                        Обработать файл
                    </Button>
                </Box>
            </Box>
        </Page>
    );
}