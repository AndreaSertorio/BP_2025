# ⚡ RIFERIMENTO RAPIDO ECO 3D

> Una pagina per trovare tutto subito

---

## 📖 DOCUMENTAZIONE

### Devo capire il sistema dall'inizio
→ **STATO_SISTEMA_2025.md** (15 min)

### Devo iniziare a sviluppare
→ **README.md** (5 min) + avvia server

### Ho un problema specifico
→ **DEBUG_*.md** o **STATO_SISTEMA_2025.md** → "Problemi Risolti"

### Devo validare formule finanziarie
→ **Guida.md** + **Strumenti_Calcoli_Fondamentali.md**

### Voglio capire una feature specifica
→ Cerca in **_INDEX.md** → Sezione "Documenti per Categoria"

---

## 🚀 COMANDI RAPIDI

```bash
# Avvia server API (porta 3001)
npm run server

# Avvia dev (porta 3000)
npm run dev

# Apri app
open http://localhost:3000

# Verifica server API
curl http://localhost:3001/api/database | jq '.version'
```

---

## 📁 FILE CHIAVE

```
database.json              ← DATI
server.js                  ← API
DatabaseProvider.tsx       ← CONTEXT
database-service.ts        ← CALCOLI
MercatoRiepilogo.tsx      ← DASHBOARD
```

---

## 🎯 PROSSIMO STEP

**Sincronizzare Mercato Ecografi con database centralizzato**

Vedi: `STATO_SISTEMA_2025.md` → Sezione "Roadmap"

---

## ✅ CHECKLIST VELOCE

Prima di committare:
- [ ] Codice compila senza errori
- [ ] Test manuali passano
- [ ] Database.json aggiornato se necessario
- [ ] STATO_SISTEMA_2025.md aggiornato
- [ ] Server riavviato e testato

---

**Ultima modifica:** 2025-01-06
