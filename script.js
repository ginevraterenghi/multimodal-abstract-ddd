/* =========================================
   MATERIALITIES OF AI
   MULTIMODAL ABSTRACT

   IMPORTANT:
   All text, media, references, colours,
   and formatting are defined in index.html.

   This JavaScript controls only:
   - Responsive text fitting
   - Media previews
   - Mouse interactions
   - Touch interactions
   - Window resizing

   It never replaces the HTML content.
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const abstract = document.getElementById('abstract');
const preview = document.getElementById('preview');
const stage = document.querySelector('.stage');

const visualMedia = abstract.querySelectorAll('.visual');


/* =========================================
   SETTINGS
========================================= */

const MOBILE_BREAKPOINT = 700;

const MIN_FONT = 12;
const MAX_FONT = 48;

const MAX_TEXT_WIDTH = 1800;

const FIT_ITERATIONS = 20;


/* =========================================
   RESPONSIVE ABSTRACT FITTING

   Desktop:
   Find the largest font size that fits
   within the available screen.

   Mobile:
   Use CSS typography and natural scrolling.
========================================= */

function fitAbstract() {

    /* -------------------------------------
       MOBILE
    ------------------------------------- */

    if (window.innerWidth <= MOBILE_BREAKPOINT) {

        abstract.style.fontSize = '';
        abstract.style.width = '';
        abstract.style.maxWidth = '';

        abstract.classList.add('ready');

        return;
    }


    /* -------------------------------------
       AVAILABLE SPACE
    ------------------------------------- */

    const stageStyles = getComputedStyle(stage);

    const paddingLeft = parseFloat(stageStyles.paddingLeft);
    const paddingRight = parseFloat(stageStyles.paddingRight);

    const paddingTop = parseFloat(stageStyles.paddingTop);
    const paddingBottom = parseFloat(stageStyles.paddingBottom);

    const availableWidth =
        stage.clientWidth -
        paddingLeft -
        paddingRight;

    const availableHeight =
        stage.clientHeight -
        paddingTop -
        paddingBottom;


    /* -------------------------------------
       PREVENT INVALID MEASUREMENTS
    ------------------------------------- */

    if (availableWidth <= 0 || availableHeight <= 0) {
        return;
    }


    /* -------------------------------------
       TEST DIFFERENT TEXT WIDTHS
    ------------------------------------- */

    const widthRatios = [
        1.00,
        0.95,
        0.90,
        0.85,
        0.80,
        0.75,
        0.70,
        0.65,
        0.60,
        0.55,
        0.50
    ];


    let bestFont = 0;
    let bestWidth = Math.min(
        availableWidth,
        MAX_TEXT_WIDTH
    );


    /* -------------------------------------
       FIND BEST FONT SIZE
    ------------------------------------- */

    widthRatios.forEach(ratio => {

        const testWidth = Math.min(
            availableWidth * ratio,
            MAX_TEXT_WIDTH
        );

        abstract.style.width = `${testWidth}px`;
        abstract.style.maxWidth = 'none';

        let low = MIN_FONT;
        let high = MAX_FONT;


        /* Binary search */

        for (let i = 0; i < FIT_ITERATIONS; i++) {

            const mid = (low + high) / 2;

            abstract.style.fontSize = `${mid}px`;

            /*
               Measure the natural height
               of the complete abstract.
            */

            const actualHeight =
                abstract.getBoundingClientRect().height;

            const actualWidth =
                abstract.scrollWidth;

            const fitsHeight =
                actualHeight <= availableHeight;

            const fitsWidth =
                actualWidth <= testWidth + 1;


            if (fitsHeight && fitsWidth) {

                low = mid;

            } else {

                high = mid;

            }

        }


        /* ---------------------------------
           SAVE BEST COMBINATION
        --------------------------------- */

        if (low > bestFont) {

            bestFont = low;
            bestWidth = testWidth;

        }

    });


    /* -------------------------------------
       APPLY FINAL DIMENSIONS
    ------------------------------------- */

    abstract.style.width = `${bestWidth}px`;

    abstract.style.maxWidth = 'none';

    abstract.style.fontSize =
        `${Math.max(MIN_FONT, bestFont - 0.3)}px`;


    /* -------------------------------------
       REVEAL ABSTRACT
    ------------------------------------- */

    abstract.classList.add('ready');

}


/* =========================================
   MEDIA PREVIEW
========================================= */

