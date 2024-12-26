import { Alert, Box, Button, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import BasicModal from "../UI/ModalTemplate";
import { patchCategories } from "../../requests/api_v2";
import FindCategories from "../UI/FindCategory";

export default function EditCategories({ data, chosenCategory, token }) {
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
        { label: "Родитель", key: "IBLOCK_SECTION_ID", edit: true, info: "parent" },
        { label: "GUID родителя", key: "XML_PARENT_ID", value: true },
        { label: "GUID", key: "XML_ID", value: true },
        { label: "Активность", key: "ACTIVE", switch: true },
        { label: "Картинка", key: "PREVIEW_PICTURE", img: true },
        { label: "Сортировка", key: "SORT", edit: true }
    ];

    const handleChange = (value, key) => {
        const patchData = async (updatedValue) => {
            const updatedSelected = { ...selected, [key]: updatedValue };
            setSelected(updatedSelected);
            const answerPatch = await patchCategories(token, [updatedSelected]);

            if (answerPatch.success) {
                setAnswer({
                    status: answerPatch.data.status,
                    severity: 'success',
                });
            } else {
                window.location.reload(); // Можно заменить на более "мягкий" способ обновления
            }

            setIsEdit(null);
        };

        if (key === "ACTIVE") {
            setIsEdit({
                title: "Подтвердите изменение активности",
                content: (
                    <Box>
                        <Alert severity="warning">
                            Вы собираетесь изменить статус активности. Подтвердите действие.
                        </Alert>
                        <Box display="flex" justifyContent="space-between" mt={2}>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => patchData(!value)}
                            >
                                Подтвердить
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => setIsEdit(null)}
                            >
                                Отменить
                            </Button>
                        </Box>
                    </Box>
                ),
            });
        }
        else if (key === "SORT") {
            setIsEdit({
                title: "Изменить сортировку",
                content: (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const updatedValue = e.target.elements[key].value;
                            patchData(updatedValue);
                        }}
                    >
                        <Alert severity="info">Текущая сортировка: {value}</Alert>
                        <TextField
                            label="Новое значение сортировки"
                            variant="outlined"
                            defaultValue={value || ""}
                            name={key}
                            fullWidth
                        />
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
        if (key === "IBLOCK_SECTION_ID") {


            const handleCategoryClick = (category) => {
                setIsEdit({
                    title: "Подтвердите действие",
                    content: (
                        <Box>
                            <Alert severity="warning">
                                Вы собираетесь изменить родительскую категорию на "{category.NAME}". Подтвердите действие.
                            </Alert>
                            <Box display="flex" justifyContent="space-between" mt={2}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => patchData(category.ID)}
                                >
                                    Подтвердить
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => setIsEdit(null)}
                                >
                                    Отменить
                                </Button>
                            </Box>
                        </Box>
                    ),
                });
            };

            setIsEdit({
                title: "Изменить родительскую категорию",
                content: (<FindCategories
                    data={data}
                    handleCategoryClick={handleCategoryClick}
                />),
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
            <Typography variant='h6'>Изменение категории</Typography>
            <Typography variant='h3'>{selected.NAME}</Typography>
            <Box className={`bg-black/10 flex flex-row flex-wrap gap-2 rounded`}>
                {names.map((name,index) => {

                    return (
                        <Box key={index} className={`border border-amber-500/10 p-2`}>
                            <Box className={`bg-black/20 px-2 text-center`}>{name.label}</Box>
                            {name.value && <Box>{selected[name.key]}</Box>}
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