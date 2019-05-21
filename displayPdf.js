let url = chrome.runtime.getURL("displayPdf.html");
var myURL;

fetch(url)
.then((response) => response.text())
.then((html) => {
    document.body.innerHTML = html;
    displayPdfX(myURL);
});

function displayPdf(url) {
    myURL = url;
}

function displayPdfX(url) {
    document.body.style.overflow = "auto";
    document.body.style.backgroundColor = "#ccc";

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        chrome.runtime.getURL("pdf.worker.js");
    let loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function(pdf) {
        console.log('PDF loaded');

        var canvases = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            let canvas = document.createElement("canvas");
            canvas.className = "pdfPageCanvas";
            let container = document.getElementById("viewerContainer");
            let pageDiv = document.createElement("div");
            pageDiv.className = "pdfPage";
            pageDiv.appendChild(canvas);
            container.appendChild(pageDiv);
            canvases.push(canvas);
        }

        var pages = [], renderContexts = [], hasRendered = [];

        function drawVisiblePages() {
            for (let i = 0; i < pdf.numPages; i++) {
                let rect = canvases[i].getBoundingClientRect();
                if ((rect.top >= 0 && rect.top < window.innerHeight) ||
                    (rect.bottom >= 0 && rect.bottom <= window.innerHeight)) {
                    for (let j = i; j <= i + 2; j++) {
                        if (j < 0 || j >= pdf.numPages) continue;
                        if (hasRendered[j]) continue;
                        hasRendered[j] = true;
                        let renderTask = pages[j].render(renderContexts[j]);
                        renderTask.promise.then(function() {
                            console.log("rendered", j);
                        });
                    }
                }
            }
        }

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            pdf.getPage(pageNumber).then(function(page) {
                console.log('Page loaded');

                let scale = window.devicePixelRatio * 1;  // TODO

                // Prepare canvas using PDF page dimensions
                let canvas = canvases[pageNumber - 1];
                console.log(canvas);
                let context = canvas.getContext('2d');
                let viewport = page.getViewport({scale: scale});
                console.log(viewport);

                canvas.width = viewport.width;// * window.devicePixelRatio;
                canvas.height = viewport.height;// * window.devicePixelRatio;
                canvas.style.width = viewport.width / scale + "px";
                canvas.style.height = viewport.height / scale + "px";

                // Render PDF page into canvas context
                let renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                pages.push(page);
                renderContexts.push(renderContext);
                hasRendered.push(false);

                if (pages.length == pdf.numPages) {
                    drawVisiblePages();
                }
//                var renderTask = page.render(renderContext);
//                renderTask.promise.then(function () {
//                    console.log('Page rendered');
//                });

            });
        }

        window.onwheel = function(e) {
            console.log(e);
            // TODO
        };

        window.addEventListener("scroll", function(event) {
            drawVisiblePages();
        }, false);
    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}
