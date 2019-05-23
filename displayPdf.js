const ScrollDrawInterval = 100;

var myURL;

let viewerUrl = chrome.runtime.getURL("displayPdf.html");
fetch(viewerUrl)
.then((response) => response.text())
.then((html) => {
    document.body.innerHTML = html;
    document.body.style.overflow = "auto";
    document.body.style.backgroundColor = "#ccc";

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        chrome.runtime.getURL("pdf.worker.js");
    displayPdf(myURL);
});

function setPdfUrl(url) {
    myURL = url;
}

function displayPdfOld(url) {
    let container = document.getElementById("viewerContainer");

    let linkService = new pdfjsViewer.PDFLinkService();
    let renderingQueue = new PDFRenderingQueue();
    let pdfViewer = new pdfjsViewer.PDFViewer({
        container: container,
        linkService: linkService,
//        renderingQueue: renderingQueue,
        //renderer: "svg"
    });
    console.log(pdfViewer);
    renderingQueue.setViewer(pdfViewer);
    linkService.setViewer(pdfViewer);

    let loadingTask = pdfjsLib.getDocument({url: url});
    loadingTask.promise.then(function(pdfDoc) {
        pdfViewer.setDocument(pdfDoc);
        linkService.setDocument(pdfDoc, null);
    });
}

function scrollToPage(pageView, destArray) {
    //if (destArray[1].name == "XYZ") {  // TODO
    window.scroll({top: pageView.div.offsetTop});
}

function displayPdf(url) {
    let loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function(pdf) {
        console.log('PDF loaded');

        var pages = [], pageViews = [], hasRendered = [];

        // TODO: optimize
        function drawVisiblePages() {
            for (let i = 0; i < pdf.numPages; i++) {
                let rect = pageViews[i].div.getBoundingClientRect();
                if (!((rect.bottom < 0 || rect.top > window.innerHeight))) {
                    for (let j = i - 1; j <= i + 2; j++) {
                        if (j < 0 || j >= pdf.numPages) continue;
                        if (hasRendered[j]) continue;
                        hasRendered[j] = true;
                        pageViews[j].draw();
                    }
                    break;
                }
            }
        }

        let linkService = {
            getDestinationHash: function(dest) {
                return "#" + escape(dest);
            },
            navigateTo: function(dest) {
                pdf.getDestination(dest).then((destArray) => {
                    pdf.getPageIndex(destArray[0]).then((pageIndex) => {
                        scrollToPage(pageViews[pageIndex], destArray);
                    });
                });
            }
        };

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            pdf.getPage(pageNumber).then(function(page) {
                //console.log('Page loaded');

                let scale = 1;//window.devicePixelRatio * 1;  // TODO

                let container = document.getElementById("viewer");
                let viewport = page.getViewport({scale: scale});
                let textLayerFactory =
                    new pdfjsViewer.DefaultTextLayerFactory();
//                let annotationLayerFactory =
//                    new pdfjsViewer.DefaultAnnotationLayerFactory();
				let annotationLayerFactory = {
					createAnnotationLayerBuilder: function(pageDiv, pdfPage,
						imageResourcesPath = '',
						renderInteractiveForms = false,
						l10n = NullL10n) {
						return new pdfjsViewer.AnnotationLayerBuilder({
							pageDiv,
							pdfPage,
							imageResourcesPath,
							renderInteractiveForms,
							linkService: linkService,
							downloadManager: null,
							l10n,
						});
					}  
                };
                let pdfPageView = new pdfjsViewer.PDFPageView({
                    container: container,
                    id: pageNumber,
                    scale: scale,
                    defaultViewport: viewport,
                    textLayerFactory: textLayerFactory,
                    annotationLayerFactory: annotationLayerFactory,
                    renderer: "svg"
                });
                pdfPageView.setPdfPage(page);
                pageViews.push(pdfPageView);
//                // Prepare canvas using PDF page dimensions
//                let pageContainer = pageContainers[pageNumber - 1];
////                let context = canvas.getContext('2d');
//                let viewport = page.getViewport({scale: scale});
//
//                pageContainer.style.width = viewport.width / scale + "px";
//                pageContainer.style.height = viewport.height / scale + "px";
//
////                canvas.width = viewport.width;// * window.devicePixelRatio;
////                canvas.height = viewport.height;// * window.devicePixelRatio;
////                canvas.style.width = viewport.width / scale + "px";
////                canvas.style.height = viewport.height / scale + "px";
//
//                // Render PDF page into canvas context
////                let renderContext = {
////                    canvasContext: context,
////                    viewport: viewport
////                };
                pages.push(page);
//                viewports.push(viewport);
//                hasRendered.push(false);

                if (pages.length == pdf.numPages) {
                    drawVisiblePages();
                }
//                var renderTask = page.render(renderContext);
//                renderTask.promise.then(function () {
//                    console.log('Page rendered');
//                });
            });
        }

        var scrollTimeout = null;
        window.addEventListener("scroll", function(event) {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(drawVisiblePages, ScrollDrawInterval);
        }, false);
    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}
