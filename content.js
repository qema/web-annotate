// create menu bar
let menuBar = document.createElement("div");
menuBar.style.position = "fixed";
menuBar.style.width = "200pt";
menuBar.style.height = "36pt";
menuBar.style.top = "24pt";
menuBar.style.right = "24pt";
menuBar.style.backgroundColor = "white";
menuBar.style.zIndex = "100001";
document.body.appendChild(menuBar);

let penButton = document.createElement("button");
penButton.className = "penButton";
penButton.innerHTML = "Pen";
penButton.onclick = function() { setAnnotMode(AttribModePen); };
menuBar.appendChild(penButton);

let eraserButton = document.createElement("button");
eraserButton.className = "eraserButton";
eraserButton.innerHTML = "Eraser";
eraserButton.onclick = function() { setAnnotMode(AttribModeEraser); };
menuBar.appendChild(eraserButton);

let undoButton = document.createElement("button");
undoButton.className = "undoButton";
undoButton.innerHTML = "Undo";
undoButton.onclick = undo;
menuBar.appendChild(undoButton);

let redoButton = document.createElement("button");
redoButton.className = "redoButton";
redoButton.innerHTML = "Redo";
redoButton.onclick = redo;
menuBar.appendChild(redoButton);

// create annotation layer
var annotationLayer = document.getElementById("annotationLayer");
if (!annotationLayer) {
    annotationLayer = document.createElement("div");
    document.body.appendChild(annotationLayer);
    annotationLayer.id = "annotationLayer";
    annotationLayer.style.position = "absolute";
    annotationLayer.style.left = "0px";
    annotationLayer.style.top = "0px";
    annotationLayer.style.zIndex = "100000";
    annotationLayer.style.width = "100%";
    annotationLayer.style.height = "100%";
    annotationLayer.style.overflow = "visible";
}

//var ctx = canvas.getContext("2d");
var isStylusDown = false, stylusTouchId = -1;
var strokePoints = [];

document.addEventListener("touchstart", function(e) {
    let touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        // if using stylus and not currently scrolling
        if (touches[i].force != 0.5 && e.cancelable) {
            e.preventDefault();
            let x = touches[i].pageX, y = touches[i].pageY;
            stylusTouchId = touches[i].identifier;
            isStylusDown = true;

            strokePoints = [{x: x, y: y}];
            beginStylusStroke(x, y);
            //document.body.style.touchAction = "none";
//            if (lasty > canvas.height) {
//                canvas.height = lasty + 800;
//                canvas.style.height = canvas.height + "px";
//            }
//
//			ctx.beginPath();
//			ctx.arc(lastx, lasty, 2, 0, 2 * Math.PI, false);
//			ctx.fillStyle = "black";
//			ctx.fill();
        }
    }
}, {passive: false});

document.addEventListener("touchmove", function(e) {
    let touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        if (isStylusDown && touches[i].identifier == stylusTouchId) {
            let x = touches[i].pageX, y = touches[i].pageY;
            let lastx = strokePoints[strokePoints.length-1].x;
            let lasty = strokePoints[strokePoints.length-1].y;
            continueStylusStroke(strokePoints[0].x, strokePoints[0].y,
                lastx, lasty, x, y);
            strokePoints.push({x: x, y: y});

//            if (y > canvas.height) {
//                canvas.height = lasty + 800;
//                canvas.style.height = canvas.height + "px";
//            }
//            ctx.beginPath();
//            ctx.moveTo(lastx, lasty);
//            ctx.lineTo(x, y);
//            ctx.lineWidth = 4;
//            ctx.strokeStyle = "black";
//            ctx.stroke();
        }
    }
//    ctx.beginPath();
}, {passive: false});

document.addEventListener("touchend", function(e) {
    if (isStylusDown) {
        e.preventDefault();
        endStylusStroke(strokePoints);
        isStylusDown = false;
    }
//    document.body.style.touchAction = "auto";
}, {passive: false});

document.addEventListener("touchcancel", function(e) {
//    isStylusDown = false;
//    document.body.style.touchAction = "auto";
}, false);
