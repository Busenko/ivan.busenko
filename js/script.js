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
    
// Визначаємо висоти верхнього та нижнього блоків
const slideTopHeight = document.querySelector('.slide__top').offsetHeight;
const slideBottomHeight = document.querySelector('.slide__bottom').offsetHeight;
const slideHeight = document.querySelector('.img__height').offsetHeight;
// Призначаємо ці значення як змінні CSS


document.documentElement.style.setProperty('--slide-height', `${slideHeight}px`);


document.documentElement.style.setProperty('--slide-top-height', `${slideTopHeight}px`);
document.documentElement.style.setProperty('--slide-bottom-height', `${slideBottomHeight}px`);


    // // SLIDER
let left = 0;
let isAnimating = false;
const CLONE_COUNT = 4; // Кількість слайдів для клонування з обох боків

const slideBlock = document.querySelector('.slider-block');
const slider = document.querySelector('.slider');

let originalSlides = [];
let slides = [];
let slideWidth = 0;

// Виділення активного слайду
const highlightActiveSlide = () => {
    slides.forEach(slide => slide.classList.remove('active'));
    const currentIndex = Math.round(left / slideWidth);
    if (slides[currentIndex]) {
        slides[currentIndex].classList.add('active');
    }
};

// Оновлення розмірів
const updateDimensions = () => {
    slideWidth = slider.clientWidth;
    if (slideWidth <= 0) {
        console.warn("Некоректна ширина слайда.");
        return;
    }

    slideBlock.style.width = `${slideWidth * slides.length}px`;
    slides.forEach(slide => {
        slide.style.width = `${slideWidth}px`;
    });

    left = slideWidth * CLONE_COUNT; // позиція на перший реальний слайд
    slideBlock.style.transition = 'none';
    slideBlock.style.transform = `translateX(-${left}px)`;
    highlightActiveSlide();
};

// Зміна розміру вікна
window.addEventListener('resize', () => {
    const currentSlideIndex = Math.round(left / slideWidth);
    slideWidth = slider.clientWidth;
    if (slideWidth <= 0) return;

    slideBlock.style.width = `${slideWidth * slides.length}px`;
    slides.forEach(slide => {
        slide.style.width = `${slideWidth}px`;
    });

    left = currentSlideIndex * slideWidth;
    slideBlock.style.transition = 'none';
    slideBlock.style.transform = `translateX(-${left}px)`;
    highlightActiveSlide();
});

// Оновлення позиції
const updatePosition = (animate = true) => {
    slideBlock.style.transition = animate ? 'all 0.5s ease' : 'none';
    slideBlock.style.transform = `translateX(-${left}px)`;
    highlightActiveSlide();
};

// Наступний слайд
const nextSlide = () => {
    if (isAnimating) return;
    isAnimating = true;
    left += slideWidth;
    updatePosition();

    if (left >= slideWidth * (slides.length - CLONE_COUNT)) {
        setTimeout(() => {
            left = slideWidth * CLONE_COUNT;
            updatePosition(false);
            isAnimating = false;
        }, 500);
    } else {
        setTimeout(() => isAnimating = false, 500);
    }
};

// Попередній слайд
const prevSlide = () => {
    if (isAnimating) return;
    isAnimating = true;
    left -= slideWidth;
    updatePosition();

    if (left < slideWidth) {
        setTimeout(() => {
            left = slideWidth * (slides.length - CLONE_COUNT * 2);
            updatePosition(false);
            isAnimating = false;
        }, 500);
    } else {
        setTimeout(() => isAnimating = false, 500);
    }
};

// Кнопки
const arrowNext = document.querySelector('.arrow-next');
const arrowPrev = document.querySelector('.arrow-prev');
arrowNext.addEventListener('click', nextSlide);
arrowPrev.addEventListener('click', prevSlide);

