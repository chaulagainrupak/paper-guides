let preservedScrollPositions = {};
let uniqueIdCounter = 0;

function ensureElementHasId(el) {
  if (!el.id) {
    el.id = "container-" + uniqueIdCounter++;
  }
  return el.id;
}

function attachScrollPreservation(container) {
  ensureElementHasId(container);
  container.addEventListener("scroll", () => {
    preservedScrollPositions[container.id] = container.scrollTop;
  });
}

function restoreScroll(container) {
  const saved = preservedScrollPositions[container.id];
  if (saved !== undefined) {
    container.scrollTop = saved;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.paper-pdf').forEach(el => {
    el.innerHTML = getLoaderHTML();
  });
  document.querySelectorAll('.question-image').forEach(el => {
    renderImageFromElement(el, el.getAttribute('data-compressed'));
  });
  document.querySelectorAll('.solution-image').forEach(el => {
    renderImageFromElement(el, el.getAttribute('data-compressed'));
  });
  fetchDocumentData();

  if (isMobile() && document.querySelectorAll(".btn.solution-toggle").length > 0) {
    const toggleContainer = document.createElement("div");
    toggleContainer.id = "mobileToggleContainer";
    toggleContainer.innerHTML = `
      <button id="toggleViewMobileButton" style="
        position: fixed;
        bottom: 50px;
        left: 50px;
        width: 60px;
        height: 60px;
        padding: 18px;
        font-size: 18px;
        background: #5d71e0;
        color: white;
        border: none;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 999999;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        scale: 1.5;
      "
      onclick="showSolution(this)">
        <i class="fas fa-eye"></i>
      
      </button>
    `;
    document.body.appendChild(toggleContainer);

  }
  
});

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
function isSafari() {
  return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
}
function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

function getLoaderHTML() {
  return `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 30px;
      background: linear-gradient(135deg, #ffffff, #f0f4f8);
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      animation: fadeIn 0.5s ease-in-out;
    ">
      <div style="font-size: 22px; font-weight: 600; color: #444; margin-bottom: 15px;">
        🕒 Loading Document...
      </div>
      <div style="
        width: 70px;
        height: 70px;
        border: 6px solid #e0e0e0;
        border-top: 6px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 15px;
      "></div>
      <p style="font-size: 15px; color: #666; text-align: center; margin: 0;">
        Please wait while we fetch and prepare your document.
      </p>
    </div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
  `;
}

function getProcessingLoaderHTML(status, delayMessage) {
  return `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px;
      background: linear-gradient(135deg, #ffffff, #f0f4f8);
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      animation: fadeIn 0.5s ease-in-out;
    ">
      <div style="font-size: 20px; color: #444; margin-bottom: 10px;">
        Processing data...
      </div>
      <h1 style="font-size: 26px; color: #444; margin-bottom: 5px;">
        ${delayMessage}
      </h1>
      <div style="font-size: 14px; color: #888; margin-bottom: 15px;">
        ${status}
      </div>
      <div style="
        width: 70px;
        height: 70px;
        border: 6px solid #e0e0e0;
        border-top: 6px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
    </div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
  `;
}

function updateLoaderMessage(status) {
  // Random delay between 3 and 6 seconds.
  const randomSec = Math.floor(Math.random() * 4) + 3;
  const delayMessage = `Please wait approximately ${randomSec} seconds`;
  document.querySelectorAll('.paper-pdf').forEach(el => {
    el.innerHTML = getProcessingLoaderHTML(status, delayMessage);
  });
}

async function fetchDocumentData() {
  try {
    updateLoaderMessage("Fetching document data...");
    const response = await fetch(window.location.pathname, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'file-raw-data': 'true'
      },
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch document data');
    }
    const data = await response.json();
    updateLoaderMessage("Processing data...");
    processDocumentData(data);
  } catch (error) {
    console.error('Error fetching document data:', error);
    document.querySelectorAll('.paper-pdf').forEach(el => {
      el.innerHTML = getErrorHTML('Failed to load document data');
    });
  }
}

