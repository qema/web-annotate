const CanvasStrokeCapacity = 40;

var canvases = [];
var canvasAnnotIdIdx = 0;
var canvasIdToStrokes = {}, canvasById = {};
var actionIdToCanvas = {};
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
    canvas.style.border = "solid red 2px";
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

function isPointInCanvas(x, y, canvas, padding) {
    return (x >= canvas.offsetLeft - padding &&
        y >= canvas.offsetTop - padding &&
        x <= canvas.offsetLeft + canvas.offsetWidth + padding &&
        y <= canvas.offsetTop + canvas.offsetHeight + padding);
}

function getCanvasForActionId(actionId) {
    return actionIdToCanvas[actionId];
}

function getCanvasForPoint(x, y) {
    for (let i = 0; i < canvases.length; i++) {
        let canvas = canvases[i];
        let underStrokeCapacity = !(canvas.annotId in canvasIdToStrokes &&
            canvasIdToStrokes[canvas.annotId].length >= CanvasStrokeCapacity);
        if (isPointInCanvas(x, y, canvas, 0) && underStrokeCapacity) {
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

function drawPenStrokeBegin(pageX, pageY, attribs, actionId) {
    // get canvas, or make one if one doesn't exist at this point
    let canvas = getCanvasForActionId(actionId) ||
        getCanvasForPoint(pageX, pageY) ||
        makeCanvasForPoint(pageX, pageY);
    actionIdToCanvas[actionId] = canvas;

    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    let canvasPos = pagePosToCanvasPos(pageX, pageY, canvas);
    ctx.arc(canvasPos.x, canvasPos.y, attribs.size / 2, 0, 2 * Math.PI,
        false);
    ctx.fillStyle = attribs.color;
    ctx.fill();
}

function drawPenStrokeContinue(sx, sy, lx, ly, x, y, attribs, actionId) {
    let canvas = getCanvasForActionId(actionId);
    if (!isPointInCanvas(x, y, canvas, 0)) {
        resizeCanvasForPoint(x, y, canvas);
    }

    let ctx = canvas.getContext("2d");
    let lastCanvasPos = pagePosToCanvasPos(lx, ly, canvas);
    let canvasPos = pagePosToCanvasPos(x, y, canvas);
    ctx.lineWidth = attribs.size;
    ctx.strokeStyle = attribs.color;
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.moveTo(lastCanvasPos.x, lastCanvasPos.y);
    ctx.lineTo(canvasPos.x, canvasPos.y);
    ctx.stroke();
}

function drawPenStrokeEnd(points, attribs, actionId) {
    let canvas = getCanvasForActionId(actionId);

    if (!(canvas.annotId in canvasIdToStrokes)) {
        canvasIdToStrokes[canvas.annotId] = []
    }
    var left = Infinity, top = Infinity, bottom = 0, right = 0;
    for (let i = 0; i < points.length; i++) {
        let x = points[i].x, y = points[i].y;
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
    }

    canvasIdToStrokes[canvas.annotId].push({
        points: points,
        attribs: attribs,
        actionId: actionId,
        left: left,
        top: top,
        right: right,
        bottom: bottom
    });
}

function drawPenStroke(points, attribs, actionId) {
    drawPenStrokeBegin(points[0].x, points[0].y, attribs, actionId);
    for (let i = 1; i < points.length; i++) {
        drawPenStrokeContinue(points[0].x, points[0].y,
            points[i-1].x, points[i-1].y,
            points[i].x, points[i].y, attribs, actionId);
    }
    drawPenStrokeEnd(points, attribs, actionId);
}

function erasePenStroke(points, attribs, actionId) {
    let canvas = getCanvasForActionId(actionId);
    if (!canvas) return;
    let strokes = canvasIdToStrokes[canvas.annotId];
    if (!strokes) return;

    var toRemoveIdx = -1;
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

function eraseAt(x, y, size) {
    for (let i = 0; i < canvases.length; i++) {
        let canvas = canvases[i];
        if (!isPointInCanvas(x, y, canvas, size)) continue;
        let canvasId = canvas.annotId;
        if (!(canvasId in canvasIdToStrokes)) continue;
        for (let j = 0; j < canvasIdToStrokes[canvasId].length; j++) {
            let stroke = canvasIdToStrokes[canvasId][j];
            if (!(x >= stroke.left - size && y >= stroke.top - size &&
                x <= stroke.right + size && y <= stroke.bottom + size))
                continue;
            let points = stroke.points;
            for (let l = 0; l < points.length; l++) {
                let point = points[l];
                if ((point.x - x)*(point.x - x) + 
                    (point.y - y)*(point.y - y) <= size*size) {
                    erasePenStroke(points, stroke.attribs,
                        stroke.actionId);
                    return {points: points, attribs: stroke.attribs,
                        actionId: stroke.actionId};
                }
            }
        }
    }
    return null;
}

var erasedStrokes = [];
function eraserStrokeBegin(x, y, attribs) {
    erasedStrokes = [];
    let erasedStroke = eraseAt(x, y, attribs.size);
    if (erasedStroke) {
        erasedStrokes.push(erasedStroke);
    }
}

function eraserStrokeContinue(lx, ly, x, y, attribs) {
    let erasedStroke = eraseAt(x, y, attribs.size);
    if (erasedStroke) {
        erasedStrokes.push(erasedStroke);
    }
}

function eraserStrokeEnd(points, attribs) {
    return erasedStrokes;
}

function eraseStrokes(strokes) {
    for (let i = 0; i < strokes.length; i++) {
        let stroke = strokes[i];
        erasePenStroke(stroke.points, stroke.attribs, stroke.actionId);
    }
}
