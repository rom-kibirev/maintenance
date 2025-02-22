import React, { useMemo, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    Typography,
    Box,
    Button,
    ButtonGroup,
    Autocomplete,
    TextField, Snackbar, Alert,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactsIcon from '@mui/icons-material/Contacts';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorIcon from '@mui/icons-material/Error';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import {handleExportAll, handleExportFiltered} from "./WarehousesScripts";
// import StorageIcon from '@mui/icons-material/Storage';
// import {injectWarehouses} from "../../requests/api_v1";

const WarehousesTable = ({ warehouses, warehouses_checked, setWarehouses_checked }) => {
    const [activeFilter, setActiveFilter] = React.useState('withAddress');
    const [selectedCity, setSelectedCity] = useState(null);
    const [injectionStatus, setInjectionStatus] = useState({ loading: false, message: '', type: '' });

    // Извлечение городов из адресов
    const cities = useMemo(() => {
        const citySet = new Set();
        warehouses.forEach(warehouse => {
            if (warehouse.position_lat > 0 && warehouse.position_lon > 0) {
                const city = warehouse.address.split(',')[0].trim();
                citySet.add(city);
            }
        });
        return Array.from(citySet).sort();
    }, [warehouses]);

    // Группировка складов по правилам
    const groupedWarehouses = useMemo(() => {
        const hasValidLocation = (w) =>
            w.address &&
            w.position_lat !== 0 &&
            w.position_lon !== 0;

        const hasContacts = (w) =>
            w.contacts?.length > 0;

        const hasWorkingMode = (w) =>
            w.working_mode?.length > 0;

        return {
            withAddress: warehouses.filter(hasValidLocation),
            withAddressAndContacts: warehouses.filter(w =>
                hasValidLocation(w) && hasContacts(w)
            ),
            withAddressContactsAndSchedule: warehouses.filter(w =>
                hasValidLocation(w) && hasContacts(w) && hasWorkingMode(w)
            ),
            withoutAddress: warehouses.filter(w => !hasValidLocation(w))
        };
    }, [warehouses]);

    // Фильтры для групп
    const filters = [
        {
            id: 'withAddress',
            label: 'Склады с адресом',
            icon: <LocationOnIcon />,
            count: groupedWarehouses.withAddress.length
        },
        {
            id: 'withAddressAndContacts',
            label: 'Склады с адресом и контактами',
            icon: <ContactsIcon />,
            count: groupedWarehouses.withAddressAndContacts.length
        },
        {
            id: 'withAddressContactsAndSchedule',
            label: 'Склады с адресом, контактами и режимом работы',
            icon: <AccessTimeIcon />,
            count: groupedWarehouses.withAddressContactsAndSchedule.length
        },
        {
            id: 'withoutAddress',
            label: 'Склады без адреса',
            icon: <ErrorIcon />,
            count: groupedWarehouses.withoutAddress.length
        }
    ];

    // Фильтрация складов по городу
    const filteredByCity = useMemo(() => {
        if (!selectedCity) return groupedWarehouses[activeFilter];

        return groupedWarehouses[activeFilter].filter(warehouse =>
            warehouse.address && warehouse.address.startsWith(selectedCity)
        );
    }, [groupedWarehouses, activeFilter, selectedCity]);// Обработчик изменения чекбокса

    const handleCheckboxChange = (guid) => {
        setWarehouses_checked(prev => {
            if (prev.includes(guid)) {
                return prev.filter(id => id !== guid);
            }
            return [...prev, guid];
        });
    };
    // const handleInjection = () => {
    //     setInjectionStatus({ loading: true, message: 'Отправка данных...', type: 'info' });
    //
    //     injectWarehouses(warehouses)
    //         .then(result => {
    //             if (result.success) {
    //                 setInjectionStatus({
    //                     loading: false,
    //                     message: 'Данные успешно отправлены',
    //                     type: 'success'
    //                 });
    //             } else {
    //                 throw new Error(result.error);
    //             }
    //         })
    //         .catch(error => {
    //             setInjectionStatus({
    //                 loading: false,
    //                 message: `Ошибка: ${error.message}`,
    //                 type: 'error'
    //             });
    //         });
    // };

    // Обновленный return с добавлением селекта городов
    return (
        <Box>
            <Box className="flex flex-wrap gap-4 mb-4">
                <Box className="flex gap-2 flex-wrap">
                    {injectionStatus.message && (
                        <Snackbar
                            open={!!injectionStatus.message}
                            autoHideDuration={6000}
                            onClose={() => setInjectionStatus(prev => ({ ...prev, message: '' }))}
                        >
                            <Alert severity={injectionStatus.type}>
                                {injectionStatus.message}
                            </Alert>
                        </Snackbar>
                    )}
                    <Autocomplete
                        options={cities}
                        value={selectedCity}
                        onChange={(_, newValue) => setSelectedCity(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Фильтр по городу"
                                variant="outlined"
                                size="small"
                                color="warning"
                                sx={{width: 200}}
                            />
                        )}
                        size="small"
                    />
                    {filters.map((filter) => (
                        <Button
                            key={filter.id}
                            variant={activeFilter === filter.id ? "contained" : "outlined"}
                            color="warning"
                            startIcon={filter.icon}
                            onClick={() => setActiveFilter(filter.id)}
                            className="whitespace-nowrap"
                        >
                            {filter.label} ({filter.count})
                        </Button>
                    ))}
                    {/*<Button*/}
                    {/*    variant="outlined"*/}
                    {/*    startIcon={<StorageIcon />}*/}
                    {/*    color="error"*/}
                    {/*    onClick={handleInjection}*/}
                    {/*    disabled={injectionStatus.loading || !warehouses.length}*/}
                    {/*>*/}
                    {/*    {injectionStatus.loading ? "Отправка..." : `Инъекция (${warehouses.length})`}*/}
                    {/*</Button>*/}
                    <ButtonGroup variant="outlined" color="success">
                        <Button
                            startIcon={<FileDownloadIcon />}
                            onClick={() => handleExportAll(warehouses)}
                            disabled={!warehouses.length}
                        >
                            Все склады ({warehouses.length})
                        </Button>
                        <Button
                            startIcon={<FilterAltIcon />}
                            onClick={() => handleExportFiltered(filteredByCity, filters.find( f => f.id === activeFilter)?.label)}
                            disabled={!filteredByCity.length}
                        >
                            Из группы ({filteredByCity.length})
                        </Button>
                    </ButtonGroup>
                </Box>
            </Box>

            <TableContainer component={Paper} className="bg-zinc-900/30 border border-amber-500/20">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">Выбор</TableCell>
                            <TableCell>GUID</TableCell>
                            <TableCell>Название</TableCell>
                            <TableCell>Адрес</TableCell>
                            <TableCell align="center">ГЕО</TableCell>
                            <TableCell align="center">Контакты</TableCell>
                            <TableCell align="center">Режим работы</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredByCity.map((warehouse) => (
                            <TableRow key={warehouse.guid} className="hover:bg-zinc-900/50">
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={warehouses_checked.includes(warehouse.guid)}
                                        onChange={() => handleCheckboxChange(warehouse.guid)}
                                        color="warning"
                                    />
                                </TableCell>
                                <TableCell>{warehouse.guid}</TableCell>
                                <TableCell>{warehouse.name}</TableCell>
                                <TableCell>{warehouse.address || '—'}</TableCell>
                                <TableCell align="center">
                                    {(warehouse?.position_lat > 0 && warehouse?.position_lon > 0) ? '✓' : '—'}
                                </TableCell>
                                <TableCell align="center">
                                    {warehouse.contacts?.length > 0 ? '✓' : '—'}
                                </TableCell>
                                <TableCell align="center">
                                    {warehouse.working_mode?.length > 0 ? '✓' : '—'}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredByCity.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body2" className="py-4 text-gray-500">
                                        Нет данных для отображения
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default WarehousesTable;