function processDocumentData(data) {
  if (data.question) {
    document.querySelectorAll('.paper-pdf.question-pdf').forEach(el => {
      renderPDFElement(el, data.question);
      const downloadQuestion = document.querySelector(".download-question");
      if (downloadQuestion) {
        const pdfDataUrl = createPDFDataUrl(data.question);
        downloadQuestion.setAttribute("onclick", `downloadFile("${pdfDataUrl}", "question.pdf");`);
      }
    });
  }
  if (data.solution) {
    document.querySelectorAll('.paper-pdf.solution-pdf').forEach(el => {
      renderPDFElement(el, data.solution);
      const downloadSolution = document.querySelector(".download-solution");
      if (downloadSolution) {
        const pdfDataUrl = createPDFDataUrl(data.solution);
        downloadSolution.setAttribute("onclick", `downloadFile("${pdfDataUrl}", "solution.pdf");`);
      }
    });
  }
}

function createPDFDataUrl(base64Data) {
  try {
    const binaryData = atob(base64Data);
    const uint8Array = new Uint8Array(binaryData.split("").map(c => c.charCodeAt(0)));
    const decompressedData = pako.inflate(uint8Array);
    let binary = "";
    decompressedData.forEach(byte => binary += String.fromCharCode(byte));
    return `data:application/pdf;base64,${btoa(binary)}`;
  } catch (error) {
    console.error('Error creating PDF data URL:', error);
    return null;
  }
}

function renderImageFromElement(el, base64Data) {
  if (!el || !base64Data) {
    el.innerHTML = getErrorHTML('No image data available');
    return;
  }
  try {
    const decoded = decodeURIComponent(base64Data);
    const cleaned = cleanBase64(decoded);
    const binaryString = atob(cleaned);
    const uint8Array = new Uint8Array(binaryString.split("").map(c => c.charCodeAt(0)));
    const decompressedData = pako.inflate(uint8Array);
    const blob = new Blob([decompressedData], { type: "image/png" });
    const imageUrl = URL.createObjectURL(blob);
    const imgEl = document.createElement("img");
    imgEl.src = imageUrl;
    imgEl.style.cssText = "max-width: 100%; height: auto; display: block; margin: 0 auto";
    el.textContent = "";
    el.appendChild(imgEl);
    imgEl.onload = () => URL.revokeObjectURL(imageUrl);
  } catch (error) {
    console.error("Failed to render image:", error);
    el.innerHTML = getErrorHTML('Image load error');
  }
}