let activeMedia = null;


/* =========================================
   SHOW PREVIEW
========================================= */

function showPreview(element) {

    /*
       Disable hover previews on mobile.
       Mobile users can interact directly
       with media links.
    */

    if (window.innerWidth <= MOBILE_BREAKPOINT) {
        return;
    }


    activeMedia = element;

    preview.replaceChildren();


    /* Find original image or video */

    const original = element.querySelector('img, video');

    if (!original) {
        return;
    }


    /* Clone media */

    const clone = original.cloneNode(true);


    /* Configure video preview */

    if (clone.tagName === 'VIDEO') {

        clone.muted = true;
        clone.autoplay = true;
        clone.loop = true;
        clone.playsInline = true;

    }


    /* Insert preview */

    preview.appendChild(clone);

    preview.classList.add('active');


    /* Start video playback */

    if (clone.tagName === 'VIDEO') {

        clone.play().catch(() => { });

    }

}


/* =========================================
   HIDE PREVIEW
========================================= */

function hidePreview() {

    activeMedia = null;

    preview.classList.remove('active');

    preview.replaceChildren();

}


/* =========================================
   MOUSE AND KEYBOARD INTERACTIONS
========================================= */

visualMedia.forEach(element => {

    /* Mouse hover */

    element.addEventListener('mouseenter', () => {
        showPreview(element);
    });

    element.addEventListener('mouseleave', () => {
        hidePreview();
    });


    /* Keyboard navigation */

    element.addEventListener('focus', () => {
        showPreview(element);
    });

    element.addEventListener('blur', () => {
        hidePreview();
    });

});


/* =========================================
   TOUCH INTERACTIONS

   First tap:
   Show preview.

   Second tap:
   Follow the original source link.
========================================= */

visualMedia.forEach(element => {

    element.addEventListener('touchstart', event => {

        /*
           On mobile, allow normal
           link navigation.
        */

        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            return;
        }


        /*
           If the element has not yet
           been touched, show its preview.
        */

        if (!element.dataset.touched) {

            event.preventDefault();


            /* Reset other media */

            visualMedia.forEach(item => {
                delete item.dataset.touched;
            });


            /* Mark current media */

            element.dataset.touched = '1';


            /* Display preview */

            showPreview(element);

        }

    }, {
        passive: false
    });

});


/* =========================================
   CLOSE PREVIEW ON OUTSIDE TOUCH
========================================= */

document.addEventListener('touchstart', event => {

    if (!event.target.closest('.visual')) {

        hidePreview();

        visualMedia.forEach(element => {
            delete element.dataset.touched;
        });

    }

});


/* =========================================
   CLOSE PREVIEW WITH ESCAPE
========================================= */

document.addEventListener('keydown', event => {

    if (event.key === 'Escape') {

        hidePreview();

    }

});


/* =========================================
   INITIAL FITTING
========================================= */

/*
   The HTML already contains the complete
   abstract.

   We only calculate its dimensions.
*/

fitAbstract();


/* =========================================
   RECALCULATE AFTER PAGE LOAD
========================================= */

window.addEventListener('load', () => {

    fitAbstract();

});


/* =========================================
   RECALCULATE AFTER FONTS LOAD
========================================= */

if (document.fonts) {

    document.fonts.ready.then(() => {

        fitAbstract();

    });

}


/* =========================================
   RECALCULATE AFTER IMAGES LOAD
========================================= */

abstract.querySelectorAll('img').forEach(image => {

    if (!image.complete) {

        image.addEventListener('load', () => {

            fitAbstract();

        }, {
            once: true
        });

    }

});


/* =========================================
   RECALCULATE AFTER VIDEO METADATA LOAD
========================================= */

abstract.querySelectorAll('video').forEach(video => {

    if (video.readyState >= 1) {
        return;
    }

    video.addEventListener('loadedmetadata', () => {

        fitAbstract();

    }, {
        once: true
    });

});


/* =========================================
   WINDOW RESIZING
========================================= */

let resizeFrame = null;

window.addEventListener('resize', () => {

    /* Close active preview */

    hidePreview();


    /* Cancel previous calculation */

    if (resizeFrame) {

        cancelAnimationFrame(resizeFrame);

    }


    /* Calculate new layout */

    resizeFrame = requestAnimationFrame(() => {

        fitAbstract();

    });

});


/* =========================================
   END
========================================= */