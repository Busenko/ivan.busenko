const VISIBLE_SLIDES = 5;
const CENTER_INDEX = Math.floor(VISIBLE_SLIDES / 2);
const SWIPE_THRESHOLD = 30; 

// --- НАЛАШТУВАННЯ ПЛАВНОСТІ ---
const ACTIVE_SCALE = 0.95;     // Розмір головного слайду (90%)
const INACTIVE_SCALE = 0.8;   // Розмір бокових слайдів (70%)
const ACTIVE_OPACITY = 1;     // Прозорість головного слайду (100%)
const INACTIVE_OPACITY = 0.5; // Прозорість бокових слайдів (50%)
const ANIMATION_SPEED = 0.15; // Швидкість дотягування


const COMPACT_SPACING = 30;


const slider = document.querySelector('.slider');
const slideBlock = document.querySelector('.slides');
const arrowNext = document.querySelector('.arrow-next');
const arrowPrev = document.querySelector('.arrow-prev');

let slideWidth = 0;
let currentIndex = 0;
let originalSlides = [];

// Змінні рушія анімації
let isDragging = false;
let touchStartX = 0;
let touchStartY = 0;
let currentDrag = 0;     
let targetDrag = 0;      
let startDragOffset = 0; 
let isHorizontalSwipe = null;
let animationFrame = null;

const getIndex = (i, total) => ((i % total) + total) % total;

const lockSliderHeight = () => {
    if (!originalSlides.length) return;
    let maxHeight = 0;
    originalSlides.forEach(slide => {
        const height = slide.offsetHeight;
        if (height > maxHeight) maxHeight = height;
    });
    if (maxHeight > 0) {
        slider.style.height = `${maxHeight}px`;
        slider.style.contain = 'layout';
        slideBlock.style.height = '100%';
        slideBlock.style.display = 'flex';
        slideBlock.style.alignItems = 'stretch';
    }
};

const updateVisuals = () => {
    slideBlock.style.transform = `translate3d(${-CENTER_INDEX * slideWidth + currentDrag}px, 0, 0)`;

    Array.from(slideBlock.children).forEach((slide, i) => {
        // Рахуємо дистанцію в пікселях від ідеального центру
        const distance = (i - CENTER_INDEX) * slideWidth + currentDrag;
        
        // relativePosition: 0 (центр), 1 (перший справа), -1 (перший зліва) і т.д.
        const relativePosition = distance / slideWidth;
        const ratio = Math.min(1, Math.abs(relativePosition)); 

        // Рахуємо розмір і прозорість
        const scale = ACTIVE_SCALE - (ACTIVE_SCALE - INACTIVE_SCALE) * ratio;
        const opacity = ACTIVE_OPACITY - (ACTIVE_OPACITY - INACTIVE_OPACITY) * ratio;

        // --- МАГІЯ СТЯГУВАННЯ ---
        // Чим далі слайд, тим сильніше він тягнеться до центру (множимо на COMPACT_SPACING)
        const translateX = relativePosition * -COMPACT_SPACING;

        // Застосовуємо одночасно зсув (translateX) та розмір (scale)
        slide.style.transform = `translateX(${translateX}px) scale(${scale})`;
        slide.style.opacity = opacity;

        if (ratio < 0.5) {
            slide.classList.add('active');
            slide.classList.remove('inactive');
        } else {
            slide.classList.add('inactive');
            slide.classList.remove('active');
        }
    });
};



const shiftDOM = (direction) => {
    const total = originalSlides.length;
    if (direction === 'next') {
        currentIndex = getIndex(currentIndex + 1, total);
        slideBlock.removeChild(slideBlock.firstElementChild); 
        const newSlide = originalSlides[getIndex(currentIndex + CENTER_INDEX, total)].cloneNode(true);
        newSlide.className = 'slide inactive';
        newSlide.style.width = `${slideWidth}px`;
        newSlide.style.height = '100%';
        newSlide.style.transition = 'none'; 
        slideBlock.appendChild(newSlide);
    } else {
        currentIndex = getIndex(currentIndex - 1, total);
        slideBlock.removeChild(slideBlock.lastElementChild); 
        const newSlide = originalSlides[getIndex(currentIndex - CENTER_INDEX, total)].cloneNode(true);
        newSlide.className = 'slide inactive';
        newSlide.style.width = `${slideWidth}px`;
        newSlide.style.height = '100%';
        newSlide.style.transition = 'none'; 
        slideBlock.insertBefore(newSlide, slideBlock.firstElementChild);
    }
};