async function lazyRenderPdfPages(pdf, container) {
  const imageContainer = document.createElement("div");
  imageContainer.style.cssText = "width: 100%; height: 100%; overflow-y: auto";
  container.innerHTML = "";
  container.appendChild(imageContainer);
  attachScrollPreservation(imageContainer);
  restoreScroll(imageContainer);
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const pagePlaceholder = document.createElement("div");
    pagePlaceholder.id = `page-${pageNum}`;
    pagePlaceholder.style.cssText =
      "min-height: 400px; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fafafa; border: 1px solid #eee; border-radius: 8px";
    pagePlaceholder.innerHTML = `
      <div style="font-size: 16px; color: #777; margin-bottom: 10px;">Rendering page ${pageNum}</div>
      <div style="width: 40px; height: 40px; border: 4px solid #ddd; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;
    imageContainer.appendChild(pagePlaceholder);
  }
  
  const observerOptions = { root: imageContainer, threshold: 0.1 };
  const observer = new IntersectionObserver(async (entries, obs) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const pagePlaceholder = entry.target;
        const pageNum = parseInt(pagePlaceholder.id.split("-")[1], 10);
        if (!pagePlaceholder.getAttribute("data-loaded")) {
          try {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext("2d");
            await page.render({ canvasContext: context, viewport }).promise;
            pagePlaceholder.innerHTML = "";
            pagePlaceholder.appendChild(canvas);
            pagePlaceholder.setAttribute("data-loaded", "true");
            obs.unobserve(pagePlaceholder);
          } catch (err) {
            console.error(`Error loading page ${pageNum}:`, err);
            pagePlaceholder.textContent = `Error loading page ${pageNum}`;
          }
        }
      }
    }
  }, observerOptions);
  imageContainer.childNodes.forEach(child => observer.observe(child));
}

async function renderPDFElement(el, base64Data) {
  if (!el || !base64Data) {
    el.innerHTML = getErrorHTML('No document data available');
    return;
  }
  try {
    const binaryData = atob(base64Data);
    const uint8Array = new Uint8Array(binaryData.split("").map(c => c.charCodeAt(0)));
    const decompressedData = pako.inflate(uint8Array);
    let binary = "";
    decompressedData.forEach(byte => binary += String.fromCharCode(byte));
    const pdfDataUrl = `data:application/pdf;base64,${btoa(binary)}`;
    
    const container = document.createElement("div");
    container.style.cssText = "width: 100%; min-height: 600px; overflow: auto; position: relative";
    // Preserve scroll position for this container.
    ensureElementHasId(container);
    attachScrollPreservation(container);
    
    if (isMobile() && !(isIOS() && isSafari())) {
      if (!window.pdfjsLib) await loadPDFJS();
      container.innerHTML = "";
      container.appendChild(document.createElement("div")).innerHTML = getLoaderHTML();
      const loadingTask = pdfjsLib.getDocument({ data: decompressedData });
      const pdf = await loadingTask.promise;
      lazyRenderPdfPages(pdf, container);
    } else {
      const objectElement = document.createElement("object");
      objectElement.type = "application/pdf";
      objectElement.style.cssText = "width: 100%; min-height: 600px; overflow: auto; display: block";
      objectElement.data = pdfDataUrl;
      objectElement.onerror = async () => {
        try {
          if (!window.pdfjsLib) await loadPDFJS();
          container.innerHTML = "";
          container.appendChild(document.createElement("div")).innerHTML = getLoaderHTML();
          const loadingTask = pdfjsLib.getDocument({ data: decompressedData });
          const pdf = await loadingTask.promise;
          lazyRenderPdfPages(pdf, container);
        } catch (error) {
          console.error("Failed to render PDF as images lazily:", error);
          container.innerHTML = getErrorHTML('Document conversion failed. Please try another browser.');
        }
      };
      objectElement.innerHTML = `
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; text-align: center;">
          <p style="color: #495057;">
            Your browser doesn't support embedded PDFs.
            <a href="${pdfDataUrl}" style="
              display: inline-block;
              background-color: #007bff;
              color: white;
              padding: 10px 15px;
              text-decoration: none;
              border-radius: 5px;
              margin-left: 10px;
            ">Download the Document</a>
          </p>
        </div>
      `;
      container.appendChild(objectElement);
    }
    
    el.innerHTML = "";
    el.appendChild(container);
    restoreScroll(container);
  } catch (error) {
    console.error("Failed to render PDF:", error);
    el.innerHTML = getErrorHTML('Document load error');
  }
}

async function loadPDFJS() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function getErrorHTML(message) {
  return `
    <div style="
      background-color: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 5px;
      text-align: center;
      border: 1px solid #f5c6cb;
    ">
      <strong>🚫 Error</strong>
      <p>${message}</p>
    </div>
  `;
}

function downloadFile(dataUrl, filename) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
  anchor.remove();
}

function cleanBase64(str) {
  str = str.replace(/[^A-Za-z0-9+/=]/g, "");
  if (str.length % 4 !== 0) {
    str = str.padEnd(str.length + (4 - (str.length % 4)), "=");
  }
  return str;
}

