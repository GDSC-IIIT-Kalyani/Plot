let plot;

// on window load
window.addEventListener("load", () => {
  plot = new PlotApp();
});

// on window resize
window.addEventListener("resize", () => {
  plot.resizeCanvas();
});