const checkWrap = () => {
    while (currentDrag <= -slideWidth && slideWidth > 0) {
        shiftDOM('next');
        currentDrag += slideWidth;
        targetDrag += slideWidth;
        startDragOffset += slideWidth; // ФІКС 1: Синхронізація стартової точки при довгому свайпі
    }
    while (currentDrag >= slideWidth && slideWidth > 0) {
        shiftDOM('prev');
        currentDrag -= slideWidth;
        targetDrag -= slideWidth;
        startDragOffset -= slideWidth; // ФІКС 1
    }
};

const animateLoop = () => {
    if (isDragging) {
        currentDrag = targetDrag; 
    } else {
        currentDrag += (targetDrag - currentDrag) * ANIMATION_SPEED;
    }

    checkWrap();
    updateVisuals();

    // Зупиняємо анімацію лише коли слайд ІДЕАЛЬНО став на місце
    if (!isDragging && Math.abs(targetDrag - currentDrag) < 0.5) {
        currentDrag = targetDrag;
        checkWrap(); 
        updateVisuals();
        animationFrame = null;
    } else {
        animationFrame = requestAnimationFrame(animateLoop);
    }
};

const startAnimation = () => {
    if (!animationFrame) {
        animateLoop();
    }
};

const applySlideSizes = () => {
    slideWidth = slider.clientWidth;
    Array.from(slideBlock.children).forEach(slide => {
        slide.style.width = `${slideWidth}px`;
        slide.style.height = '100%';
        slide.style.transition = 'none'; 
    });
    slideBlock.style.transition = 'none';
    updateVisuals();
};

const initSlider = () => {
    originalSlides = Array.from(document.querySelectorAll('.slide'));
    if (!originalSlides.length) return;
    
    slideBlock.innerHTML = ''; 
    slideBlock.style.willChange = 'transform'; 

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < VISIBLE_SLIDES; i++) {
        const logicalIndex = getIndex(currentIndex + i - CENTER_INDEX, originalSlides.length);
        const clone = originalSlides[logicalIndex].cloneNode(true);
        clone.className = i === CENTER_INDEX ? 'slide active' : 'slide inactive';
        clone.style.transition = 'none'; 
        fragment.appendChild(clone);
    }
    slideBlock.appendChild(fragment);

    applySlideSizes();
    lockSliderHeight(); 
    slideBlock.style.opacity = '1';

    const setContext = (e) => (e.type.includes('mouse') ? e : e.touches[0]);

    const onStart = (e) => {
        const ctx = setContext(e);
        isDragging = true;
        isHorizontalSwipe = null;
        touchStartX = ctx.clientX;
        touchStartY = ctx.clientY;
        startDragOffset = currentDrag; 
        startAnimation();
    };

    const onMove = (e) => {
        if (!isDragging) return;
        const ctx = setContext(e);
        const deltaX = ctx.clientX - touchStartX;
        const deltaY = ctx.clientY - touchStartY;

        if (isHorizontalSwipe === null) {
            isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
        }

        if (e.type.includes('touch') && !isHorizontalSwipe) {
            // ФІКС 2: Якщо це вертикальний скрол, примусово повертаємо слайд рівно на місце
            targetDrag = 0;
            isDragging = false; 
            return;
        }

        e.preventDefault();
        targetDrag = startDragOffset + deltaX;
    };

    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;

        // Магнітимо до найближчого слайда
        if (currentDrag < -SWIPE_THRESHOLD) {
            targetDrag = -slideWidth;
        } else if (currentDrag > SWIPE_THRESHOLD) {
            targetDrag = slideWidth;
        } else {
            targetDrag = 0;
        }
    };

    slider.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('mouseleave', onEnd); // ФІКС 3: Страховка, якщо миша вийшла за межі вікна

    slider.addEventListener('touchstart', onStart, { passive: false });
    slider.addEventListener('touchmove', onMove, { passive: false });
    slider.addEventListener('touchend', onEnd);
    slider.addEventListener('touchcancel', onEnd);

    slider.addEventListener('contextmenu', (e) => e.preventDefault());
};

const handleSlideChange = (direction) => {
    if (direction === 'next') {
        targetDrag -= slideWidth;
    } else {
        targetDrag += slideWidth;
    }
    startAnimation();
};

const nextSlide = () => handleSlideChange('next');
const prevSlide = () => handleSlideChange('prev');

if (arrowNext) arrowNext.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });
if (arrowPrev) arrowPrev.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        applySlideSizes();
        slider.style.height = 'auto'; 
        lockSliderHeight(); 
    }, 150);
});

document.addEventListener('DOMContentLoaded', initSlider);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});
