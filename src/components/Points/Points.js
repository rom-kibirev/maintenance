import Page from "../UI/Theme/Page";
import { useState, useEffect } from "react";
import warehouses1C from "./warehouses.json";
import { Box, Button, TextField, CircularProgress, Alert } from "@mui/material";
import WarehouseIcon from '@mui/icons-material/Warehouse';
import StorefrontIcon from '@mui/icons-material/Storefront';
import useLocalStorage from "../UI/global/useLocalStorage";
import WarehousesTable from "./WarehousesTable";
import { fetchLocations } from "../../requests/api_v2";
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function Points({ token }) {
    const [methods, setMethods] = useLocalStorage('method_points', 'warehouses_1c');
    const [warehouses] = useState(warehouses1C || []);
    const [warehouses_checked, setWarehouses_checked] = useLocalStorage('warehouses_checked', []);
    
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [map, setMap] = useState(null);
    const [isYMapsLoaded, setIsYMapsLoaded] = useState(false);

    const methodsList = [
        {
            label: "Склады из 1С",
            type: "warehouses_1c",
            icon: <WarehouseIcon />,
        },
        {
            label: "Склады на сайте",
            type: "warehouses_site",
            icon: <StorefrontIcon />,
        }
    ];

    useEffect(() => {
        const getLocations = async () => {
            if (methods === 'warehouses_site') {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetchLocations(token);
                    if (response.success) {
                        setLocations(response.data.data);
                    } else {
                        setError(response.message);
                    }
                } catch (err) {
                    setError('Ошибка при загрузке данных о складах');
                }
                setLoading(false);
            }
        };

        getLocations();
    }, [token, methods]);

    useEffect(() => {
        if (methods === 'warehouses_site' && !window.ymaps) {
            console.log('Начинаем загрузку API Яндекс Карт');
            const script = document.createElement('script');
            script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
            script.async = true;
            
            script.onload = () => {
                console.log('Скрипт API загружен');
                window.ymaps.ready(() => {
                    console.log('API Яндекс Карт готов к использованию');
                    setIsYMapsLoaded(true);
                });
            };

            script.onerror = (error) => {
                console.error('Ошибка загрузки API:', error);
                setError('Ошибка загрузки API Яндекс Карт');
            };
            
            document.body.appendChild(script);
            console.log('Скрипт добавлен в DOM');

            return () => {
                document.body.removeChild(script);
                if (map) {
                    map.destroy();
                    setMap(null);
                }
                setIsYMapsLoaded(false);
            };
        }
    }, [methods]);

    useEffect(() => {
        if (isYMapsLoaded && methods === 'warehouses_site' && !map) {
            console.log('Начинаем инициализацию карты');
            try {
                const newMap = new window.ymaps.Map('map', {
                    center: [55.76, 37.64],
                    zoom: 10,
                    controls: ['zoomControl', 'fullscreenControl']
                });
                console.log('Карта создана успешно');
                setMap(newMap);
            } catch (err) {
                console.error('Ошибка при создании карты:', err);
                setError('Ошибка при инициализации карты: ' + err.message);
            }
        }
    }, [isYMapsLoaded, methods]);

    const filteredLocations = locations.filter(location => 
        location.ADDRESS.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.NAME.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
        console.log('Выбранный склад:', location);
        console.log('Режим работы:', location.WORKING_MODE);
        
        if (window.ymaps && map && location) {
            map.geoObjects.removeAll();
            addPlacemarkToMap(map, location);
            map.setCenter([location.POSITION_LAT, location.POSITION_LON], 15);
        }
    };

    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    const formatWorkingHours = (workingMode) => {
        let result = [];
        
        // Находим режимы работы для разных дней
        const mondayMode = workingMode.find(mode => mode.ID === 1);
        const saturdayMode = workingMode.find(mode => mode.ID === 6);
        const sundayMode = workingMode.find(mode => mode.ID === 7);

        // Если есть режим для понедельника, применяем его ко всем будним дням
        if (mondayMode) {
            result.push({
                days: 'Пн-Пт',
                hours: `${mondayMode.START.slice(0, -3)} - ${mondayMode.END.slice(0, -3)}`
            });
        }

        // Добавляем режим для субботы
        if (saturdayMode) {
            result.push({
                days: 'Сб',
                hours: saturdayMode.START && saturdayMode.END
                    ? `${saturdayMode.START.slice(0, -3)} - ${saturdayMode.END.slice(0, -3)}`
                    : 'Выходной'
            });
        }

        // Добавляем режим для воскресенья
        if (sundayMode) {
            result.push({
                days: 'Вс',
                hours: sundayMode.START && sundayMode.END
                    ? `${sundayMode.START.slice(0, -3)} - ${sundayMode.END.slice(0, -3)}`
                    : 'Выходной'
            });
        }

        return result;
    };

    const addPlacemarkToMap = (mapInstance, location) => {
        const workingHours = formatWorkingHours(location.WORKING_MODE);
        
        const placemark = new window.ymaps.Placemark(
            [location.POSITION_LAT, location.POSITION_LON],
            {
                balloonContentHeader: location.NAME,
                balloonContentBody: `
                    <div style="padding: 10px;">
                        <p><strong>Адрес:</strong> ${location.ADDRESS}</p>
                        <p><strong>Телефон:</strong> ${location.CONTACTS.find(c => c.TYPE === 'Phone')?.VALUE || 'Не указан'}</p>
                        <p><strong>Email:</strong> ${location.CONTACTS.find(c => c.TYPE === 'Email')?.VALUE || 'Не указан'}</p>
                        <p><strong>Режим работы:</strong></p>
                        ${workingHours.map(({days, hours}) => 
                            `<p>${days}: ${hours}</p>`
                        ).join('')}
                    </div>
                `
            },
            {
                preset: 'islands#redDotIcon'
            }
        );
        
        mapInstance.geoObjects.add(placemark);
        placemark.balloon.open();
    };

    return (
        <Page
            label="Работа с точками выдачи товаров"
            subtitle={methodsList?.find(m => m.type === methods)?.label}
        >
            <Box className="flex gap-2 p-3 border bg-zinc-900/50 border-amber-500/20 rounded">
                {methodsList.map((m, id) => (
                    <Button
                        key={id}
                        variant="contained"
                        color={methods === m.type ? "warning" : "primary"}
                        startIcon={m.icon}
                        onClick={() => {
                            setMethods(m.type);
                            setSearchQuery('');
                            setSelectedLocation(null);
                            if (map) {
                                map.geoObjects.removeAll();
                            }
                        }}
                    >
                        {m.label}
                    </Button>
                ))}
            </Box>

            {methods === "warehouses_1c" && warehouses?.length > 0 && (
                <Box className="mt-4">
                    <WarehousesTable
                        warehouses={warehouses}
                        warehouses_checked={warehouses_checked}
                        setWarehouses_checked={setWarehouses_checked}
                    />
                </Box>
            )}

            {methods === 'warehouses_site' && (
                <Box className="mt-4">
                    <Box className="flex gap-2 mb-4">
                        <TextField
                            label="Поиск по адресу"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Box>

                    {loading && <CircularProgress />}
                    {error && <Alert severity="error">{error}</Alert>}

                    <Box className="flex gap-4">
                        <Box className="w-[400px] border rounded p-4 max-h-[70vh] overflow-auto">
                            {filteredLocations.map((location) => (
                                <Box
                                    key={location.GUID}
                                    className={`p-3 mb-2 rounded cursor-pointer ${
                                        selectedLocation?.GUID === location.GUID 
                                        ? 'bg-amber-500/20' 
                                        : 'hover:bg-zinc-800'
                                    }`}
                                    onClick={() => handleLocationSelect(location)}
                                >
                                    <Box className="flex items-center gap-2">
                                        <LocationOnIcon />
                                        <Box className="w-full">
                                            <Box className="font-bold">{location.NAME}</Box>
                                            <Box className="text-sm">{location.ADDRESS}</Box>
                                            <Box className="text-sm text-gray-400">
                                                {location.CONTACTS.find(c => c.TYPE === 'Phone')?.VALUE}
                                            </Box>
                                            <Box className="text-sm mt-2 border-t border-gray-600 pt-2">
                                                <Box className="font-bold mb-1">Режим работы:</Box>
                                                {formatWorkingHours(location.WORKING_MODE).map(({days, hours}, index) => (
                                                    <Box key={index} className="flex justify-between text-xs">
                                                        <span>{days}</span>
                                                        <span>{hours}</span>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        <Box 
                            id="map" 
                            className="flex-1 border rounded relative bg-white" 
                            style={{ height: '70vh', minWidth: '500px' }}
                        >
                            {!map && methods === 'warehouses_site' && (
                                <Box className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                    <CircularProgress />
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            )}
        </Page>
    );
}