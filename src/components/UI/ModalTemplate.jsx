import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import {useTheme} from "@mui/material";
import {tokens} from "../../theme";

const style = (bgColor, textColor) => {

    return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: bgColor,
        border: `1px solid ${bgColor}`,
        boxShadow: 24,
        color: textColor,
        borderRadius: 2,
    };
};

export default function BasicModal({title, open, handleClose, children}) {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // console.log('\n id', colors.primary[500]);
    // console.log('\n children', children);

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box
                sx={style(colors.grey[800], colors.grey[100])}
                className={`w-5/6 md:1/3 xl:w-1/2 text-[${colors.primary[200]}]`}
            >
                <Typography
                    id="modal-modal-title"
                    variant="h5"
                    component="h2"
                    sx={{
                        px: 3,
                    }}
                >
                    {title}
                </Typography>
                <Box
                    id="modal-modal-description"
                    sx={{
                        mt: 1,
                        // backgroundColor: '#f0f5ff',
                        p: 2,
                        borderRadius: 2,
                        // color: '#222',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Modal>
    );
}