chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.executeScript(null, {code: "toggleAnnotationView();"});
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status == "complete") {
        // is PDF?
        if (tab.url.toLowerCase().endsWith(".pdf")) {
            chrome.tabs.executeScript(null, {file: "pdf.js"});
            chrome.tabs.executeScript(null, {file: "displayPdf.js"},
                function(res) {
                    chrome.tabs.executeScript(null,
                        {code: 'displayPdf("' + tab.url + '");'});
                }
            );
        }
    }
});

//chrome.runtime.onInstalled.addListener(function() {
//	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//		chrome.declarativeContent.onPageChanged.addRules([{
//            conditions: [new chrome.declarativeContent.PageStateMatcher()],
//			actions: [new chrome.declarativeContent.ShowPageAction()]
//		}]);
//	});
//});
