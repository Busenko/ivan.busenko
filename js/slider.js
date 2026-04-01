const VISIBLE_SLIDES = 5;
const CENTER_INDEX = Math.floor(VISIBLE_SLIDES / 2);
const SWIPE_THRESHOLD = 50;

const slider = document.querySelector('.slider');
const slideBlock = document.querySelector('.slides');
const arrowNext = document.querySelector('.arrow-next');
const arrowPrev = document.querySelector('.arrow-prev');

let slideWidth = 0;
let isAnimating = false;
let currentIndex = 0;
let originalSlides = [];

// Змінні для свайпів/перетягування
let isDragging = false;
let touchStartX = 0;
let touchStartY = 0;
let dragOffset = 0;
let isHorizontalSwipe = null;
let rafId = null;

// Допоміжна функція для циклічного індексу (враховує від'ємні значення)
const getIndex = (i, total) => ((i % total) + total) % total;

const applySlideSizes = () => {
    slideWidth = slider.clientWidth;
    Array.from(slideBlock.children).forEach(slide => {
        slide.style.width = `${slideWidth}px`;
    });
    // Повертаємо трек у вихідне положення без анімації
    slideBlock.style.transition = 'none';
    slideBlock.style.transform = `translate3d(-${CENTER_INDEX * slideWidth}px, 0, 0)`;
};

const initSlider = () => {
    originalSlides = Array.from(document.querySelectorAll('.slide'));
    slideBlock.innerHTML = ''; 

    // Створюємо початкові 5 слотів
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

    applySlideSizes();

    slideBlock.style.opacity = '1';
    slideBlock.style.transition = 'opacity 0.5s ease';

    // Уніфіковані слухачі подій для миші та тачу
    slider.addEventListener('mousedown', handleDragStart);
    window.addEventListener('mousemove', handleDragMove, { passive: false });
    window.addEventListener('mouseup', handleDragEnd);

    slider.addEventListener('touchstart', handleDragStart, { passive: false });
    slider.addEventListener('touchmove', handleDragMove, { passive: false });
    slider.addEventListener('touchend', handleDragEnd);
    slider.addEventListener('touchcancel', handleDragEnd);

    slider.addEventListener('contextmenu', (e) => e.preventDefault());
};

const handleSlideChange = (direction) => {
    if (isAnimating) return;
    isAnimating = true;

    const total = originalSlides.length;
    const shift = direction === 'next' ? 1 : -1;
    const newTransform = -(CENTER_INDEX + shift) * slideWidth;

    const currentCenter = slideBlock.children[CENTER_INDEX];
    const futureCenter = slideBlock.children[CENTER_INDEX + shift];

    // Зміна класів для CSS-анімацій всередині слайду
    currentCenter.classList.remove('active');
    currentCenter.classList.add('inactive');
    futureCenter.classList.remove('inactive');
    futureCenter.classList.add('active');

    // Анімуємо рух треку
    slideBlock.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    slideBlock.style.transform = `translate3d(${newTransform}px, 0, 0)`;

    slideBlock.addEventListener('transitionend', function onTransitionEnd(e) {
        if (e.target !== slideBlock) return;
        slideBlock.removeEventListener('transitionend', onTransitionEnd);

        // Фізично зміщуємо DOM-вузли після завершення анімації
        if (direction === 'next') {
            currentIndex = getIndex(currentIndex + 1, total);
            slideBlock.removeChild(slideBlock.firstElementChild); // Видаляємо перший
            
            const nextLogicalIndex = getIndex(currentIndex + CENTER_INDEX, total);
            const newSlide = originalSlides[nextLogicalIndex].cloneNode(true);
            newSlide.style.width = `${slideWidth}px`;
            newSlide.classList.add('slide', 'inactive');
            newSlide.classList.remove('active');
            
            slideBlock.appendChild(newSlide); // Додаємо в кінець
        } else {
            currentIndex = getIndex(currentIndex - 1, total);
            slideBlock.removeChild(slideBlock.lastElementChild); // Видаляємо останній
            
            const prevLogicalIndex = getIndex(currentIndex - CENTER_INDEX, total);
            const newSlide = originalSlides[prevLogicalIndex].cloneNode(true);
            newSlide.style.width = `${slideWidth}px`;
            newSlide.classList.add('slide', 'inactive');
            newSlide.classList.remove('active');
            
            slideBlock.insertBefore(newSlide, slideBlock.firstElementChild); // Вставляємо на початок
        }

        // Прибираємо транзицію та миттєво повертаємо трек на вихідну позицію (-2 слайди)
        slideBlock.style.transition = 'none';
        
        // Force Reflow (примусовий перерахунок стилів, гарантує відсутність мерехтіння)
        void slideBlock.offsetHeight; 
        
        slideBlock.style.transform = `translate3d(-${CENTER_INDEX * slideWidth}px, 0, 0)`;
        
        isAnimating = false;
    });
};

const nextSlide = () => handleSlideChange('next');
const prevSlide = () => handleSlideChange('prev');

// --- Логіка свайпів / перетягування ---

const handleDragStart = (e) => {
    if (isAnimating) return;
    isDragging = true;
    isHorizontalSwipe = null;
    touchStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    touchStartY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    dragOffset = 0;
    slideBlock.style.transition = 'none';
};

const handleDragMove = (e) => {
    if (!isDragging || isAnimating) return;

    const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY;

    if (isHorizontalSwipe === null) {
        isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    }

    if (e.type.includes('touch') && !isHorizontalSwipe) {
        isDragging = false; // Дозволяємо стандартний вертикальний скрол сторінки
        return;
    }

    e.preventDefault();

    // Обмеження витягування (ефект опору)
    dragOffset = Math.max(-slideWidth * 0.5, Math.min(slideWidth * 0.5, deltaX));

    if (!rafId) {
        rafId = requestAnimationFrame(() => {
            if (isDragging) {
                slideBlock.style.transform = `translate3d(${-CENTER_INDEX * slideWidth + dragOffset}px, 0, 0)`;
            }
            rafId = null;
        });
    }
};

const handleDragEnd = () => {
    if (!isDragging || isAnimating) return;
    isDragging = false;

    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }

    if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
        dragOffset < 0 ? nextSlide() : prevSlide();
    } else {
        // Повернення на місце, якщо свайп був закоротким
        slideBlock.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        slideBlock.style.transform = `translate3d(-${CENTER_INDEX * slideWidth}px, 0, 0)`;
    }
    
    dragOffset = 0;
    isHorizontalSwipe = null;
};

// --- Ініціалізація та обробники подій ---

if (arrowNext) arrowNext.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });
if (arrowPrev) arrowPrev.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        applySlideSizes();
    }, 150);
});

document.addEventListener('DOMContentLoaded', initSlider);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});
