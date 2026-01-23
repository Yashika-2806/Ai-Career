import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (
  elementId: string,
  fileName: string = 'resume.pdf'
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Show the element temporarily if hidden
    const originalDisplay = element.style.display;
    element.style.display = 'block';

    // Wait for fonts and images to load
    await document.fonts.ready;

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Restore original display
    element.style.display = originalDisplay;

    // Calculate dimensions for A4 page
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Handle multi-page if content is too long
    if (imgHeight <= 297) {
      // Fits in one page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // Multi-page
      let heightLeft = imgHeight;
      let position = 0;
      const pageHeight = 297; // A4 height in mm

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    // Save the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const downloadResume = async (
  templateComponent: React.ReactNode,
  fileName: string = 'resume.pdf'
): Promise<void> => {
  // Create a temporary container
  const container = document.createElement('div');
  container.id = 'pdf-temp-container';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm'; // A4 width
  container.style.background = 'white';
  document.body.appendChild(container);

  try {
    // Render the template into the container
    // This would typically use ReactDOM.render or similar
    // For now, we'll use the elementId approach
    await generatePDF('pdf-temp-container', fileName);
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};
