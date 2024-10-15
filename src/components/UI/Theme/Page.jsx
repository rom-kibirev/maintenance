
import React from "react";
import {Box} from "@mui/material";
import Header from "./Header";

export default function Page(
    {
        label,
        subtitle,
        children,
    }
) {

    return (
        <Box
            m="20px"
            display="flex"
            flexDirection="column"
        >
            <Header
                title={label}
                subtitle={subtitle}
            />
            {children}
        </Box>
    );
}