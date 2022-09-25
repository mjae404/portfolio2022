// 링크 클릭시 부드럽게 이동
const links = document.querySelectorAll(".anchor_link");

for (const link of links) {
    link.addEventListener("click", clickHandler);
}

function clickHandler(e) {
    e.preventDefault();
    const href = this.getAttribute("href");
    const offsetTop = document.querySelector(href).offsetTop;

    scroll({
        top: offsetTop,
        behavior: "smooth"
    });
};

// 스크롤시 클래스 추가
function posY(elm) {
    var test = elm,
        top = 0;

    while (!!test && test.tagName.toLowerCase() !== "body") {
        top += test.offsetTop;
        test = test.offsetParent;
    }

    return top;
}

function viewPortHeight() {
    var de = document.documentElement;

    if (!!window.innerWidth) {
        return window.innerHeight;
    } else if (de && !isNaN(de.clientHeight)) {
        return de.clientHeight;
    }

    return 0;
}

function scrollNumber() {
    if (window.pageYOffset) {
        return window.pageYOffset;
    }
    return Math.max(document.documentElement.scrollTop, document.body.scrollTop);
}

function checkVisible(elm, eval) {
    eval = eval || "visible";
    var vpH = viewPortHeight(), // Viewport Height
        st = scrollNumber(), // Scroll Top
        y = posY(elm),
        elementHeight = elm.offsetHeight;

    if (eval == "visible") return ((y < (vpH + st)) && (y > (st - elementHeight)));
    if (eval == "above") return ((y < (vpH + st)));
}

let sectionsVisible = '';

var goTopButton = document.getElementById("topButton");
function scrollFunction() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        goTopButton.style.opacity = "1";
        goTopButton.style.zIndex = "50";
    } else {
        goTopButton.style.opacity = "0";
        goTopButton.style.zIndex = "-1";
    }
}

const onscroll = function(e) {
    let visualTitle = document.querySelectorAll('.main_visual_title');
    for (let title of visualTitle) {
        const isVisible = checkVisible(title);
        title.classList.toggle('animate', isVisible);
    }

    let texts = document.querySelectorAll('.main_image');
    for (let test of texts) {
        const isVisible = checkVisible(test);
        test.classList.toggle('animate', isVisible);
    }

    let titles = document.querySelectorAll('.section_title');
    for (let title of titles) {
        const isVisible = checkVisible(title);
        title.classList.toggle('animate', isVisible);
    }

    scrollFunction();
};

window.onscroll = onscroll;
onscroll();

goTopButton.addEventListener('click',(e)=>{
    window.scrollTo({top: 0, behavior: 'smooth'});
})


// 모바일 메뉴
const navButton = document.getElementById('navButton');
const navArea = document.getElementById('headerNav');
const dimmed = document.getElementById('dimmed');
const closeButton = document.getElementById('closeButton');
const body = document.getElementById('body');

function layerOpen(e){
    navArea.classList.add('on');
    body.classList.add('hidden');
}

function layerClose(e){
    navArea.classList.remove('on');
    body.classList.remove('hidden');
}

navButton.addEventListener("click", layerOpen);
dimmed.addEventListener("click", layerClose);
closeButton.addEventListener("click", layerClose);

// PC 메뉴
var section = document.getElementsByClassName("area");
var navLink = document.querySelectorAll(".header_nav_item");
var pageNum = 0;
var totalNum = section.length;

window.addEventListener("scroll", function (event) {
    var scroll = this.scrollY;

    for (var i = 0; i < totalNum; i++) {
        if (scroll > section[i].offsetTop - window.outerHeight / 1.5 && scroll < section[i].offsetTop - window.outerHeight / 1.5 + section[i].offsetHeight) {
            pageNum = i;
            break;
        }
    }
    pageChangeFunc();
});

function pageChangeFunc() {
    for (var i = 0; i < totalNum; i++) {
        section[i].classList.remove("active");
        navLink[i].classList.remove("active");
    }
    section[pageNum].classList.add("active");
    navLink[pageNum].classList.add("active");
}

pageChangeFunc();

// 모달 토글 및 모달 active시 포커스를 모달 내부에만 한정
const addButtonTrigger = (el) => {
    el.addEventListener('click', () => {
        const popupEl = document.querySelector(`.${el.dataset.for}`);
        const target = el.closest('.main_gallery_item');
        popupEl.classList.toggle('on');
        target.classList.toggle('on');
        body.classList.toggle('hidden');

        const focusedElementBeforeModal = document.activeElement;
        popupEl.addEventListener('keydown', trapTabKey);

        const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
        let focusableElements = popupEl.querySelectorAll(focusableElementsString);
        focusableElements = Array.prototype.slice.call(focusableElements);

        let firstTabStop = focusableElements[0];
        let lastTabStop = focusableElements[focusableElements.length - 1];

        firstTabStop.focus();

        function trapTabKey(e) {
            if (e.keyCode === 9) {
                if (e.shiftKey) {
                    if (document.activeElement === firstTabStop) {
                        e.preventDefault();
                        lastTabStop.focus();
                    }
                } else {
                    if (document.activeElement === lastTabStop) {
                        e.preventDefault();
                        firstTabStop.focus();
                    }
                }
            }
            if (e.keyCode === 27) {
                popupClose();
            }
        }
    });
};

Array.from(document.querySelectorAll('button[data-for]')).forEach(addButtonTrigger);

// 모바일에서 100vh일 시 가려지는 이슈
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});

// webp 호환되지 않는 브라우저 반영
function WebpIsSupported(callback){
    if(!window.createImageBitmap){
        callback(false);
        return;
    }

    var webpdata = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v3AgAA=';

    // Retrieve the Image in Blob Format
    fetch(webpdata).then(function(response){
        return response.blob();
    }).then(function(blob){
        createImageBitmap(blob).then(function(){
            callback(true);
        }, function(){
            callback(false);
        });
    });
}

window.onload = () => {
    WebpIsSupported((isSupportWebP) => {
        if (!isSupportWebP) {
            const imageWrap = document.querySelectorAll('.main_image');
            const workButton = document.querySelectorAll('.main_gallery_link');

            for (var i = 0; i < imageWrap.length; i++) {
                imageWrap[i].classList.remove('support_webp');
            }
            for (var i = 0; i < workButton.length; i++) {
                workButton[i].classList.remove('support_webp');
            }
        }
    });
}