// constants
let PenAnnotAttribs = {
    "mode": "pen",
    "size": 4,
    "color": "black"
}
let EraserAnnotAttribs = {
    "mode": "eraser",
    "size": 24
}

// state
var annotAttribs = PenAnnotAttribs;
var canvases = [];

// methods
function setAnnotMode(mode) {
    if (mode == "pen") {
        annotAttribs = PenAnnotAttribs;
    } else if (mode == "eraser") {
        annotAttribs = EraserAnnotAttribs;
    }
}

function makeCanvasForPoint(x, y) {
    let annotationLayer = document.getElementById("annotationLayer");
    let canvas = document.createElement("canvas");
    canvas.className = "annotationLayerCanvas";

    let desiredWidth = 200, desiredHeight = 200;
    let left = x - desiredWidth/2;
    let top = y - desiredHeight/2;
    let right = x + desiredWidth/2;
    let bottom = y + desiredHeight/2;
    canvas.style.top = top + "px";
    canvas.style.bottom = bottom + "px";
    canvas.style.left = left + "px";
    canvas.style.right = right + "px";
    let width = right - left, height = bottom - top;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.overflow = "hidden";
    canvas.style.position = "absolute";
    //canvas.style.border = "solid red 2px";
    annotationLayer.appendChild(canvas);
    canvases.push(canvas);
    return canvas;
}

function resizeCanvasForPoint(x, y, canvas) {
    let ctx = canvas.getContext("2d");
    let savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let paddingX = 200, paddingY = 200;
    var width = canvas.offsetWidth, height = canvas.offsetHeight;
    var dx = 0, dy = 0;
    if (x < canvas.offsetLeft) {
        canvas.style.left = (canvas.offsetLeft - paddingX) + "px";
        width += paddingX;
        dx = paddingX * window.devicePixelRatio;
    }
    if (y < canvas.offsetTop) {
        canvas.style.top = (canvas.offsetTop - paddingY) + "px";
        height += paddingY;
        dy = paddingY * window.devicePixelRatio;
    }
    if (x > canvas.offsetLeft + canvas.offsetWidth) {
        canvas.style.right = (canvas.offsetLeft + canvas.offsetWidth +
            paddingX) + "px";
        width += paddingX;
    }
    if (y > canvas.offsetTop + canvas.offsetHeight) {
        canvas.style.bottom = (canvas.offsetTop + canvas.offsetHeight +
            paddingY) + "px";
        height += paddingY;
    }
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.putImageData(savedImageData, dx, dy);
}

function isPointInCanvas(x, y, canvas) {
    return (x >= canvas.offsetLeft && y >= canvas.offsetTop &&
        x <= canvas.offsetLeft + canvas.offsetWidth &&
        y <= canvas.offsetTop + canvas.offsetHeight);
}

function getCanvasForPoint(x, y) {
    for (let i = 0; i < canvases.length; i++) {
        let canvas = canvases[i];
        if (isPointInCanvas(x, y, canvas)) {
            return canvas;
        }
    }
    // didn't find canvas
    return null;
}

function pagePosToCanvasPos(pageX, pageY, canvas) {
    let x = (pageX - canvas.offsetLeft) * canvas.width / canvas.offsetWidth;
    let y = (pageY - canvas.offsetTop) * canvas.height / canvas.offsetHeight;
    return {x: x, y: y}
}

function beginStylusStroke(pageX, pageY) {
    console.log(pageX, pageY);
    // get canvas, or make one if one doesn't exist at this point
    let canvas = getCanvasForPoint(pageX, pageY) ||
        makeCanvasForPoint(pageX, pageY);
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    let canvasPos = pagePosToCanvasPos(pageX, pageY, canvas);
    ctx.arc(canvasPos.x, canvasPos.y, annotAttribs.size / 2, 0, 2 * Math.PI,
        false);
    ctx.fillStyle = annotAttribs.color;
    ctx.fill();
}

function continueStylusStroke(points) {
    let lastPoint = points[points.length - 2];
    let curPoint = points[points.length - 1];
    let canvas = getCanvasForPoint(points[0].x, points[0].y);
    if (!isPointInCanvas(curPoint.x, curPoint.y, canvas)) {
        resizeCanvasForPoint(curPoint.x, curPoint.y, canvas);
    }
    let ctx = canvas.getContext("2d");

    let lastCanvasPos = pagePosToCanvasPos(lastPoint.x, lastPoint.y, canvas);
    let canvasPos = pagePosToCanvasPos(curPoint.x, curPoint.y, canvas);
    ctx.beginPath();
    ctx.moveTo(lastCanvasPos.x, lastCanvasPos.y);
    ctx.lineTo(canvasPos.x, canvasPos.y);
    ctx.lineWidth = annotAttribs.size;
    ctx.strokeStyle = annotAttribs.color;
    ctx.stroke();
}

function endStylusStroke(x, y) {
}
