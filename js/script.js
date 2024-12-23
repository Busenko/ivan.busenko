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
    


    let left = 0;
    const slideBlock = document.querySelector('.slider-block');
    const slider = document.querySelector('.slider');
    
    // Клонування для безшовного зациклення
    const slides = Array.from(slideBlock.children);
    const firstSlide = slides[0].cloneNode(true);
    const lastSlide = slides[slides.length - 1].cloneNode(true);
    slideBlock.appendChild(firstSlide);
    slideBlock.insertBefore(lastSlide, slides[0]);
    
    let isAnimating = false;
    let slideWidth = 0;
    
    const updateDimensions = () => {
        slideWidth = window.innerWidth; // Займає всю ширину екрана
        left = slideWidth;
        slideBlock.style.width = `${slideBlock.children.length * slideWidth}px`;
        Array.from(slideBlock.children).forEach(slide => {
            slide.style.width = `${slideWidth}px`;
        });
        slideBlock.style.transform = `translateX(-${left}px)`;
        slideBlock.style.transition = 'none';
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions(); // Ініціалізація розмірів
    
    const updatePosition = (animate = true) => {
        if (animate) {
            slideBlock.style.transition = 'all 0.5s ease';
            isAnimating = true;
            setTimeout(() => {
                isAnimating = false;
            }, 500); // Тривалість анімації
        } else {
            slideBlock.style.transition = 'none';
        }
        slideBlock.style.transform = `translateX(-${left}px)`;
    };
    
    const nextSlide = () => {
        if (isAnimating) return;
    
        left += slideWidth;
        updatePosition();
        if (left >= (slideBlock.children.length - 1) * slideWidth) {
            setTimeout(() => {
                left = slideWidth;
                updatePosition(false);
            }, 500);
        }
    };
    
    const prevSlide = () => {
        if (isAnimating) return;
    
        left -= slideWidth;
        updatePosition();
        if (left <= 0) {
            setTimeout(() => {
                left = (slideBlock.children.length - 2) * slideWidth;
                updatePosition(false);
            }, 500);
        }
    };
    
    const arrowNext = document.querySelector('.arrow-next');
    const arrowPrev = document.querySelector('.arrow-prev');
    arrowNext.addEventListener('click', nextSlide);
    arrowPrev.addEventListener('click', prevSlide);
    
    let startX = 0;
    let currentX = 0;
    
    slider.addEventListener('touchstart', (e) => {
        if (isAnimating) return;
        startX = e.touches[0].clientX;
    });
    
    slider.addEventListener('touchmove', (e) => {
        if (isAnimating) return;
        currentX = e.touches[0].clientX;
    });
    
    slider.addEventListener('touchend', () => {
        if (isAnimating) return;
        if (startX - currentX > 50) {
            nextSlide();
        } else if (currentX - startX > 50) {
            prevSlide();
        }
    });
    
    
    
});
