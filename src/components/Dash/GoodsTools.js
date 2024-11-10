import {useEffect} from "react";
import Page from "../UI/Theme/Page";
// import {fetchAllGoodsData} from "../../requests/api_v2";

export const GoodsTools = ({token}) => {

    // const [goods, setGoods] = useState(null);

    useEffect(() => {

        const getGoodsData = async () => {

            // const response = await fetchAllGoodsData(token);
            // console.log('\n ', response);
            // setGoods(response);

            // try {
            //     const response = await axios.get('/assets/data/bitrix_goods.json'); // путь относительно public
            //     console.log('\n Axios response:', JSON.parse(response.data));
            //     setGoods(response.data); // сохраняем данные в стейт
            // } catch (error) {
            //     console.error('Error fetching the JSON file with Axios:', error);
            // }
        }

        getGoodsData();
    }, [token]);

    // if (goods) console.log('\n goods', goods);

    return (
        <Page
            label="Управление товарами"
            subtitle=""
        >
        </Page>
    );
}