document.addEventListener("DOMContentLoaded", function() {
    const title = "BiblioMart";
    const titleElement = document.getElementById("title");
    const subtitleElement = document.getElementById("subtitle");
    const buttonsSection = document.querySelector(".sec");

    const subtitleText = "Buy and sell new or used books with ease on our platform. Find the books you've been searching for or make some extra cash by selling your own.";

    function animateText(text, element, delay, callback) {
        let index = 0;
        function addLetter() {
            if (index < text.length) {
                const span = document.createElement("span");
                span.textContent = text[index];
                element.appendChild(span);
                index++;
                setTimeout(addLetter, delay);
            } else if (callback) {
                callback();
            }
        }
        addLetter();
    }

    function showSubtitleAndButtons() {
        subtitleElement.textContent = subtitleText;
        subtitleElement.style.display = "block";
        buttonsSection.style.display = "flex";
    }

    animateText(title, titleElement, 100, showSubtitleAndButtons);
});
