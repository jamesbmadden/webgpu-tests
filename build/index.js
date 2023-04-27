"use strict";
console.log('test');
const frame = document.querySelector('iframe') || document.createElement('iframe');
// establish the click action of each item on the navbar
document.querySelectorAll('li').forEach(link => {
    // attach a click listener
    link.addEventListener('click', () => {
        var _a;
        // set the frame's src to the link's data-href attribute
        frame.src = link.getAttribute('data-href') || '';
        // switch the active link
        (_a = document.querySelector('.selected')) === null || _a === void 0 ? void 0 : _a.classList.remove('selected');
        link.classList.add('selected');
    });
});
