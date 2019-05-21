var annotationLayer = null;
function createAnnotationLayer() {
    var hoveringOverMenuBar = false;
    var isStylusDown = false, stylusTouchId = -1;
    var strokePoints = [];
    annotationLayer = document.createElement("div");
    
    let viewers = document.getElementsByClassName("pdfViewer");
    if (viewers.length > 0) {
        let viewerContainer = document.getElementById("viewerContainer");
        viewerContainer.appendChild(annotationLayer);
    } else {
        document.body.appendChild(annotationLayer);
    }
    
    annotationLayer.id = "annotationLayer";
    annotationLayer.style.position = "absolute";
    annotationLayer.style.left = "0px";
    annotationLayer.style.top = "0px";
    annotationLayer.style.zIndex = "100000";
    annotationLayer.style.width = "100%";
    annotationLayer.style.height = "100%";
    annotationLayer.style.overflow = "visible";
    //annotationLayer.style.display = "none";

    document.addEventListener("touchstart", function(e) {
        let container = document.getElementById("viewerContainer") ||
            document.body;
        console.log(container.scrollTop);
        let touches = e.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            // if using stylus and not currently scrolling or on menu bar
            if (touches[i].force != 0.5 && e.cancelable && !hoveringOverMenuBar) {
                e.preventDefault();
                let x = touches[i].pageX + container.scrollLeft -
                    container.offsetLeft;
                let y = touches[i].pageY + container.scrollTop -
                    container.offsetTop;
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
        let container = document.getElementById("viewerContainer") ||
            document.body;
        let touches = e.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            if (isStylusDown && touches[i].identifier == stylusTouchId) {
                let x = touches[i].pageX + container.scrollLeft -
                    container.offsetLeft;
                let y = touches[i].pageY + container.scrollTop -
                    container.offsetTop;
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
}

function lazyStartAnnotation() {
    if (!annotationLayer)
        createAnnotationLayer();
}
