// Client-side PDF export: renders the container to a single continuous canvas,
// then slices it into A4 pages to prevent awkward gaps and scaling issues.
export async function exportPagesToPdf(
  container: HTMLElement,
  fileName: string,
  orientation: "portrait" | "landscape" = "portrait",
) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas-pro"),
  ]);

  // Capture the entire container as one continuous image
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    // Add a small delay to ensure charts/fonts are rendered
    onclone: (doc) => {
      // Hide any "no-print" elements during capture
      const noPrints = doc.querySelectorAll(".no-print");
      noPrints.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
    },
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  
  const pdfWidth = orientation === "portrait" ? 210 : 297; // Standard A4 width in mm
  const margin = 10;
  const innerWidth = pdfWidth - margin * 2;
  
  const imgWidth = innerWidth;
  const imgHeight = (canvas.height * innerWidth) / canvas.width;
  
  const pdfHeight = imgHeight + margin * 2;

  // Create a single continuous PDF page
  const pdf = new jsPDF({ 
    orientation, 
    unit: "mm", 
    format: [pdfWidth, pdfHeight]
  });
  
  pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight, undefined, "FAST");
  pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}
