import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Node } from '@xyflow/react';
import type { DiagramNodeData, EditorSettings } from '../types';

interface GenerateReportOptions {
  nodes: Node<DiagramNodeData>[];
  settings: EditorSettings;
  vesselName?: string;
  plantName?: string;
}

export async function generatePdfReport({ nodes, settings, vesselName = "R-202", plantName = "PDH" }: GenerateReportOptions) {
  // Create an A4 portrait document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Extract specific nodes for data mapping
  const shells = nodes.filter(n => n.type === 'vesselShell');
  const heads = nodes.filter(n => n.type === 'vesselHead');
  const nozzles = nodes.filter(n => n.type === 'vesselNozzle');
  const supports = nodes.filter(n => n.type === 'vesselSupport');

  // Primary Shell properties (if any)
  const mainShell = shells[0]?.data;
  const shellDiameter = mainShell?.calcInputs?.diameter || mainShell?.calcInputs?.radius ? ((mainShell.calcInputs?.radius || 0) * 2) : '-';
  const shellLength = mainShell?.calcInputs?.length || '-';
  const shellThickness = mainShell?.calcInputs?.thickness || '-';
  
  const mainHead = heads[0]?.data;
  const headType = mainHead?.calcShape || '-';
  const headThickness = mainHead?.calcInputs?.thickness || '-';

  const supportType = supports.length > 0 ? (supports[0]?.data?.calcShape || 'Skirt') : '-';

  // Format date
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' });

  // 1. HEADER SECTION
  const drawHeader = (data: any) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Logos (Placeholders)
    doc.setFillColor(230, 230, 230);
    doc.rect(14, 10, 20, 20, 'F');
    doc.rect(40, 10, 20, 20, 'F');
    doc.setFontSize(7);
    doc.text("Vendor Logo", 15, 20);
    doc.text("Client Logo", 41, 20);

    // Title
    doc.setFontSize(14);
    doc.text("Data Sheet", pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text("Acid Regenerator", pageWidth / 2, 24, { align: 'center' });
    doc.text(vesselName, pageWidth / 2, 29, { align: 'center' });

    // Meta Table on the right
    const metaStartX = pageWidth - 65;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text("Prepared by:", metaStartX, 13);
    doc.text("Check & App. by:", metaStartX, 18);
    doc.text(`Date: ${dateStr}`, metaStartX, 23);
    doc.text(`Page: ${data.pageNumber} / ${data.pageCount}`, metaStartX, 28);
    doc.text(`Plant: ${plantName}`, metaStartX, 33);
    
    // Lines around meta
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.line(metaStartX - 2, 10, pageWidth - 14, 10);
    doc.line(metaStartX - 2, 15, pageWidth - 14, 15);
    doc.line(metaStartX - 2, 20, pageWidth - 14, 20);
    doc.line(metaStartX - 2, 25, pageWidth - 14, 25);
    doc.line(metaStartX - 2, 30, pageWidth - 14, 30);
    doc.line(metaStartX - 2, 35, pageWidth - 14, 35);
  };

  // 2. MAIN DATA TABLES
  // Define standard table styling matching the picture (grey headers, tight rows)
  const baseTableStyles = {
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1, lineColor: [150, 150, 150], lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 35, fillColor: [255, 255, 255] }, 
      1: { cellWidth: 100 }, 
      2: { cellWidth: 45, halign: 'center' } 
    },
    margin: { top: 40 },
    didDrawPage: drawHeader,
  };

  // Primary Parameters Table
  const parametersBody = [
    [{ content: 'General Data', rowSpan: 5 }, 'Ref. Process Data Sheet', '-'],
    ['Ref. Mechanical Data Sheet', '-'],
    ['Process Special Service', 'Sulfuric Acid Service'],
    ['Design Code', settings.asmeCodeEdition || 'Current'],
    ['Service Condition', '-'],
    
    [{ content: 'Operating Data', rowSpan: 4 }, 'Operating Temperature (°C)', '530'],
    ['Operating Pressure Internal (barg)', '13.8'],
    ['Operating Pressure External (barg)', '--'],
    ['Density Liquid (kg/m³)', '--'],
    
    [{ content: 'Design Data', rowSpan: 6 }, 'Design Temperature (°C)', '580'],
    ['Minimum Design Metal Temperature (°C)', '0'],
    ['Design Pressure Internal (barg)', '15'],
    ['Design Pressure External (barg)', '--'],
    ['Maximum Allowable Working Pressure (barg)', '--'],
    ['Tower Deflection (in./100ft.)', (settings.allowableTowerDeflection ?? 6).toString()],
    
    [{ content: 'Body Material & \nWelded Material', rowSpan: 11 }, 'Plate Pressurized', 'SA-353'],
    ['Forged Flange', 'SA-350 LF3'],
    ['Seamless Pipe', 'SA-335 P22'],
    ['Welded Pipe', 'SA-335 P22'],
    ['Forged Fitting', 'SA-350 LF3'],
    ['Stud Bolt', 'SA-193 B16'],
    ['Nut', 'SA-194 16'],
    ['Gasket', '--'],
    ['Corrosion Allowance Body (mm)', { content: '0', styles: { textColor: [200, 0, 0] } }],
    ['Corrosion Allowance Welded Internal (mm)', { content: '0', styles: { textColor: [200, 0, 0] } }],
  ];

  autoTable(doc, {
    ...baseTableStyles,
    head: [['Subject', 'Parameters', 'Value']],
    body: parametersBody as any,
  } as any);

  // Shell & Head Table
  const shellHeadBody = [
    [{ content: 'Shell & Head', rowSpan: 7 }, 'Orientation', 'Vertical'],
    ['Inside Diameter (mm)', shellDiameter.toString()],
    ['Length "TL-TL" (mm)', shellLength.toString()],
    ['Shell Thickness (mm)', shellThickness.toString()],
    ['Head Type', headType],
    ['Head Thickness (mm)', headThickness.toString()],
    ['Support Type', supportType],
  ];

  autoTable(doc, {
    ...baseTableStyles,
    body: shellHeadBody as any,
    margin: { top: 0 },
    startY: (doc as any).lastAutoTable.finalY + 5,
  } as any);

  // 3. NOZZLE LIST
  const nozzleBody = nozzles.map((n, i) => {
    return [
      i + 1,
      n.data.label || `N${i+1}`,
      `${n.data.calcShape || 'Standard Flange'}`,
      '-',
      '-'
    ];
  });

  if (nozzleBody.length > 0) {
    autoTable(doc, {
      ...baseTableStyles,
      head: [[{ content: 'Nozzle & Connection List', colSpan: 5, styles: { halign: 'center' } }]],
      body: [
        [{ content: 'No.', styles: { fontStyle: 'bold' } }, { content: 'Nozzle Name', styles: { fontStyle: 'bold' } }, { content: 'Flange', styles: { fontStyle: 'bold' } }, { content: 'Pipe', styles: { fontStyle: 'bold' } }, { content: 'Reinforce', styles: { fontStyle: 'bold' } }],
        ...nozzleBody
      ] as any,
      margin: { top: 0 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 35, halign: 'center' },
        2: { cellWidth: 70, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 30, halign: 'center' },
      },
      startY: (doc as any).lastAutoTable.finalY + 5,
    } as any);
  } else {
    // Empty state
    autoTable(doc, {
      ...baseTableStyles,
      head: [[{ content: 'Nozzle & Connection List', colSpan: 5, styles: { halign: 'center' } }]],
      body: [['-', 'No nozzles found in design', '-', '-', '-']],
      margin: { top: 0 },
      startY: (doc as any).lastAutoTable.finalY + 5,
    } as any);
  }

  // Generate ArrayBuffer and return
  return doc.output('arraybuffer');
}
