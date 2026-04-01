const VISIBLE_SLIDES = 5;
const CENTER_INDEX = Math.floor(VISIBLE_SLIDES / 2);
const SWIPE_THRESHOLD = 30; // Зменшено для швидшої реакції

const slider = document.querySelector('.slider');
const slideBlock = document.querySelector('.slides');
const arrowNext = document.querySelector('.arrow-next');
const arrowPrev = document.querySelector('.arrow-prev');

let slideWidth = 0;
let isAnimating = false;
let currentIndex = 0;
let originalSlides = [];

// Змінні для свайпів
let isDragging = false;
let touchStartX = 0;
let dragOffset = 0;
let isHorizontalSwipe = null;

// Функція циклічного індексу
const getIndex = (i, total) => ((i % total) + total) % total;

// 1. ФІКС СМИКАННЯ ІКОНОК (JS-ХАК)
const lockSliderHeight = () => {
    if (!originalSlides.length) return;
    
    // Знаходимо найвищий слайд серед оригіналів
    let maxHeight = 0;
    originalSlides.forEach(slide => {
        const height = slide.offsetHeight;
        if (height > maxHeight) maxHeight = height;
    });

    // Якщо висоту знайшли, жорстко прописуємо її в інлайн-стилі слайдера
    // Тепер, коли DOM буде змінюватися всередині, висота всього блоку не ворухнеться
    if (maxHeight > 0) {
        slider.style.height = `${maxHeight}px`;
        // Також додаємо CSS-ізоляцію, якщо браузер її підтримує
        slider.style.contain = 'layout';
        slideBlock.style.height = '100%';
        slideBlock.style.display = 'flex';
        slideBlock.style.alignItems = 'stretch';
    }
};

const applySlideSizes = () => {
    slideWidth = slider.clientWidth;
    Array.from(slideBlock.children).forEach(slide => {
        slide.style.width = `${slideWidth}px`;
        slide.style.height = '100%'; // Щоб слайди тягнулися по висоті треку
    });
    slideBlock.style.transition = 'none';
    slideBlock.style.transform = `translate3d(-${CENTER_INDEX * slideWidth}px, 0, 0)`;
};

const initSlider = () => {
    originalSlides = Array.from(document.querySelectorAll('.slide'));
    if (!originalSlides.length) return;
    
    // Готуємо трек
    slideBlock.innerHTML = ''; 
    slideBlock.style.willChange = 'transform'; // Оптимізація для GPU

    // Створюємо 5 слотів
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < VISIBLE_SLIDES; i++) {
        const logicalIndex = getIndex(currentIndex + i - CENTER_INDEX, originalSlides.length);
        const clone = originalSlides[logicalIndex].cloneNode(true);
        clone.classList.add('slide');
        
        if (i === CENTER_INDEX) {
            clone.classList.add('active');
            clone.classList.remove('inactive');
        } else {
            clone.classList.add('inactive');
            clone.classList.remove('active');
        }
        fragment.appendChild(clone);
    }
    slideBlock.appendChild(fragment);

    // Викликаємо фікси
    applySlideSizes();
    lockSliderHeight(); // Фіксуємо висоту "намертво"

    slideBlock.style.opacity = '1';
    slideBlock.style.transition = 'opacity 0.5s ease';

    // Уніфіковані події (миша + тач)
    const setContext = (e) => (e.type.includes('mouse') ? e : e.touches[0]);

    // НАЧАЛО СВАЙПА
    const onStart = (e) => {
        if (isAnimating) return;
        const ctx = setContext(e);
        isDragging = true;
        isHorizontalSwipe = null;
        touchStartX = ctx.clientX;
        touchStartY = ctx.clientY;
        dragOffset = 0;
        slideBlock.style.transition = 'none'; // Прибираємо транзицію миттєво
    };

    // РУХ ПАЛЬЦЯ (РОБИМО ПЛАВНІШИМ І ШВИДШИМ)
    const onMove = (e) => {
        if (!isDragging || isAnimating) return;
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

        // Прибираємо ефект опору (гуми), щоб палець йшов 1:1 зі слайдом
        // Це робить свайп плавнішим і слухнянішим
        dragOffset = deltaX; 

        // Прибираємо requestAnimationFrame, застосовуємо трансформ негайно.
        // Це прибирає мікро-затримку реакції.
        slideBlock.style.transform = `translate3d(${-CENTER_INDEX * slideWidth + dragOffset}px, 0, 0)`;
    };

    // КІНЕЦЬ СВАЙПА
    const onEnd = () => {
        if (!isDragging || isAnimating) return;
        isDragging = false;

        if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
            // Підбираємо швидкість анімації залежно від сили свайпа
            const speed = Math.max(0.2, Math.min(0.6, 1 - Math.abs(dragOffset) / slideWidth));
            dragOffset < 0 ? nextSlide(speed) : prevSlide(speed);
        } else {
            // Повернення на місце
            slideBlock.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
            slideBlock.style.transform = `translate3d(-${CENTER_INDEX * slideWidth}px, 0, 0)`;
        }
        
        dragOffset = 0;
        isHorizontalSwipe = null;
    };

    // Прив'язка подій до слайдера
    slider.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);

    slider.addEventListener('touchstart', onStart, { passive: false });
    slider.addEventListener('touchmove', onMove, { passive: false });
    slider.addEventListener('touchend', onEnd);
    slider.addEventListener('touchcancel', onEnd);

    slider.addEventListener('contextmenu', (e) => e.preventDefault());
};

