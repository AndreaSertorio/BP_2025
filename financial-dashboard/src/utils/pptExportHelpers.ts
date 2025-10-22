/**
 * PowerPoint Export Helpers
 * NOTA: pptxgenjs non funziona nel browser (richiede Node.js/fs)
 * Usa Export PDF invece!
 */

import type { AnnualCalculation } from '@/types/financialPlan.types';

/**
 * Export PowerPoint - Placeholder
 * pptxgenjs usa node:fs che non è compatibile con Next.js client-side
 */
export async function exportPowerPoint(_annualData: AnnualCalculation[], _type: string) {
  alert(
    '📊 Export PowerPoint non disponibile nel browser\n\n' +
    'pptxgenjs richiede Node.js e non funziona lato client.\n\n' +
    'Alternativa: Usa Export PDF che funziona perfettamente!\n' +
    '• Business Plan Report\n' +
    '• Dashboard Snapshot\n' +
    '• Investor Deck PDF\n' +
    '• Financial Statements'
  );
}

/**
 * Export template configurabile PowerPoint
 */
export async function exportCustomPowerPoint() {
  alert(
    '🎨 Template Personalizzati\n\n' +
    'Funzionalità in arrivo!\n' +
    'Potrai configurare slides, grafici e KPI personalizzati.'
  );
}
