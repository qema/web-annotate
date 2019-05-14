chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(null, {file: "annotOps.js"});
    chrome.tabs.executeScript(null, {file: "content.js"});
});

//chrome.runtime.onInstalled.addListener(function() {
//	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//		chrome.declarativeContent.onPageChanged.addRules([{
//            conditions: [new chrome.declarativeContent.PageStateMatcher()],
//			actions: [new chrome.declarativeContent.ShowPageAction()]
//		}]);
//	});
//});
