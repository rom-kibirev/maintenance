import React, {useEffect, useState} from "react";
import PrintCategories from "./PrintCategories";
import Header from "../UI/Theme/Header";
import {Alert, Box} from "@mui/material";
import * as XLSX from "xlsx";
import {fetchCategoryData, sendCategories} from "../../requests/api_v2";
import {oldCategories} from "../../data/checkCategories/cat";

export const CategoriesTools = ({token}) => {

    const [categoriesData, setCategoriesData] = useState(null);
    const [answer, setAnswer] = useState(null);
    // const [changedIdList, setChangedIdList] = useState([]);

    useEffect(() => {

        const getCategoriesData = async () => {

            // console.log('\n ', token);

            const updateCategories = await fetchCategoryData(token);
            if (updateCategories.success) {

                const checkData = updateCategories.data.sort((a, b) => a.SORT - b.SORT);

                // if (checkData?.length > 0) {
                //
                //     const missed = [
                //         9279,
                //         9290,
                //         9291,
                //         9350,
                //         9351,
                //         9352,
                //         9353,
                //         9354,
                //         9355,
                //         9356,
                //         9357,
                //         9358,
                //         9359,
                //         9360,
                //         9361,
                //         9370,
                //         9375,
                //         9377,
                //         9451,
                //         9615,
                //         9620
                //     ];
                //
                //     const withParent = checkData?.map(c => {
                //
                //         if (c.ID === 9480) c.IBLOCK_SECTION_ID = 7893;
                //         if (c.ID === 8310) c.IBLOCK_SECTION_ID = 8241;
                //         if (c.ID === 8311) c.IBLOCK_SECTION_ID = 8241;
                //         if (c.ID === 8312) c.IBLOCK_SECTION_ID = 8241;
                //         if (c.ID === 8313) c.IBLOCK_SECTION_ID = 8241;
                //         if (c.ID === 9111) c.IBLOCK_SECTION_ID = 9096;
                //
                //         if (missed.includes(c.ID)) c.ACTIVE = false;
                //
                //         if (c.IBLOCK_SECTION_ID === null) {
                //             const findOld = oldCategories.find(o => o.guid === c.XML_ID);
                //             if (findOld?.parent) {
                //
                //                 const findData = checkData?.find(d => d.XML_ID === findOld?.parent)
                //
                //                 if (findData?.ID) {
                //
                //                     c.IBLOCK_SECTION_ID = findData?.ID;
                //                 }
                //             }
                //         }
                //
                //         return (c);
                //     });
                //
                //     setCategoriesData(withParent);
                // }

                setCategoriesData(checkData);
                setAnswer(null);
            } else {
                setAnswer(updateCategories);
            }
        }

        getCategoriesData();
    }, [token]);

    // useEffect(() => {
    //     const importAllFiles = (requireContext) =>
    //         requireContext.keys().map(requireContext);
    //
    //     // Импортируем все файлы, начинающиеся на 23-03-
    //     const files = importAllFiles(require.context(
    //         '../../data/checkCategories', // Относительный путь
    //         false,
    //         /23-03-\d+\.json$/
    //     ));
    //
    //     const combinedCategories = files.flat().map(category => ({
    //         ID: category.guid,
    //         IBLOCK_SECTION_ID: category.parent,
    //         NAME: category.name,
    //         ACTIVE: true
    //     }));
    //
    //     console.log('\n combinedCategories', combinedCategories);
    //     setCategoriesData(combinedCategories);
    //
    //     // setCategories(combinedCategories); // Обновляем состояние с преобразованными данными
    // }, []);
    
    // console.log('\n categoriesData', categoriesData);
    // if (categoriesData) console.log('\n categoriesData', categoriesData, categoriesData?.find(c => c.NAME === 'Runtec TEST 2'));

    // const changeIdsList = (id) => {
    //
    //     const updateChangedIdList = [...changedIdList, id];
    //     setChangedIdList(updateChangedIdList);
    // }

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

    // const reBuildCategories = (data) => {
    //     let updatedIds = [];
    //
    //     const updateCategoriesData = categoriesData
    //         .map(c => {
    //             const inject = data.find(r => r.ID === c.ID); // Находим соответствие по ID в XLS
    //
    //             // Если соответствие не найдено, возвращаем категорию как есть
    //             if (!inject) return c;
    //
    //             let hasChanged = false; // Флаг для отслеживания изменений
    //
    //             // 1. ACTIVE (xls: Y/N -> json: true/false)
    //             const newActive = inject.ACTIVE === 'Y' ? true : false;
    //             if (newActive !== c.ACTIVE) {
    //                 c.ACTIVE = newActive;
    //                 hasChanged = true;
    //             }
    //
    //             // 2. SORT (проверяем сортировку)
    //             if (inject.SORT && inject.SORT !== c.SORT) {
    //                 c.SORT = inject.SORT;
    //                 hasChanged = true;
    //             }
    //
    //             // 3. IS_MODIFIED_ON_SITE (устанавливаем true, если изменены NEW_NAME, REMOVE_SECTION_ID, ADD_SECTION_ID)
    //             let isModifiedOnSite = c.IS_MODIFIED_ON_SITE;
    //             if (inject.NEW_NAME !== c.NAME || inject.REMOVE_SECTION_ID === 'Y' || (inject.ADD_SECTION_ID && inject.ADD_SECTION_ID !== c.IBLOCK_SECTION_ID)) {
    //                 isModifiedOnSite = true;
    //             }
    //
    //             if (isModifiedOnSite !== c.IS_MODIFIED_ON_SITE) {
    //                 c.IS_MODIFIED_ON_SITE = isModifiedOnSite;
    //                 hasChanged = true;
    //             }
    //
    //             // 4. NEW_NAME (изменение имени)
    //             if (inject.NEW_NAME && inject.NEW_NAME !== c.NAME) {
    //                 c.NAME = inject.NEW_NAME;
    //                 hasChanged = true;
    //             }
    //
    //             // 5. REMOVE_SECTION_ID (если Y, то делаем IBLOCK_SECTION_ID равным null)
    //             if (inject.REMOVE_SECTION_ID === 'Y' && c.IBLOCK_SECTION_ID !== null) {
    //                 c.IBLOCK_SECTION_ID = null;
    //                 hasChanged = true;
    //             }
    //
    //             // 6. ADD_SECTION_ID (если ADD_SECTION_ID присутствует, обновляем)
    //             if (inject.ADD_SECTION_ID && inject.ADD_SECTION_ID !== c.IBLOCK_SECTION_ID) {
    //                 c.IBLOCK_SECTION_ID = inject.ADD_SECTION_ID;
    //                 hasChanged = true;
    //             }
    //
    //             // Если категория изменилась, добавляем её ID в список изменённых
    //             if (hasChanged) {
    //                 updatedIds.push(c.ID);
    //             }
    //
    //             return c; // Возвращаем обновлённую категорию
    //         })
    //         .sort((a, b) => a.SORT - b.SORT); // Сортируем по полю SORT
    //
    //     console.log('\n updateCategoriesData', updateCategoriesData);
    //
    //     // Обновляем данные категорий
    //     setCategoriesData(updateCategoriesData);
    //
    //     // Обновляем список изменённых ID, добавляем только уникальные значения
    //     setChangedIdList(prev => [...new Set([...prev, ...updatedIds])]);
    // };
    // Обработчик загрузки и восстановления данных из XLSX
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

    // console.log('\n changedIdList', changedIdList);
    // if (categoriesData) console.log('\n ', categoriesData); // ?.find(c => c.ID === 7809)
    // const setRuntecFirst = () => {
    //
    //     const updateCategoriesData = [...categoriesData].map(g => {
    //
    //         if (g.ID === 8782) {
    //             g.SORT = 1;
    //             changeIdsList(8782);
    //         }
    //         return g;
    //     });
    //     setCategoriesData(updateCategoriesData)
    // }
    // const disableRuntecTest = () => {
    //
    //     const updateCategoriesData = [...categoriesData].map(g => {
    //
    //         if (g.ID === 7809) {
    //             g.ACTIVE = false;
    //
    //             changeIdsList(7809);
    //         }
    //         return g;
    //     });
    //     setCategoriesData(updateCategoriesData)
    // }
    // const renameRuntecTest = () => {
    //
    //     const updateCategoriesData = [...categoriesData].map(g => {
    //
    //         if (g.ID === 7810) {
    //             g.NAME = "Инструмент для металлообработки";
    //             changeIdsList(7810);
    //         }
    //         return g;
    //     });
    //     setCategoriesData(updateCategoriesData)
    // }

    const sendChangedCategoriesHandler = async () => {

        // const changedCategories = categoriesData.filter(c => changedIdList.includes(c.ID));

        const response = await sendCategories(token, categoriesData);
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
            {/*<Box className={`flex flex-wrap gap-2 items-center mb-6`}>*/}
            {/*    <Button variant="outlined" color="warning" onClick={setRuntecFirst}>Runtec sort 1</Button>*/}
            {/*    <Button variant="outlined" color="warning" onClick={disableRuntecTest}>Runtec TEST 1 disable</Button>*/}
            {/*    <Button variant="outlined" color="warning" onClick={renameRuntecTest}>Runtec TEST 2 rename</Button>*/}
            {/*</Box>*/}
            {categoriesData?.length > 0 &&
                <PrintCategories
                    data={categoriesData}
                    saveXlsxHandler={saveXlsxHandler}
                    uploadXlsxHandler={uploadXlsxHandler}
                    sendChangedCategoriesHandler={sendChangedCategoriesHandler}
                    restoreXlsxHandler={restoreXlsxHandler}
                />
            }
        </Box>
    )
}