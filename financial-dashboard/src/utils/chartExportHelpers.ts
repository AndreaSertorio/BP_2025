/**
 * Chart Export Helpers - Export grafici come immagini PNG
 */

import html2canvas from 'html2canvas';

/**
 * Esporta un singolo grafico come PNG
 */
export async function exportChartAsPNG(chartId: string, filename?: string) {
  try {
    const chartElement = document.getElementById(chartId);
    
    if (!chartElement) {
      console.error(`Chart element with id "${chartId}" not found`);
      throw new Error(`Grafico "${chartId}" non trovato`);
    }

    // Converti il chart in canvas
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Alta qualità
      logging: false
    });

    // Converti canvas in blob
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Errore nella conversione del grafico');
      }

      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `${chartId}_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');

  } catch (error) {
    console.error('Errore export chart:', error);
    throw error;
  }
}

/**
 * Esporta tutti i grafici visibili in una pagina
 * NOTA: Cerca in TUTTA la pagina, non solo nel tab attivo
 */
export async function exportAllChartsAsPNG() {
  try {
    // STRATEGIA: Cerca SPECIFICAMENTE nel tab Grafici, anche se nascosto
    
    // 1. Trova il tab panel "Grafici" (anche se non attivo)
    const allTabPanels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
    const graficiPanel = allTabPanels.find(panel => {
      const heading = panel.querySelector('h2, h3');
      return heading?.textContent?.includes('Grafici') || 
             heading?.textContent?.includes('Revenue') ||
             heading?.textContent?.includes('EBITDA');
    });
    
    console.log('🔍 Tab panel Grafici trovato:', graficiPanel ? 'SI' : 'NO');
    
    let validContainers: HTMLElement[] = [];
    
    // 2. Se troviamo il panel Grafici, cerca SOLO lì dentro
    if (graficiPanel) {
      // Cerca i recharts container NEL TAB GRAFICI
      const chartsInPanel = graficiPanel.querySelectorAll('.recharts-responsive-container, .recharts-wrapper, svg.recharts-surface');
      
      if (chartsInPanel.length > 0) {
        // Prendi i parent Card per avere titolo + grafico
        validContainers = Array.from(chartsInPanel)
          .map(chart => {
            // Risali fino al Card (div con bordo/shadow)
            let parent = chart.parentElement;
            while (parent && !parent.className.includes('rounded') && parent !== graficiPanel) {
              parent = parent.parentElement;
            }
            return parent || chart.parentElement;
          })
          .filter((el): el is HTMLElement => el !== null && el instanceof HTMLElement);
      }
    }
    
    // 3. Fallback: cerca in tutta la pagina
    if (validContainers.length === 0) {
      const containers1 = Array.from(document.querySelectorAll('.recharts-responsive-container'));
      validContainers = containers1.filter((el): el is HTMLElement => el instanceof HTMLElement);
    }
    
    // DEBUG
    console.log('🔍 Grafici trovati:', validContainers.length);
    console.log('Containers:', validContainers);
    
    if (validContainers.length === 0) {
      // ULTIMO TENTATIVO: Cerca il tab Grafici nascosto e cattura quello
      const graficiTab = document.querySelector('[aria-label="Grafici"]') || 
                        document.querySelector('[data-value="charts"]') ||
                        Array.from(document.querySelectorAll('[role="tabpanel"]'))
                          .find(tab => tab.textContent?.includes('Grafici'));
      
      if (graficiTab) {
        console.log('📊 Trovato tab Grafici, catturo quello:', graficiTab);
        const canvas = await html2canvas(graficiTab as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Eco3D_Tutti_Grafici_${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 'image/png');
        
        alert('✅ Export completato!\n\nScreenshot dell\'area grafici salvato.');
        return;
      }
      
      alert(
        '📊 Nessun grafico trovato\n\n' +
        'I grafici potrebbero non essere ancora caricati.\n' +
        'Prova ad aprire il tab "Grafici" una volta,\n' +
        'poi torna qui e riprova.'
      );
      throw new Error('Nessun grafico trovato nella pagina');
    }

    // Esporta ogni grafico trovato
    for (let i = 0; i < validContainers.length; i++) {
      const container = validContainers[i] as HTMLElement;
      
      // Trova il Card parent per catturare anche il titolo
      const cardElement = container.closest('[class*="rounded"]') as HTMLElement || container;
      
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      // Download con delay per evitare conflitti
      await new Promise(resolve => setTimeout(resolve, 300));

      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Eco3D_Grafico_${i + 1}_${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    }

    // Mostra conferma
    alert(`✅ Export completato!\n\n${validContainers.length} grafici esportati come PNG.`);

  } catch (error) {
    console.error('Errore export multiple charts:', error);
    throw error;
  }
}

/**
 * Esporta dashboard completo come PNG (screenshot)
 */
export async function exportDashboardAsPNG() {
  try {
    // Cerca il contenitore principale dei grafici
    let dashboardElement = document.getElementById('financial-dashboard') as HTMLElement;
    
    // Se non trova, cerca il tab content attivo
    if (!dashboardElement) {
      dashboardElement = document.querySelector('[role="tabpanel"][data-state="active"]') as HTMLElement;
    }
    
    // Fallback: cerca .space-y-6
    if (!dashboardElement) {
      dashboardElement = document.querySelector('.space-y-6') as HTMLElement;
    }
    
    // Ultimo fallback: body
    if (!dashboardElement) {
      dashboardElement = document.body;
    }

    const canvas = await html2canvas(dashboardElement, {
      backgroundColor: '#f3f4f6',
      scale: 1.5,
      logging: false,
      windowWidth: 1920,
      windowHeight: 1080
    });

    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Errore nella conversione del dashboard');
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Eco3D_Dashboard_Screenshot_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');

  } catch (error) {
    console.error('Errore export dashboard:', error);
    throw error;
  }
}

/**
 * Esporta un componente specifico come PNG
 */
export async function exportComponentAsPNG(elementId: string, filename: string) {
  try {
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error(`Elemento "${elementId}" non trovato`);
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false
    });

    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Errore nella conversione');
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');

  } catch (error) {
    console.error('Errore export component:', error);
    throw error;
  }
}

/**
 * Esporta l'area grafici corrente (alternativa più semplice)
 */
export async function exportChartsAreaAsPNG() {
  try {
    // Cerca l'area dei grafici (il tab content attivo)
    const chartsArea = document.querySelector('[role="tabpanel"][data-state="active"]') as HTMLElement;
    
    if (!chartsArea) {
      alert('Vai al tab Grafici prima di esportare');
      throw new Error('Area grafici non trovata');
    }

    const canvas = await html2canvas(chartsArea, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false
    });

    canvas.toBlob((blob) => {
      if (!blob) throw new Error('Errore conversione');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Eco3D_Grafici_Area_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');

  } catch (error) {
    console.error('Errore export charts area:', error);
    throw error;
  }
}
