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
  
  const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const margin = 10; // mm breathing space
  const innerWidth = pdfWidth - margin * 2;
  const innerHeight = pdfHeight - margin * 2;
  
  const imgWidth = innerWidth;
  const imgHeight = (canvas.height * innerWidth) / canvas.width;
  
  let heightLeft = imgHeight;
  let position = 0; // The top of the image relative to the current PDF page
  
  // First page
  pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight, undefined, "FAST");
  heightLeft -= innerHeight;
  
  // Add subsequent pages if the image is taller than one page
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", margin, position + margin, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= innerHeight;
  }

  pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}
