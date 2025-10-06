# 📚 DOCUMENTAZIONE TECNICA ECO 3D

Questa cartella contiene la documentazione tecnica del progetto Eco 3D Financial Dashboard.

---

## 📖 DOCUMENTI PRINCIPALI (AGGIORNATI)

### 🎯 **STATO_SISTEMA_2025.md** ⭐
**Il documento di riferimento principale**

Contiene:
- Architettura completa del sistema
- Stato implementazione (cosa funziona, cosa manca)
- Struttura database.json
- Flussi dati sincronizzati
- Roadmap e prossimi passi
- Best practices

**👉 LEGGI QUESTO PRIMA DI TUTTO!**

---

### 📊 Guida.md
Validazione formule piano finanziario (MRR, ARR, LTV, CAC, ecc.)

### 🔧 Strumenti_Calcoli_Fondamentali.md
Formule matematiche fondamentali per i calcoli finanziari

### 📈 RIEPILOGO_FINALE_MERCATO_ECOGRAFIE.md
Documentazione dettagliata implementazione Mercato Ecografie con grafici

### 🎮 SISTEMA_MERCATO_COMPLETO.md
Documentazione MercatoContext (da deprecare dopo migrazione Ecografi)

### 📊 MERCATO_MASTER_MAPPING.md
Guida navigazione dati mercato

### 🐛 DEBUG_*.md
File di troubleshooting per problemi specifici

### 📄 Altri file specifici
Documentazione features specifiche (export Excel, grafici, ecc.)

---

## 📁 ARCHIVIO_OBSOLETI/

Contiene documenti **NON PIÙ VALIDI** relativi a:
- Sistema PlayerPrefs (sostituito da database centralizzato)
- localStorage approach (sostituito da API server)
- Vecchie architetture (superate)

**⚠️ NON USARE questi documenti per riferimento!**

Sono mantenuti solo per storico.

---

## 🚀 QUICK START SVILUPPATORE

1. **Leggi** `STATO_SISTEMA_2025.md`
2. **Avvia server:** `npm run server` (porta 3001)
3. **Avvia dev:** `npm run dev` (porta 3000)
4. **Apri:** http://localhost:3000

---

## 📊 STRUTTURA PROGETTO

```
financial-dashboard/
├── src/
│   ├── data/
│   │   └── database.json          ← FONTE UNICA DI VERITÀ
│   ├── contexts/
│   │   └── DatabaseProvider.tsx   ← Context principale
│   ├── lib/
│   │   └── database-service.ts    ← Logica calcoli
│   └── components/
│       ├── MercatoEcografie.tsx
│       ├── MercatoEcografi.tsx
│       └── MercatoRiepilogo.tsx
└── server.js                       ← API Express
```

---

## 🎯 STATO ATTUALE

✅ **Mercato Ecografie** - Completamente sincronizzato  
✅ **Regioni Mondiali** - Sincronizzate (USA, Europa, Cina, Globale)  
✅ **Pagina Riepilogo** - Sincronizzata  
🔄 **Mercato Ecografi** - Da sincronizzare (prossimo step)  
📋 **Piano Finanziario** - Da implementare

---

## 📞 SUPPORTO

Per domande o problemi:
1. Consulta `STATO_SISTEMA_2025.md`
2. Controlla file DEBUG specifici
3. Verifica sezione "Problemi Risolti" in STATO_SISTEMA_2025.md

---

**Ultimo aggiornamento:** 2025-01-06
