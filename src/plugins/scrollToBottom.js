export default (element, duration) => {
    if (!element) {
        return;
    }
    let target = element.scrollHeight;
    target = Math.round(target);
    duration = Math.round(duration);
    if (duration < 0) {
        return false;
    }
    if (duration === 0) {
        element.scrollTop = target;
        return true;
    }

    let start_time = Date.now();
    let end_time = start_time + duration;

    let start_top = element.scrollTop;
    let distance = target - start_top;

    // based on http://en.wikipedia.org/wiki/Smoothstep
    let smooth_step = function (start, end, point) {
        if (point <= start) {
            return 0;
        }
        if (point >= end) {
            return 1;
        }
        let x = (point - start) / (end - start); // interpolation
        return x * x * (3 - 2 * x);
    };

    // This is to keep track of where the element's scrollTop is
    // supposed to be, based on what we're doing
    let previous_top = element.scrollTop;

    // This is like a think function from a game loop
    let scroll_frame = function () {
        if (element.scrollTop !== previous_top) {
            return false;
        }

        // set the scrollTop for this frame
        let now = Date.now();
        let point = smooth_step(start_time, end_time, now);
        let frameTop = Math.round(start_top + (distance * point));
        element.scrollTop = frameTop;

        // check if we're done!
        if (now >= end_time) {
            return true;
        }

        // If we were supposed to scroll but didn't, then we
        // probably hit the limit, so consider it done; not
        // interrupted.
        if (element.scrollTop === previous_top && element.scrollTop !== frameTop) {
            return true;
        }
        previous_top = element.scrollTop;

        // schedule next frame for execution
        setTimeout(scroll_frame, 0);
    };
    // boostrap the animation process
    setTimeout(scroll_frame, 0);
};
