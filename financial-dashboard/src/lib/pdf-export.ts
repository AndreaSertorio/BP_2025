/**
 * PDF Export Service
 * Genera PDF della Value Proposition in 3 formati
 */

import jsPDF from 'jspdf';
import type { ValueProposition } from '@/types/valueProposition';

export type PDFFormat = 'presentation' | 'report' | 'onepager';

interface PDFOptions {
  format: PDFFormat;
  language: 'it' | 'en';
  includeLogo: boolean;
  includeCharts: boolean;
}

const DEFAULT_OPTIONS: PDFOptions = {
  format: 'presentation',
  language: 'it',
  includeLogo: true,
  includeCharts: true,
};

// Colors
const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    600: '#4b5563',
    900: '#111827',
  },
};

/**
 * Export Value Proposition to PDF
 */
export async function exportValuePropositionToPDF(
  data: ValueProposition,
  options: Partial<PDFOptions> = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  switch (opts.format) {
    case 'presentation':
      await generatePresentationFormat(pdf, data, opts);
      break;
    case 'report':
      await generateReportFormat(pdf, data, opts);
      break;
    case 'onepager':
      await generateOnePagerFormat(pdf, data, opts);
      break;
  }

  // Download
  const fileName = `value-proposition-${opts.format}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}

/**
 * PRESENTATION FORMAT - Visual, slide-like
 */
async function generatePresentationFormat(
  pdf: jsPDF,
  data: ValueProposition,
  options: PDFOptions
): Promise<void> {
  const { language } = options;
  const texts = language === 'it' ? TEXTS_IT : TEXTS_EN;
  
  let currentPage = 0;

  // Page 1: Cover
  addCoverPage(pdf, texts);
  currentPage++;

  // Page 2: Customer Profile Overview
  pdf.addPage();
  addCustomerProfilePage(pdf, data, texts);
  currentPage++;

  // Page 3: Value Map
  pdf.addPage();
  addValueMapPage(pdf, data, texts);
  currentPage++;

  // Page 4: Elevator Pitch & Messaging
  pdf.addPage();
  addMessagingPage(pdf, data, texts);
  currentPage++;

  // Page 5: ROI Calculator Results
  if (data.roiCalculator) {
    pdf.addPage();
    addROIPage(pdf, data, texts);
    currentPage++;
  }

  // Page 6: Competitors
  if (data.competitorAnalysis && data.competitorAnalysis.competitors.length > 0) {
    pdf.addPage();
    addCompetitorsPage(pdf, data, texts);
  }

  // Add page numbers
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter(pdf, i, totalPages);
  }
}

/**
 * REPORT FORMAT - Detailed, text-heavy
 */
async function generateReportFormat(
  pdf: jsPDF,
  data: ValueProposition,
  options: PDFOptions
): Promise<void> {
  const { language } = options;
  const texts = language === 'it' ? TEXTS_IT : TEXTS_EN;

  // Cover
  addCoverPage(pdf, texts);

  // Executive Summary
  pdf.addPage();
  addExecutiveSummary(pdf, data, texts);

  // Detailed Customer Profile
  pdf.addPage();
  addDetailedCustomerProfile(pdf, data, texts);

  // Detailed Value Map
  pdf.addPage();
  addDetailedValueMap(pdf, data, texts);

  // Messaging & Positioning
  pdf.addPage();
  addDetailedMessaging(pdf, data, texts);

  // Competitive Analysis
  if (data.competitorAnalysis && data.competitorAnalysis.competitors.length > 0) {
    pdf.addPage();
    addDetailedCompetitors(pdf, data, texts);
  }

  // Appendix - ROI Calculator
  if (data.roiCalculator) {
    pdf.addPage();
    addDetailedROI(pdf, data, texts);
  }

  // Add page numbers
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter(pdf, i, totalPages);
  }
}

/**
 * ONE-PAGER FORMAT - Executive summary on single page
 */
async function generateOnePagerFormat(
  pdf: jsPDF,
  data: ValueProposition,
  options: PDFOptions
): Promise<void> {
  const { language } = options;
  const texts = language === 'it' ? TEXTS_IT : TEXTS_EN;

  // Header
  addOnePagerHeader(pdf, texts);

  // Quick Value Prop
  addOnePagerValue(pdf, data, texts);

  // Key Benefits
  addOnePagerBenefits(pdf, data, texts);

  // ROI Snapshot
  if (data.roiCalculator) {
    addOnePagerROI(pdf, data, texts);
  }

  // Contact/CTA
  addOnePagerFooter(pdf, texts);
}

/**
 * PAGE COMPONENTS
 */

function addCoverPage(pdf: jsPDF, texts: typeof TEXTS_IT): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Background gradient (simulated with rectangles)
  pdf.setFillColor(COLORS.primary);
  pdf.rect(0, 0, pageWidth, pageHeight / 2, 'F');
  pdf.setFillColor(COLORS.secondary);
  pdf.rect(0, pageHeight / 2, pageWidth, pageHeight / 2, 'F');

  // Logo (placeholder)
  pdf.setFillColor(255, 255, 255);
  pdf.circle(pageWidth / 2, 60, 20, 'F');
  pdf.setFontSize(16);
  pdf.setTextColor(COLORS.primary);
  pdf.text('ECO 3D', pageWidth / 2, 62, { align: 'center' });

  // Title
  pdf.setFontSize(32);
  pdf.setTextColor(255, 255, 255);
  pdf.text(texts.cover.title, pageWidth / 2, 120, { align: 'center' });

  // Subtitle
  pdf.setFontSize(16);
  pdf.text(texts.cover.subtitle, pageWidth / 2, 135, { align: 'center' });

  // Date
  pdf.setFontSize(12);
  const date = new Date().toLocaleDateString('it-IT');
  pdf.text(date, pageWidth / 2, pageHeight - 30, { align: 'center' });
}

function addCustomerProfilePage(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(COLORS.gray[900]);
  pdf.text(texts.customerProfile.title, 20, y);
  y += 15;

  // Get active segment
  const activeSegmentId = data.customerProfile.activeSegmentId;
  const activeSegment = activeSegmentId 
    ? data.customerProfile.segments.find(s => s.id === activeSegmentId) 
    : data.customerProfile.segments[0];
  
  if (!activeSegment) return;

  // Segment name
  pdf.setFontSize(14);
  pdf.setTextColor(COLORS.primary);
  pdf.text(`${texts.customerProfile.segment}: ${activeSegment.name}`, 20, y);
  y += 15;

  // Jobs
  y = addSection(pdf, texts.customerProfile.jobs, activeSegment.jobs, y, pageWidth, COLORS.primary);

  // Pains
  if (y < 240) {
    y = addSection(pdf, texts.customerProfile.pains, activeSegment.pains, y, pageWidth, COLORS.danger);
  }

  // Gains (se c'è spazio)
  if (y < 240) {
    y = addSection(pdf, texts.customerProfile.gains, activeSegment.gains, y, pageWidth, COLORS.success);
  }
}

function addValueMapPage(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(COLORS.gray[900]);
  pdf.text(texts.valueMap.title, 20, y);
  y += 15;

  // Features
  pdf.setFontSize(16);
  pdf.setTextColor(COLORS.primary);
  pdf.text(texts.valueMap.features, 20, y);
  y += 8;

  // Get all features from all products/services
  const allFeatures = data.valueMap.productsAndServices
    .flatMap(ps => ps.features)
    .filter(f => f.visible !== false)
    .slice(0, 5);
  pdf.setFontSize(10);
  pdf.setTextColor(COLORS.gray[600]);
  
  allFeatures.forEach((feature: any) => {
    pdf.text(`• ${feature.name}`, 25, y);
    y += 5;
    if (feature.description) {
      const desc = pdf.splitTextToSize(feature.description, pageWidth - 50);
      pdf.setTextColor(COLORS.gray[600]);
      pdf.text(desc, 30, y);
      y += desc.length * 4 + 3;
    }
  });

  y += 10;

  // Pain Relievers
  pdf.setFontSize(16);
  pdf.setTextColor(COLORS.danger);
  pdf.text(texts.valueMap.painRelievers, 20, y);
  y += 8;

  const visibleRelievers = data.valueMap.painRelievers.filter(pr => pr.visible !== false).slice(0, 4);
  pdf.setFontSize(10);
  
  visibleRelievers.forEach(reliever => {
    pdf.text(`• ${reliever.description.substring(0, 80)}...`, 25, y);
    y += 6;
  });

  y += 10;

  // Gain Creators
  if (y < 240) {
    pdf.setFontSize(16);
    pdf.setTextColor(COLORS.success);
    pdf.text(texts.valueMap.gainCreators, 20, y);
    y += 8;

    const visibleCreators = data.valueMap.gainCreators.filter(gc => gc.visible !== false).slice(0, 4);
    pdf.setFontSize(10);
    
    visibleCreators.forEach(creator => {
      pdf.text(`• ${creator.description.substring(0, 80)}...`, 25, y);
      y += 6;
    });
  }
}

function addMessagingPage(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(COLORS.gray[900]);
  pdf.text(texts.messaging.title, 20, y);
  y += 15;

  // Elevator Pitch
  pdf.setFontSize(16);
  pdf.setTextColor(COLORS.primary);
  pdf.text(texts.messaging.elevatorPitch, 20, y);
  y += 8;

  pdf.setFontSize(11);
  pdf.setTextColor(COLORS.gray[900]);
  const pitch = pdf.splitTextToSize(data.messaging.elevatorPitch.content, pageWidth - 40);
  pdf.text(pitch, 20, y);
  y += pitch.length * 6 + 10;

  // Value Statements
  if (data.messaging.valueStatements && data.messaging.valueStatements.length > 0 && y < 220) {
    const mainStatement = data.messaging.valueStatements[0];
    
    pdf.setFontSize(16);
    pdf.setTextColor(COLORS.primary);
    pdf.text(mainStatement.headline, 20, y);
    y += 8;

    pdf.setFontSize(11);
    pdf.setTextColor(COLORS.gray[900]);
    const body = pdf.splitTextToSize(mainStatement.body, pageWidth - 40);
    pdf.text(body, 20, y);
    y += body.length * 6 + 10;
  }
}

function addROIPage(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(COLORS.gray[900]);
  pdf.text(texts.roi.title, 20, y);
  y += 15;

  const roi = data.roiCalculator!;

  // Assumptions box
  pdf.setFillColor(COLORS.gray[50]);
  pdf.roundedRect(20, y, (pageWidth - 50) / 2, 50, 3, 3, 'F');
  
  pdf.setFontSize(14);
  pdf.setTextColor(COLORS.primary);
  pdf.text(texts.roi.assumptions, 25, y + 8);
  
  pdf.setFontSize(10);
  pdf.setTextColor(COLORS.gray[900]);
  pdf.text(`${texts.roi.patients}: ${roi.assumptions.pazientiMese}`, 25, y + 18);
  pdf.text(`${texts.roi.price}: €${roi.assumptions.prezzoEsame3D}`, 25, y + 26);
  pdf.text(`${texts.roi.penetration}: ${(roi.assumptions.penetrazione3D * 100).toFixed(0)}%`, 25, y + 34);

  // Results box
  pdf.setFillColor(COLORS.success + '20');
  pdf.roundedRect((pageWidth / 2) + 5, y, (pageWidth - 50) / 2, 50, 3, 3, 'F');
  
  pdf.setFontSize(14);
  pdf.setTextColor(COLORS.success);
  pdf.text(texts.roi.results, (pageWidth / 2) + 10, y + 8);
  
  pdf.setFontSize(10);
  pdf.setTextColor(COLORS.gray[900]);
  pdf.text(`${texts.roi.revenue}: €${roi.results.ricaviAggiuntivi.toLocaleString()}`, (pageWidth / 2) + 10, y + 18);
  pdf.text(`${texts.roi.payback}: ${roi.results.paybackPeriod.toFixed(1)} ${texts.roi.months}`, (pageWidth / 2) + 10, y + 26);
  pdf.text(`${texts.roi.roi3y}: ${roi.results.roi3anni.toFixed(1)}x`, (pageWidth / 2) + 10, y + 34);

  y += 60;

  // Big ROI number
  pdf.setFontSize(48);
  pdf.setTextColor(COLORS.success);
  const roiText = `${roi.results.roi3anni.toFixed(1)}x ROI`;
  pdf.text(roiText, pageWidth / 2, y + 30, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setTextColor(COLORS.gray[600]);
  pdf.text(texts.roi.in3years, pageWidth / 2, y + 45, { align: 'center' });
}

function addCompetitorsPage(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(COLORS.gray[900]);
  pdf.text(texts.competitors.title, 20, y);
  y += 15;

  const competitors = data.competitorAnalysis.competitors.filter((c: any) => c.visible !== false).slice(0, 3);

  competitors.forEach((comp, idx) => {
    // Competitor name
    pdf.setFontSize(14);
    pdf.setTextColor(COLORS.primary);
    pdf.text(`${idx + 1}. ${comp.name}`, 20, y);
    y += 8;

    // Strengths & Weaknesses
    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.gray[600]);
    
    // Show top attributes
    const attrs = Object.entries(comp.attributes).slice(0, 3);
    pdf.setFontSize(9);
    pdf.setTextColor(COLORS.gray[600]);
    attrs.forEach(([key, value]: [string, any]) => {
      pdf.text(`  ${key}: ${value}/5`, 25, y);
      y += 5;
    });

    y += 10;

    if (y > 250) return; // Stop if page full
  });
}

function addFooter(pdf: jsPDF, pageNumber: number, totalPages: number): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.gray[600]);
  pdf.text(
    `Eco 3D - Value Proposition | Pagina ${pageNumber} di ${totalPages}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
}

