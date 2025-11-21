// Filter Buttons
const buttons = document.querySelectorAll(".btn");
const cards = document.querySelectorAll(".card");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".active").classList.remove("active");
    btn.classList.add("active");

    const filter = btn.getAttribute("data-filter");
    cards.forEach(card => {
      const category = card.getAttribute("data-category");

      if (filter === "all" || filter === category) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});

// Lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const closeBtn = document.getElementById("closeBtn");

cards.forEach(card => {
  card.addEventListener("click", () => {
    const img = card.querySelector("img").src;
    const caption = card.querySelector("p").innerText;

    lightboxImg.src = img;
    lightboxCaption.innerText = caption;

    lightbox.style.display = "flex";
  });
});

closeBtn.addEventListener("click", () => {
  lightbox.style.display = "none";
});
