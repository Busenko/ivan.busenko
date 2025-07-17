window.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
    
            const targetId = this.getAttribute('href'); 
            const targetElement = document.querySelector(targetId); 
    
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 50, 
                    behavior: 'smooth' 
                });
            }
        });
    });


      


   
 // Меню бургер...................................................................................................................
 $(document).ready(function () {
    const burgerMenu = document.querySelector('.menu__burger');
    const menuBlock = document.querySelector('.menu__block');
    const menuLinks = document.querySelectorAll('.menu__link');
    
    if (burgerMenu && menuBlock) {
        // Відкривання/закривання меню при кліку на бургер
        $(burgerMenu).click(function () {
            $(this).toggleClass('active');
            $(menuBlock).toggleClass('active');
            $('body').toggleClass('lock');
        });

        // Закриття меню при кліку на посилання
        menuLinks.forEach(link => {
            $(link).click(function () {
                $(burgerMenu).removeClass('active'); // Видаляємо клас "active" у бургер-іконки
                $(menuBlock).removeClass('active');  // Видаляємо клас "active" у меню
                $('body').removeClass('lock');       // Розблоковуємо прокручування
            });
        });
    }
});




    // Функція для оновлення висоти футера та хедера в CSS...................................................................................................................
    function updateFooterAndHeaderHeight() {
        const footer = document.querySelector('footer');
        const header = document.querySelector('header');

        if (footer && header) {
            const footerHeight = footer.offsetHeight;
            const headerHeight = header.offsetHeight;
//            document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
            document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        }
    }

    window.addEventListener('load', updateFooterAndHeaderHeight);
    window.addEventListener('resize', updateFooterAndHeaderHeight);
// робота з відкриваючими блоками...................................................................................................................
    function itemsControl() {
        const coll = document.getElementsByClassName('block__item');
        if (coll.length > 0) {
            for (let i = 0; i < coll.length; i++) {
                const title = coll[i].querySelector('.item__button');
                if (title) {
                    title.addEventListener('click', function () {
                        let content = coll[i].querySelector('.block__item-info');
                        let image = coll[i].querySelector('.img-rotate');
                        if (content) {
                            if (content.style.maxHeight) {
                                content.style.maxHeight = null;
                                image && image.classList.remove('rotated');
                            } else {
                                content.style.maxHeight = content.scrollHeight + 'px';
                                image && image.classList.add('rotated');
                            }
                        }
                    });
                }
            }
    
            
            window.addEventListener('resize', function () {
                for (let i = 0; i < coll.length; i++) {
                    const content = coll[i].querySelector('.block__item-info');
                    if (content && content.style.maxHeight) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                }
            });
        }
    }
    
    itemsControl();
    

});
const ENABLE_SWIPE = true;

const VISIBLE_SLIDES = 7;
const CENTER_INDEX = Math.floor(VISIBLE_SLIDES / 2);

const slider = document.querySelector('.container');
const slideBlock = document.querySelector('.slider-block');
const arrowNext = document.querySelector('.arrow-next');
const arrowPrev = document.querySelector('.arrow-prev');

let slideWidth = 0;
let isAnimating = false;
let currentIndex = 0;
let slides = [];

let startX = 0;
let isSwiping = false;

const setHeights = (targetSlide = null) => {
    const target = targetSlide || document.querySelector('.slide:not(.inactive)');
    if (!target) return;

    const slideTop = target.querySelector('.slide__top');
    const slideBottom = target.querySelector('.slide__bottom');
    const slideHeight = target.querySelector('.img__height')?.offsetHeight || 0;

    const slideTopHeight = slideTop?.offsetHeight || 0;
    const slideBottomHeight = slideBottom?.offsetHeight || 0;

    document.documentElement.style.setProperty('--slide-height', `${slideHeight}px`);
    document.documentElement.style.setProperty('--slide-top-height', `${slideTopHeight}px`);
    document.documentElement.style.setProperty('--slide-bottom-height', `${slideBottomHeight}px`);
};

const applySlideSizes = () => {
    slideWidth = slider.clientWidth;
    if (slideWidth <= 0) return;
    slides.forEach(slide => {
        slide.style.width = `${slideWidth}px`;
    });
};

const getIndex = (i, total) => (i + total) % total;

const renderSlides = () => {
    while (slideBlock.firstChild) slideBlock.removeChild(slideBlock.firstChild);

    const total = slides.length;

    for (let i = 0; i < VISIBLE_SLIDES; i++) {
        const index = getIndex(currentIndex + i - CENTER_INDEX, total);
        const slide = slides[index];
        const clone = slide.cloneNode(true);

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
            clone.style.transform = 'scale(0.8)';
            clone.style.opacity = '0.6';
            clone.style.zIndex = '1';
        }

        slideBlock.appendChild(clone);
    }

    slideBlock.style.transition = 'none';
    slideBlock.style.transform = `translateX(-${CENTER_INDEX * slideWidth}px)`;

    const activeSlide = slideBlock.children[CENTER_INDEX];
    if (activeSlide) setHeights(activeSlide);
};

const handleSlideTransition = (direction) => {
    if (isAnimating) return;
    isAnimating = true;

    const total = slides.length;
    const newIndex = direction === 'next'
        ? (currentIndex + 1) % total
        : (currentIndex - 1 + total) % total;

    const shift = direction === 'next' ? CENTER_INDEX + 1 : CENTER_INDEX - 1;

    const oldCenter = slideBlock.children[CENTER_INDEX];
    const newCenter = slideBlock.children[shift];

    if (oldCenter) {
        oldCenter.style.transform = 'scale(0.8)';
        oldCenter.style.opacity = '0.6';
        oldCenter.style.zIndex = '1';
    }

    if (newCenter) {
        newCenter.classList.remove('inactive');
        newCenter.style.transform = 'scale(1)';
        newCenter.style.opacity = '1';
        newCenter.style.zIndex = '2';
    }

    const newTranslate = -(shift * slideWidth);
    slideBlock.style.transition = 'transform 0.6s ease';
    slideBlock.style.transform = `translateX(${newTranslate}px)`;

    slideBlock.addEventListener('transitionend', () => {
        if (!isAnimating) return;
        currentIndex = newIndex;
        renderSlides();
        isAnimating = false;
    }, { once: true });
};

const nextSlide = () => handleSlideTransition('next');
const prevSlide = () => handleSlideTransition('prev');

const initSwipe = () => {
    slider.addEventListener('touchstart', e => {
        if (isAnimating || e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        isSwiping = true;
    });

    slider.addEventListener('touchmove', e => {
        if (!isSwiping) return;
        // можна додати перетягування
    });

    slider.addEventListener('touchend', e => {
        if (!isSwiping) return;
        const endX = e.changedTouches[0].clientX;
        const delta = endX - startX;

        if (Math.abs(delta) > 50) {
            delta < 0 ? nextSlide() : prevSlide();
        }

        isSwiping = false;
    });
};

const initSlider = () => {
    slides = Array.from(document.querySelectorAll('.slide'));
    applySlideSizes();
    renderSlides();
    slideBlock.style.opacity = '1';
    slideBlock.style.transition = 'opacity 0.5s ease';
    setHeights();

    if (ENABLE_SWIPE) initSwipe(); // 
};

// Події
arrowNext.addEventListener('click', nextSlide);
arrowPrev.addEventListener('click', prevSlide);

window.addEventListener('resize', () => {
    applySlideSizes();
    renderSlides();
});

document.addEventListener('DOMContentLoaded', initSlider);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});

