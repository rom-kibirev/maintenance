import Typography from "@mui/material/Typography";
import {Avatar, Box, Card, CardContent, CardHeader, useTheme} from "@mui/material";
import {routers} from "../../routers";
import React from "react";
import {tokens} from "../../theme";
import {Link} from "react-router-dom";

export default function WelcomeUser({token}) {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box>
            <Typography variant="h2" color={colors.yellowAccent[500]}>
                Начало работы
            </Typography>
            <Box className={`flex flex-row flex-wrap gap-2`}>
                {routers(token).map((item, index) => {

                    return (
                        !item?.falsePrint && <Card
                            sx={{ width: 345 }}
                            key={index}
                            component={Link}
                            to={item.to}
                        >
                            <CardHeader
                                avatar={
                                    <Avatar sx={{ bgcolor: colors.yellowAccent[700] }} aria-label="recipe">{item.icon}</Avatar>
                                }
                                title={item.title}
                            />
                            <CardContent>
                                <Typography variant="body2" color={colors.greenAccent[500]}>{item.worked}</Typography>
                                <Typography variant="body2" color={colors.blueAccent[400]}>{item.options}</Typography>
                                <Typography variant="body2">{item.description}</Typography>
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>
        </Box>
    );
}