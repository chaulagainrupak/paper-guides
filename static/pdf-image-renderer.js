// Image rendering function
function renderImageFromElement(element, base64Data) {
  if (!element || !base64Data) {
    element.innerHTML = `
      <div class="error-message" style="
        background-color: #f8d7da;
        color: #721c24;
        padding: 15px;
        border-radius: 5px;
        text-align: center;
        border: 1px solid #f5c6cb;
      ">
        <strong>🚫 Image Unavailable</strong>
        <p>Unfortunately, no image data could be found for this content.</p>
      </div>
    `;
    return;
  }

  try {
    const decoded = decodeURIComponent(base64Data);
    const cleaned = cleanBase64(decoded);
    const binaryString = atob(cleaned);
    const uint8Array = new Uint8Array(
      binaryString.split("").map((char) => char.charCodeAt(0)),
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
    element.innerHTML = `
      <div class="error-message" style="
        background-color: #f8d7da;
        color: #721c24;
        padding: 15px;
        border-radius: 5px;
        text-align: center;
        border: 1px solid #f5c6cb;
      ">
        <strong>🖼️ Image Load Error</strong>
        <p>We couldn't load the image. The file might be damaged or incomplete.</p>
      </div>
    `;
  }
}

// PDF rendering function with image fallback
async function renderPDFElement(element, base64Data) {
  if (!element || !base64Data) {
    element.innerHTML = `
      <div class="error-message" style="
        background-color: #f8d7da;
        color: #721c24;
        padding: 15px;
        border-radius: 5px;
        text-align: center;
        border: 1px solid #f5c6cb;
      ">
        <strong>📄 Document Unavailable</strong>
        <p>No document data could be found.</p>
      </div>
    `;
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

    // Try to load PDF first
    const object = document.createElement("object");
    object.type = "application/pdf";
    object.width = "100%";
    object.height = "100%";
    object.data = pdfDataUrl;

    const questionFull = document.querySelector(".question-full");
    const solutionFull = document.querySelector(".solution-full");
    
    if (element.classList.contains("question-pdf")) {
      questionFull.setAttribute("onclick", `window.open('${pdfDataUrl}', '_blank')`);
    } else if (element.classList.contains("solution-pdf")) {
      solutionFull.setAttribute("onclick", `window.open('${pdfDataUrl}', '_blank')`);
    }
    
    // Add fallback handling
    object.onerror = async () => {
      try {
        // Load PDF.js library if not already loaded
        if (!window.pdfjsLib) {
          await loadPDFJS();
        }

        // Create loading indicator
        const loadingIndicator = document.createElement("div");
        loadingIndicator.innerHTML = `
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
              🕒 Rendering Document
            </div>
            <p style="color: #666;">
              Your document is being converted to images. 
              Please wait about 5 seconds.
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
            viewport: viewport
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
    element.innerHTML = `
      <div class="error-message" style="
        background-color: #f8d7da;
        color: #721c24;
        padding: 15px;
        border-radius: 5px;
        text-align: center;w
        border: 1px solid #f5c6cb;
      ">
        <strong>📄 Document Load Error</strong>
        <p>We couldn't load the document. The file might be damaged.</p>
      </div>
    `;
  }
}

// Helper function to load PDF.js library
async function loadPDFJS() {
  return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
  });
}

// Initialize elements when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize images
  document.querySelectorAll(".question-image, .solution-image")
      .forEach((element) => {
          const base64Data = element.getAttribute("data-compressed");
          renderImageFromElement(element, base64Data);
      });

  // Initialize PDFs
  document.querySelectorAll(".paper-pdf").forEach((element) => {
      const base64Data = element.getAttribute("data-compressed");
      renderPDFElement(element, base64Data);
  });
});

// Utility function for base64 handling
function cleanBase64(str) {
  str = str.replace(/[^A-Za-z0-9+/=]/g, "");
  if (str.length % 4 !== 0) {
    str = str.padEnd(str.length + (4 - (str.length % 4)), "=");
  }
  return str;
}
