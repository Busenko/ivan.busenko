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
                const isOpen = content.style.maxHeight;

  
                coll.forEach(otherItem => {
                    const otherContent = otherItem.querySelector('.item-info');
                    const otherImage = otherItem.querySelector('.img-rotate');
                    
                    if (otherContent) {
                        otherContent.style.maxHeight = null;
                    }
                    if (otherImage) {
                        otherImage.classList.remove('rotated');
                    }
                });

                
                if (!isOpen) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    if (image) image.classList.add('rotated');
                    if (item.querySelector('#thanosdog')) {
                        
                        skillsAnim.forcePlay();
                    }
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
                if (content && content.style.maxHeight) {
                    content.style.maxHeight = 'none'; 
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        }, 500);
    });
}

itemsControl();

//ПОПАП ...................................................................................................................
const body = document.body;
const openPopupBtns = document.querySelectorAll(".openPopup");
const popupOverlay = document.getElementById("popupOverlay");
const closePopupBtn = document.querySelector(".closePopup");

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

        const buttonRect = button.getBoundingClientRect();
        let newTitle = "";
        let newBody = "";

        if (sourceContent) {
            const titleEl = sourceContent.querySelector(".popup-custom-title");
            const bodyEl = sourceContent.querySelector(".popup-custom-body");
            if (titleEl) newTitle = titleEl.innerHTML;
            if (bodyEl) newBody = bodyEl.innerHTML;
        }

        requestAnimationFrame(() => {
            if (newTitle) popupTitle.innerHTML = newTitle;
            if (newBody) popupWraper.innerHTML = newBody;

            popupOverlay.style.transition = "none";
            popupOverlay.style.transform = `scale(0)`;
            popupOverlay.classList.add("show");

            requestAnimationFrame(() => {
                const winWidth = window.innerWidth;
                const winHeight = window.innerHeight;
                const popupWidth = popupOverlay.offsetWidth;
                const popupHeight = popupOverlay.offsetHeight;

                const endX = winWidth / 2 - popupWidth / 2;
                const endY = winHeight / 2 - popupHeight / 2;

                const startX = buttonRect.left + buttonRect.width / 2 - popupWidth / 2;
                const startY = buttonRect.top + buttonRect.height / 2 - popupHeight / 2;
                popupOverlay.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(0)`;

                requestAnimationFrame(() => {
                    isAnimating = true;

          
                    popupOverlay.style.transition = "transform 0.3s ease-out";
                  
                    popupOverlay.style.transform = `translate3d(${endX}px, ${endY}px, 0) scale(1)`;

                    body.classList.add('stop-scrolling');

                    
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

popupOverlay.addEventListener("click", function (event) {
    if (event.target === popupOverlay || event.target.closest('.closePopup')) {
        closePopup();
    }
});

function closePopup() {
    if (!lastClickedButton || isAnimating) return;
    isAnimating = true;


    const buttonRect = lastClickedButton.getBoundingClientRect();
    const popupWidth = popupOverlay.offsetWidth;
    const popupHeight = popupOverlay.offsetHeight;

    const endX = buttonRect.left + buttonRect.width / 2 - popupWidth / 2;
    const endY = buttonRect.top + buttonRect.height / 2 - popupHeight / 2;


    requestAnimationFrame(() => {

        popupOverlay.style.transition = "transform 0.3s ease-out";
        popupOverlay.style.transform = `translate3d(${endX}px, ${endY}px, 0) scale(0)`;


        popupOverlay.addEventListener('transitionend', function handler(e) {
            if (e.target !== popupOverlay) return;
            
            popupOverlay.classList.remove("show");
            body.classList.remove('stop-scrolling');
            
        
            popupOverlay.style.transition = "none";
            
            lastClickedButton = null;
            isAnimating = false;
            popupOverlay.removeEventListener('transitionend', handler);
        });
    });
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
