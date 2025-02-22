
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
            className={`h-full flex flex-col`}
        >
            <Header
                title={label}
                subtitle={subtitle}
            />
            <Box className={`grow overflow-y-auto p-5 flex flex-col`}>
                {children}
            </Box>
        </Box>
    );
}