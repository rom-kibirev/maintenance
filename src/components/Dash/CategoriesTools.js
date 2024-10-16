import React, {useEffect, useState} from "react";
import PrintCategories from "./PrintCategories";
import Header from "../UI/Theme/Header";
import {Alert, Box} from "@mui/material";
import * as XLSX from "xlsx";
import {fetchCategoryData, sendCategories} from "../../requests/api_v2";

export const CategoriesTools = ({token}) => {

    const [categoriesData, setCategoriesData] = useState(null);
    const [answer, setAnswer] = useState(null);
    const [changedIdList, setChangedIdList] = useState([]);

    useEffect(() => {

        const getCategoriesData = async () => {

            // console.log('\n ', token);
            
            const updateCategories = await fetchCategoryData(token);
            if (updateCategories.success) {

                // const disable = [7810, 7811, 9133, 9134];

                const checkData = updateCategories.data
                    // .map(c => {
                    //
                    //     const ACTIVE = !disable.includes(c.ID);
                    //     const SORT = c.NAME.includes('Runtec') ? 100 : c.SORT;
                    //
                    //     return ({
                    //         ...c,
                    //         ACTIVE,
                    //         SORT
                    //     })
                    // })
                    .sort((a, b) => a.SORT - b.SORT)
                ;

                setCategoriesData(checkData);
                setAnswer(null);
            } else {
                setAnswer(updateCategories);
            }
        }

        getCategoriesData();
    }, [token]);
    // console.log('\n categoriesData', categoriesData);
    // if (categoriesData) console.log('\n categoriesData', categoriesData, categoriesData?.find(c => c.NAME === 'Runtec TEST 2'));

    const changeIdsList = (id) => {

        const updateChangedIdList = [...changedIdList, id];
        setChangedIdList(updateChangedIdList);
    }

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

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                console.log('JSON результат:', json);
                reBuildCategories(json);
            };
            reader.readAsArrayBuffer(file);
        }
    };
    const reBuildCategories = (data) => {
        
        const updateCategoriesData = categoriesData
            .map(c => {
            
            const inject = data.find(r=> {

                if (r.ID === c.ID) changeIdsList(c.ID);
                return (r.ID === c.ID);
            });

            if (inject?.NEW_NAME) {
                c.NAME = inject.NEW_NAME;
            }
            if (inject?.ACTIVE && inject?.ACTIVE !== "") {
                c.ACTIVE = inject.ACTIVE;
            }
            if (inject?.SORT && inject?.SORT !== "") {
                c.SORT = inject.SORT;
            }
            if (inject?.REMOVE_SECTION_ID === "Y") {
                c.IBLOCK_SECTION_ID = null;
            }
            if (inject?.ADD_SECTION_ID && inject?.ADD_SECTION_ID !== "") {
                c.IBLOCK_SECTION_ID = inject.ADD_SECTION_ID;
            }

            return c;
        })
            .sort((a, b) => a.SORT - b.SORT)
        ;
        console.log('\n updateCategoriesData', updateCategoriesData);
        setCategoriesData(updateCategoriesData);
    }

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

        const changedCategories = categoriesData.filter(c => changedIdList.includes(c.ID));

        const response = await sendCategories(token, changedCategories);
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
                />
            }
        </Box>
    )
}