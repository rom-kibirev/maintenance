import { Box, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import {generateSortStatistics} from "../UI/global/sortTools";

export default function BrandStatistics({ goods }) {
    const [statistics, setStatistics] = useState([]);

    useEffect(() => {
        if (goods?.length) {
            const sortedStatistics = generateSortStatistics(goods);
            // console.log('\n sortedStatistics', sortedStatistics);
            setStatistics(sortedStatistics);
        }
    }, [goods]);

    return (
        <Box className="mb-3 flex flex-wrap flex-row gap-2">
            {statistics.map(({ brand, ranges }) => (
                <TextField
                    key={brand}
                    label={brand.toUpperCase()}
                    variant="outlined"
                    disabled
                    value={ranges.join(", ")}
                />
            ))}
        </Box>
    );
}
