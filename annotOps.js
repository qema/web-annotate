// attribs
const AttribModePen = "pen";
const AttribModeEraser = "eraser";
let PenAnnotAttribs = {
    "mode": AttribModePen,
    "size": 4,
    "color": "black"
};
let EraserAnnotAttribs = {
    "mode": AttribModeEraser,
    "size": 8
};

// actions
function PenStrokeAction(points, attribs, actionId) {
    this.points = points;
    this.attribs = attribs;
    this.actionId = actionId;
    this.perform = function() {
        drawPenStroke(this.points, this.attribs, this.actionId);
    };
    this.undo = function() {
        erasePenStroke(this.points, this.attribs, this.actionId);
    };
}

function EraserStrokeAction(erasedStrokes) {
    this.erasedStrokes = erasedStrokes;
    this.perform = function() {
        eraseStrokes(this.erasedStrokes);
    };
    this.undo = function() {
        for (let i = 0; i < this.erasedStrokes.length; i++) {
            let stroke = this.erasedStrokes[i];
            drawPenStroke(stroke.points, stroke.attribs, stroke.actionId);
        }
    };
}

// state
var annotAttribs = PenAnnotAttribs;
var undoStack = [], undoIdx = -1;
var actionId = 0;

// methods
function setAnnotMode(mode) {
    if (mode == AttribModePen) {
        annotAttribs = PenAnnotAttribs;
    } else if (mode == AttribModeEraser) {
        annotAttribs = EraserAnnotAttribs;
    }
}

function getAnnotMode() {
    return annotAttribs.mode;
}

function commitAction(action) {
    undoStack = undoStack.slice(0, undoIdx + 1)
    undoStack.push(action);
    undoIdx++;
}

function recordPenStroke(points, attribs) {
}

function beginStylusStroke(pageX, pageY) {
    if (annotAttribs.mode == AttribModePen) {
        drawPenStrokeBegin(pageX, pageY, annotAttribs, actionId);
    } else if (annotAttribs.mode == AttribModeEraser) {
        eraserStrokeBegin(pageX, pageY, annotAttribs);
    }
}

function continueStylusStroke(sx, sy, lx, ly, x, y) {
    if (annotAttribs.mode == AttribModePen) {
        drawPenStrokeContinue(sx, sy, lx, ly, x, y, annotAttribs, actionId);
    } else if (annotAttribs.mode == AttribModeEraser) {
        eraserStrokeContinue(lx, ly, x, y, annotAttribs);
    }
}

function endStylusStroke(points) {
    if (annotAttribs.mode == AttribModePen) {
        drawPenStrokeEnd(points, annotAttribs, actionId);
        commitAction(new PenStrokeAction(points, annotAttribs, actionId));
        actionId++;
    } else if (annotAttribs.mode == AttribModeEraser) {
        let erasedStrokes = eraserStrokeEnd(points, annotAttribs);
        commitAction(new EraserStrokeAction(erasedStrokes));
        actionId++;
    }
}

function undo() {
    if (undoIdx < 0) return;
    let action = undoStack[undoIdx];
    action.undo();
    undoIdx--;
}

function redo() {
    if (undoIdx < undoStack.length - 1) {
        undoIdx++;
        undoStack[undoIdx].perform();
    }
    console.log(undoStack);
}
