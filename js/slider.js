const VISIBLE_SLIDES = 5;
const CENTER_INDEX = Math.floor(VISIBLE_SLIDES / 2);
const SWIPE_THRESHOLD = 50;
const IS_TOUCH_DEVICE = 'ontouchstart' in window;

let slideWidth = 0;
let isAnimating = false;
let currentIndex = 0;
let slides = [];
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let isDragging = false;
let dragStartX = 0;
let dragOffset = 0;
let allowInteraction = true;
let isHorizontalSwipe = null;
let lastInputType = null;
let rafId = null;

const slider = document.querySelector('.slider');
const slideBlock = document.querySelector('.slides');
const arrowNext = document.querySelector('.arrow-next');
const arrowPrev = document.querySelector('.arrow-prev');

const applySlideSizes = () => {
    slideWidth = slider.clientWidth;
};

const getIndex = (i, total) => (i + total) % total;

const renderSlides = () => {
    const total = slides.length;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < VISIBLE_SLIDES; i++) {
        const index = getIndex(currentIndex + i - CENTER_INDEX, total);
        const clone = slides[index].cloneNode(true);

        clone.classList.add('slide');
        clone.style.width = `${slideWidth}px`;

        if (i === CENTER_INDEX) {
            clone.classList.add('active');
            clone.classList.remove('inactive');
        } else {
            clone.classList.add('inactive');
            clone.classList.remove('active');
        }
        
        fragment.appendChild(clone);
    }

    slideBlock.innerHTML = '';
    slideBlock.appendChild(fragment);

    slideBlock.style.transition = 'none';
    slideBlock.style.transform = `translate3d(-${CENTER_INDEX * slideWidth}px, 0, 0)`;
};

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
    const futureCenter = slideBlock.children[shift];

    if (oldCenter) {
        oldCenter.classList.remove('active');
        oldCenter.classList.add('inactive');
    }
    if (futureCenter) {
        futureCenter.classList.remove('inactive');
        futureCenter.classList.add('active');
    }

    slideBlock.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    slideBlock.style.transform = `translate3d(-${shift * slideWidth}px, 0, 0)`;

    const onTransitionEnd = (e) => {
        if (e.target !== slideBlock) return;
        slideBlock.removeEventListener('transitionend', onTransitionEnd);
        
        currentIndex = newIndex;
        renderSlides();
        isAnimating = false;
        allowInteraction = true;
    };

    slideBlock.addEventListener('transitionend', onTransitionEnd);
};

const nextSlide = () => handleSlideChange('next');
const prevSlide = () => handleSlideChange('prev');

const performDragAnimation = () => {
    if (isDragging || lastInputType === 'touch') {
        slideBlock.style.transition = 'none';
        slideBlock.style.transform = `translate3d(${-CENTER_INDEX * slideWidth + dragOffset}px, 0, 0)`;
    }
    rafId = null;
};

const handleTouchStart = (e) => {
    if (!allowInteraction) return;
    lastInputType = 'touch';
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchEndX = touchStartX;
    isHorizontalSwipe = null;
    dragOffset = 0;
};

const handleTouchMove = (e) => {
    if (!allowInteraction || lastInputType !== 'touch' || !touchStartX) return;

    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;

    if (isHorizontalSwipe === null) {
        isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    }

    if (!isHorizontalSwipe) return; 

    e.preventDefault();
    touchEndX = e.touches[0].clientX;

    const diff = touchStartX - touchEndX;
    dragOffset = Math.max(-slideWidth * 0.3, Math.min(slideWidth * 0.3, -diff));

    if (!rafId) {
        rafId = requestAnimationFrame(performDragAnimation);
    }
};

const handleTouchEnd = () => {
    if (!allowInteraction || lastInputType !== 'touch' || !touchStartX) return;

    if (isHorizontalSwipe) {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > SWIPE_THRESHOLD) {
            diff > 0 ? nextSlide() : prevSlide();
        } else {
            slideBlock.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
            slideBlock.style.transform = `translate3d(-${CENTER_INDEX * slideWidth}px, 0, 0)`;
        }
    }

    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    touchStartX = touchEndX = 0;
    dragOffset = 0;
    isHorizontalSwipe = null;
};

const handleMouseDown = (e) => {
    if (IS_TOUCH_DEVICE || !allowInteraction) return;
    lastInputType = 'mouse';
    isDragging = true;
    dragStartX = e.clientX;
    dragOffset = 0;
    slideBlock.style.transition = 'none';
    e.preventDefault();
};

const handleMouseMove = (e) => {
    if (!isDragging || IS_TOUCH_DEVICE || lastInputType !== 'mouse' || !allowInteraction) return;

    dragOffset = e.clientX - dragStartX;
    dragOffset = Math.max(-slideWidth * 0.3, Math.min(slideWidth * 0.3, dragOffset));

    if (!rafId) {
        rafId = requestAnimationFrame(performDragAnimation);
    }
};

const handleMouseUp = () => {
    if (!isDragging || IS_TOUCH_DEVICE || lastInputType !== 'mouse' || !allowInteraction) return;
    isDragging = false;

    if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
        dragOffset > 0 ? prevSlide() : nextSlide();
    } else {
        slideBlock.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        slideBlock.style.transform = `translate3d(-${CENTER_INDEX * slideWidth}px, 0, 0)`;
    }
    
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    dragOffset = 0;
};

const initSlider = () => {
    slides = Array.from(document.querySelectorAll('.slide'));
    
    applySlideSizes();
    renderSlides();
    
    slideBlock.style.opacity = '1';
    slideBlock.style.transition = 'opacity 0.5s ease';

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

if (arrowNext) arrowNext.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });
if (arrowPrev) arrowPrev.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });

let lastWindowWidth = window.innerWidth;
let resizeTimeout;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        if (newWidth !== lastWindowWidth) {
            lastWindowWidth = newWidth;
            applySlideSizes();
            renderSlides();
        }
    }, 150);
});

document.addEventListener('DOMContentLoaded', initSlider);
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});
