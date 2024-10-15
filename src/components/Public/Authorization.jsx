import React, { useState } from "react";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {auth, fetchUserData} from "../../requests/api_v2";
import {groupTypes} from "../UI/global/templates";

const LoginPage = ({ setCookie }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        const response = await auth(username, password);
        if (!response.success) {
            throw new Error(`Ошибка авторизации: ${response.message}`);
        }
        else {

            const token = response.token;
            const getUserData = await fetchUserData(token);
            if (getUserData.success) {
                // console.log('\n ', getUserData?.data?.groups, groupTypes[getUserData?.data?.groups[0]]);
                const checkAccess = getUserData?.data?.groups?.filter(id => {

                    const readAccess = groupTypes[id];

                    return readAccess?.agreement_read;
                });

                // console.log('\n checkAccess', checkAccess);

                if (checkAccess?.length > 0) {
                    setCookie('token', token, {path: '/', sameSite: 'None', secure: true});

                    navigate("/");
                }
            }
        }
    };

    return (
        <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, margin: 'auto' }}>
            <Typography variant="h5" component="h1" align="center" gutterBottom>
                Авторизация
            </Typography>
            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Логин"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <TextField
                    label="Пароль"
                    variant="outlined"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <Typography color="error">{error}</Typography>}
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Войти
                </Button>
            </Box>
        </Paper>
    );
};

export default LoginPage;
