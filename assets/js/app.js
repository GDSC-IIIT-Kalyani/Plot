/*
Author: chankruze (chankruze@gmail.com)
Created: Sun Oct 09 2022 22:19:55 GMT+0530 (India Standard Time)

Copyright (c) geekofia 2022 and beyond
*/

class PlotApp {
  constructor() {
    this.mount();
    this.setup();
    this.hookEventListeners();
  }

  // mount elements
  mount() {
    /***********
     * actions
     ***********/
    // clear canvas
    this.clearCanvas = document.querySelector("#clear-canvas");
    // save
    this.saveCanvas = document.querySelector("#save-canvas");
    // thickness slider
    this.brushWidthSlider = document.querySelector("#brush-width-slider");
    // color picker
    this.colorPicker = document.querySelector("#color-picker");

    /***********
     * tools
     ***********/
    this.toolBtns = document.querySelectorAll(".tool");
    this.fillColor = document.querySelector("#bucket");
    this.colorBtns = document.querySelectorAll(".color");

    /***********
     * art-board
     ***********/
    this.canvas = document.querySelector("canvas");
  }

  setup() {
    this.prevMouseX;
    this.prevMouseY;
    this.snapshot;
    this.isDrawing = false;
    this.selectedTool = "pencil";
    this.brushWidth = this.brushWidthSlider.value;
    this.selectedColor = "#000";

    this.resizeCanvas();

    // canvas context options
    const ctxOptions = {
      // readback optimization: //https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-will-read-frequently
      willReadFrequently: true,
    };

    // canvas context
    this.ctx = this.canvas.getContext("2d", ctxOptions);
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  hookEventListeners() {
    // clear canvas
    this.clearCanvas.addEventListener("click", () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    });
    // save image
    this.saveCanvas.addEventListener("click", () => {
      let e = document.getElementById("fileFormat");
      let selectedFormat = e.options[e.selectedIndex].text;
      const img = this.canvas.toDataURL(`image/${selectedFormat}`);
      downloadImage(
        img,
        `draw-${new Date().getMilliseconds()}.${selectedFormat}`
      );
    });
    // tools
    this.toolBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.id === "pencil") {
          // disable brush width slider
          this.brushWidthSlider.disabled = true;
        } else {
          // enable brush width slider
          this.brushWidthSlider.disabled = false;
        }
        //adding click event to all tool option
        // removing active class from the pervious option and adding on current clicked option
        document.querySelector(".tool.active").classList.remove("active");
        btn.classList.add("active");
        this.selectedTool = btn.id;
        this.canvas.id = this.selectedTool;
      });
    });
    // brush thickness
    this.brushWidthSlider.addEventListener("change", () => {
      if (this.selectedTool === "pencil") {
        this.brushWidth = 2;
        return;
      }

      this.brushWidth = this.brushWidthSlider.value;
      return;
    });
    // colors
    this.colorBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // adding click event to all color button
        // removing active class from the previous option and adding on current clicked option
        document.querySelector(".color.selected").classList.remove("selected");
        btn.classList.add("selected");
        // passing selected btn background as selectedColor value
        this.selectedColor = window
          .getComputedStyle(btn)
          .getPropertyValue("background-color");
      });
    });
    // color picker
    this.colorPicker.addEventListener("change", () => {
      // add new color box
      const customColor = document.createElement("div");
      customColor.classList.add("color");
      customColor.style.background = this.colorPicker.value;
      document.querySelector("#colors").appendChild(customColor);
      this.selectedColor = this.colorPicker.value;
      this.colorBtns = document.querySelectorAll(".color");
      this.hookEventListeners();
    });
    // canvas event listeners
    this.canvas.addEventListener("mousedown", (e) => this.startDraw(e));
    this.canvas.addEventListener("mousemove", (e) => this.drawing(e));
    this.canvas.addEventListener("mouseup", (e) => (this.isDrawing = false));
  }

  resizeCanvas() {
    // grab updated canvas node
    this.canvas = document.querySelector("canvas");
    const parent = this.canvas.parentNode;
    const styles = getComputedStyle(parent);
    const parentWidth = parseInt(styles.getPropertyValue("width"), 10);
    const parentHeight = parseInt(styles.getPropertyValue("height"), 10);

    this.canvas.width = parentWidth;
    this.canvas.height = parentHeight;
  }

  drawing(e) {
    // if isDrawing is flase return form here
    if (!this.isDrawing) return;
    // add the copied canvas on to this canvas
    this.ctx.putImageData(this.snapshot, 0, 0);

    switch (this.selectedTool) {
      case "pencil":
        // pencil is thin
        this.ctx.lineWidth = 2;
        //creating line according to the mouse pointer
        this.ctx.lineTo(e.offsetX, e.offsetY);
        //drawin/filling line with color
        this.ctx.stroke();
        return;
      case "brush":
        //creating line according to the mouse pointer
        this.ctx.lineTo(e.offsetX, e.offsetY);
        //drawin/filling line with color
        this.ctx.stroke();
        return;
      case "eraser":
        this.ctx.strokeStyle = "#fff";
        //creating line according to the mouse pointer
        this.ctx.lineTo(e.offsetX, e.offsetY);
        //drawin/filling line with color
        this.ctx.stroke();
        return;
      case "rectangle":
        this.drawRect(e);
        return;
      case "circle":
        this.drawCircle(e);
        return;
      case "triangle":
        this.drawTriangle(e);
        return;
    }
  }

  drawRect(e) {
    // if fill color is not checked then draw a rect with border else draw rect with background
    if (!this.fillColor.checked) {
      // creating a rectangle according to the mouse pointer
      return this.ctx.strokeRect(
        e.offsetX,
        e.offsetY,
        this.prevMouseX - e.offsetX,
        this.prevMouseY - e.offsetY
      );
    }
    this.ctx.fillRect(
      e.offsetX,
      e.offsetY,
      this.prevMouseX - e.offsetX,
      this.prevMouseY - e.offsetY
    );
  }

  drawCircle(e) {
    // create a new path to draw circle
    this.ctx.beginPath();
    // get radius for circle according to the mouse pointer
    let radius = Math.sqrt(
      Math.pow(this.prevMouseX - e.offsetX, 2) +
        Math.pow(this.prevMouseY - e.offsetY, 2)
    );
    // create circle according to the mouse pointer
    this.ctx.arc(this.prevMouseX, this.prevMouseY, radius, 0, 2 * Math.PI);
    this.ctx.stroke();
    // if fillColor is checked fill circle else draw border circle
    this.fillColor.checked ? this.ctx.fill() : this.ctx.stroke();
  }

  drawTriangle(e) {
    this.ctx.beginPath(); //creating new path to draw circle
    this.ctx.moveTo(this.prevMouseX, this.prevMouseY); // moving triangle to the mouse pointer
    this.ctx.lineTo(e.offsetX, e.offsetY); // creating first line according to the mouse pointer
    this.ctx.lineTo(this.prevMouseX * 2 - e.offsetX, e.offsetY); // creating bottom line of the triangle
    this.ctx.closePath(); // closing path of the triangle so the third line draw automatically
    this.ctx.stroke();
    this.fillColor.checked ? this.ctx.fill() : this.ctx.stroke(); //if fillColor is checked fill circle else draw border triangle
  }

  startDraw(e) {
    this.isDrawing = true;
    this.prevMouseX = e.offsetX; //passing current MouseX position as prevMouseX value
    this.prevMouseY = e.offsetY; //passing current MouseY position as prevMouseY value
    this.ctx.beginPath(); //creating new path to draw
    this.ctx.lineWidth = this.brushWidth; //passing brushSize as line width
    this.snapshot = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    ); //coping canvas data and passing as snapshot value.. this avoids dragging the image
    this.ctx.strokeStyle = this.selectedColor; // passing selectedColor as stroke syle
    this.ctx.fillStyle = this.selectedColor; // passing selectedColor as fill style
  }
}
