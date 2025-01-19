import {IconButton} from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";

export const copyToClipboard = async (content) => {
    try {
        if (typeof content === 'string') {
            await navigator.clipboard.writeText(content);
            return true;
        }

        // Если передан HTML элемент, получаем его текстовое содержимое
        if (content instanceof Element) {
            const text = content.innerText || content.textContent;
            await navigator.clipboard.writeText(text);
            return true;
        }

        // Для других типов пробуем преобразовать в строку
        await navigator.clipboard.writeText(String(content));
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
};

export default function CopyButton ({str}) {

    return (
        <IconButton color="info" onClick={() => copyToClipboard(str)}>
            <FileCopyIcon/>
        </IconButton>
    );
}