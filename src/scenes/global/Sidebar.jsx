import React, {useContext, useEffect, useState} from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import {Box, Button, IconButton, Typography, useTheme} from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import {ColorModeContext, tokens} from "../../theme";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import {routers} from "../../routers";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import {useCookies} from "react-cookie";
import {fetchUserData} from "../../requests/api_v2";
import {avatarGoogle} from "../../data/templates";

const Item = ({ title, to, icon, selected, setSelected }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <MenuItem
            active={selected === title}
            style={{
                color: colors.grey[100],
            }}
            onClick={() => setSelected(title)}
            icon={icon}
        >
            <Typography>{title}</Typography>
            <Link to={to} />
        </MenuItem>
    );
};

const Sidebar = ({handleLogout, token}) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const [cookies] = useCookies(['token']);

    const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem('collapsed') === "1");
    const [selected, setSelected] = useState("Dashboard");
    const [user, setUser] = useState(null);

    useEffect(() => {

        const getUserData = async () => {

            const updateUser = await fetchUserData(token);
            if (updateUser.success) {

                setUser(updateUser.data);
            } else handleLogout();
        }

        getUserData();
    },[token, handleLogout]);

    if (!cookies.token) return null;

    const collapsedHandler = (state) => {

        setIsCollapsed(state);

        state ? localStorage.setItem('collapsed', '1') : localStorage.setItem('collapsed', '');
    }

    // if (user) console.log('\n user', user);

    return (
        <Box
            sx={{
                "& .pro-sidebar-inner": {
                    background: `rgba(0,0,0,0.15) !important`,
                },
                "& .pro-icon-wrapper": {
                    backgroundColor: "transparent !important",
                },
                "& .pro-inner-item": {
                    padding: "5px 35px 5px 20px !important",
                },
                "& .pro-inner-item:hover": {
                    color: `${theme.palette.mode === "dark" ? colors.yellowAccent[700] : colors.yellowAccent[900]} !important`,
                },
                "& .pro-menu-item.active": {
                    color: `${theme.palette.mode === "dark" ? colors.yellowAccent[700] : colors.yellowAccent[900]} !important`,
                },
            }}
        >
            <ProSidebar collapsed={isCollapsed}>
                <Menu iconShape="square">
                    <Box className={`flex w-full`}>
                        {!isCollapsed && <Box className={`my-auto w-full ml-6`}>
                            <IconButton onClick={colorMode.toggleColorMode}>
                                {theme.palette.mode === "dark" ? (
                                    <DarkModeOutlinedIcon />
                                ) : (
                                    <LightModeOutlinedIcon />
                                )}
                            </IconButton>
                        </Box>}

                        <MenuItem
                            onClick={() => collapsedHandler(!isCollapsed)}
                            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
                            style={{color: colors.grey[100]}}
                        >
                            {!isCollapsed && (
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="end"
                                >
                                    <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                                        <MenuOutlinedIcon />
                                    </IconButton>
                                </Box>
                            )}
                        </MenuItem>
                    </Box>

                    {!isCollapsed && (
                        <Box mb="25px">
                            {user && <Box textAlign="center">
                                {avatarGoogle[user.email] && <Box display="flex" justifyContent="center" alignItems="center">
                                    <img
                                        alt="profile-user"
                                        width="80px"
                                        height="80px"
                                        src={avatarGoogle[user.email]}
                                        style={{ borderRadius: "50%", backgroundColor: "white", boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
                                    />
                                </Box>}
                                <Typography
                                    variant="h3"
                                    color={colors.primary[100]}
                                    sx={{m: "10px 0 0 0"}}
                                >
                                    {user.surname} {user.name}
                                </Typography>
                                <Typography variant="h5" color={colors.primary[300]}>
                                    {user.email}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="warning"
                                    onClick={handleLogout}
                                >
                                    Выйти
                                </Button>
                            </Box>}
                        </Box>
                    )}

                    <Box paddingLeft={isCollapsed ? undefined : "10%"}>
                        {routers(token).map((item, index) => {

                            return (
                                !item.falseSide && <Item
                                    key={index}
                                    title={item.title}
                                    to={item.to}
                                    icon={item.icon}
                                    selected={selected}
                                    setSelected={setSelected}
                                />
                            );
                        })}
                    </Box>
                </Menu>
            </ProSidebar>
        </Box>
    );
};

export default Sidebar;