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
const setHeights = (targetSlide = null) => {
    const target = targetSlide || document.querySelector('.slide:not(.inactive)');
    if (!target) return;

    const slideTop = target.querySelector('.slide__top');
    const slideBottom = target.querySelector('.slide__bottom');
    
    // Get heights with fallback
    const slideTopHeight = slideTop?.offsetHeight || 0;
    const slideBottomHeight = slideBottom?.offsetHeight || 0;
    const slideHeight = target.querySelector('.img__height')?.offsetHeight || 0;

    // Smooth transition for height changes
    document.documentElement.style.transition = '--slide-height 0.6s ease, --slide-top-height 0.6s ease, --slide-bottom-height 0.6s ease';
    document.documentElement.style.setProperty('--slide-height', `${slideHeight}px`);
    document.documentElement.style.setProperty('--slide-top-height', `${slideTopHeight}px`);
    document.documentElement.style.setProperty('--slide-bottom-height', `${slideBottomHeight}px`);

    // Remove transition after animation completes
    setTimeout(() => {
        document.documentElement.style.transition = 'none';
    }, 600);
};

const slider = document.querySelector('.slider');
const slideBlock = document.querySelector('.slider-block');
const arrowNext = document.querySelector('.arrow-next');
const arrowPrev = document.querySelector('.arrow-prev');

let slideWidth = 0;
let isAnimating = false;
let currentIndex = 0;
let slides = [];

const applySlideSizes = () => {
    slideWidth = slider.clientWidth;
    if (slideWidth <= 0) return;
    slides.forEach(slide => {
        slide.style.width = `${slideWidth}px`;
    });
};

const renderSlides = () => {
    slideBlock.innerHTML = '';
    const total = slides.length;
    const getIndex = i => (i + total) % total;

    const indices = [
        getIndex(currentIndex - 2),
        getIndex(currentIndex - 1),
        currentIndex,
        getIndex(currentIndex + 1),
        getIndex(currentIndex + 2)
    ];

    indices.forEach((index, i) => {
        const clone = slides[index].cloneNode(true);
        clone.style.width = `${slideWidth}px`;
        
        if (i !== 2) {
            clone.classList.add('inactive');
            clone.style.transform = 'scale(0.85)';
            clone.style.opacity = '0.7';
        } else {
            clone.classList.remove('inactive');
            clone.style.transform = 'scale(0.95)'; // Start slightly scaled down
            clone.style.opacity = '0.9'; // Start slightly transparent
        }
        
        clone.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
        clone.style.zIndex = i === 2 ? '2' : '1';
        slideBlock.appendChild(clone);
    });

    slideBlock.style.transition = 'none';
    slideBlock.style.transform = `translateX(-${2 * slideWidth}px)`;
    
    // Set heights for the new active slide
    setTimeout(() => {
        const activeSlide = slideBlock.children[2];
        if (activeSlide) {
            setHeights(activeSlide);
            activeSlide.style.transform = 'scale(1)';
            activeSlide.style.opacity = '1';
        }
    }, 10);
};

const handleSlideTransition = (direction) => {
    if (isAnimating) return;
    isAnimating = true;

    const currentActive = document.querySelector('.slide:not(.inactive)');
    const nextActiveIndex = direction === 'next' 
        ? (currentIndex + 1) % slides.length
        : (currentIndex - 1 + slides.length) % slides.length;
    
    if (currentActive) {
        // Animate out current active slide
        currentActive.style.transform = 'scale(0.85)';
        currentActive.style.opacity = '0.7';
        currentActive.style.zIndex = '1';
    }

    // Move slides
    slideBlock.style.transition = 'transform 0.6s ease';
    slideBlock.style.transform = direction === 'next' 
        ? `translateX(-${3 * slideWidth}px)`
        : `translateX(-${slideWidth}px)`;

    // After movement completes
    setTimeout(() => {
        currentIndex = nextActiveIndex;
        renderSlides();
        isAnimating = false;
    }, 600);
};

const nextSlide = () => handleSlideTransition('next');
const prevSlide = () => handleSlideTransition('prev');

const initSlider = () => {
    slides = Array.from(document.querySelectorAll('.slide'));
    applySlideSizes();
    renderSlides();
    slideBlock.style.opacity = '1';
    slideBlock.style.transition = 'opacity 0.5s ease';
    
    // Initialize heights after first render
    setTimeout(() => setHeights(), 100);
};

// Event listeners
arrowNext.addEventListener('click', nextSlide);
arrowPrev.addEventListener('click', prevSlide);

window.addEventListener('resize', () => {
    applySlideSizes();
    renderSlides();
});

document.addEventListener('DOMContentLoaded', initSlider);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});
