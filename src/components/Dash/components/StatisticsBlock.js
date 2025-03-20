import React, { useState, useCallback } from 'react';
import { 
    Grid, 
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Button,
    Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { darkThemeStyles } from '../constants/goodsAnalysisConstants';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const StatisticsBlock = ({ statistics, onFilterSelect, onExportClick }) => {
    const [expandedPanel, setExpandedPanel] = useState(null);

    const handleAccordionChange = useCallback((panel) => (_, isExpanded) => {
        const newPanel = isExpanded ? panel : null;
        setExpandedPanel(newPanel);
        
        // При открытии панели автоматически выбираем общий фильтр
        if (isExpanded) {
            switch (panel) {
                case 'matching':
                    onFilterSelect('MATCHING', 'total');
                    break;
                case 'onlySite':
                    onFilterSelect('ONLY_SITE', 'total');
                    break;
                case 'only1C':
                    onFilterSelect('ONLY_1C', 'total');
                    break;
                default:
                    break;
            }
        }
    }, [onFilterSelect]);

    // Общая статистика
    const GeneralStatistics = () => (
        <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                    Всего товаров на сайте: {statistics.totalSite || 0}
                </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                    Всего товаров в 1С: {statistics.total1C || 0}
                </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                    Неактивные товары: {statistics.inactive || 0}
                </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                    Активные товары: {(statistics.totalSite - statistics.inactive) || 0}
                </Typography>
            </Grid>
        </Grid>
    );

    const buttonSx = {
        color: '#fff',
        borderColor: 'rgba(255, 152, 0, 0.5)',
        '&:hover': {
            borderColor: '#ff9800',
            backgroundColor: 'rgba(255, 152, 0, 0.08)'
        },
        width: '100%',
        justifyContent: 'flex-start',
        textTransform: 'none'
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <GeneralStatistics />
                <Button
                    variant="outlined"
                    onClick={onExportClick}
                    startIcon={<FileDownloadIcon />}
                    sx={{
                        ...buttonSx,
                        width: 'auto',
                        minWidth: '200px',
                        ml: 2
                    }}
                >
                    Экспорт в Excel
                </Button>
            </Box>
            
            {/* Совпадающие товары */}
            <Accordion 
                expanded={expandedPanel === 'matching'} 
                onChange={handleAccordionChange('matching')}
                sx={{ 
                    ...darkThemeStyles.paper,
                    mt: 2,
                    '&.Mui-expanded': {
                        margin: '16px 0'
                    }
                }}
            >
                <AccordionSummary 
                    expandIcon={<ExpandMoreIcon sx={{ color: '#ff9800' }} />}
                    sx={{
                        '&.Mui-expanded': {
                            minHeight: 48,
                            margin: '12px 0'
                        }
                    }}
                >
                    <Typography sx={{ color: '#fff' }}>
                        Совпадающие товары ({statistics.matching?.total || 0})
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={() => onFilterSelect('MATCHING', 'total')}
                            sx={buttonSx}
                        >
                            Все ({statistics.matching?.total || 0})
                        </Button>
                        {statistics.matching?.categoryMismatch > 0 && (
                            <Button
                                variant="outlined"
                                onClick={() => onFilterSelect('MATCHING', 'categoryMismatch')}
                                sx={buttonSx}
                            >
                                Не совпадает категория ({statistics.matching.categoryMismatch})
                            </Button>
                        )}
                        {statistics.matching?.nameMismatch > 0 && (
                            <Button
                                variant="outlined"
                                onClick={() => onFilterSelect('MATCHING', 'nameMismatch')}
                                sx={buttonSx}
                            >
                                Не совпадают наименования ({statistics.matching.nameMismatch})
                            </Button>
                        )}
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {/* Только на сайте */}
            <Accordion 
                expanded={expandedPanel === 'onlySite'} 
                onChange={handleAccordionChange('onlySite')}
                sx={{ 
                    ...darkThemeStyles.paper,
                    mt: 1,
                    '&.Mui-expanded': {
                        margin: '16px 0'
                    }
                }}
            >
                <AccordionSummary 
                    expandIcon={<ExpandMoreIcon sx={{ color: '#ff9800' }} />}
                    sx={{
                        '&.Mui-expanded': {
                            minHeight: 48,
                            margin: '12px 0'
                        }
                    }}
                >
                    <Typography sx={{ color: '#fff' }}>
                        Только на сайте ({statistics.onlySite?.total || 0})
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={() => onFilterSelect('ONLY_SITE', 'total')}
                            sx={buttonSx}
                        >
                            Все ({statistics.onlySite?.total || 0})
                        </Button>
                        {statistics.onlySite?.noMatches > 0 && (
                            <Button
                                variant="outlined"
                                onClick={() => onFilterSelect('ONLY_SITE', 'noMatches')}
                                sx={buttonSx}
                            >
                                Нет совпадений ({statistics.onlySite.noMatches})
                            </Button>
                        )}
                        {statistics.onlySite?.nameMatch > 0 && (
                            <Button
                                variant="outlined"
                                onClick={() => onFilterSelect('ONLY_SITE', 'nameMatch')}
                                sx={buttonSx}
                            >
                                Совпадает наименование ({statistics.onlySite.nameMatch})
                            </Button>
                        )}
                        {statistics.onlySite?.noArticle > 0 && (
                            <Button
                                variant="outlined"
                                onClick={() => onFilterSelect('ONLY_SITE', 'noArticle')}
                                sx={buttonSx}
                            >
                                Нет артикула ({statistics.onlySite.noArticle})
                            </Button>
                        )}
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {/* Только в 1С */}
            <Accordion 
                expanded={expandedPanel === 'only1C'} 
                onChange={handleAccordionChange('only1C')}
                sx={{ 
                    ...darkThemeStyles.paper,
                    mt: 1,
                    '&.Mui-expanded': {
                        margin: '16px 0'
                    }
                }}
            >
                <AccordionSummary 
                    expandIcon={<ExpandMoreIcon sx={{ color: '#ff9800' }} />}
                    sx={{
                        '&.Mui-expanded': {
                            minHeight: 48,
                            margin: '12px 0'
                        }
                    }}
                >
                    <Typography sx={{ color: '#fff' }}>
                        Только в 1С ({statistics.only1C?.total || 0})
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={() => onFilterSelect('ONLY_1C', 'total')}
                            sx={buttonSx}
                        >
                            Все ({statistics.only1C?.total || 0})
                        </Button>
                        {statistics.only1C?.noMatches > 0 && (
                            <Button
                                variant="outlined"
                                onClick={() => onFilterSelect('ONLY_1C', 'noMatches')}
                                sx={buttonSx}
                            >
                                Нет совпадений ({statistics.only1C.noMatches})
                            </Button>
                        )}
                        {statistics.only1C?.nameMatch > 0 && (
                            <Button
                                variant="outlined"
                                onClick={() => onFilterSelect('ONLY_1C', 'nameMatch')}
                                sx={buttonSx}
                            >
                                Совпадает наименование ({statistics.only1C.nameMatch})
                            </Button>
                        )}
                        {statistics.only1C?.noArticle > 0 && (
                            <Button
                                variant="outlined"
                                onClick={() => onFilterSelect('ONLY_1C', 'noArticle')}
                                sx={buttonSx}
                            >
                                Нет артикула ({statistics.only1C.noArticle})
                            </Button>
                        )}
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default StatisticsBlock; 