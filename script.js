const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
clearCanvasBtn = document.querySelector('#clear-canvas')
ctx = canvas.getContext("2d");

// global variables with default values
let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool = "brush",
brushWidth = 5,
selectedColor = "#000";

window.addEventListener("load", () => {
    //setting canvas width and height // offsetWidth/Height returns viewable width/height of an element
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
});

const drawRect = (e) => {
    // if fill color is not checked then draw a rect with border else draw rect with background
    if(!fillColor.checked) {
        // creating a circle according to the mouse pointer
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
}

const drawCircle = (e) => {
    ctx.beginPath(); //creating a new path to draw circle
    // getting radius for circle according to the mouse pointer
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI); //creating circle according to the mouse pointer
    ctx.stroke();
    fillColor.checked ? ctx.fill() : ctx.stroke(); //if fillColor is checked fill circle else draw border circle
}

const drawTriangle = (e) => {
    ctx.beginPath(); //creating new path to draw circle
    ctx.moveTo(prevMouseX, prevMouseY); // moving triangle to the mouse pointer
    ctx.lineTo(e.offsetX, e.offsetY); // creating first line according to the mouse pointer
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY); // creating bottom line of the triangle
    ctx.closePath(); // closing path of the triangle so the third line draw automatically
    ctx.stroke();
    fillColor.checked ? ctx.fill() : ctx.stroke(); //if fillColor is checked fill circle else draw border triangle
}

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX; //passing current MouseX position as prevMouseX value
    prevMouseY = e.offsetY; //passing current MouseY position as prevMouseY value
    ctx.beginPath(); //creating new path to draw
    ctx.lineWidth = brushWidth; //passing brushSize as line width
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height); //coping canvas data and passing as snapshot value.. this avoids dragging the image
    ctx.strokeStyle = selectedColor; // passing selectedColor as stroke syle
    ctx.fillStyle = selectedColor; // passing selectedColor as fill style
}

const drawing = (e) => {
    if(!isDrawing) return; //if isDrawing is flase return form here
    ctx.putImageData(snapshot, 0, 0); //adding the copied canvas on to this canvas

    if(selectedTool === "brush" || selectedTool === "eraser"){
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor; //if selected tool is eraser then set strokeStyle to white to paint white color onto the existing canvas content else set the stroke color to selected color
        ctx.lineTo(e.offsetX, e.offsetY); //creating line according to the mouse pointer
        ctx.stroke(); //drawin/filling line with color
    } else if (selectedTool === "rectangle"){
        drawRect(e);
    }else if (selectedTool === "circle"){
        drawCircle(e);
    }else {
        drawTriangle(e);
    }
}

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => { //adding click event to all tool option
        // removing active class from the pervious option and adding on current clicked option
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        if(selectedTool == "eraser"){
            canvas.style.cursor = "crosshair";
        }else{
        canvas.style.cursor = 'crosshair'
        }
        console.log(btn.id);
    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value); //passin slider value as brush Size

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => { // adding click event to all color button
        // removing active class from the previous option and adding on current clicked option
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        // passing selected btn background as selectedColor value
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });

});

colorPicker.addEventListener("change", () => {
     colorPicker.parentElement.style.background = colorPicker.value;
     colorPicker.parentElement.click();
});

document.querySelector('.save-img').addEventListener("click", ()=>{
    let e = document.getElementById("fileFormat");
    let selectedFormat = e.options[e.selectedIndex].text;
    const img    = canvas.toDataURL(`image/${selectedFormat}`)
    downloadImage(img, `draw.${selectedFormat}`);
})

function downloadImage(data, filename = 'untitled.jpeg') {
    var a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => isDrawing = false);

clearCanvasBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
})
