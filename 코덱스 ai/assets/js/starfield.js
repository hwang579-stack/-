(function () {
  "use strict";

  const canvas = document.getElementById("starfield");
  const context = canvas.getContext("2d");
  const stars = [];
  const starCount = 140;
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function createStars() {
    stars.length = 0;
    for (let index = 0; index < starCount; index += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.7 + 0.25,
        speed: Math.random() * 0.22 + 0.04,
        alpha: Math.random() * 0.7 + 0.25
      });
    }
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(255,255,255,0.9)";

    stars.forEach((star) => {
      star.y += star.speed;
      if (star.y > height + 4) {
        star.y = -4;
        star.x = Math.random() * width;
      }

      context.globalAlpha = star.alpha;
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    });

    context.globalAlpha = 1;
    animationFrame = window.requestAnimationFrame(draw);
  }

  function reset() {
    window.cancelAnimationFrame(animationFrame);
    resize();
    createStars();
    draw();
  }

  window.addEventListener("resize", reset);
  reset();
})();
