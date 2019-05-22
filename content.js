const PointerTypeSurfacePen = 1;
const PointerTypeSurfaceEraser = 6;

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

    function beginStylusStrokeWithEvent(e, container) {
        let x = e.pageX + container.scrollLeft -
            container.offsetLeft;
        let y = e.pageY + container.scrollTop -
            container.offsetTop;
        isStylusDown = true;
        strokePoints = [{x: x, y: y}];
        beginStylusStroke(x, y);
    }

    function getAnnotationContainer() {
        return document.getElementById("viewerContainer") || document.body;
    }

    var touchEventGate = 0;
    document.addEventListener("touchstart", function(e) {
        let touches = e.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            if (touches[i].force != 0.5 && e.cancelable) {   // stylus
                e.preventDefault();
                touchEventGate++;
                if (touchEventGate == 2) {
                    let container = getAnnotationContainer();
                    beginStylusStrokeWithEvent(touches[i], container);
                }
                break;
            }
        }
    }, {passive: false});

    document.addEventListener("pointerdown", function(e) {
        // if using stylus and not currently scrolling or on menu bar
        if (e.pointerType == "pen" && !hoveringOverMenuBar) {
            if (e.which == PointerTypeSurfacePen) {
                setAnnotMode("pen");
            } else if (e.which == PointerTypeSurfaceEraser) {
                setAnnotMode("eraser");
            }

            touchEventGate++;
            stylusTouchId = e.pointerId;

            if (touchEventGate == 2) {
                let container = getAnnotationContainer();
                beginStylusStrokeWithEvent(e, container);
            }
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
    });

    document.addEventListener("pointermove", function(e) {
        let container = getAnnotationContainer();
        if (isStylusDown && e.pointerId == stylusTouchId) {
            let x = e.pageX + container.scrollLeft -
                container.offsetLeft;
            let y = e.pageY + container.scrollTop -
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
    //    ctx.beginPath();
    });

//    document.addEventListener("pointerdown", function(e) {
//        console.log(e);
//    });

    document.addEventListener("pointerup", function(e) {
        if (isStylusDown) {
            e.preventDefault();
            endStylusStroke(strokePoints);
            isStylusDown = false;
            touchEventGate = 0;
        }
    });

    document.addEventListener("pointercancel", function(e) {
        if (isStylusDown) {
            e.preventDefault();
            endStylusStroke(strokePoints);
            isStylusDown = false;
            touchEventGate = 0;
        }
    }, false);
}

function lazyStartAnnotation() {
    if (!annotationLayer)
        createAnnotationLayer();
}
