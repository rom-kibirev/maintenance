import React, { useEffect, useState } from "react";
import {Routes, Route, useNavigate} from "react-router-dom";
import { useCookies } from "react-cookie";
import {CssBaseline, Box, ThemeProvider} from "@mui/material";
import WelcomeUser from "./components/Dash/WelcomeUser";
import Authorization from "./components/Public/Authorization";
import * as PropTypes from "prop-types";
import Sidebar from "./scenes/global/Sidebar";
import { ColorModeContext, useMode } from "./theme";
import {CategoriesTools} from "./components/Dash/CategoriesTools";
import {GoodsTools} from "./components/Dash/GoodsTools";
import {FeedGoodsDiff} from "./components/Dash/FeedGoodsDiff";
import SearchGoods from "./components/Search/SearchGoods";

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

                                <Route path="/" element={<WelcomeUser />}/>
                                <Route path="/categories-tools" element={<CategoriesTools token={cookies.token} />}/>
                                <Route path="/goods-tools" element={<GoodsTools token={cookies.token} />}/>
                                <Route path="/feed-goods-diff" element={<FeedGoodsDiff token={cookies.token} />}/>
                                <Route path="/search" element={<SearchGoods token={cookies.token} />}/>
                            </Routes>
                        </Box>
                    </main>
                </div>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default App;
