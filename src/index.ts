console.log('test');

const frame = document.querySelector('iframe') || document.createElement('iframe');

// establish the click action of each item on the navbar
document.querySelectorAll('li').forEach(link => {

  // attach a click listener
  link.addEventListener('click', () => {
    // set the frame's src to the link's data-href attribute
    frame.src = link.getAttribute('data-href') || '';
    // switch the active link
    document.querySelector('.selected')?.classList.remove('selected');
    link.classList.add('selected');
  });

});