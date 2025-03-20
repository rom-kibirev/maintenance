// import {Alert, Box, Button, TextField, Select, MenuItem} from "@mui/material";
// import React, {useState} from "react";
// import TaskAltIcon from '@mui/icons-material/TaskAlt';
//
// export default function FindCategories({data, handleCategoryClick}) {
//     const [searchTerm, setSearchTerm] = useState("");
//     const [filteredCategories, setFilteredCategories] = useState([]);
//
//     const handleSearch = (e) => {
//         const searchValue = e.target.value.toLowerCase();
//         setSearchTerm(searchValue);
//
//         const filtered = data
//             .filter(category => category.NAME.toLowerCase().includes(searchValue))
//             .slice(0, 10);
//
//         setFilteredCategories(filtered);
//     };
//
//     return (
//         <Box>
//             <Select
//                 value=""
//                 displayEmpty
//                 fullWidth
//                 renderValue={() => (
//                     <TextField
//                         label="Поиск категории"
//                         variant="standard"
//                         value={searchTerm}
//                         onChange={handleSearch}
//                         fullWidth
//                         sx={{ mt: -1 }}
//                     />
//                 )}
//             >
//                 {filteredCategories.map((category) => (
//                     <MenuItem
//                         key={category.ID}
//                         value={category.ID}
//                         onClick={() => handleCategoryClick(category)}
//                     >
//                         {category.NAME}
//                     </MenuItem>
//                 ))}
//                 {filteredCategories.length === 0 && searchTerm && (
//                     <MenuItem disabled>
//                         Категории не найдены
//                     </MenuItem>
//                 )}
//             </Select>
//         </Box>
//     );
// }