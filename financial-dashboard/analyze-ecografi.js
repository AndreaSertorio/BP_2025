const XLSX = require('xlsx');
const fs = require('fs');

const filePath = './public/assets/ECO_Mercato_Ecografi_IT_Riepilogo.xlsx';

console.log('📊 ANALISI FILE EXCEL: ECO_Mercato_Ecografi_IT_Riepilogo.xlsx\n');
console.log('='.repeat(70));

try {
  const workbook = XLSX.readFile(filePath);
  
  console.log('\n📋 FOGLI DISPONIBILI:');
  workbook.SheetNames.forEach((name, idx) => {
    console.log(`  ${idx + 1}. ${name}`);
  });
  
  // Analizza ogni foglio
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n\n${'='.repeat(70)}`);
    console.log(`📄 FOGLIO: ${sheetName}`);
    console.log('='.repeat(70));
    
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    console.log(`\nDimensioni: ${range.e.r + 1} righe x ${range.e.c + 1} colonne`);
    console.log(`Range: ${worksheet['!ref']}\n`);
    
    // Stampa le prime 30 righe
    console.log('Prime 30 righe:\n');
    for (let row = 0; row <= Math.min(30, range.e.r); row++) {
      const rowData = [];
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        const value = cell ? (cell.v !== undefined ? cell.v : '') : '';
        rowData.push(value);
      }
      console.log(`Riga ${row.toString().padStart(2, '0')}: ${JSON.stringify(rowData)}`);
    }
    
    // Se ci sono più di 30 righe, mostra anche le ultime 10
    if (range.e.r > 30) {
      console.log(`\n... (${range.e.r - 30} righe omesse) ...\n`);
      console.log('Ultime 10 righe:\n');
      for (let row = Math.max(31, range.e.r - 9); row <= range.e.r; row++) {
        const rowData = [];
        for (let col = 0; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          const value = cell ? (cell.v !== undefined ? cell.v : '') : '';
          rowData.push(value);
        }
        console.log(`Riga ${row.toString().padStart(2, '0')}: ${JSON.stringify(rowData)}`);
      }
    }
  });
  
  console.log('\n\n' + '='.repeat(70));
  console.log('✅ Analisi completata!');
  
} catch (error) {
  console.error('❌ Errore durante la lettura del file:', error.message);
  process.exit(1);
}
