// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// слайдер................................................................................................................
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const VISIBLE_SLIDES = 7;
const CENTER_INDEX = Math.floor(VISIBLE_SLIDES / 2);
const SWIPE_THRESHOLD = 50;
const IS_TOUCH_DEVICE = 'ontouchstart' in window;

let slideWidth = 0;
let isAnimating = false;
let currentIndex = 0;
let slides = [];
let touchStartX = 0;
let touchEndX = 0;
let isDragging = false;
let dragStartX = 0;
let dragOffset = 0;
let allowInteraction = true;
let touchStartY = 0;
let isHorizontalSwipe = null;
let lastInputType = null;

const slider = document.querySelector('.slider');
const slideBlock = document.querySelector('.slider-block');
const arrowNext = document.querySelector('.arrow-next');
const arrowPrev = document.querySelector('.arrow-prev');

// --- Встановлення висот для активного слайду ---
const setHeights = (targetSlide = null) => {
    const target = targetSlide || document.querySelector('.slide:not(.inactive)');
    if (!target) return;

    const slideTop = target.querySelector('.slide__top');
    const slideBottom = target.querySelector('.slide__bottom');
    const slideHeight = target.querySelector('.img__height')?.offsetHeight || 0;

    document.documentElement.style.setProperty('--slide-height', `${slideHeight}px`);
    document.documentElement.style.setProperty('--slide-top-height', `${slideTop?.offsetHeight || 0}px`);
    document.documentElement.style.setProperty('--slide-bottom-height', `${slideBottom?.offsetHeight || 0}px`);
};

// --- Застосування ширини слайдів ---
const applySlideSizes = () => {
    slideWidth = slider.clientWidth;
    if (slideWidth <= 0) return;
    slides.forEach(slide => slide.style.width = `${slideWidth}px`);
};

const getIndex = (i, total) => (i + total) % total;

// --- Відмальовування видимих слайдів ---
const renderSlides = () => {
    slideBlock.innerHTML = '';
    const total = slides.length;

    for (let i = 0; i < VISIBLE_SLIDES; i++) {
        const index = getIndex(currentIndex + i - CENTER_INDEX, total);
        const clone = slides[index].cloneNode(true);

        clone.classList.add('slide');
        clone.style.width = `${slideWidth}px`;
        clone.style.transition = 'transform 0.6s ease, opacity 0.6s ease';

        if (i === CENTER_INDEX) {
            clone.classList.remove('inactive');
            clone.style.transform = 'scale(1)';
            clone.style.opacity = '1';
            clone.style.zIndex = '2';
        } else {
            clone.classList.add('inactive');
            clone.style.transform = 'scale(0.7)';
            clone.style.opacity = '0.6';
            clone.style.zIndex = '1';
        }
        slideBlock.appendChild(clone);
    }

    slideBlock.style.transition = 'none';
    slideBlock.style.transform = `translateX(-${CENTER_INDEX * slideWidth}px)`;
    setHeights(slideBlock.children[CENTER_INDEX]);
};

// --- Зміна слайда ---
const handleSlideChange = (direction) => {
    if (isAnimating || !allowInteraction) return;
    allowInteraction = false;
    isAnimating = true;

    const total = slides.length;
    const newIndex = direction === 'next'
        ? (currentIndex + 1) % total
        : (currentIndex - 1 + total) % total;

    const shift = direction === 'next' ? CENTER_INDEX + 1 : CENTER_INDEX - 1;

    const oldCenter = slideBlock.children[CENTER_INDEX];
    if (oldCenter) {
        oldCenter.style.transform = 'scale(0.7)';
        oldCenter.style.opacity = '0.6';
        oldCenter.style.zIndex = '1';
    }

    const futureCenter = slideBlock.children[shift];
    if (futureCenter) {
        futureCenter.classList.remove('inactive');
        futureCenter.style.transform = 'scale(1)';
        futureCenter.style.opacity = '1';
        futureCenter.style.zIndex = '2';
    }

    slideBlock.style.transition = 'transform 0.6s ease';
    slideBlock.style.transform = `translateX(-${shift * slideWidth}px)`;

    slideBlock.addEventListener('transitionend', () => {
        currentIndex = newIndex;
        renderSlides();
        isAnimating = false;
        allowInteraction = true;
    }, { once: true });
};

