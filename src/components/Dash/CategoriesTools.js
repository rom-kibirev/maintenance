import React, {useEffect, useState} from "react";
import PrintCategories from "./PrintCategories";
import {Alert, Box, Button, CircularProgress, FormControlLabel, Switch, TextField} from "@mui/material";
import {fetchCategories, fetchUserData, uploadCategories_v2} from "../../requests/api_v2";
import EditCategories from "./EditCategories";
import Page from "../UI/Theme/Page";
import {editContentUsers} from "../UI/users";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import {checkAccess} from "../UI/global/userStatus";

export default function CategoriesTools ({ token }) {

    const [categories, setCategories] = useState(null);
    const [answer, setAnswer] = useState(null); // Уведомления
    // const [progress, setProgress] = useState({ current: 0, total: 0 }); // Прогресс отправки
    // const [inProgress, setInProgress] = useState(false); // Статус процесса
    const [isAuth, setIsAuth] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [inProgress, setInProgress] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [printCategories, setPrintCategories] = useState(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const categories = await fetchCategories(token, true);
                setCategories(categories);

                const updatePrintCategories = categories.filter(c => c.ACTIVE === isActive).sort((a, b) => a.SORT - b.SORT);
                setPrintCategories(updatePrintCategories);

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

        setInProgress(false);

        getData();
    }, [token, isActive]);

    const pathCategoriesApiV2 = async () => {
        if (!isAuth) {
            setAnswer({ severity: "error", message: "Пользователь не авторизован" });
            return;
        }

        setInProgress(true);

        try {

            const result = await uploadCategories_v2(token, categories);
            // const result = await sendPy(`Bearer ${token}`, categories, 'category');

            // console.log(`\n sendChangedCategoriesHandler`, result);
            if (result?.severity === "success") {
                setAnswer(result);
                setInProgress(false);
            }
        } catch (error)  {
            setAnswer({ severity: "error", message: error.message });
        }
    };



    return (
        <Page
            label="Управление категориями"
            subtitle={"Демонстрация категорий как на сайте"}
        >
            {checkAccess(currentUser) && <Box className={`flex flex-wrap gap-2 p-3 border bg-amber-500/5 border-amber-500/50 rounded mb-3`}>
                {inProgress && <CircularProgress color="info" size={20} sx={{marginY: "auto"}} />}
                {answer && (<Alert severity={answer.severity || "info"}>{answer.message}</Alert>)}
                <FormControlLabel
                    control={
                        <Switch
                            checked={isActive}
                            color="success"
                            onChange={() => setIsActive(!isActive)}
                        />
                    }
                    label={`${isActive ? "А" : "Не а"}ктивныее категории`}
                />
                <TextField
                    disabled
                    id="catcount"
                    label="Количество всех категорий"
                    value={categories.length || ''}
                />
                {editContentUsers.includes(currentUser?.user_id) && <Button
                    color="error"
                    variant="contained"
                    onClick={pathCategoriesApiV2}
                ><CloudUploadOutlinedIcon /></Button>}
            </Box>}
            {categories?.length > 0 &&
                <Box>
                    {selectedCategory && <EditCategories
                        token={token}
                        data={categories}
                        chosenCategory={selectedCategory}
                        unselectCategory={() => setSelectedCategory(null)}
                    />}

                    {printCategories?.length && <PrintCategories
                        data={printCategories}
                        setChosenCategory={setSelectedCategory}
                    />}
                </Box>
            }
        </Page>
    )
}