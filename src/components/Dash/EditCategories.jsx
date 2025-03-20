import {Alert, Box, Button, FormControlLabel, Switch, TextField} from "@mui/material";
import React, { useEffect, useState } from "react";
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import BasicModal from "../UI/ModalTemplate";
import { patchCategories } from "../../requests/api_v2";
import UnpublishedRoundedIcon from '@mui/icons-material/UnpublishedRounded';
import CategorySearch from "./CategorySearch";

const transliterate = (text) => {
    const mapping = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo", "ж": "zh",
        "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o",
        "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "kh", "ц": "ts",
        "ч": "ch", "ш": "sh", "щ": "shch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya"
    };
    return text.toLowerCase().split('').map(char => mapping[char] || char).join('')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-');
};


export default function EditCategories({ data, chosenCategory, token, unselectCategory }) {
    const [selected, setSelected] = useState(null);
    const [isEdit, setIsEdit] = useState(null);
    const [answer, setAnswer] = useState(null);

    useEffect(() => {
        if (data?.length && chosenCategory !== null && chosenCategory !== undefined) {
            const selectedCategory = data.find(category => category.ID === chosenCategory);
            setSelected(selectedCategory || null);
        }
    }, [data, chosenCategory]);

    const names = [
        { label: "ID", key: "ID", value: true },
        { label: "CODE", key: "CODE", value: true },
        { label: "Родитель", key: "IBLOCK_SECTION_ID", edit: true, info: "parent" },
        { label: "GUID родителя", key: "XML_PARENT_ID", value: true },
        { label: "GUID", key: "XML_ID", value: true },
        { label: "Активность", key: "ACTIVE", switch: true },
        { label: "Картинка", key: "PREVIEW_PICTURE", img: true },
        { label: "Сортировка", key: "SORT", edit: true }
    ];

    const generateUniqueCode = (baseCode) => {
        let code = `${baseCode}`;
        let counter = 1;
        while (data.some(category => category.CODE === baseCode)) {
            code = `${baseCode}-${counter}`;
            counter++;
        }
        return code;
    };

    const handleChange = (value, key) => {
        const patchData = async (updatedValue) => {
            let updatedCategory = { ...selected, [key]: updatedValue };

            if (key === "NAME") {
                const newCode = generateUniqueCode(transliterate(updatedValue));
                updatedCategory = { ...updatedCategory, CODE: newCode };
            }

            setSelected(updatedCategory);
            const answerPatch = await patchCategories(token, [updatedCategory]);

            if (answerPatch.success) {
                setAnswer({
                    status: answerPatch.data.status,
                    severity: 'success',
                });
            } else {
                window.location.reload();
            }

            setIsEdit(null);
        };

        if (key === "ACTIVE") {
            patchData(!value);
        } else if (key === "NAME" || key === "SORT" || key === "IBLOCK_SECTION_ID") {
            const getTitle = () => {
                if (key === "NAME") return "название";
                if (key === "SORT") return "сортировку";
                if (key === "IBLOCK_SECTION_ID") return "родителя";
                return key;
            };

            setIsEdit({
                title: `Изменить ${getTitle()}`,
                content: (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (key === "IBLOCK_SECTION_ID") {
                                const formData = new FormData(e.target);
                                const parentId = formData.get(key);
                                patchData(parentId ? parseInt(parentId, 10) : null);
                            } else {
                                const updatedValue = e.target.elements[key].value;
                                if (key === "SORT") {
                                    patchData(updatedValue ? parseInt(updatedValue, 10) : null);
                                } else {
                                    patchData(updatedValue);
                                }
                            }
                        }}
                    >
                        <Alert severity="info">Текущее значение: {value}</Alert>
                        {key === "IBLOCK_SECTION_ID" ? (
                            <Box>
                                <input type="hidden" name={key} value="" id="parent-category-input" />
                                <CategorySearch
                                    categories={data.filter(cat => cat.ID !== selected.ID)}
                                    setSelectedCategory={(category) => {
                                        document.getElementById('parent-category-input').value = category.ID;
                                    }}
                                />
                            </Box>
                        ) : (
                            <TextField
                                label={key === "NAME" ? "Новое название" : "Новое значение сортировки"}
                                variant="outlined"
                                defaultValue={value || ""}
                                name={key}
                                type={key === "SORT" ? "number" : "text"}
                                fullWidth
                            />
                        )}
                        <Box display="flex" justifyContent="space-between" mt={2}>
                            <Button type="submit" variant="contained" color="secondary">
                                Сохранить
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => setIsEdit(null)}
                            >
                                Отменить
                            </Button>
                        </Box>
                    </form>
                ),
            });
        }
    };

    if (selected) return (
        <Box className={`mb-2 bg-amber-100/5 px-2 py-3 rounded-md`}>
            {answer && <Alert severity={answer.severity}>{answer.status}</Alert>}
            {isEdit && <BasicModal
                open={!!isEdit}
                handleClose={() => setIsEdit(null)}
                title={isEdit?.title}
            >
                {isEdit?.content}
            </BasicModal>}
            {/*<Typography variant='h3'>{selected.NAME}</Typography>*/}
            <Button
                variant="contained"
                color="warning"
                onClick={() => handleChange(selected.NAME, "NAME")}
                startIcon={<EditRoundedIcon />}
            >
                {selected.NAME}
            </Button>
            <Box className={`bg-black/10 flex flex-row flex-wrap gap-2 rounded`}>
                <Button
                    color="success"
                    variant="contained"
                    onClick={unselectCategory}
                    size="small"
                    sx={{height: "max-content", marginY: "auto"}}
                ><UnpublishedRoundedIcon /></Button>
                {names.map((name,index) => {

                    return (
                        <Box key={index} className={`border border-amber-500/10 p-2`}>
                            <Box className={`bg-black/20 px-2 text-center`}>{name.label}</Box>
                            {name.value && <Box className={`flex flex-col gap-2 items-center`}>
                                {selected[name.key]}
                            </Box>}
                            {name.switch && <FormControlLabel
                                control={
                                    <Switch
                                        checked={selected[name.key]}
                                        color="warning"
                                        onChange={() => handleChange(selected[name.key], name.key)}
                                    />
                                }
                                label={name.label}
                            />}
                            {name.edit && <Button
                                variant="contained"
                                color={selected[name.key] ? "warning" : "success"}
                                onClick={() => handleChange(selected[name.key], name.key)}
                                startIcon={<EditRoundedIcon />}
                            >
                                {selected[name.key] || "Назначить"}
                            </Button>}
                            {(name.img && selected[name.key]) && <img src={selected[name.key]} width={70} height={70} alt={name.label}/>}
                            {(name.info && selected[name.key]) && <Alert severity="info">{data?.find(c => c.ID === selected[name.key]).NAME}</Alert>}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}