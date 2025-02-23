import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CategoryInfo = ({ name, error }) => {
    if (error) {
        return <Alert severity="warning" className="mb-2">{error}</Alert>;
    }
    return <Chip label={`Категория: ${name}`} className="mb-2" />;
};

const Products1CList = ({ goods }) => {
    if (!goods?.length) {
        return (
            <Box className="p-4">
                <Typography>Товары не найдены</Typography>
            </Box>
        );
    }

    return (
        <Box className="p-4">
            <Grid container spacing={2}>
                {goods.map((good) => (
                    <Grid item xs={12} key={good.guid}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {good.name}
                                </Typography>

                                <CategoryInfo name={good.categoryName} error={good.categoryError} />

                                <Box className="flex flex-wrap gap-2 mb-2">
                                    <Chip
                                        label={`Артикул: ${good.vendor_code}`}
                                        size="small"
                                    />
                                    <Chip
                                        label={`Бренд: ${good.brand}`}
                                        size="small"
                                    />
                                    <Chip
                                        label={`Страна: ${good.country}`}
                                        size="small"
                                    />
                                </Box>

                                <Typography variant="body2" color="text.secondary" className="mb-2">
                                    {good.description}
                                </Typography>

                                <Box className="flex flex-col gap-2">
                                    {Boolean(good.parameters?.length) && (
                                        <Accordion>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                className="hover:bg-zinc-100/5"
                                            >
                                                <Typography>Основные параметры</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Grid container spacing={1}>
                                                    {good.parameters.map((param, index) => (
                                                        <Grid item xs={6} sm={4} md={3} key={index}>
                                                            <Typography variant="body2">
                                                                {param.name}: {param.value} {param.unit}
                                                            </Typography>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </AccordionDetails>
                                        </Accordion>
                                    )}

                                    {Boolean(good.additional_parameters?.length) && (
                                        <Accordion>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                className="hover:bg-zinc-100/5"
                                            >
                                                <Typography>Дополнительные параметры</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Grid container spacing={1}>
                                                    {good.additional_parameters.map((param, index) => (
                                                        <Grid item xs={6} sm={4} md={3} key={index}>
                                                            <Typography variant="body2">
                                                                {param.name}: {param.value} {param.unit}
                                                            </Typography>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </AccordionDetails>
                                        </Accordion>
                                    )}

                                    {Boolean(good.equipment?.length) && (
                                        <Accordion>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                className="hover:bg-zinc-100/5"
                                            >
                                                <Typography>Комплектация</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Grid container spacing={1}>
                                                    {good.equipment.map((item, index) => (
                                                        <Grid item xs={12} key={index}>
                                                            <Typography variant="body2">
                                                                {item.good} {item.quantity > 1 && `(${item.quantity} шт.)`}
                                                            </Typography>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </AccordionDetails>
                                        </Accordion>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Products1CList;