// Завантаження сторінки
document.addEventListener('DOMContentLoaded', () => {
    // Початкові слайди
    originalSlides = Array.from(document.querySelectorAll('.slide'));

    if (originalSlides.length === 0) {
        console.warn("Слайди не знайдено.");
        return;
    }

    // Клонування останніх N слайдів на початок
    for (let i = CLONE_COUNT; i > 0; i--) {
        const clone = originalSlides[originalSlides.length - i].cloneNode(true);
        clone.classList.add('cloned');
        slideBlock.insertBefore(clone, originalSlides[0]);
    }

    // Клонування перших N слайдів у кінець
    for (let i = 0; i < CLONE_COUNT; i++) {
        const clone = originalSlides[i].cloneNode(true);
        clone.classList.add('cloned');
        slideBlock.appendChild(clone);
    }

    // Оновлення посилання після клонування
    slides = document.querySelectorAll('.slide');

    setTimeout(updateDimensions, 0); // дає шанс DOM повністю відмалюватись
});


    // let left = 0; // Поточна позиція слайдера
    // let isAnimating = false; // Прапор для перевірки анімації
    // const slideBlock = document.querySelector('.slider-block'); // Контейнер зі слайдами
    // const slider = document.querySelector('.slider'); // Основний контейнер слайдера
    
    // // Клонування першого і останнього слайдів для безшовного зациклення
    // const slides = document.querySelectorAll('.slide'); // Отримуємо всі слайди
    // const firstSlide = slides[0].cloneNode(true); // Клонування першого слайда
    // const lastSlide = slides[slides.length - 1].cloneNode(true); // Клонування останнього слайда
    // slideBlock.appendChild(firstSlide); // Додаємо перший слайд в кінець
    // slideBlock.insertBefore(lastSlide, slides[0]); // Додаємо останній слайд на початок
    
    // let slideWidth = slider.clientWidth; // Ширина слайда, залежить від ширини контейнера
    
    // // Функція для оновлення розмірів слайдера під час зміни розміру вікна
    // const updateDimensions = () => {
    //     slideWidth = slider.clientWidth; // Перерахунок ширини слайда
        
    //     // Перевірка коректності ширини
    //     // if (slideWidth <= 0) {
    //     //     console.warn("Некоректна ширина слайда. Перевірте розмітку або стилі.");
    //     //     return;
    //     // }
    
    //     left = slideWidth; // Початкова позиція слайдера (після клонованого слайда)
    //     slideBlock.style.transform = `translateX(-${left}px)`; // Зсув до початкового стану
    //     // slideBlock.style.transition = 'none'; // Вимкнення анімації під час ініціалізації
    
    //     // Оновлення ширини контейнера і окремих слайдів
    //     slideBlock.style.width = `${slideWidth * (slides.length + 2)}px`; // Враховуємо два клоновані слайди
    //     document.querySelectorAll('.slide').forEach(slide => {
    //         slide.style.width = `${slideWidth}px`; // Задаємо однакову ширину для всіх слайдів
    //     });
    // };
    
   
    //     // Оновлення ширини слайдів при завантаженні
    //     slideWidth = slider.clientWidth;
    
    //     if (slideWidth <= 0) {
    //         console.warn("Некоректна ширина слайда. Перевірте розмітку або стилі.");
    //         return;
    //     }
    
    //     // Налаштування ширини контейнера та слайдів
    //     slideBlock.style.width = `${slideWidth * (slides.length + 2)}px`;
    //     document.querySelectorAll('.slide').forEach(slide => {
    //         slide.style.width = `${slideWidth}px`;
    //     });
    
    //     // Початкова позиція - перший реальний слайд
    //     left = slideWidth; // Переміщення на перший реальний слайд
    //     slideBlock.style.transition = 'none'; // Вимкнення анімації для миттєвого переходу
    //     slideBlock.style.transform = `translateX(-${left}px)`; // Зсув до правильної позиції

    
    // // // Відстеження зміни розміру вікна
    // // window.addEventListener('resize', updateDimensions);
    // // updateDimensions(); // Ініціалізація після завантаження

    // window.addEventListener('resize', () => {
    //     // Збереження відношення поточної позиції до ширини слайдів
    //     const currentSlideIndex = Math.round(left / slideWidth); // Індекс активного слайда
    //     slideWidth = slider.clientWidth; // Оновлення ширини слайда
    
    //     if (slideWidth <= 0) {
    //         console.warn("Некоректна ширина слайда. Перевірте розмітку або стилі.");
    //         return;
    //     }
    
    //     // Оновлення розмірів слайдерного блоку та окремих слайдів
    //     slideBlock.style.width = `${slideWidth * (slides.length + 2)}px`;
    //     document.querySelectorAll('.slide').forEach(slide => {
    //         slide.style.width = `${slideWidth}px`;
    //     });
    
    //     // Відновлення позиції слайдера після зміни розміру
    //     left = currentSlideIndex * slideWidth; // Позиція з урахуванням нового розміру
    //     slideBlock.style.transition = 'none'; // Вимкнення анімації
    //     slideBlock.style.transform = `translateX(-${left}px)`; // Зсув до правильної позиції
    // });
    


    
    // // Функція для оновлення позиції слайдера
    // const updatePosition = (animate = true) => {
    //     slideBlock.style.transition = animate ? 'all 0.5s ease' : 'none'; // Включення/виключення анімації
    //     slideBlock.style.transform = `translateX(-${left}px)`; // Зсув слайдера
    // };
    
    // // Переміщення на наступний слайд
    // const nextSlide = () => {
    //     if (isAnimating) return; // Уникаємо накладання анімацій
    //     isAnimating = true; // Встановлюємо прапор анімації
    //     left += slideWidth; // Збільшуємо позицію
    
    //     updatePosition(); // Оновлюємо положення
    
    //     // Якщо досягли кінця, переносимо на початок
    //     if (left >= slideBlock.scrollWidth - slideWidth) {
    //         setTimeout(() => {
    //             left = slideWidth; // Повертаємо до початкової позиції
    //             updatePosition(false); // Без анімації
    //             isAnimating = false; // Скидаємо прапор анімації
    //         }, 500);
    //     } else {
    //         setTimeout(() => isAnimating = false, 500); // Скидаємо прапор після завершення анімації
    //     }
    // };
    
    // // Переміщення на попередній слайд
    // const prevSlide = () => {
    //     if (isAnimating) return; // Уникаємо накладання анімацій
    //     isAnimating = true; // Встановлюємо прапор анімації
    //     left -= slideWidth; // Зменшуємо позицію
    
    //     updatePosition(); // Оновлюємо положення
    
    //     // Якщо досягли початку, переносимо на кінець
    //     if (left <= 0) {
    //         setTimeout(() => {
    //             left = slideBlock.scrollWidth - 2 * slideWidth; // Позиція перед останнім слайдом
    //             updatePosition(false); // Без анімації
    //             isAnimating = false; // Скидаємо прапор анімації
    //         }, 500);
    //     } else {
    //         setTimeout(() => isAnimating = false, 500); // Скидаємо прапор після завершення анімації
    //     }
    // };
    
    // // // Підтримка свайпів на мобільних пристроях
    // // let startX = 0; // Початкова точка свайпу
    // // let endX = 0; // Кінцева точка свайпу
    
    // // slider.addEventListener('touchstart', (e) => {
    // //     startX = e.touches[0].clientX; // Зберігаємо початкову координату
    // // });
    
    // // slider.addEventListener('touchmove', (e) => {
    // //     endX = e.touches[0].clientX; // Зберігаємо кінцеву координату
    // // });
    
    // // slider.addEventListener('touchend', () => {
    // //     if (isAnimating) return; // Перевірка анімації
    
    // //     if (startX - endX > 50) nextSlide(); // Якщо свайп вліво
    // //     if (endX - startX > 50) prevSlide(); // Якщо свайп вправо
    // // });
    
    // // Керування через кнопки
    // const arrowNext = document.querySelector('.arrow-next'); // Кнопка наступного слайда
    // const arrowPrev = document.querySelector('.arrow-prev'); // Кнопка попереднього слайда
    
    // arrowNext.addEventListener('click', nextSlide);
    // arrowPrev.addEventListener('click', prevSlide);
    
    // // Перевірка після завантаження сторінки
    // document.addEventListener('DOMContentLoaded', () => {
    //     if (slides.length === 0) {
    //         console.warn("Слайди не знайдено. Перевірте правильність розмітки.");
    //     }
    //     updateDimensions(); // Ініціалізація розмірів
    // });


    
    

});
