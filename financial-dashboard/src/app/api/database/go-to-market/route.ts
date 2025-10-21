import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/database.json');

/**
 * PATCH /api/database/go-to-market
 * 
 * Aggiorna la configurazione Go-To-Market Engine
 */
export async function PATCH(request: NextRequest) {
  try {
    const updates = await request.json();
    console.log('📥 Ricevuto update Go-To-Market:', updates);
    
    // Leggi database corrente
    const fileContent = await fs.readFile(DB_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Deep merge degli updates (necessario per salesCycle.salesMix e altri oggetti nidificati)
    if (!data.goToMarket) {
      data.goToMarket = {};
    }
    
    // Merge con supporto per oggetti nidificati
    Object.keys(updates).forEach(key => {
      if (key === 'lastUpdate') return; // Skip lastUpdate dall'update
      
      const value = updates[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Deep merge per oggetti (es. salesCycle)
        data.goToMarket[key] = {
          ...(data.goToMarket[key] || {}),
          ...value
        };
      } else {
        // Copia diretta per primitivi e array
        data.goToMarket[key] = value;
      }
    });
    
    data.goToMarket.lastUpdate = new Date().toISOString();
    
    // Salva database aggiornato
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    
    console.log('✅ Go-To-Market Engine aggiornato');
    
    return NextResponse.json({ 
      success: true, 
      goToMarket: data.goToMarket 
    });
    
  } catch (error) {
    console.error('❌ Errore aggiornamento Go-To-Market:', error);
    return NextResponse.json(
      { error: 'Failed to update Go-To-Market', details: String(error) }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/database/go-to-market
 * 
 * Recupera la configurazione Go-To-Market corrente
 */
export async function GET() {
  try {
    const fileContent = await fs.readFile(DB_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json(data.goToMarket || {});
    
  } catch (error) {
    console.error('❌ Errore lettura Go-To-Market:', error);
    return NextResponse.json(
      { error: 'Failed to read Go-To-Market', details: String(error) }, 
      { status: 500 }
    );
  }
}
