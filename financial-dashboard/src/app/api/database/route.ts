import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/database
 * Restituisce l'intero database.json aggiornato
 */
export async function GET() {
  try {
    // Leggi il file database.json dalla directory src/data
    const filePath = path.join(process.cwd(), 'src', 'data', 'database.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const database = JSON.parse(fileContents);
    
    return NextResponse.json(database);
  } catch (error) {
    console.error('Errore nel caricamento del database:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento del database' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/database
 * Aggiorna una sezione specifica del database
 */
export async function PATCH(request: Request) {
  try {
    const { path: dataPath, value } = await request.json();
    
    // Leggi il database corrente
    const filePath = path.join(process.cwd(), 'src', 'data', 'database.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const database = JSON.parse(fileContents);
    
    // Aggiorna il valore nel path specificato
    // Esempio path: "mercatoEcografie.italia[0].u"
    const pathParts = dataPath.split('.');
    let current = database;
    
    // Naviga fino al penultimo elemento
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      
      // Gestisci array con indice [n]
      const arrayMatch = part.match(/(.+)\[(\d+)\]/);
      if (arrayMatch) {
        const [, key, index] = arrayMatch;
        current = current[key][parseInt(index)];
      } else {
        current = current[part];
      }
    }
    
    // Imposta il valore finale
    const lastPart = pathParts[pathParts.length - 1];
    const arrayMatch = lastPart.match(/(.+)\[(\d+)\]/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      current[key][parseInt(index)] = value;
    } else {
      current[lastPart] = value;
    }
    
    // Aggiorna lastUpdate
    database.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Scrivi il database aggiornato
    fs.writeFileSync(filePath, JSON.stringify(database, null, 2), 'utf8');
    
    // Sincronizza con public/data/database.json
    const publicFilePath = path.join(process.cwd(), 'public', 'data', 'database.json');
    fs.writeFileSync(publicFilePath, JSON.stringify(database, null, 2), 'utf8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database aggiornato con successo',
      updatedPath: dataPath
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento del database:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del database' },
      { status: 500 }
    );
  }
}
