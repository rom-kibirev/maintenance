import CsvXlsxConverter from "./CsvXlsxConverter";
import {useEffect, useState} from "react";
import {GoodsData} from "../../data/imitated_api";
import {EditGoodsBitrix} from "./EditGoodsBitrix";

export const GoodsTools = () => {

    const [bitrixGoodsData, setBitrixGoodsData] = useState(null);

    useEffect(() => {

        const getBitrixData = async () => {

            try {

                const response = await GoodsData();

                // console.log('\n response', response);
                setBitrixGoodsData(response?.length ? response : null);
            }
            catch (e) {
                console.log('\n getBitrixData', e);
            }
        }

        getBitrixData();
    }, []);

    return (
        bitrixGoodsData?.length > 0 ?
            <EditGoodsBitrix data={bitrixGoodsData} /> :
            <CsvXlsxConverter />
    );
}