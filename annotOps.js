// attribs
let PenAnnotAttribs = {
    "mode": "pen",
    "size": 4,
    "color": "black"
};
let EraserAnnotAttribs = {
    "mode": "eraser",
    "size": 24
};

// actions
function PenStrokeAction(points, attribs, actionId) {
    this.points = points;
    this.attribs = attribs;
    this.actionId = actionId;
    this.perform = function(drawState) {
        //drawState.push({points: points, attribs: attribs});
        drawPenStroke(this.points, this.attribs, this.actionId);
    };
    this.undo = function(drawState) {
        //let action = drawState.pop();
        erasePenStroke(this.points, this.attribs, this.actionId);
    };
}

// state
var annotAttribs = PenAnnotAttribs;
var canvases = [];
var drawState = [];
var undoStack = [], undoIdx = -1;
var actionId = 0;

// methods
function setAnnotMode(mode) {
    if (mode == "pen") {
        annotAttribs = PenAnnotAttribs;
    } else if (mode == "eraser") {
        annotAttribs = EraserAnnotAttribs;
    }
}

function commitAction(action) {
    undoStack = undoStack.slice(0, undoIdx + 1)
    undoStack.push(action);
    undoIdx++;
}

function recordPenStroke(points, attribs) {
}

function beginStylusStroke(pageX, pageY) {
    drawPenStrokeBegin(pageX, pageY, annotAttribs);
}

function continueStylusStroke(sx, sy, lx, ly, x, y) {
    drawPenStrokeContinue(sx, sy, lx, ly, x, y, annotAttribs);
}

function endStylusStroke(points) {
    drawPenStrokeEnd(points, annotAttribs, actionId);
    commitAction(new PenStrokeAction(points, annotAttribs, actionId));
    console.log(undoStack);
    actionId++;
}

function undo() {
    if (undoIdx < 0) return;
    let action = undoStack[undoIdx];
    console.log(action);
    action.undo(drawState);
    undoIdx--;
}

function redo() {
    if (undoIdx < undoStack.length - 1) {
        undoIdx++;
        undoStack[undoIdx].perform(drawState);
    }
    console.log(undoStack);
}
