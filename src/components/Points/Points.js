import Page from "../UI/Theme/Page";
import {useState} from "react";
import warehouses1C from "./data_1c.json";
import {Box, Button} from "@mui/material";
import WarehouseIcon from '@mui/icons-material/Warehouse';
import useLocalStorage from "../UI/global/useLocalStorage";
import WarehousesTable from "./WarehousesTable";

export default function Points() {
    const [methods, setMethods] = useLocalStorage('method_points', null);
    const [warehouses] = useState(warehouses1C || []); // setWarehouses
    const [warehouses_checked, setWarehouses_checked] = useLocalStorage('warehouses_checked', []);

    const methodsList = [
        {
            label: "Склады из 1С",
            type: "warehouses",
            icon: <WarehouseIcon />,
        }
    ];

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
                        color="warning"
                        disabled={methods === m.type}
                        startIcon={m.icon}
                        onClick={() => setMethods(m.type)}
                    >
                        {m.label}
                    </Button>
                ))}
            </Box>
            {(methods === "warehouses" && warehouses?.length) && (
                <Box className="mt-4">
                    <WarehousesTable
                        warehouses={warehouses}
                        warehouses_checked={warehouses_checked}
                        setWarehouses_checked={setWarehouses_checked}
                    />
                </Box>
            )}
        </Page>
    );
}