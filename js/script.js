class LottieController {
    constructor(containerSelector, animationPath) {
        this.container = document.querySelector(containerSelector);
        this.isFirstPlayed = false; 
        this.isCurrentlyPlaying = false; 

        if (!this.container) return;

        this.animation = lottie.loadAnimation({
            container: this.container,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: animationPath
        });

        this.animation.addEventListener('DOMLoaded', () => {
            this.animation.onComplete = () => {
                this.isCurrentlyPlaying = false;
            };
            
            this.animation.onEnterFrame = (e) => {
                if (e.currentTime > 0) this.isCurrentlyPlaying = true;
            };

            this.initObserver();
            // this.initInteractions();
            this.checkVisibilityOnLoad();
        });
    }

    initObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isFirstPlayed) {
                    this.playWithFlag();
                }
            });
        }, { threshold: 0.9 });
        observer.observe(this.container);
    }

    checkVisibilityOnLoad() {
        setTimeout(() => {
            if (this.isFirstPlayed) return;
            const rect = this.container.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                this.playWithFlag();
            }
        }, 100);
    }

    playWithFlag() {
        if (this.animation && !this.isFirstPlayed) {
            this.isFirstPlayed = true;
            this.isCurrentlyPlaying = true;
///////////////////////////////////////////////////////////////////////////////
        
///////////////////////////////////////////////////////////////////////////////
            this.animation.play();
        }
    }

    forcePlay() {
        if (this.isCurrentlyPlaying) return;

        if (this.animation) {
            this.isCurrentlyPlaying = true;
            this.animation.goToAndPlay(0, true);
        }
    }
}




// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener("DOMContentLoaded", function () {


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        // Захист від критичної помилки: ігноруємо пусті посилання (заглушки)
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            e.preventDefault();

            // Читаємо висоту хедера (працює як і в тебе)
            const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 50;
            
            // Надійний прорахунок позиції відносно початку ВСЬОГО документа
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: targetPosition - headerHeight,
                behavior: 'smooth' // Віддаємо роботу нативному движку браузера
            });
        }
    });
});
      
