import React, {useEffect, useState} from "react";
import PrintCategories from "./PrintCategories";
import Header from "../UI/Theme/Header";
import {Alert, Box} from "@mui/material";
import * as XLSX from "xlsx";
import {fetchCategories, fetchUserData, patchCategories} from "../../requests/api_v2";

export const CategoriesTools = ({token}) => {

    const [categoriesData, setCategoriesData] = useState(null);
    const [answer, setAnswer] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {

        const getData = async () => {

            const categories = await fetchCategories(token, true);

            setCategoriesData(categories);

            const response = await fetchUserData(token);
            if (response.success) setCurrentUser(response.data);
        }

        getData();
    }, [token]);

    // console.log('\n CategoriesTools', {
    //     categoriesData,
    //     currentUser,
    // });

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
    const restoreXlsxHandler = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Преобразуем данные в JSON
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            const xlsCategories = jsonData.map(row => {
                // const name = `${row.NAME || ''} ${row.NAME_1 || ''} ${row.NAME_2 || ''} ${row.NAME_3 || ''} ${row.NAME_4 || ''}`.trim();
                return {
                    ID: row.ID,
                    IBLOCK_SECTION_ID: row.IBLOCK_SECTION_ID || "",
                    // XML_ID: row.XML_ID,
                    // XML_PARENT_ID: row.XML_PARENT_ID || "",
                    // NAME: name,
                    // ACTIVE: row.ACTIVE === 'Y',
                    // SORT: row.SORT || 500,
                    // IS_MODIFIED_ON_SITE: row.IS_MODIFIED_ON_SITE === 'Y'
                };
            });

            // Обновляем существующие данные по ID или добавляем новые
            setCategoriesData(prevData => {
                // Создаем копию существующих данных, чтобы обновить их
                const updatedData = prevData ? [...prevData] : [];

                xlsCategories.forEach(newItem => {
                    const existingIndex = updatedData.findIndex(item => item.ID === newItem.ID);

                    if (existingIndex !== -1) {
                        // Если ID найден, обновляем существующую запись
                        updatedData[existingIndex] = {
                            ...updatedData[existingIndex],
                            ...newItem, // Обновляем поля данными из нового элемента
                        };
                    } else {
                        // Если ID не найден, добавляем новую запись
                        updatedData.push(newItem);
                    }
                });

                return updatedData;
            });

            console.log('Обновленные данные:', categoriesData);
        };

        reader.readAsArrayBuffer(file);
    };

    const sendChangedCategoriesHandler = async () => {

        const response = await patchCategories(token, categoriesData);
        if (response?.success) {
            console.log('\n response', response.data);
            setAnswer({success: true, message: "Данные успешно обновлены" });
        }
    }

    return (
        <Box>
            <Header title="Управление категориями" subtitle={"Демонстрация категорий как на сайте"} />
            {answer && <Box>
                <Alert severity={answer.success ? "success" : "error"}>
                    {answer.success ? "Данные успешно обновлены" : answer.message}
                </Alert>
            </Box>}
            {categoriesData?.length > 0 &&
                <PrintCategories
                    data={categoriesData}
                    saveXlsxHandler={saveXlsxHandler}
                    uploadXlsxHandler={uploadXlsxHandler}
                    sendChangedCategoriesHandler={sendChangedCategoriesHandler}
                    restoreXlsxHandler={restoreXlsxHandler}
                    currentUser={currentUser}
                />
            }
        </Box>
    )
}