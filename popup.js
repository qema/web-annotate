const MenuButtonDefaultColor = "rgba(0, 0, 0, 0)";
const MenuButtonHoverColor = "#cccccc";
const MenuButtonActiveColor = "#bbb";
const MenuButtonActiveHoverColor = "#aaa";

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
    chrome.tabs.executeScript(null, {code: "setAnnotMode(AttribModePen);"});
};
eraserButton.onmousedown = function() {
    penButton.style.backgroundColor = MenuButtonDefaultColor;
    penButton.annotIsActive = false;
    eraserButton.style.backgroundColor = MenuButtonActiveHoverColor;
    eraserButton.annotIsActive = true;
    chrome.tabs.executeScript(null, {code: "setAnnotMode(AttribModeEraser);"});
};

let undoButton = createMenuButton("undo");
undoButton.onclick = function() {
    chrome.tabs.executeScript(null, {code: "undo();"});
};
menuBar.appendChild(undoButton);

let redoButton = createMenuButton("redo");
redoButton.className = "redoButton";
redoButton.innerHTML = "Redo";
redoButton.onclick = function() {
    chrome.tabs.executeScript(null, {code: "redo();"});
};
menuBar.appendChild(redoButton);

penButton.onmousedown();

chrome.tabs.executeScript(null, {code: "lazyStartAnnotation();"});
