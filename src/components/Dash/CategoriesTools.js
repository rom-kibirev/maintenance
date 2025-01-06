import React, {useEffect, useState} from "react";
import PrintCategories from "./PrintCategories";
import {Alert, Box, Button} from "@mui/material";
import * as XLSX from "xlsx";
import {fetchCategories, fetchUserData} from "../../requests/api_v2";
import EditCategories from "./EditCategories";
import Page from "../UI/Theme/Page";
import {getStatus, sendPy} from "../../requests/py";

export default function CategoriesTools ({ token }) {
    const [categoriesData, setCategoriesData] = useState(null); // Данные категорий
    const [answer, setAnswer] = useState(null); // Уведомления
    // const [progress, setProgress] = useState({ current: 0, total: 0 }); // Прогресс отправки
    // const [inProgress, setInProgress] = useState(false); // Статус процесса
    const [isAuth, setIsAuth] = useState(true); // Авторизация
    const [chosenCategory, setChosenCategory] = useState(null);

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const categories = await fetchCategories(token, true);
                setCategoriesData(categories);

                const userResponse = await fetchUserData(token);
                if (userResponse.success) {
                    setIsAuth(true);
                    if (userResponse.success) setCurrentUser(userResponse.data);
                } else {
                    setIsAuth(false);
                    setAnswer({ severity: "error", message: "Ошибка авторизации" });
                }
            } catch (error) {
                setAnswer({ severity: "error", message: "Ошибка загрузки данных" });
            }
        };

        getData();
    }, [token]);

    const saveXlsxHandler = () => {
        const parents = categoriesData.filter(c => !c.IBLOCK_SECTION_ID);

        const prepareCategories = [];
        const prepareMissedCategories = [];

        const buildChildren = (parentId, level) => {
            const children = categoriesData.filter(c => c.IBLOCK_SECTION_ID === parentId);
            if (children.length > 0) {
                children.forEach(child => {
                    prepareCategories.push({
                        ...child,
                        level: level
                    });
                    buildChildren(child.ID, level + 1);
                });
            }
        };

        parents.forEach(parent => {
            prepareCategories.push({ ...parent, level: 0 }); // Уровень 0 для корневых категорий
            buildChildren(parent.ID, 1);
        });

        const maxLevel = Math.max(...prepareCategories.map(c => c.level));

        const parentIds = prepareCategories.map(c => c.ID);
        prepareMissedCategories.push(...categoriesData.filter(mc => !parentIds.includes(mc.ID)));

        const allowedNames = [
            "ID", // id в системе
            "XML_ID", // id в 1С
            "IBLOCK_SECTION_ID", // id родителя в системе
            "XML_PARENT_ID", // id родителя в 1C
            "NAME", // Наименование
            "ACTIVE", // Вкл/Выкл
            "SORT", // Сортировка
            "IS_MODIFIED_ON_SITE", // свойство вкл/выкл обновления из 1С
            "NEW_NAME", // Переименование - поля системы обновления данных
            "REMOVE_SECTION_ID", // удаление родителя - поля системы обновления данных
            "ADD_SECTION_ID", // добавление родителя - поля системы обновления данных
            // "GOODS_PREVIEW", // id товара для превью
            // "FILTER_PROPS", // id свойств товара для работы фильтра
            // "PREVIEW_PICTURE", // Ссылка на превью изображения категотрии
        ];

        const exportCategories = prepareCategories.map(c =>
            allowedNames.flatMap(name => {
                if (name === "NAME") {
                    const nameCells = Array(maxLevel + 1).fill('');
                    nameCells[c.level] = c[name] || '';
                    return nameCells;
                }
                else if (name === "ACTIVE" || name === "IS_MODIFIED_ON_SITE") {
                    return c[name] ? "Y" : "N";
                }
                else if (name === "FILTER_PROPS") {
                    return c[name]?.join(",");
                }
                return c[name] || '';
            })
        );

        const exportMissedCategories = prepareMissedCategories.map(c =>
            allowedNames.flatMap(name => c[name] || '')
        );

        const headerRow = allowedNames.flatMap(name => {
            if (name === "NAME") {
                return [name, ...Array(maxLevel).fill('')];
            }
            return name;
        });

        exportCategories.unshift(headerRow);
        exportMissedCategories.unshift(headerRow);

        const wb = XLSX.utils.book_new();
        const wsCategories = XLSX.utils.aoa_to_sheet(exportCategories);
        XLSX.utils.book_append_sheet(wb, wsCategories, "Categories");
        const wsMissedCategories = XLSX.utils.aoa_to_sheet(exportMissedCategories);
        XLSX.utils.book_append_sheet(wb, wsMissedCategories, "MissedCategories");
        const date = new Date().toLocaleDateString();
        const fileName = `Категории_${date}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };
    const uploadXlsxHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const excelData = XLSX.utils.sheet_to_json(worksheet);

            const updatedCategories = categoriesData.map((category) => {
                const matchingRow = excelData.find(row => row.ID === category.ID);

                if (!matchingRow) return category; // если совпадений не найдено, возвращаем категорию без изменений

                // Копируем категорию для обновления
                const updatedCategory = { ...category };

                // Проверка и обновление значений
                if (matchingRow.ACTIVE) {
                    updatedCategory.ACTIVE = matchingRow.ACTIVE === 'Y';
                }

                if (matchingRow.IBLOCK_SECTION_ID !== undefined) {
                    updatedCategory.IBLOCK_SECTION_ID = matchingRow.IBLOCK_SECTION_ID;
                }

                if (matchingRow.SORT !== undefined) {
                    updatedCategory.SORT = matchingRow.SORT;
                }

                if (matchingRow.NEW_NAME) {
                    updatedCategory.NAME = matchingRow.NEW_NAME;
                    updatedCategory.IS_MODIFIED_ON_SITE = true;
                }

                if (matchingRow.REMOVE_SECTION_ID === 'Y') {
                    updatedCategory.IBLOCK_SECTION_ID = null;
                    updatedCategory.IS_MODIFIED_ON_SITE = true;
                } else if (Number.isInteger(matchingRow.ADD_SECTION_ID)) {
                    updatedCategory.IBLOCK_SECTION_ID = matchingRow.ADD_SECTION_ID;
                    updatedCategory.IS_MODIFIED_ON_SITE = true;
                }

                return updatedCategory;
            });

            setCategoriesData(updatedCategories);
        };

        reader.readAsArrayBuffer(file);
    };

    const sendChangedCategoriesHandler = async () => {
        if (!isAuth) {
            setAnswer({ severity: "error", message: "Пользователь не авторизован" });
            return;
        }

        try {

            const sendData = await sendPy(`Bearer ${token}`, categoriesData, 'category');

            console.log(`\n sendChangedCategoriesHandler`, sendData);
        } catch (error)  {
            setAnswer({ severity: "error", message: error.message });
        }
    };

    const getSendStatus = async () => {

        const status = await getStatus();
        console.log(`\n getSendStatus`, status);

        setAnswer({
            severity: "info",
            message: (<Box>Отправлено {status.sent * 30} из {status.total * 30}</Box>)
        });
    }

    return (
        <Page
            label="Управление категориями"
            subtitle={"Демонстрация категорий как на сайте"}
        >
            {answer && (<Alert severity={answer.severity || "info"}>{answer.message}</Alert>)}
            <Button
                variant="contained"
                color="success"
                onClick={getSendStatus}
            >
                Статус
            </Button>
            {categoriesData?.length > 0 &&
                <Box>
                    {chosenCategory && <EditCategories
                        token={token}
                        data={categoriesData}
                        chosenCategory={chosenCategory}
                    />}

                    <PrintCategories
                        data={categoriesData}
                        saveXlsxHandler={saveXlsxHandler}
                        uploadXlsxHandler={uploadXlsxHandler}
                        sendChangedCategoriesHandler={sendChangedCategoriesHandler}
                        currentUser={currentUser}
                        setChosenCategory={setChosenCategory}
                    />
                </Box>
            }
        </Page>
    )
}