import Typography from "@mui/material/Typography";
import {Box, Button, CardMedia, Grid, Skeleton, useTheme} from "@mui/material";
import {routers} from "../../context";
import React from "react";
import {tokens} from "../../theme";
import {Link} from "react-router-dom";

export default function WelcomeUser() {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box >
            <Typography variant="h2" color={colors.second[500]}>
                Начало работы
            </Typography>
            <Grid
                container
                wrap="wrap"
                spacing={1}
            >
                {routers.map((item, index) => (
                    <Grid item key={index}>
                        <Button
                            variant="outlined"
                            component={Link}
                            to={item.to}
                            color="secondary"
                        >
                                <Box sx={{
                                    width:300,
                                    mx: 0.5,
                                    my: 5,
                                    textTransform: "none"
                                }} >
                                    {item ? (
                                        <React.Fragment>
                                            <CardMedia
                                                variant="rectangular"
                                                title={item.title}
                                                image={item.src}
                                                sx={{
                                                    width:"100%",
                                                    height:150,
                                                    borderRadius: 1,
                                                    marginBottom: 1,
                                                }}
                                            />
                                            <Box>
                                                <Typography gutterBottom variant="h3" color={colors.second[400]}>
                                                    {item.icon}
                                                    {item.title}
                                                </Typography>
                                                <Typography
                                                    variant="h5"
                                                    color={colors.primary[100]}
                                                    sx={{ whiteSpace: "break-spaces" }}
                                                >
                                                    {item.options}
                                                </Typography>
                                                <Typography variant="body2" color={colors.greenAccent[200]}>
                                                    {item.options}
                                                </Typography>
                                                <Typography variant="body2" color={colors.redAccent[200]}>
                                                    {item.trouble}
                                                </Typography>
                                            </Box>
                                        </React.Fragment>
                                    ) : (
                                        <Skeleton
                                            variant="rectangular"
                                            sx={{
                                                width:300,
                                                height:200,
                                                borderRadius: 1,
                                            }}
                                        />
                                    )}
                                </Box>
                        </Button>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}