const VISIBLE_SLIDES = 5;
const CENTER_INDEX = Math.floor(VISIBLE_SLIDES / 2);
const SWIPE_THRESHOLD = 30; 

// --- НАЛАШТУВАННЯ ПЛАВНОСТІ ---
const INACTIVE_SCALE = 0.8;   // Розмір бокових слайдів (зараз 80%)
const INACTIVE_OPACITY = 0.5; // Прозорість бокових слайдів (зараз 50%)
const ANIMATION_SPEED = 0.15; // Швидкість дотягування (від 0.1 до 0.3)

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
let currentDrag = 0;     // Де слайдер знаходиться візуально
let targetDrag = 0;      // Куди він має приїхати
let startDragOffset = 0; // Позиція в момент торкання
let isHorizontalSwipe = null;
let animationFrame = null;

const getIndex = (i, total) => ((i % total) + total) % total;

// Фікс стрибків іконок
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

// Головна функція малювання: вираховує розмір і прозорість для КОЖНОГО пікселя
const updateVisuals = () => {
    slideBlock.style.transform = `translate3d(${-CENTER_INDEX * slideWidth + currentDrag}px, 0, 0)`;

    Array.from(slideBlock.children).forEach((slide, i) => {
        // Рахуємо дистанцію кожного слайду від ідеального центру
        const distance = (i - CENTER_INDEX) * slideWidth + currentDrag;
        
        // Співвідношення (0 - це центр, 1 - це сусідній слайд)
        const ratio = Math.min(1, Math.abs(distance) / slideWidth); 

        // Плавна інтерполяція розміру та прозорості
        const scale = 1 - (1 - INACTIVE_SCALE) * ratio;
        const opacity = 1 - (1 - INACTIVE_OPACITY) * ratio;

        // Застосовуємо стилі миттєво через JS (це набагато плавніще ніж CSS)
        slide.style.transform = `scale(${scale})`;
        slide.style.opacity = opacity;

        // Синхронізуємо класи на випадок, якщо вони тобі потрібні для чогось іншого
        if (ratio < 0.5) {
            slide.classList.add('active');
            slide.classList.remove('inactive');
        } else {
            slide.classList.add('inactive');
            slide.classList.remove('active');
        }
    });
};

// Непомітне перекидання елементів
const shiftDOM = (direction) => {
    const total = originalSlides.length;
    if (direction === 'next') {
        currentIndex = getIndex(currentIndex + 1, total);
        slideBlock.removeChild(slideBlock.firstElementChild); 
        const newSlide = originalSlides[getIndex(currentIndex + CENTER_INDEX, total)].cloneNode(true);
        newSlide.className = 'slide inactive';
        newSlide.style.width = `${slideWidth}px`;
        newSlide.style.height = '100%';
        newSlide.style.transition = 'none'; // Блокуємо CSS-затримки
        slideBlock.appendChild(newSlide);
    } else {
        currentIndex = getIndex(currentIndex - 1, total);
        slideBlock.removeChild(slideBlock.lastElementChild); 
        const newSlide = originalSlides[getIndex(currentIndex - CENTER_INDEX, total)].cloneNode(true);
        newSlide.className = 'slide inactive';
        newSlide.style.width = `${slideWidth}px`;
        newSlide.style.height = '100%';
        newSlide.style.transition = 'none'; // Блокуємо CSS-затримки
        slideBlock.insertBefore(newSlide, slideBlock.firstElementChild);
    }
};

// Безкінечний цикл для швидких свайпів
const checkWrap = () => {
    while (currentDrag <= -slideWidth && slideWidth > 0) {
        shiftDOM('next');
        currentDrag += slideWidth;
        targetDrag += slideWidth;
    }
    while (currentDrag >= slideWidth && slideWidth > 0) {
        shiftDOM('prev');
        currentDrag -= slideWidth;
        targetDrag -= slideWidth;
    }
};

// Серце анімації (працює на 60 FPS)
const animateLoop = () => {
    if (isDragging) {
        currentDrag = targetDrag; // Під час драгу йдемо рівно за пальцем
    } else {
        // Плавне дотягування (пружина)
        currentDrag += (targetDrag - currentDrag) * ANIMATION_SPEED;
    }

    checkWrap();
    updateVisuals();

    // Якщо дотягнули до кінця - зупиняємось
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
        slide.style.transition = 'none'; // Прибираємо конфлікт з CSS
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
        // Перехоплюємо анімацію "на льоту", щоб не було ривків
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
            isDragging = false; 
            return;
        }

        e.preventDefault();
        targetDrag = startDragOffset + deltaX;
    };

    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;

        // Визначаємо до якого слайду дотягнути магнітом
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

    slider.addEventListener('touchstart', onStart, { passive: false });
    slider.addEventListener('touchmove', onMove, { passive: false });
    slider.addEventListener('touchend', onEnd);
    slider.addEventListener('touchcancel', onEnd);

    slider.addEventListener('contextmenu', (e) => e.preventDefault());
};

const handleSlideChange = (direction) => {
    // Жодних блокувань! Просто додаємо зсув, навіть якщо він вже їде
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
