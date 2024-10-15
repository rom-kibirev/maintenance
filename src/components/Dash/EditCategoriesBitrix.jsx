import {Box, Button} from "@mui/material";
import React, {useEffect, useState} from "react";

export const EditCategoriesBitrix = ({ data }) => {

    const [keys, setKeys] = useState(null);
    useEffect(() => {

        setKeys(false);
    },[]);

    if (keys) console.log('\n keys', keys);

    return (

            <Box
                sx={{
                    '& .MuiTextField-root': { m: 1, width: 'auto' },
                }}
                noValidate
                autoComplete="off"
            >
                <Button
                    variant="outlined"
                    color="secondary"
                >
                    Редактировать отображение параметров
                </Button>
            </Box>


    );
}