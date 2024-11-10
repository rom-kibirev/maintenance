import React, { useState } from "react";
import { Box, IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function ImageCarousel({ pictures, altText, isFeed, link }) {
    const [imageIndex, setImageIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState(0); // Для отслеживания начального касания

    // Переключение на предыдущее изображение
    const handlePrevImage = (e) => {
        e.stopPropagation();
        setImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : pictures.length - 1));
    };

    // Переключение на следующее изображение
    const handleNextImage = (e) => {
        e.stopPropagation();
        setImageIndex((prevIndex) => (prevIndex < pictures.length - 1 ? prevIndex + 1 : 0));
    };

    // Обработчик для перелистывания свайпом влево и вправо
    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX); // Начало касания
    };

    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        if (touchStartX - touchEndX > 50) {
            handleNextImage(e); // Свайп влево
        } else if (touchEndX - touchStartX > 50) {
            handlePrevImage(e); // Свайп вправо
        }
    };

    // Переключение по наведению мыши
    const handleMouseMove = (e) => {
        if (pictures.length > 1) {
            const rect = e.currentTarget.getBoundingClientRect();
            const position = (e.clientX - rect.left) / rect.width;
            const newIndex = Math.floor(position * pictures.length);
            setImageIndex(Math.min(newIndex, pictures.length - 1));
        }
    };

    // Переход по ссылке при клике на изображение
    const handleImageClick = () => {
        if (link) {
            window.open(link, "_blank");
        }
    };

    return (
        <Box
            className="relative bg-white rounded-md overflow-hidden h-[200px]"
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseLeave={() => setImageIndex(0)}
            onClick={handleImageClick}
        >
            {/* Изображение */}
            <img
                src={`${!isFeed ? 'https://runtec-shop.ru/' : ""}${pictures[imageIndex] || 'local/templates/runtec/components/bitrix/catalog.section/runtec_v1/images/no_photo.png'}`}
                alt={altText}
                title={altText}
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            />

            {/* Кнопки для переключения изображений */}
            {pictures.length > 1 && (
                <>
                    <IconButton
                        className="absolute top-1/2 left-2 transform -translate-y-1/2"
                        onClick={handlePrevImage}
                    >
                        <ArrowBackIosIcon />
                    </IconButton>
                    <IconButton
                        className="absolute top-1/2 right-2 transform -translate-y-1/2"
                        onClick={handleNextImage}
                    >
                        <ArrowForwardIosIcon />
                    </IconButton>
                </>
            )}

            {/* Пагинация (точки под изображениями) */}
            {pictures.length > 1 && (
                <Box
                    className="flex flex-wrap justify-center absolute bottom-2 left-1/2 transform -translate-x-1/2"
                    style={{ gap: '4px', maxWidth: '90%', overflow: 'hidden' }}
                >
                    {pictures.map((_, index) => (
                        <div
                            key={index}
                            className={`w-4 h-1 ${index === imageIndex ? "bg-black/50 border-white/80" : "bg-black/20 border-gray-400/50"} border transition-all`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setImageIndex(index);
                            }}
                            style={{
                                minWidth: '12px',
                                borderRadius: '2px',
                            }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}