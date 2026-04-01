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

            this.initInteractions();

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

    initInteractions() {
       
        this.container.addEventListener('click', () => {
          
            if (this.isCurrentlyPlaying) return;

            if (this.animation) {
                this.isCurrentlyPlaying = true;
                this.animation.goToAndPlay(0, true);
            }
        });
    }
}




// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener("DOMContentLoaded", function () {


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

      
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            e.preventDefault();

            const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 50;
          
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: targetPosition - headerHeight,
                behavior: 'smooth'
            });
        }
    });
});
      
// робота з відкриваючими блоками...................................................................................................................
function itemsControl() {
    const coll = document.querySelectorAll('.item');
    if (coll.length === 0) return;

    coll.forEach(item => {
        const title = item.querySelector('.item-btn');
        const content = item.querySelector('.item-info');
        const image = item.querySelector('.img-rotate');

        if (title && content) {
            title.addEventListener('click', function () {
                const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

                let heightLostAbove = 0;

                coll.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherContent = otherItem.querySelector('.item-info');
                        const otherImage = otherItem.querySelector('.img-rotate');
                        
                        if (otherContent && otherContent.style.maxHeight && otherContent.style.maxHeight !== '0px') {
                            if (otherItem.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING) {
                                heightLostAbove += otherContent.scrollHeight;
                            }
                            otherContent.style.maxHeight = '0px';
                        }
                        
                        if (otherImage) {
                            otherImage.classList.remove('rotated');
                        }
                    }
                });

                if (!isOpen) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    if (image) image.classList.add('rotated');
                    
                    if (item.querySelector('#thanosdog') && typeof skillsAnim !== 'undefined') {
                        skillsAnim.forcePlay();
                    }

                    const headerHeight = title.offsetHeight; 
                    const contentHeight = content.scrollHeight; 
                    const finalItemHeight = headerHeight + contentHeight;
                    const currentItemTop = item.getBoundingClientRect().top + window.scrollY;
                    const futureItemTop = currentItemTop - heightLostAbove;
                    const centerPosition = futureItemTop - (window.innerHeight / 2) + (finalItemHeight / 2);

                    window.scrollTo({
                        top: centerPosition,
                        behavior: 'smooth'
                    });
                } 
                else {
                    content.style.maxHeight = '0px';
                    if (image) image.classList.remove('rotated');
                }
            });
        }
    });

    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            coll.forEach(item => {
                const content = item.querySelector('.item-info');
                if (content && content.style.maxHeight && content.style.maxHeight !== '0px') {
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        }, 250);
    });
}

itemsControl();

//ПОПАП ...................................................................................................................
const body = document.body;
const openPopupBtns = document.querySelectorAll(".openPopup");
const popupOverlay = document.getElementById("popupOverlay");
const popupCard = popupOverlay.querySelector(".popup"); 

const popupTitle = popupOverlay.querySelector(".popup__title");
const popupWraper = popupOverlay.querySelector(".popup__wraper");

let lastClickedButton = null;
let isAnimating = false; 

