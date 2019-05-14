let startAnnotation = document.getElementById("startAnnotation");

startAnnotation.onclick = function(elt) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(
            tabs[0].id, {file: 'content.js'}
        );
    });
}