// Helper: Add section with items
function addSection(
  pdf: jsPDF,
  title: string,
  items: any[],
  startY: number,
  pageWidth: number,
  color: string
): number {
  let y = startY;

  pdf.setFontSize(16);
  pdf.setTextColor(color);
  pdf.text(title, 20, y);
  y += 8;

  const visibleItems = items.filter(i => i.visible !== false).slice(0, 4);
  
  pdf.setFontSize(10);
  pdf.setTextColor(COLORS.gray[600]);

  visibleItems.forEach(item => {
    const desc = item.description || item.title || '';
    const shortDesc = desc.length > 70 ? desc.substring(0, 70) + '...' : desc;
    pdf.text(`• ${shortDesc}`, 25, y);
    y += 6;
  });

  return y + 5;
}

// Placeholder functions for detailed formats
function addExecutiveSummary(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  // TODO: Implement detailed executive summary
  pdf.setFontSize(20);
  pdf.text('Executive Summary', 20, 30);
}

function addDetailedCustomerProfile(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  // TODO: Implement detailed customer profile
}

function addDetailedValueMap(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  // TODO: Implement detailed value map
}

function addDetailedMessaging(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  // TODO: Implement detailed messaging
}

function addDetailedCompetitors(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  // TODO: Implement detailed competitors
}

