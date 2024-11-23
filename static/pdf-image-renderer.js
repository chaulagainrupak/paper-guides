// Image rendering function
function renderImageFromElement(element, base64Data) {
  if (!element || !base64Data) {
    element.innerHTML = '<p class="error">No image data available</p>';
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
    element.textContent = "";
    element.appendChild(imgElement);

    imgElement.onload = () => URL.revokeObjectURL(imageUrl);
  } catch (error) {
    console.error("Failed to render image:", error);
    element.innerHTML =
      '<p class="error">Error loading image. The data may be corrupted.</p>';
  }
}

// PDF rendering function with image fallback
async function renderPDFElement(element, base64Data) {
  if (!element || !base64Data) {
      element.innerHTML = '<p class="error">No PDF data available</p>';
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

      // Add fallback handling
      object.onerror = async () => {
          try {
              // Load PDF.js library if not already loaded
              if (!window.pdfjsLib) {
                  await loadPDFJS();
              }

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
              
              // Replace PDF object with image container
              container.innerHTML = "";
              container.appendChild(imageContainer);
          } catch (error) {
              console.error("Failed to render PDF as images:", error);
              container.innerHTML = '<p class="error">Error loading PDF. Please try downloading instead.</p>';
          }
      };

      // Add download link as fallback content
      object.innerHTML = `
          <p>Your browser doesn't support embedded PDFs.
          <a href="${pdfDataUrl}" class="pdf-download" download="document.pdf">Download the PDF</a> instead.
          </p>
      `;

      container.appendChild(object);
      element.innerHTML = "";
      element.appendChild(container);

  } catch (error) {
      console.error("Failed to render PDF:", error);
      element.innerHTML = '<p class="error">Error loading PDF. The data may be corrupted.</p>';
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
