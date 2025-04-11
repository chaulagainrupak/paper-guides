// Document Renderer - Improved version that fetches data after page load
document.addEventListener("DOMContentLoaded", () => {
  // Initialize placeholder loaders for PDFs and images
  document.querySelectorAll('.paper-pdf').forEach(element => {
    element.innerHTML = getLoaderHTML();
  });

  document.querySelectorAll('.question-image').forEach(element =>{
    renderImageFromElement(element, element.getAttribute('data-compressed'))
  });
  
  document.querySelectorAll('.solution-image').forEach(element =>{
    renderImageFromElement(element, element.getAttribute('data-compressed'))
  });
  // Fetch the data after initial page load
  fetchDocumentData();
});

// Loader HTML template
function getLoaderHTML() {
  return `
    <div style="
      text-align: center;
      padding: 20px;
      background-color: #f0f0f0;
      border-radius: 5px;
    ">
      <div style="
        font-size: 24px;
        margin-bottom: 10px;
        color: #333;
      ">
        🕒 Loading Document
      </div>
      <p style="color: #666;">
        Please wait while we fetch the document data...
      </p>
      <div style="
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      "></div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}

// Fetch document data from API
async function fetchDocumentData() {
  try {
    
    // Make API request to get raw data
    const response = await fetch(window.location.pathname, {
      headers: {
        'file-raw-data': 'true'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch document data');
    }
    
    const data = await response.json();
    
    // Process question and solution data
    if (data.question) {
      const questionElements = document.querySelectorAll('.paper-pdf.question-pdf');
      questionElements.forEach(element => {

          renderPDFElement(element, data.question);
          
          // Update download button if it exists
          const downloadQuestion = document.querySelector(".download-question");
          if (downloadQuestion) {
            const pdfDataUrl = createPDFDataUrl(data.question);
            downloadQuestion.setAttribute(
              "onclick",
              `downloadFile("${pdfDataUrl}", "question.pdf");`
            );
          }
      
        });
    }
    
    if (data.solution) {
      const solutionElements = document.querySelectorAll('.paper-pdf.solution-pdf');
      solutionElements.forEach(element => {
        
          renderPDFElement(element, data.question);

          // Update download button if it exists
          const downloadSolution = document.querySelector(".download-solution");
          if (downloadSolution) {
            const pdfDataUrl = createPDFDataUrl(data.solution);
            downloadSolution.setAttribute(
              "onclick",
              `downloadFile("${pdfDataUrl}", "solution.pdf");`
            );
          }
          
      });
    }
  } catch (error) {
    console.error('Error fetching document data:', error);
    document.querySelectorAll('.paper-pdf').forEach(element => {
      element.innerHTML = getErrorHTML('Failed to load document data');
    });
  }
}

// Create PDF data URL from base64 data
function createPDFDataUrl(base64Data) {
  try {
    const binaryData = atob(base64Data);
    const uint8Array = new Uint8Array(
      binaryData.split("").map((char) => char.charCodeAt(0))
    );
    const decompressedData = pako.inflate(uint8Array);
    let binary = "";
    decompressedData.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const base64PDF = btoa(binary);
    return `data:application/pdf;base64,${base64PDF}`;
  } catch (error) {
    console.error('Error creating PDF data URL:', error);
    return null;
  }
}

// Image rendering function
function renderImageFromElement(element, base64Data) {
  if (!element || !base64Data) {
    element.innerHTML = getErrorHTML('No image data available');
    return;
  }

  try {
    const decoded = decodeURIComponent(base64Data);
    const cleaned = cleanBase64(decoded);
    const binaryString = atob(cleaned);
    const uint8Array = new Uint8Array(
      binaryString.split("").map((char) => char.charCodeAt(0))
    );
    const decompressedData = pako.inflate(uint8Array);
    const blob = new Blob([decompressedData], {
      type: "image/png",
    });
    const imageUrl = URL.createObjectURL(blob);

    const imgElement = document.createElement("img");
    imgElement.src = imageUrl;
    imgElement.style.maxWidth = "100%";
    imgElement.style.height = "auto";
    imgElement.style.display = "block";
    imgElement.style.margin = "0 auto";

    element.textContent = "";
    element.appendChild(imgElement);

    imgElement.onload = () => URL.revokeObjectURL(imageUrl);
  } catch (error) {
    console.error("Failed to render image:", error);
    element.innerHTML = getErrorHTML('Image load error');
  }
}

// PDF rendering function with image fallback
async function renderPDFElement(element, base64Data) {
  if (!element || !base64Data) {
    element.innerHTML = getErrorHTML('No document data available');
    return;
  }

  try {
    const binaryData = atob(base64Data);
    const uint8Array = new Uint8Array(
      binaryData.split("").map((char) => char.charCodeAt(0))
    );
    const decompressedData = pako.inflate(uint8Array);
    let binary = "";
    decompressedData.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const base64PDF = btoa(binary);
    const pdfDataUrl = `data:application/pdf;base64,${base64PDF}`;

    // Create container for PDF or images
    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.overflow = "auto";

    // Create PDF object element
    const object = document.createElement("object");
    object.type = "application/pdf";
    object.width = "100%";
    object.height = "100%";
    object.data = pdfDataUrl;

    // Add fallback handling
    object.onerror = async () => {
      try {
        // Load PDF.js library if not already loaded
        if (!window.pdfjsLib) {
          await loadPDFJS();
        }

        // Create loading indicator
        const loadingIndicator = document.createElement("div");
        loadingIndicator.innerHTML = getLoaderHTML();
        container.innerHTML = "";
        container.appendChild(loadingIndicator);

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({ data: decompressedData });
        const pdf = await loadingTask.promise;

        // Create scrollable container for images
        const imageContainer = document.createElement("div");
        imageContainer.style.width = "100%";
        imageContainer.style.height = "100%";
        imageContainer.style.overflowY = "auto";

        // Render each page as an image
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const context = canvas.getContext("2d");
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const img = document.createElement("img");
          img.src = canvas.toDataURL();
          img.style.width = "100%";
          img.style.marginBottom = "20px";
          imageContainer.appendChild(img);
        }

        // Replace loading indicator with image container
        container.innerHTML = "";
        container.appendChild(imageContainer);
      } catch (error) {
        console.error("Failed to render PDF as images:", error);
        container.innerHTML = `
          <div class="error-message" style="
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            border: 1px solid #f5c6cb;
          ">
            <strong>📄 Document Conversion Failed</strong>
            <p>We couldn't convert the document to images.</p>
            <a href="${pdfDataUrl}" style="
              display: inline-block;
              background-color: #007bff;
              color: white;
              padding: 10px 15px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 10px;
            ">Download Document</a>
          </div>
        `;
      }
    };

    // Add download link as fallback content
    object.innerHTML = `
      <div style="
        background-color: #e9ecef;
        padding: 15px;
        border-radius: 5px;
        text-align: center;
      ">
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

    container.appendChild(object);
    element.innerHTML = "";
    element.appendChild(container);
  } catch (error) {
    console.error("Failed to render PDF:", error);
    element.innerHTML = getErrorHTML('Document load error');
  }
}

// Helper function to load PDF.js library
async function loadPDFJS() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Error HTML template
function getErrorHTML(message) {
  return `
    <div class="error-message" style="
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

// downloadFile function
function downloadFile(dataUrl, filename) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();  // Trigger the download
  anchor.remove(); // Clean up
}

// Utility function for base64 handling
function cleanBase64(str) {
  str = str.replace(/[^A-Za-z0-9+/=]/g, "");
  if (str.length % 4 !== 0) {
    str = str.padEnd(str.length + (4 - (str.length % 4)), "=");
  }
  return str;
}