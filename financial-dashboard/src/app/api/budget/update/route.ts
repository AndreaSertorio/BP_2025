/**
 * API Endpoint per aggiornare i valori del budget
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { itemId, periodId, value } = await request.json();

    // Validazione input
    if (!itemId || !periodId || value === undefined) {
      return NextResponse.json(
        { error: 'Parametri mancanti' },
        { status: 400 }
      );
    }

    // Path del database in public (servito staticamente)
    const dbPath = path.join(process.cwd(), 'public', 'data', 'database.json');

    // Leggi database
    const fileContent = await fs.readFile(dbPath, 'utf-8');
    const database = JSON.parse(fileContent);

    if (!database.budget) {
      return NextResponse.json(
        { error: 'Sezione budget non trovata' },
        { status: 404 }
      );
    }

    // Trova e aggiorna l'item in allItems
    const itemIndex = database.budget.allItems.findIndex((i: any) => i.id === itemId);
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item non trovato' },
        { status: 404 }
      );
    }

    // Aggiorna valore
    database.budget.allItems[itemIndex].values[periodId] = value;
    database.budget.allItems[itemIndex].lastModified = new Date().toISOString();

    // Aggiorna anche nelle categorie
    let updated = false;
    for (const category of database.budget.categories) {
      // Items diretti della categoria
      const directItem = category.items?.find((i: any) => i.id === itemId);
      if (directItem) {
        directItem.values[periodId] = value;
        directItem.lastModified = new Date().toISOString();
        updated = true;
      }

      // Items nelle subcategorie
      for (const subcat of category.subcategories || []) {
        const subcatItem = subcat.items?.find((i: any) => i.id === itemId);
        if (subcatItem) {
          subcatItem.values[periodId] = value;
          subcatItem.lastModified = new Date().toISOString();
          updated = true;
        }
      }
    }

    // Aggiorna metadata versione
    database.version = database.version || '1.0.3';
    database.lastUpdate = new Date().toISOString().split('T')[0];

    // Salva database
    await fs.writeFile(dbPath, JSON.stringify(database, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Valore aggiornato con successo',
      itemId,
      periodId,
      value,
      updated
    });

  } catch (error) {
    console.error('Errore aggiornamento budget:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento' },
      { status: 500 }
    );
  }
}
