import React, { useEffect } from 'react';
import { Paper, Box, FormControl, InputLabel, Select, MenuItem, TextField, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ANALYSIS_MODES, MATCHING_STATUSES, ONLY_SITE_STATUSES, ONLY_1C_STATUSES, darkThemeStyles } from '../constants/goodsAnalysisConstants';

// Получаем статусы для выбранного режима
const getStatusesForMode = (mode) => {
    switch (mode) {
        case ANALYSIS_MODES.MATCHING:
            return Object.values(MATCHING_STATUSES);
        case ANALYSIS_MODES.ONLY_SITE:
            return Object.values(ONLY_SITE_STATUSES);
        case ANALYSIS_MODES.ONLY_1C:
            return Object.values(ONLY_1C_STATUSES);
        default:
            return [];
    }
};

const FiltersPanel = ({
    selectedMode,
    selectedStatus,
    searchQuery,
    availableSubStatuses,
    onModeChange,
    onStatusChange,
    onSearchChange,
    onExportClick
}) => {
    // Эффект для отладки параметров компонента
    useEffect(() => {
        console.log('FiltersPanel updated:', { 
            selectedMode, 
            selectedStatus,
            availableSubStatuses,
            // Получаем статусы напрямую из констант для сравнения
            directStatuses: selectedMode ? getStatusesForMode(selectedMode) : []
        });
    }, [selectedMode, selectedStatus, availableSubStatuses]);

    // Получаем статусы напрямую из констант, если переданный массив пуст
    const statuses = (Array.isArray(availableSubStatuses) && availableSubStatuses.length > 0) 
        ? availableSubStatuses 
        : getStatusesForMode(selectedMode);

    return (
        <Paper className="p-4" sx={darkThemeStyles.paper}>
            <Box className="flex gap-4 items-center flex-wrap">
                <FormControl sx={{ minWidth: 220, ...darkThemeStyles.select }}>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Режим анализа</InputLabel>
                    <Select
                        value={selectedMode || ''}
                        onChange={(e) => onModeChange(e.target.value)}
                        label="Режим анализа"
                        sx={{ color: '#ffffff' }}
                    >
                        <MenuItem value="">Все товары</MenuItem>
                        {Object.entries(ANALYSIS_MODES).map(([key, label]) => (
                            <MenuItem key={key} value={key}>{label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {selectedMode && (
                    <FormControl sx={{ minWidth: 220, ...darkThemeStyles.select }}>
                        <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Статус</InputLabel>
                        <Select
                            value={selectedStatus || ''}
                            onChange={(e) => onStatusChange(e.target.value)}
                            label="Статус"
                            sx={{ color: '#ffffff' }}
                        >
                            <MenuItem value="">Все статусы</MenuItem>
                            {statuses.map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                <TextField
                    label="Поиск"
                    value={searchQuery}
                    onChange={onSearchChange}
                    size="small"
                    sx={{ minWidth: 220, ...darkThemeStyles.textField }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={onExportClick}
                    startIcon={<FileDownloadIcon />}
                    sx={{ 
                        minWidth: '220px',
                        height: '40px'
                    }}
                >
                    Экспорт в Excel
                </Button>
            </Box>
        </Paper>
    );
};

export default FiltersPanel; 