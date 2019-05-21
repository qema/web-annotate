const MenuButtonDefaultColor = "rgba(0, 0, 0, 0)";
const MenuButtonHoverColor = "#cccccc";
const MenuButtonActiveColor = "#bbb";
const MenuButtonActiveHoverColor = "#aaa";

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
    annotationLayer.style.display = "none";

    // create menu bar
    let menuBar = document.createElement("div");
    menuBar.id = "annotationLayerMenuBar";
    menuBar.style.position = "fixed";
    menuBar.style.width = "192px";
    menuBar.style.height = "48px";
    menuBar.style.top = "12px";
    menuBar.style.right = "12px";
    menuBar.style.backgroundColor = "#eee";
    menuBar.style.opacity = 0.9;
    menuBar.style.borderRadius = "6px";
    menuBar.style.zIndex = "100001";
    menuBar.style.display = "none";
    menuBar.onmouseenter = function() {
        hoveringOverMenuBar = true;
    };
    menuBar.onmouseleave = function() {
        hoveringOverMenuBar = false;
    };
    document.body.appendChild(menuBar);

    function createMenuButton(name) {
        let imgURL = chrome.runtime.getURL("images/" + name + ".png");
        let button = document.createElement("img");
        button.src = imgURL;
        button.style.width = "24px";
        button.style.height = "24px";
        button.style.padding = "6px";
        button.style.margin = "6px";
        button.style.borderRadius = "6px";
        button.style.boxSizing = "content-box";
        button.style.backgroundColor = MenuButtonDefaultColor;
        button.annotIsActive = false;
        button.onmouseenter = function() {
            button.style.backgroundColor = button.annotIsActive ?
                MenuButtonActiveHoverColor : MenuButtonHoverColor;
        }
        button.onmouseleave = function() {
            button.style.backgroundColor = button.annotIsActive ?
                MenuButtonActiveColor : MenuButtonDefaultColor;
        }
        return button;
    }

    let penButton = createMenuButton("pen");
    let eraserButton = createMenuButton("eraser");
    menuBar.appendChild(penButton);
    menuBar.appendChild(eraserButton);

    penButton.onmousedown = function() {
        eraserButton.style.backgroundColor = MenuButtonDefaultColor;
        eraserButton.annotIsActive = false;
        penButton.style.backgroundColor = MenuButtonActiveHoverColor;
        penButton.annotIsActive = true;
        setAnnotMode(AttribModePen);
    };
    eraserButton.onmousedown = function() {
        penButton.style.backgroundColor = MenuButtonDefaultColor;
        penButton.annotIsActive = false;
        eraserButton.style.backgroundColor = MenuButtonActiveHoverColor;
        eraserButton.annotIsActive = true;
        setAnnotMode(AttribModeEraser);
    };

    let undoButton = createMenuButton("undo");
    undoButton.onclick = undo;
    menuBar.appendChild(undoButton);

    let redoButton = createMenuButton("redo");
    redoButton.className = "redoButton";
    redoButton.innerHTML = "Redo";
    redoButton.onclick = redo;
    menuBar.appendChild(redoButton);

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

function toggleAnnotationView() {
    if (!annotationLayer)
        createAnnotationLayer();

    let menuBar = document.getElementById("annotationLayerMenuBar");
    if (menuBar.style.display == "none") {
        annotationLayer.style.display = "block";
        menuBar.style.display = "block";
    } else {
        annotationLayer.style.display = "none";
        menuBar.style.display = "none";
    }
}
