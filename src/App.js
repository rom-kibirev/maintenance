import React, { useEffect, useState } from "react";
import {Routes, Route, useNavigate} from "react-router-dom";
import { useCookies } from "react-cookie";
import {CssBaseline, Box, ThemeProvider} from "@mui/material";
import Authorization from "./components/Public/Authorization";
import * as PropTypes from "prop-types";
import { ColorModeContext, useMode } from "./theme";
import {routers} from "./routers";
import Sidebar from "./scenes/global/Sidebar";

ThemeProvider.propTypes = {children: PropTypes.node};

function App() {

    const [theme, colorMode] = useMode();
    const [cookies, setCookie, removeCookie] = useCookies(['token']);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (cookies.token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            navigate('/login');
        }
    }, [cookies.token, navigate]);

    // Функция выхода
    const handleLogout = () => {
        removeCookie('token', { path: '/', sameSite: 'None', secure: true });
        setIsAuthenticated(false);
    };

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div className="app">
                    {isAuthenticated && <Sidebar handleLogout={handleLogout} token={cookies.token}/>}
                    <main className="content">
                        <Box className={`h-screen relative p-5`}>
                            <Routes>
                                <Route path="/login" element={<Authorization setCookie={setCookie} />} />

                                {routers(cookies.token).map((route, index) => (
                                    <Route
                                        key={index}
                                        path={route.to}
                                        element={route.component}
                                    />
                                ))}
                            </Routes>
                        </Box>
                    </main>
                </div>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default App;
