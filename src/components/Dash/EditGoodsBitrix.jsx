import {Box, Button, TextField, useTheme} from "@mui/material";
import React, { useEffect, useState } from "react";
import Header from "../UI/Theme/Header";
import {tokens} from "../../theme";
import {DataGrid, GridToolbar} from "@mui/x-data-grid";

export const EditGoodsBitrix = ({ data }) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    // console.log('\n colors', colors);

    const [keys, setKeys] = useState(null);
    const [groups, setGroups] = useState(null);
    const [brands, setBrands] = useState(null);
    // console.log('\n keys', keys);

    useEffect(() => {
        if (data?.length > 0) {
            const dataKeys = data.flatMap(good => Object.keys(good));
            const uniqueKeys = [...new Set(dataKeys)].sort();
            setKeys(uniqueKeys);

            const dataGroups = data.flatMap(good => {
                const groupsIds = Object.keys(good).filter(key =>
                    key.toLowerCase().includes('group')
                );
                const groups = groupsIds.flatMap(key => good[key]);
                return groups.length > 0 && groups;
            }).filter(g => g);
            const uniqueGroups = [...new Set(dataGroups)].sort();
            setGroups(uniqueGroups);

            const dataBrands = data.flatMap(good => good["IP_PROP45"]).filter(g => g);
            const uniqueBrands = [...new Set(dataBrands)].sort();
            setBrands(uniqueBrands);

            // console.log('\n data', data);

            const searchParam = "a:4:{i:0;a:3:{s:4:\"good\";s:33:\"Ударный гайковерт\";s:5:\"value\";s:0:\"\";s:8:\"quantity\";i:1;}i:1;a:3:{s:4:\"good\";s:30:\"Аккумулятор RT-LB24\";s:5:\"value\";s:0:\"\";s:8:\"quantity\";i:2;}i:2;a:3:{s:4:\"good\";s:37:\"Зарядное устройство\";s:5:\"value\";s:0:\"\";s:8:\"quantity\";i:1;}i:3;a:3:{s:4:\"good\";s:34:\"Сумка для хранения\";s:5:\"value\";s:0:\"\";s:8:\"quantity\";i:1;}}";
            const brand_ids = data
                .filter((d) => {

                    const fieldsValue = Object.values(d)
                        .some(v => String(v).toUpperCase() === String(searchParam).toUpperCase())
                    ;

                    // console.log('\n ', fieldsValue);

                    return fieldsValue;
                })
            ;
            console.log('\n brand_ids', brand_ids);
        }
    }, [data]);

    const [uniqueKeys, setUniqueKeys] = useState(null);
    const [isEditShowKeys, setIsEditShowKeys] = useState(false);

    useEffect(() => {

        if (keys?.length > 0) {
            const updateUniqueKeys = [...keys]
                .sort()
                .filter(key => !key.includes('PROP'))
            ;
            // console.log('\n updateUniqueKeys', updateUniqueKeys);
            setUniqueKeys(updateUniqueKeys);
        }

    }, [keys]);
    // if (uniqueKeys) console.log('\n uniqueKeys', uniqueKeys);
    const columns = uniqueKeys?.map(key => ({
        field: key,
        headerName: key,
    }));
    const guids = [];
    // const repeatedRows = [];
    const rows = data?.map((row, index) => {

            if (!guids.includes(row.IE_ID)) {

                guids.push(row.IE_ID);

                return ({
                    id: row.IE_ID || index,
                    ...row,
                });
            }
            else {

                // repeatedRows.push(row);

                return null;
            }
        }).filter(r => r);
    // console.log('\n guids', guids);
    // console.log('\n repeatedRows', repeatedRows);

    const editKeysHandler = (key, exist) => {

        // console.log('\n ', key, exist, uniqueKeys);

        if (exist) {
            const newKeys = uniqueKeys?.filter(k => k!== key);
            setUniqueKeys(newKeys);
        } else {
            const newKeys = [...uniqueKeys, key];
            setUniqueKeys(newKeys);
        }
    }

    return (
        <Box>
            <Header title="Управление товарами" subtitle="Данные из BitrixCMS" />
            <Box
                sx={{
                    '& .MuiTextField-root': { m: 1, width: 'auto' },
                }}
                noValidate
                autoComplete="off"
            >
                {rows?.length > 0 && <TextField
                    disabled
                    id="goods_count"
                    label="Количество товаров"
                    defaultValue={rows?.length}
                />}
                {keys?.length > 0 && <TextField
                    disabled
                    id="keys_count"
                    label="Количество параметров"
                    defaultValue={keys?.length}
                />}
                {groups?.length > 0 && <TextField
                    disabled
                    id="keys_count"
                    label="Количество групп"
                    defaultValue={groups?.length}
                />}
                {brands?.length > 0 && <TextField
                    disabled
                    id="keys_count"
                    label="Количество брендов"
                    defaultValue={brands?.length}
                />}
                <Button
                    variant="outlined"
                    color="secondary"
                    sx={{
                        marginTop: "7px",
                        width: 200,
                        whiteSpace: "pre-wrap"
                    }}
                    onClick={() => setIsEditShowKeys(!isEditShowKeys)}
                >
                    Редактировать отображение параметров
                </Button>
            </Box>
            <Box
                m="40px 0 0 0"
                height="65vh"
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
                    "& .MuiDataGrid-columnHeaders": {
                        borderBottom: "none",
                        backgroundColor: colors.primary[500],
                        color: colors.yellowAccent[900],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.primary[500],
                        color: colors.yellowAccent[900],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${colors.yellowAccent[900]} !important`,
                    },
                    "& .MuiToolbar-gutters": {
                        color: `${colors.yellowAccent[900]} !important`,
                    },
                }}
            >
                {isEditShowKeys ?
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            height: '60vh',
                            overflow: 'auto'
                        }}
                    >
                        {keys?.map(key => (
                            <Button
                                variant={uniqueKeys?.includes(key) ? "contained" : "outlined"}
                                key={key}
                                color={"secondary"}
                                onClick={() => editKeysHandler(key, uniqueKeys?.includes(key))}
                            >
                                {key}
                            </Button>
                        ))}
                    </Box> :
                    (rows?.length > 0 && columns?.length > 0) && <DataGrid
                        rows={rows}
                        columns={columns}
                        components={{ Toolbar: GridToolbar }}
                        pageSize={30}
                        rowsPerPageOptions={[30]}
                    />
                }
            </Box>
        </Box>
    );
}