// робота з відкриваючими блоками...................................................................................................................
function itemsControl() {
    const coll = document.querySelectorAll('.item');
    if (coll.length === 0) return;

    // 1. Повертаємо твою надійну логіку кліків (трохи коротше через forEach)
    coll.forEach(item => {
        const title = item.querySelector('.item-btn');
        const content = item.querySelector('.item-info');
        const image = item.querySelector('.img-rotate');

        if (title && content) {
            title.addEventListener('click', function () {
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                    if (image) image.classList.remove('rotated');
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    if (image) image.classList.add('rotated');
                }
            });
        }
    });

    // 2. Оптимізуємо ТІЛЬКИ ресайз (тепер він не спамить 60 разів на секунду)
    let resizeTimeout;
    window.addEventListener('resize', function () {
        // Скасовуємо попередній виклик, якщо користувач все ще крутить екран
        clearTimeout(resizeTimeout);
        
        // Запускаємо перерахунок висоти лише через 150мс після зупинки ресайзу
        resizeTimeout = setTimeout(() => {
            coll.forEach(item => {
                const content = item.querySelector('.item-info');
                // Оновлюємо висоту тільки для відкритих елементів
                if (content && content.style.maxHeight) {
                    // Спочатку скидаємо висоту, щоб отримати актуальний scrollHeight
                    content.style.maxHeight = 'none'; 
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        }, 150);
    });
}

// Запускаємо миттєво, як у твоєму оригіналі
itemsControl();

//ПОПАП ...................................................................................................................
const body = document.body;
const openPopupBtns = document.querySelectorAll(".openPopup");
const popupOverlay = document.getElementById("popupOverlay");
const closePopupBtn = document.querySelector(".closePopup");

const popupTitle = popupOverlay.querySelector(".popup__title");
const popupWraper = popupOverlay.querySelector(".popup__wraper");

let lastClickedButton = null;
let isAnimating = false; // Захист від багів при швидкому спамі кліками

openPopupBtns.forEach(button => {
    button.addEventListener("click", function () {
        if (isAnimating) return; // Ігноруємо кліки, поки йде анімація
        lastClickedButton = button;

        const targetId = button.getAttribute("data-target");
        const sourceContent = document.getElementById(targetId);

        // --- 1. ПІДГОТОВКА (Читаємо координати кнопки та контент) ---
        const buttonRect = button.getBoundingClientRect();
        let newTitle = "";
        let newBody = "";

        if (sourceContent) {
            const titleEl = sourceContent.querySelector(".popup-custom-title");
            const bodyEl = sourceContent.querySelector(".popup-custom-body");
            if (titleEl) newTitle = titleEl.innerHTML;
            if (bodyEl) newBody = bodyEl.innerHTML;
        }

        // --- 2. ФАЗА ІНІЦІАЛІЗАЦІЇ (Змінюємо DOM та готуємо попап) ---
        requestAnimationFrame(() => {
            if (newTitle) popupTitle.innerHTML = newTitle;
            if (newBody) popupWraper.innerHTML = newBody;

            // Відключаємо транзишн, ставимо scale(0) і show
            popupOverlay.style.transition = "none";
            popupOverlay.style.transform = `scale(0)`;
            popupOverlay.classList.add("show");

            // --- 3. ФАЗА РОЗРАХУНКУ ТА СТАРТУ (в наступному кадрі) ---
            requestAnimationFrame(() => {
                const winWidth = window.innerWidth;
                const winHeight = window.innerHeight;
                const popupWidth = popupOverlay.offsetWidth;
                const popupHeight = popupOverlay.offsetHeight;

                // Вираховуємо фінальну позицію (центр екрану)
                const endX = winWidth / 2 - popupWidth / 2;
                const endY = winHeight / 2 - popupHeight / 2;

                // Ставимо попап над кнопкою у розмірі scale(0), використовуючи translate3d для GPU
                const startX = buttonRect.left + buttonRect.width / 2 - popupWidth / 2;
                const startY = buttonRect.top + buttonRect.height / 2 - popupHeight / 2;
                popupOverlay.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(0)`;

                // Даємо браузеру один кадр на застосування стилів...
                requestAnimationFrame(() => {
                    isAnimating = true;

                    // --- 4. ФАЗА ПОЛЬОТУ (точно як у твоєму оригіналі) ---
                    // Повертаємо твій transition: 0.3s ease-out
                    popupOverlay.style.transition = "transform 0.3s ease-out";
                    // І летимо в центр, ростучи до scale(1)
                    popupOverlay.style.transform = `translate3d(${endX}px, ${endY}px, 0) scale(1)`;

                    body.classList.add('stop-scrolling');

                    // Знімаємо блок після завершення анімації
                    popupOverlay.addEventListener('transitionend', function handler(e) {
                        if (e.target !== popupOverlay) return;
                        isAnimating = false;
                        popupOverlay.removeEventListener('transitionend', handler);
                    });
                });
            });
        });
    });
});

// Обробник закриття: делегуємо події на overlay та хрестик
popupOverlay.addEventListener("click", function (event) {
    if (event.target === popupOverlay || event.target.closest('.closePopup')) {
        closePopup();
    }
});

function closePopup() {
    if (!lastClickedButton || isAnimating) return;
    isAnimating = true;

    // --- 1. ФАЗА ЧИТАННЯ ---
    const buttonRect = lastClickedButton.getBoundingClientRect();
    const popupWidth = popupOverlay.offsetWidth;
    const popupHeight = popupOverlay.offsetHeight;

    const endX = buttonRect.left + buttonRect.width / 2 - popupWidth / 2;
    const endY = buttonRect.top + buttonRect.height / 2 - popupHeight / 2;

    // --- 2. ФАЗА ЗАПИСУ ---
    requestAnimationFrame(() => {
        // Анімація закриття теж використовує ease-out
        popupOverlay.style.transition = "transform 0.3s ease-out";
        popupOverlay.style.transform = `translate3d(${endX}px, ${endY}px, 0) scale(0)`;

        // Очищення після приземлення попапу
        popupOverlay.addEventListener('transitionend', function handler(e) {
            if (e.target !== popupOverlay) return;
            
            popupOverlay.classList.remove("show");
            body.classList.remove('stop-scrolling');
            
            // Скидаємо стилі, щоб не конфліктували при наступному відкритті
            popupOverlay.style.transition = "none";
            
            lastClickedButton = null;
            isAnimating = false;
            popupOverlay.removeEventListener('transitionend', handler);
        });
    });
}



// /////////////////////////////////////////////////////////////////////////

     const headerAnim = new LottieController('#webdog', '../asset/lottie/webdogs.json');

    const experienceAnim = new LottieController('#jobdog', '../asset/lottie/exp.json');
    const skillsAnim = new LottieController('#thanosdog', '../asset/lottie/skill.json');



    
});
