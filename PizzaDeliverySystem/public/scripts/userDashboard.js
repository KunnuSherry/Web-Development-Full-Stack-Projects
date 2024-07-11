let slides = document.querySelectorAll("img");
let length = slides.length;
let count = 0;
let ctr = 0;
function slider() {
  slides[count].classList.remove("active");
  count = [count + 1] % length;
  slides[count].classList.add("active");
}
setInterval(slider, 4000);

let text = document.querySelector('.text1');
function blink(){
    if(text.classList.contains('active')){
        text.classList.remove('active');
    }
    else{
        text.classList.add('active')
    }
}
setInterval(blink,100)