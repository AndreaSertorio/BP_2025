import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { GlobalSettingsService } from '@/services/globalSettingsService';

const dbPath = path.join(process.cwd(), 'src/data/database.json');

/**
 * GET /api/database/global-settings
 * Recupera global settings
 */
export async function GET() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(data);
    
    return NextResponse.json(db.globalSettings || null);
  } catch (error) {
    console.error('Error reading global settings:', error);
    return NextResponse.json(
      { error: 'Failed to read global settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/database/global-settings
 * Aggiorna global settings (deep merge)
 * 
 * Body examples:
 * 
 * Update device price:
 * { "business": { "devicePrice": 55000 } }
 * 
 * Update sales mix:
 * { "salesMix": { "pubblico": 0.7, "privato": 0.2, "research": 0.1 } }
 */
export async function PATCH(req: NextRequest) {
  try {
    const updates = await req.json();
    
    // Read current database
    const data = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(data);
    
    // Ensure globalSettings exists
    if (!db.globalSettings) {
      db.globalSettings = {
        business: {
          devicePrice: 50000,
          deviceType: 'carrellato',
          currency: 'EUR'
        },
        salesMix: {
          pubblico: 0.6,
          privato: 0.3,
          research: 0.1
        }
      };
    }
    
    // Deep merge business settings
    if (updates.business) {
      db.globalSettings.business = {
        ...db.globalSettings.business,
        ...updates.business,
        lastUpdate: new Date().toISOString()
      };
      
      // ✅ SINCRONIZZA: Se cambia devicePrice, aggiorna anche TAM/SAM/SOM
      if (updates.business.devicePrice !== undefined) {
        const newPrice = updates.business.devicePrice;
        
        // Aggiorna prezzoMedioDispositivo in ecografi
        if (db.configurazioneTamSamSom?.ecografi) {
          db.configurazioneTamSamSom.ecografi.prezzoMedioDispositivo = newPrice;
          db.configurazioneTamSamSom.ecografi.lastUpdate = new Date().toISOString();
          
          console.log('✅ Sincronizzato prezzoMedioDispositivo:', newPrice);
        }
        
        // Aggiorna anche prezzi in ecografie se necessario
        if (db.configurazioneTamSamSom?.ecografie) {
          db.configurazioneTamSamSom.ecografie.lastUpdate = new Date().toISOString();
        }
      }
    }
    
    // Deep merge sales mix
    if (updates.salesMix) {
      // Normalize to ensure sum = 1.0
      const normalizedMix = GlobalSettingsService.normalizeSalesMix(updates.salesMix);
      
      db.globalSettings.salesMix = {
        ...normalizedMix,
        description: db.globalSettings.salesMix?.description,
        lastUpdate: new Date().toISOString()
      };
      
      // Ricalcola Sales Cycle medio se cambiano i pesi
      if (db.goToMarket?.salesCycle?.bySegment) {
        const bySegment = db.goToMarket.salesCycle.bySegment;
        db.goToMarket.salesCycle.avgMonths = 
          GlobalSettingsService.calculateWeightedAvgSalesCycle(bySegment, db);
        db.goToMarket.salesCycle.avgMonthsCalculated = true;
        
        console.log('✅ Sales Cycle ricalcolato:', db.goToMarket.salesCycle.avgMonths);
      }
    }
    
    // Update global lastUpdate
    db.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Write back to database
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
    
    console.log('✅ Global Settings updated:', updates);
    
    return NextResponse.json({
      success: true,
      globalSettings: db.globalSettings,
      message: 'Global settings updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating global settings:', error);
    return NextResponse.json(
      { error: 'Failed to update global settings', details: String(error) },
      { status: 500 }
    );
  }
}