function addDetailedROI(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  // TODO: Implement detailed ROI
}

function addOnePagerHeader(pdf: jsPDF, texts: typeof TEXTS_IT): void {
  // TODO: Implement one-pager header
}

function addOnePagerValue(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  // TODO: Implement one-pager value
}

function addOnePagerBenefits(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  // TODO: Implement one-pager benefits
}

function addOnePagerROI(pdf: jsPDF, data: ValueProposition, texts: typeof TEXTS_IT): void {
  // TODO: Implement one-pager ROI
}

function addOnePagerFooter(pdf: jsPDF, texts: typeof TEXTS_IT): void {
  // TODO: Implement one-pager footer
}

// Texts
const TEXTS_IT = {
  cover: {
    title: 'Value Proposition',
    subtitle: 'Eco 3D - Ecografia di Nuova Generazione',
  },
  customerProfile: {
    title: 'Customer Profile',
    segment: 'Segmento',
    jobs: 'Customer Jobs',
    pains: 'Pains',
    gains: 'Gains',
  },
  valueMap: {
    title: 'Value Map',
    features: 'Features & Prodotti',
    painRelievers: 'Pain Relievers',
    gainCreators: 'Gain Creators',
  },
  messaging: {
    title: 'Messaging',
    elevatorPitch: 'Elevator Pitch',
    statement: 'Value Proposition Statement',
    keyMessages: 'Key Messages',
  },
  roi: {
    title: 'ROI Calculator',
    assumptions: 'Assumptions',
    results: 'Results',
    patients: 'Pazienti/mese',
    price: 'Prezzo esame',
    penetration: 'Penetrazione 3D',
    revenue: 'Ricavi aggiuntivi/mese',
    payback: 'Payback period',
    roi3y: 'ROI 3 anni',
    months: 'mesi',
    in3years: 'in 3 anni',
  },
  competitors: {
    title: 'Competitive Analysis',
    strengths: 'Strengths',
    weaknesses: 'Weaknesses',
  },
};

const TEXTS_EN = {
  cover: {
    title: 'Value Proposition',
    subtitle: 'Eco 3D - Next Generation Ultrasound',
  },
  customerProfile: {
    title: 'Customer Profile',
    segment: 'Segment',
    jobs: 'Customer Jobs',
    pains: 'Pains',
    gains: 'Gains',
  },
  valueMap: {
    title: 'Value Map',
    features: 'Features & Products',
    painRelievers: 'Pain Relievers',
    gainCreators: 'Gain Creators',
  },
  messaging: {
    title: 'Messaging',
    elevatorPitch: 'Elevator Pitch',
    statement: 'Value Proposition Statement',
    keyMessages: 'Key Messages',
  },
  roi: {
    title: 'ROI Calculator',
    assumptions: 'Assumptions',
    results: 'Results',
    patients: 'Patients/month',
    price: 'Exam price',
    penetration: '3D Penetration',
    revenue: 'Additional revenue/month',
    payback: 'Payback period',
    roi3y: 'ROI 3 years',
    months: 'months',
    in3years: 'in 3 years',
  },
  competitors: {
    title: 'Competitive Analysis',
    strengths: 'Strengths',
    weaknesses: 'Weaknesses',
  },
};
