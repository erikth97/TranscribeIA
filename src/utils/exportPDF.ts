import jsPDF from 'jspdf';
import type { MeetingData, SummaryData } from '../types';

interface PDFContent {
  title: string;
  date: string;
  participants: string;
  type: string;
  content: string;
  wordCount: number;
  duration: string;
}

export const exportToPDF = async (
  summary: SummaryData,
  meetingData: MeetingData,
  wordCount: number = 0,
  duration: number = 0
): Promise<void> => {
  try {
    const pdfContent = generatePDFContent(summary, meetingData, wordCount, duration);
    await generateAdvancedPDF(pdfContent);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    // Fallback to print functionality
    const pdfContent = generatePDFContent(summary, meetingData, wordCount, duration);
    printToPDF(pdfContent);
  }
};

const generatePDFContent = (
  summary: SummaryData, 
  meetingData: MeetingData, 
  wordCount: number, 
  duration: number
): PDFContent => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    title: `Minuta: ${meetingData.name}`,
    date: new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    participants: meetingData.participants.join(', '),
    type: getTypeDisplayName(meetingData.type),
    content: summary.content || 'No hay contenido de resumen disponible.',
    wordCount,
    duration: formatDuration(duration)
  };
};

const getTypeDisplayName = (type: string): string => {
  const typeMap = {
    'daily': 'Daily Standup',
    'planning': 'Planning / Sprint',
    'retrospective': 'Retrospectiva'
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const generateAdvancedPDF = async (content: PDFContent): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // PDF Configuration
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(124, 58, 237); // Purple color
  pdf.text(content.title, margin, yPosition);
  yPosition += lineHeight * 2;

  // Metadata section
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  
  pdf.text(`Fecha: ${content.date}`, margin, yPosition);
  yPosition += lineHeight;
  
  pdf.text(`Tipo de reunión: ${content.type}`, margin, yPosition);
  yPosition += lineHeight;
  
  pdf.text(`Participantes: ${content.participants}`, margin, yPosition);
  yPosition += lineHeight;
  
  pdf.text(`Duración: ${content.duration}`, margin, yPosition);
  yPosition += lineHeight;
  
  pdf.text(`Palabras transcritas: ${content.wordCount.toLocaleString()}`, margin, yPosition);
  yPosition += lineHeight * 2;

  // Content section
  pdf.setFontSize(14);
  pdf.setTextColor(124, 58, 237);
  pdf.text('Resumen de la reunión:', margin, yPosition);
  yPosition += lineHeight * 1.5;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  // Split content into lines that fit the page width
  const contentLines = pdf.splitTextToSize(content.content, pageWidth - (margin * 2));
  
  for (let i = 0; i < contentLines.length; i++) {
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(contentLines[i], margin, yPosition);
    yPosition += lineHeight;
  }

  // Save the PDF
  const fileName = `minuta_${content.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

const printToPDF = (content: PDFContent): void => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${content.title}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              margin: 40px; 
              line-height: 1.6;
              color: #333;
            }
            h1 { 
              color: #7c3aed; 
              border-bottom: 2px solid #7c3aed;
              padding-bottom: 10px;
              margin-bottom: 30px;
            }
            .metadata { 
              background: #f8fafc; 
              padding: 20px; 
              margin: 20px 0; 
              border-radius: 8px;
              border-left: 4px solid #7c3aed;
            }
            .metadata p {
              margin: 8px 0;
              font-weight: 500;
            }
            .content {
              margin-top: 30px;
              text-align: justify;
            }
            .content h3 {
              color: #7c3aed;
              margin-top: 25px;
              margin-bottom: 15px;
            }
          </style>
        </head>
        <body>
          <h1>${content.title}</h1>
          <div class="metadata">
            <p><strong>📅 Fecha:</strong> ${content.date}</p>
            <p><strong>🏷️ Tipo:</strong> ${content.type}</p>
            <p><strong>👥 Participantes:</strong> ${content.participants}</p>
            <p><strong>⏱️ Duración:</strong> ${content.duration}</p>
            <p><strong>📝 Palabras:</strong> ${content.wordCount.toLocaleString()}</p>
          </div>
          <div class="content">
            <h3>📋 Resumen de la reunión</h3>
            <p>${content.content.replace(/\n/g, '<br>')}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};