openPopupBtns.forEach(button => {
    button.addEventListener("click", function () {
        if (isAnimating) return; 
        lastClickedButton = button;

        const targetId = button.getAttribute("data-target");
        const sourceContent = document.getElementById(targetId);

        if (sourceContent) {
            const titleEl = sourceContent.querySelector(".popup-custom-title");
            const bodyEl = sourceContent.querySelector(".popup-custom-body");
            if (titleEl) popupTitle.innerHTML = titleEl.innerHTML;
            if (bodyEl) popupWraper.innerHTML = bodyEl.innerHTML;
        }

        const btnRect = button.getBoundingClientRect();
        const startX = (btnRect.left + btnRect.width / 2) - (window.innerWidth / 2);
        const startY = (btnRect.top + btnRect.height / 2) - (window.innerHeight / 2);

        // 1. Миттєво, БЕЗ анімації, ховаємо картку в кнопку
        popupCard.style.transition = "none";
        popupCard.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(0)`;
        
        // 2. Показуємо оверлей
        popupOverlay.classList.add("show");
        body.classList.add('stop-scrolling');

         
        setTimeout(() => {
            isAnimating = true;
            
            
            popupCard.style.transition = "transform 0.5s ease-out";
            popupCard.style.transform = `translate3d(0px, 0px, 0) scale(1)`;

            const onEnd = (e) => {
                if (e.target !== popupCard) return;
                isAnimating = false;
                popupCard.removeEventListener('transitionend', onEnd);
            };
            popupCard.addEventListener('transitionend', onEnd);
        }, 30);
    });
});

popupOverlay.addEventListener("click", function (event) {
    if (event.target === popupOverlay || event.target.closest('.closePopup')) {
        closePopup();
    }
});

function closePopup() {
    if (!lastClickedButton || isAnimating) return;
    isAnimating = true;

    const btnRect = lastClickedButton.getBoundingClientRect();
    const endX = (btnRect.left + btnRect.width / 2) - (window.innerWidth / 2);
    const endY = (btnRect.top + btnRect.height / 2) - (window.innerHeight / 2);

    // Ховаємо картку назад у кнопку
    popupCard.style.transition = "transform 0.3s ease-out";
    popupCard.style.transform = `translate3d(${endX}px, ${endY}px, 0) scale(0)`;
    
    // Ховаємо розмитий фон
    popupOverlay.classList.remove("show");

    const onEnd = (e) => {
        if (e.target !== popupCard) return;
        
        body.classList.remove('stop-scrolling');
        lastClickedButton = null;
        isAnimating = false;
        popupCard.removeEventListener('transitionend', onEnd);
    };
    popupCard.addEventListener('transitionend', onEnd);
}


// ..............................................................................................Сервіси
function autoSelectService() {
    const orderLinks = document.querySelectorAll('.link-btn[href="#form-point"]');
    const serviceGroup = document.querySelector('#serviceGroup');

    orderLinks.forEach(link => {
        link.addEventListener('click', function () {
            const serviceName = this.getAttribute('data-service');
            
            if (serviceName) {
                const radioToSelect = document.querySelector(`#service-${serviceName}`);
                
                if (radioToSelect) {
                    radioToSelect.checked = true;
                    
                  
                    if (serviceGroup) {
                        serviceGroup.classList.remove('error');
                    }
                }
            }
        });
    });
}

autoSelectService();
// ..............................................................................................Форма
function formControl() {
    const form = document.querySelector('.form-order');
    if (!form) return;

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    const name = form.querySelector('#name');
    const company = form.querySelector('#company');
    const email = form.querySelector('#email');
    const project = form.querySelector('#project');

    const validateField = (field) => {
        let hasError = false;

        if (field.id === 'name' && field.value.trim().length < 2) hasError = true;
        if (field.id === 'company' && field.value.trim() === '') hasError = true;
        if (field.id === 'email' && !emailPattern.test(field.value.trim())) hasError = true;
        if (field.id === 'project' && field.value.trim().length < 10) hasError = true;

        if (hasError) {
            field.classList.add('error');
            return false;
        } else {
            field.classList.remove('error');
            return true;
        }
    };

    form.addEventListener('submit', function (e) {
        let isValid = true;

        if (!validateField(name)) isValid = false;
        if (!validateField(company)) isValid = false;
        if (!validateField(email)) isValid = false;
        if (!validateField(project)) isValid = false;

        if (!isValid) {
            e.preventDefault();
        }
    });

    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        
        input.addEventListener('input', function () {
            this.classList.remove('error');
        });

        input.addEventListener('blur', function () {

            if (this.value.trim() === '') {
                this.classList.remove('error'); 
                return; 
            }

            validateField(this);
        });
    });
}

formControl();
// /////////////////////////////////////////////////////////////////////////

     const headerAnim = new LottieController('#webdog', 'asset/lottie/webdogs.json');

    const experienceAnim = new LottieController('#jobdog', 'asset/lottie/exp.json');
    const skillsAnim = new LottieController('#thanosdog', 'asset/lottie/skill.json');



    
});
