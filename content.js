var annotationLayer = document.getElementById("annotationLayer");
var canvas;
if (annotationLayer) {
    canvas = document.getElementById("annotationLayerCanvas");
} else {
    annotationLayer = document.createElement("div");
    document.body.appendChild(annotationLayer);
    annotationLayer.className = "annotationLayer";
    annotationLayer.style.position = "absolute";
    annotationLayer.style.left = "0px";
    annotationLayer.style.top = "0px";
    annotationLayer.style.zIndex = "100000";
    annotationLayer.style.width = "100%";
    annotationLayer.style.height = "100%";

    canvas = document.createElement("canvas");
    canvas.className = "annotationLayerCanvas";
    canvas.style.width = annotationLayer.scrollWidth + "px";
    canvas.style.height = annotationLayer.scrollHeight + "px";
    canvas.width = annotationLayer.scrollWidth;
    canvas.height = annotationLayer.scrollHeight;
    canvas.style.overflow = "visible";
    canvas.style.position = "absolute";
    annotationLayer.appendChild(canvas);
}

var ctx = canvas.getContext("2d");

var isDrawing = false, drawTouchId = -1;
var lastx, lasty;

document.addEventListener("touchstart", function(e) {
    let touches = e.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        // if using pen and not currently scrolling
        if (touches[i].force != 0.5 && e.cancelable) {
            console.log(touches[i]);
            e.preventDefault();
            lastx = touches[i].pageX;
            lasty = touches[i].pageY;
            drawTouchId = touches[i].identifier;
            isDrawing = true;

            //document.body.style.touchAction = "none";
            if (lasty > canvas.height) {
                canvas.height = lasty + 800;
                canvas.style.height = canvas.height + "px";
            }

			ctx.beginPath();
			ctx.arc(lastx, lasty, 2, 0, 2 * Math.PI, false);
			ctx.fillStyle = "black";
			ctx.fill();
        }
    }
}, {passive: false});

document.addEventListener("touchmove", function(e) {
    console.log(document.body.style.touchAction);
    let touches = e.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        if (isDrawing && touches[i].identifier == drawTouchId) {
            let x = touches[i].pageX, y = touches[i].pageY;

            if (y > canvas.height) {
                canvas.height = lasty + 800;
                canvas.style.height = canvas.height + "px";
            }
            ctx.beginPath();
            ctx.moveTo(lastx, lasty);
            ctx.lineTo(x, y);
            ctx.lineWidth = 4;
            ctx.strokeStyle = "black";
            ctx.stroke();
            lastx = x;
            lasty = y;
        }
    }
    ctx.beginPath();
}, {passive: false});

document.addEventListener("touchend", function(e) {
    if (isDrawing) {
        e.preventDefault();
        console.log("end", e);
        isDrawing = false;
    }
//    document.body.style.touchAction = "auto";
}, {passive: false});

document.addEventListener("touchcancel", function(e) {
//    isDrawing = false;
//    document.body.style.touchAction = "auto";
}, false);
