import React, {useState, useEffect, useRef, useCallback} from "react";
import { Box } from "@mui/material";

export default function ImageCarousel({ pictures, altText, isFeed, link, autoplay, interval = 3000, shortMode, imgSize }) {
    const [imageIndex, setImageIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState(0);
    const autoPlayRef = useRef(null);

    // Handle previous image
    const handlePrevImage = () => {
        setImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : pictures.length - 1));
    };

    // Handle next image
    const handleNextImage = useCallback(() =>  {
        setImageIndex((prevIndex) => (prevIndex < pictures.length - 1 ? prevIndex + 1 : 0));
    }, [pictures.length]);

    // Handle swipe
    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
        stopAutoplay();
    };

    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        if (touchStartX - touchEndX > 50) {
            handleNextImage();
        } else if (touchEndX - touchStartX > 50) {
            handlePrevImage();
        }
        startAutoplay();
    };

    // Hover-based image switch
    const handleMouseMove = (e) => {
        stopAutoplay();
        if (pictures.length > 1) {
            const rect = e.currentTarget.getBoundingClientRect();
            const position = (e.clientX - rect.left) / rect.width;
            const newIndex = Math.floor(position * pictures.length);
            setImageIndex(Math.min(newIndex, pictures.length - 1));
        }
    };

    // Autoplay logic
    const startAutoplay = useCallback(() => {
        if (autoplay && pictures.length > 1) {
            autoPlayRef.current = setInterval(() => {
                handleNextImage();
            }, interval);
        }
    }, [handleNextImage, autoplay, interval, pictures.length]);

    const stopAutoplay = useCallback(() => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
        }
    }, []);

    useEffect(() => {
        startAutoplay();
        return () => stopAutoplay();
    }, [startAutoplay, stopAutoplay]);

    // Open image link on click
    const handleImageClick = () => {
        if (link) {
            window.open(link, "_blank");
        }
    };

    return (
        <Box
            className={`relative rounded-md overflow-hidden ${shortMode ? 'h-[70px] w-[70px]' : 'h-[250px] w-[250px]'}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseMove={handleMouseMove}
            onMouseLeave={startAutoplay} // Восстановление автопрокрутки при уходе мыши
            onClick={handleImageClick}
        >
            {/* Изображение */}
            <img
                src={`${!isFeed ? 'https://runtec-shop.ru/' : ""} ${pictures[imageIndex] || 'https://runtec-shop.ru/local/templates/runtec/components/bitrix/catalog.section/runtec_v1/images/no_photo.png'}`}
                alt={altText}
                className="absolute top-0 left-0 w-full h-full object-cover"
            />

            {/* Пагинация (точки под изображениями) */}
            {pictures.length > 1 && (
                <Box
                    className="flex flex-wrap justify-center absolute bottom-2 left-1/2 transform -translate-x-1/2"
                    style={{ gap: '4px', maxWidth: '90%', overflow: 'hidden' }}
                >
                    {pictures.map((_, index) => (
                        <div
                            key={index}
                            className={`w-3 h-0.5 ${index === imageIndex ? "bg-black/50 border-white/80" : "bg-black/20 border-gray-400/50"} border transition-all`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setImageIndex(index);
                                stopAutoplay(); // Остановка при клике
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
