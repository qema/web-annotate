var canvasAnnotIdIdx = 0;
var canvasIdToStrokes = {}, canvasById = {};
function makeCanvasForPoint(x, y) {
    let annotationLayer = document.getElementById("annotationLayer");
    let canvas = document.createElement("canvas");
    canvas.className = "annotationLayerCanvas";
    canvas.annotId = canvasAnnotIdIdx++;
    canvasById[canvas.annotId] = canvas;

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
//    canvas.style.border = "solid red 2px";
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

function drawPenStrokeBegin(pageX, pageY, attribs) {
    // get canvas, or make one if one doesn't exist at this point
    let canvas = getCanvasForPoint(pageX, pageY) ||
        makeCanvasForPoint(pageX, pageY);
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    let canvasPos = pagePosToCanvasPos(pageX, pageY, canvas);
    ctx.arc(canvasPos.x, canvasPos.y, attribs.size / 2, 0, 2 * Math.PI,
        false);
    ctx.fillStyle = attribs.color;
    ctx.fill();
}

function drawPenStrokeContinue(sx, sy, lx, ly, x, y, attribs) {
    let canvas = getCanvasForPoint(sx, sy);
    if (!isPointInCanvas(x, y, canvas)) {
        resizeCanvasForPoint(x, y, canvas);
    }

    let ctx = canvas.getContext("2d");
    let lastCanvasPos = pagePosToCanvasPos(lx, ly, canvas);
    let canvasPos = pagePosToCanvasPos(x, y, canvas);
    ctx.lineWidth = attribs.size;
    ctx.strokeStyle = attribs.color;
    ctx.beginPath();
    ctx.moveTo(lastCanvasPos.x, lastCanvasPos.y);
    ctx.lineTo(canvasPos.x, canvasPos.y);
    ctx.stroke();
}

function drawPenStrokeEnd(points, attribs, actionId) {
    let canvas = getCanvasForPoint(points[0].x, points[0].y);

    if (!(canvas.annotId in canvasIdToStrokes)) {
        canvasIdToStrokes[canvas.annotId] = []
    }
    canvasIdToStrokes[canvas.annotId].push({
        points: points,
        attribs: attribs,
        actionId: actionId
    });
}

function drawPenStroke(points, attribs, actionId) {
    drawPenStrokeBegin(points[0].x, points[0].y, attribs);
    for (let i = 1; i < points.length; i++) {
        drawPenStrokeContinue(points[0].x, points[0].y,
            points[i-1].x, points[i-1].y,
            points[i].x, points[i].y, attribs);
    }
    drawPenStrokeEnd(points, attribs, actionId);
}

function erasePenStroke(points, attribs, actionId) {
    let canvas = getCanvasForPoint(points[0].x, points[0].y);
    if (!canvas) return;
    let strokes = canvasIdToStrokes[canvas.annotId];
    if (!strokes) return;

    var toRemoveIdx = -1;
    console.log(strokes);
    for (let i = 0; i < strokes.length; i++) {
        let stroke = strokes[i];
        if (actionId == stroke.actionId) {
            toRemoveIdx = i;
        }
    }
    if (toRemoveIdx >= 0) {
        let oldStrokes = strokes.slice();
        canvasIdToStrokes[canvas.annotId] = [];
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < oldStrokes.length; i++) {
            if (i != toRemoveIdx) {
                drawPenStroke(oldStrokes[i].points, oldStrokes[i].attribs,
                    oldStrokes[i].actionId);
            }
        }
    }
}
