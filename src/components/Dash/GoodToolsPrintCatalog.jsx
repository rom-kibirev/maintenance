import {Box} from "@mui/material";
import CategoriesTree from "./CategoriesTree";
import BrandStatistics from "./BrandStatistics";
import ProductsList from "./ProductsList";
import React from "react";

export default function GoodToolsPrintCatalog({categories, goods, currentMethod, selectedCategory, setSelectedCategory, feed}) {

    return (
        <Box className="grow flex flex-row gap-2 pt-3">
            {categories?.length > 0 && (<Box className="w-[400px] relative">
                <CategoriesTree
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    editShow
                />
            </Box>)}
            {(goods?.length) && <Box className="grow">
                {currentMethod === 0 && <BrandStatistics
                    goods={goods}
                />}
                <ProductsList
                    goods={goods}
                    feed={feed || []}
                />
            </Box>}
        </Box>
    )
}