const handleSlideChange = (direction, customSpeed = 0.6) => {
    if (isAnimating) return;
    isAnimating = true;

    const total = originalSlides.length;
    const shift = direction === 'next' ? 1 : -1;
    const newTransform = -(CENTER_INDEX + shift) * slideWidth;

    const currentCenter = slideBlock.children[CENTER_INDEX];
    const futureCenter = slideBlock.children[CENTER_INDEX + shift];

    currentCenter.classList.remove('active');
    currentCenter.classList.add('inactive');
    futureCenter.classList.remove('inactive');
    futureCenter.classList.add('active');

    // Використовуємо адаптивну швидкість (або стандартну)
    slideBlock.style.transition = `transform ${customSpeed}s cubic-bezier(0.2, 1, 0.3, 1)`;
    slideBlock.style.transform = `translate3d(${newTransform}px, 0, 0)`;

    slideBlock.addEventListener('transitionend', function onTransitionEnd(e) {
        if (e.target !== slideBlock) return;
        slideBlock.removeEventListener('transitionend', onTransitionEnd);

        if (direction === 'next') {
            currentIndex = getIndex(currentIndex + 1, total);
            slideBlock.removeChild(slideBlock.firstElementChild); 
            const nextLogicalIndex = getIndex(currentIndex + CENTER_INDEX, total);
            const newSlide = originalSlides[nextLogicalIndex].cloneNode(true);
            newSlide.style.width = `${slideWidth}px`;
            newSlide.style.height = '100%';
            newSlide.classList.add('slide', 'inactive');
            newSlide.classList.remove('active');
            slideBlock.appendChild(newSlide);
        } else {
            currentIndex = getIndex(currentIndex - 1, total);
            slideBlock.removeChild(slideBlock.lastElementChild); 
            const prevLogicalIndex = getIndex(currentIndex - CENTER_INDEX, total);
            const newSlide = originalSlides[prevLogicalIndex].cloneNode(true);
            newSlide.style.width = `${slideWidth}px`;
            newSlide.style.height = '100%';
            newSlide.classList.add('slide', 'inactive');
            newSlide.classList.remove('active');
            slideBlock.insertBefore(newSlide, slideBlock.firstElementChild);
        }

        slideBlock.style.transition = 'none';
        void slideBlock.offsetHeight; // Force Reflow
        slideBlock.style.transform = `translate3d(-${CENTER_INDEX * slideWidth}px, 0, 0)`;
        
        isAnimating = false;
    });
};

const nextSlide = (speed) => handleSlideChange('next', speed);
const prevSlide = (speed) => handleSlideChange('prev', speed);

// --- Ініціалізація та кнопки ---

if (arrowNext) arrowNext.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });
if (arrowPrev) arrowPrev.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // При резайзі перераховуємо все наново
        applySlideSizes();
        slider.style.height = 'auto'; // Скидаємо висоту
        lockSliderHeight(); // Задаємо нову висоту
    }, 150);
});

document.addEventListener('DOMContentLoaded', initSlider);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});