const nextSlide = () => handleSlideChange('next');
const prevSlide = () => handleSlideChange('prev');

// --- Touch-події ---
const handleTouchStart = (e) => {
    if (!allowInteraction) return;
    lastInputType = 'touch';
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchEndX = touchStartX;
    isHorizontalSwipe = null;
};

const handleTouchMove = (e) => {
    if (!allowInteraction || lastInputType !== 'touch' || !touchStartX) return;

    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;

    if (isHorizontalSwipe === null) {
        isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    }

    if (!isHorizontalSwipe) return; // вертикальний свайп — даємо сторінці скролитися

    e.preventDefault();
    touchEndX = e.touches[0].clientX;

    const diff = touchStartX - touchEndX;
    const offset = Math.max(-slideWidth * 0.3, Math.min(slideWidth * 0.3, diff));

    slideBlock.style.transition = 'none';
    slideBlock.style.transform = `translateX(${-CENTER_INDEX * slideWidth - offset}px)`;
};

const handleTouchEnd = () => {
    if (!allowInteraction || lastInputType !== 'touch' || !touchStartX) return;

    if (isHorizontalSwipe) {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > SWIPE_THRESHOLD) {
            diff > 0 ? nextSlide() : prevSlide();
        } else {
            slideBlock.style.transition = 'transform 0.3s ease';
            slideBlock.style.transform = `translateX(-${CENTER_INDEX * slideWidth}px)`;
        }
    }

    touchStartX = touchEndX = 0;
    isHorizontalSwipe = null;
};

// --- Mouse-події ---
const handleMouseDown = (e) => {
    if (IS_TOUCH_DEVICE || !allowInteraction) return;
    lastInputType = 'mouse';
    isDragging = true;
    dragStartX = e.clientX;
    slideBlock.style.transition = 'none';
    e.preventDefault();
};

const handleMouseMove = (e) => {
    if (!isDragging || IS_TOUCH_DEVICE || lastInputType !== 'mouse' || !allowInteraction) return;

    dragOffset = e.clientX - dragStartX;
    dragOffset = Math.max(-slideWidth * 0.3, Math.min(slideWidth * 0.3, dragOffset));

    slideBlock.style.transform = `translateX(${-CENTER_INDEX * slideWidth + dragOffset}px)`;
};

const handleMouseUp = () => {
    if (!isDragging || IS_TOUCH_DEVICE || lastInputType !== 'mouse' || !allowInteraction) return;
    isDragging = false;

    if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
        dragOffset > 0 ? prevSlide() : nextSlide();
    } else {
        slideBlock.style.transition = 'transform 0.3s ease';
        slideBlock.style.transform = `translateX(-${CENTER_INDEX * slideWidth}px)`;
    }
    dragOffset = 0;
};

// --- Ініціалізація ---
const initSlider = () => {
    slides = Array.from(document.querySelectorAll('.slide'));
    applySlideSizes();
    renderSlides();
    slideBlock.style.opacity = '1';
    slideBlock.style.transition = 'opacity 0.5s ease';
    setHeights();

    if (IS_TOUCH_DEVICE) {
        slider.addEventListener('touchstart', handleTouchStart, { passive: false });
        slider.addEventListener('touchmove', handleTouchMove, { passive: false });
        slider.addEventListener('touchend', handleTouchEnd, { passive: false });
        slider.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    } else {
        slider.addEventListener('mousedown', handleMouseDown);
        slider.addEventListener('mousemove', handleMouseMove);
        slider.addEventListener('mouseup', handleMouseUp);
        slider.addEventListener('mouseleave', handleMouseUp);
    }

    slider.addEventListener('contextmenu', (e) => e.preventDefault());
};

arrowNext.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });
arrowPrev.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });

// --- Ресайз тільки по ширині ---
let lastWindowWidth = window.innerWidth;
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    if (newWidth !== lastWindowWidth) {
        lastWindowWidth = newWidth;
        applySlideSizes();
        renderSlides();
    }
});

document.addEventListener('DOMContentLoaded', initSlider);
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});

