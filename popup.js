const MenuButtonDefaultColor = "rgba(0, 0, 0, 0)";
const MenuButtonHoverColor = "#cccccc";
const MenuButtonMouseDownColor = "#bbb";
const MenuButtonActiveColor = "#bbb";
const MenuButtonActiveHoverColor = "#aaa";
const MenuButtonActiveMouseDownColor = "#999";

// create menu bar
let menuBar = document.createElement("div");
menuBar.id = "annotationLayerMenuBar";
menuBar.style.width = "192px";
menuBar.style.height = "48px";
document.body.appendChild(menuBar);

function createMenuButton(name) {
    let imgURL = chrome.runtime.getURL("images/" + name + ".png");
    let button = document.createElement("img");
    button.src = imgURL;
    button.style.width = "24px";
    button.style.height = "24px";
    button.style.padding = "12px";
    button.style.backgroundColor = MenuButtonDefaultColor;
    button.annotIsActive = false;
    button.onmousedown = function() {
        button.style.backgroundColor = button.annotIsActive ?
            MenuButtonActiveMouseDownColor : MenuButtonMouseDownColor;
    };
    button.onmouseenter = function() {
        button.style.backgroundColor = button.annotIsActive ?
            MenuButtonActiveHoverColor : MenuButtonHoverColor;
    };
    button.onmouseup = button.onmouseenter;
    button.onmouseleave = function() {
        button.style.backgroundColor = button.annotIsActive ?
            MenuButtonActiveColor : MenuButtonDefaultColor;
    };
    return button;
}

let penButton = createMenuButton("pen");
let eraserButton = createMenuButton("eraser");
menuBar.appendChild(penButton);
menuBar.appendChild(eraserButton);

penButton.addEventListener("mousedown", function(e) {
    eraserButton.style.backgroundColor = MenuButtonDefaultColor;
    eraserButton.annotIsActive = false;
    penButton.annotIsActive = true;
    penButton.style.backgroundColor = MenuButtonActiveMouseDownColor;
    chrome.storage.sync.set({annotMode: "pen"});
    chrome.tabs.executeScript(null, {code: "setAnnotMode(AttribModePen);"});
});
eraserButton.addEventListener("mousedown", function(e) {
    penButton.style.backgroundColor = MenuButtonDefaultColor;
    penButton.annotIsActive = false;
    eraserButton.annotIsActive = true;
    eraserButton.style.backgroundColor = MenuButtonActiveMouseDownColor;
    chrome.storage.sync.set({annotMode: "eraser"});
    chrome.tabs.executeScript(null, {code: "setAnnotMode(AttribModeEraser);"});
});

let undoButton = createMenuButton("undo");
undoButton.addEventListener("mousedown", function(e) {
    chrome.tabs.executeScript(null, {code: "undo();"});
});
menuBar.appendChild(undoButton);

let redoButton = createMenuButton("redo");
redoButton.className = "redoButton";
redoButton.innerHTML = "Redo";
redoButton.addEventListener("mousedown", function(e) {
    chrome.tabs.executeScript(null, {code: "redo();"});
});
menuBar.appendChild(redoButton);

chrome.tabs.executeScript(null, {code: "lazyStartAnnotation();"});
chrome.storage.sync.get("annotMode", function(data) {
    if (data.annotMode == "pen") {
        penButton.onmousedown();
    } else if (data.annotMode == "eraser") {
        eraserButton.onmousedown();
    }
});
