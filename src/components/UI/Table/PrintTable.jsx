import {DataGrid, GridToolbar} from "@mui/x-data-grid";
import {Box, useTheme} from "@mui/material";
import {tokens} from "../../../theme";

export default function PrintTable ({rows,columns,tools, height, checkbox}) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    // console.log('\n PrintTable', {rows, columns});

    if (rows?.length && columns?.length) return (
        <Box
            m="40px 0 0 0"
            height={`${height || `75vh`}`}
            sx={{
                "& .MuiDataGrid-root": {
                    border: "none",
                },
                "& .MuiDataGrid-cell": {
                    borderBottom: "none",
                },
                "& .name-column--cell": {
                    color: colors.greenAccent[300],
                },
                "& .MuiDataGrid-toolbarContainer": {
                    backgroundColor: colors.yellowAccent[700],
                    borderBottom: "none",
                },
                "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: colors.grey[700],
                    color: colors.grey[100],
                    borderBottom: "none",
                },
                "& .MuiDataGrid-virtualScroller": {
                    backgroundColor: colors.grey[800],
                    color: colors.grey[100],
                },
                "& .MuiDataGrid-footerContainer": {
                    borderTop: "none",
                    color: colors.yellowAccent[700],
                },
                "& .MuiCheckbox-root": {
                    color: `${colors.yellowAccent[900]} !important`,
                },
            }}
        >
            <DataGrid
                checkboxSelection={checkbox}
                rows={rows}
                columns={columns}
                components={tools ? { Toolbar: GridToolbar }: {}}
            />
        </Box>
    );
}