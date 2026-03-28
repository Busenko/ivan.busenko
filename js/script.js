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
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 50;
            window.scrollTo({
                top: targetElement.offsetTop - headerHeight,
                behavior: 'smooth'
            });
        }
    });
});
      
// робота з відкриваючими блоками...................................................................................................................
    function itemsControl() {
        const coll = document.getElementsByClassName('item');
        if (coll.length > 0) {
            for (let i = 0; i < coll.length; i++) {
                const title = coll[i].querySelector('.item-btn');
                if (title) {
                    title.addEventListener('click', function () {
                        let content = coll[i].querySelector('.item-info');
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
                    const content = coll[i].querySelector('.item-info');
                    if (content && content.style.maxHeight) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                }
            });
        }
    }
    
    itemsControl();


//ПОПАП ...................................................................................................................
const body = document.querySelector('body');
const openPopupBtns = document.querySelectorAll(".openPopup");
const popupOverlay = document.getElementById("popupOverlay");
const closePopupBtn = document.querySelector(".closePopup");
let lastClickedButton = null;

const popupTitle = popupOverlay.querySelector(".popup__title");
const popupWraper = popupOverlay.querySelector(".popup__wraper");



openPopupBtns.forEach(button => {
    button.addEventListener("click", function () {
        lastClickedButton = button;

        const targetId = button.getAttribute("data-target");
        const sourceContent = document.getElementById(targetId);

        if (sourceContent) {
            const newTitle = sourceContent.querySelector(".popup-custom-title").innerHTML;
            const newBody = sourceContent.querySelector(".popup-custom-body").innerHTML;

            popupTitle.innerHTML = newTitle;
            popupWraper.innerHTML = newBody;
        }
        const buttonRect = button.getBoundingClientRect();
        const popupWidth = popupOverlay.offsetWidth;
        const popupHeight = popupOverlay.offsetHeight;

        popupOverlay.style.transition = "none";
        popupOverlay.style.transform = `translate(${buttonRect.left + buttonRect.width / 2 - popupWidth / 2}px, ${buttonRect.top + buttonRect.height / 2 - popupHeight / 2}px) scale(0)`;
        
        popupOverlay.classList.add("show");
        
        setTimeout(() => {
            popupOverlay.style.transition = "transform 0.3s ease-out";
            popupOverlay.style.transform = `translate(${window.innerWidth / 2 - popupWidth / 2}px, ${window.innerHeight / 2 - popupHeight / 2}px) scale(1)`;
        }, 10);

        body.classList.add('stop-scrolling');
    });
});

popupOverlay.addEventListener("click", function (event) {
    if (event.target === popupOverlay) {
        closePopup();
    }
});

closePopupBtn.addEventListener("click", closePopup);

function closePopup() {
    if (!lastClickedButton) return;

    const buttonRect = lastClickedButton.getBoundingClientRect();

    popupOverlay.style.transform = `translate(${buttonRect.left + buttonRect.width / 2 - popupOverlay.offsetWidth / 2}px, ${buttonRect.top + buttonRect.height / 2 - popupOverlay.offsetHeight / 2}px) scale(0)`;

    setTimeout(() => {
        popupOverlay.classList.remove("show");
        body.classList.remove('stop-scrolling');
        lastClickedButton = null;
    }, 300);
}


////////////////////////////////////////////////////////////////////////////

function ItemOpen() {
    const tabs = document.querySelectorAll('.tab-btn');
    const columns = document.querySelectorAll('.column');

   
    if (window.innerWidth <= 1024) {
        document.getElementById('design').classList.add('active');
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetId = this.getAttribute('data-show');

      
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

     
            columns.forEach(col => {
                col.classList.remove('active');
                if (col.id === targetId) {
                    col.classList.add('active');
                }
            });
        });
    });
};

ItemOpen();
// /////////////////////////////////////////////////////////////////////////

     const headerAnim = new LottieController('#webdog', 'asset/lottie/webdogs.json');

    const experienceAnim = new LottieController('#jobdog', 'asset/lottie/exp.json');
    const skillsAnim = new LottieController('#thanosdog', 'asset/lottie/skill.json');



    
});
