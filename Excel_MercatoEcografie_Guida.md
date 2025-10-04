Guida rapida al contenuto del file

ECO_Riepilogo → Pannello riassuntivo (💡 qui la guida è più dettagliata, come richiesto).

TotaliPerPriorità → Somma “cella per cella” delle 15 prestazioni (quadri U/B/D/P).

ECO_… (15 fogli) → Una prestazione per foglio, con mensili Gen–Ago + stime Set–Dic e riga “Totale”.

Parametri_Stagionali → Tabella pesi Set–Ott–Nov–Dic per codice (usata per stime stagionali).

README_Rename → Note operative.

ECO_TemplatePrestazione → Template identico alla struttura dei fogli ECO_…

ECO_Riepilogo (GUIDA DETTAGLIATA)

Ogni prestazione ha 3 righe:

Titolo (es. 88.71.4 – …)

Header (U, B, D, P, …)

Riga Dati (i numeri che ti servono)

Le celle utili nella riga dati sono sempre:

U: colonna A

B: colonna B

D: colonna C

P: colonna D

Colonna E: valore principale della prestazione (nel file attuale è “Totale gen-mesi” per molte tabelle; nella prima è “Stima annua SSN”: leggi l’intestazione della riga header subito sopra per capire cosa rappresenta E in quella tabella).

Totale annuo (SSN+extra-SSN): colonna F

Stima extra-SSN: colonna G

% Stima extra-SSN: colonna H

Di seguito le righe dati per ogni prestazione (pronto-uso per i link):

88.71.4 – Capo/Collo → riga 6

U A6 · B B6 · D C6 · P D6 · E E6 · Tot annuo (SSN+extra) F6 · Extra-SSN G6 · % H6

88.72.2 – Cardio a riposo → riga 10

U A10 · B B10 · D C10 · P D10 · E E10 · F F10 · G G10 · H H10

88.73.5 – TSA → riga 14

U A14 · B B14 · D C14 · P D14 · E E14 · F F14 · G G14 · H H14

88.77.4 – Arti inferiori (arterioso/venoso) → riga 18

U A18 · B B18 · D C18 · P D18 · E E18 · F F18 · G G18 · H H18

88.77.6 – Arti superiori (arterioso/venoso) → riga 22

U A22 · B B22 · D C22 · P D22 · E E22 · F F22 · G G22 · H H22

88.76.3 – Grossi vasi addominali → riga 26

U A26 · B B26 · D C26 · P D26 · E E26 · F F26 · G G26 · H H26

88.78.2 – Ginecologica (TV/TA) → riga 30

U A30 · B B30 · D C30 · P D30 · E E30 · F F30 · G G30 · H H30

88.76.1 – Addome completo → riga 34

U A34 · B B34 · D C34 · P D34 · E E34 · F F34 · G G34 · H H34

88.75.1 – Addome inferiore → riga 38

U A38 · B B38 · D C38 · P D38 · E E38 · F F38 · G G38 · H H38

88.74.1 – Addome superiore → riga 42

U A42 · B B42 · D C42 · P D42 · E E42 · F F42 · G G42 · H H42

88.73.1 – Mammella bilaterale → riga 46

U A46 · B B46 · D C46 · P D46 · E E46 · F F46 · G G46 · H H46

88.73.2 – Mammella monolaterale → riga 50

U A50 · B B50 · D C50 · P D50 · E E50 · F F50 · G G50 · H H50

88.79.3 – MSK → riga 54

U A54 · B B54 · D C54 · P D54 · E E54 · F F54 · G G54 · H H54

88.79.6 – Scrotale (eco) → riga 58

U A58 · B B58 · D C58 · P D58 · E E58 · F F58 · G G58 · H H58

88.79.E – Scrotale (ECD) → riga 62

U A62 · B B62 · D C62 · P D62 · E E62 · F F62 · G G62 · H H62

Totale Italia – Stima (aggregato):

Titolo circa riga 67, riga dati = 69

U A69 · B B69 · D C69 · P D69 · E E69 · Tot annuo (SSN+extra) F69 · Extra-SSN G69

Nota: la colonna E cambia etichetta tra i blocchi (in alcune “Stima annua SSN”, in altre “Totale gen-mesi”). Se al sito serve un significato uniforme, consiglio di leggere l’header riga titolo+1 per decidere cosa stai mappando.

Fogli ECO_* (una prestazione per foglio)

Struttura uniforme su tutti i fogli ECO_…:

Blocchi per priorità: U, B, D, P (in quest’ordine, orizzontalmente).

Per ogni blocco le colonne sono: anno | mese | prenotazioni | 1° quartile | mediana | 3° quartile.

Le colonne delle prenotazioni (quelle da sommare) sono sempre:

U: colonna C

B: colonna I

D: colonna O

P: colonna U

Intervalli mese:

Gen–Ago: righe 4:11

Set–Dic (stime): righe 12:15

Agosto: riga 11 (utile per logiche stagionali).
Esempio (Capo/Collo): C11 + I11 + O11 + U11 = totale SSN di agosto (tutte le priorità).

Totale (somma Gen–Dic per ciascuna priorità): riga 16

U: C16 · B: I16 · D: O16 · P: U16

Questa mappa vale per TUTTE le prestazioni, es.:

ECO_ECO_Capocollo, ECO_ECO_CardiodoppRiposo, ECO_ECO_TSA, ECO_ECO_GrossivasiAddominali, ECO_ECO_ArtiinfArterioso, ECO_EcodopplerArtiSupArterioso, ECO_Ecografia_MSK, ECO_Ecografia_DELL_AddomeComple, ECO_EcoAddomeSuperiore, ECO_EcoAddomeInferiore, ECO_EcoBilateraleMammella, ECO_EcoMonolateraleMammella, ECO_EcografiaScrotale, ECO_EcografiaGinecologica, ECO_EcocolordopplerScrotale.

TotaliPerPriorità

È la somma cella-per-cella delle 15 prestazioni (stessa griglia dei fogli ECO_…).

Colonne prenotazioni: U=C, B=I, D=O, P=U

Righe “mese”: Gen–Ago = 4:11, Set–Dic = 12:15

Riga “Totale”: 16

Tot U C16, Tot B I16, Tot D O16, Tot P U16
(Questi sono i “macro-totali” SSN per priorità su TUTTA Italia/15 prestazioni.)

Parametri_Stagionali

Tabella pesi stagionali per codice:

Intervallo dati: A2:F16

Codice A · Settore/Memo B · w_Set C · w_Ott D · w_Nov E · w_Dic F

Esempio di recupero pesi in Excel (in italiano o inglese):

ITA (CERCA.X):
=SE.ERRORE(CERCA.X($Codice; Parametri_Stagionali!$A:$A; Parametri_Stagionali!$C:$C); 1)

ENG (XLOOKUP):
=IFERROR(XLOOKUP($Code, Parametri_Stagionali!$A:$A, Parametri_Stagionali!$C:$C), 1)

Suggerimenti per l’integrazione nel sito

Per ECO_Riepilogo, usa gli indirizzi diretti sopra (es. E!A10, se “E” è l’ID interno del foglio) per leggere U/B/D/P e la/e colonna/e di interesse.

Se ti serve la somma SSN gen–ago per una prestazione da un foglio ECO_X specifico, leggi direttamente le Totali:

U C16 + B I16 + D O16 + P U16 (oppure prendi il dato già riassunto in ECO_Riepilogo, colonna E della riga dati di quella prestazione).

Per logiche stagionali da riprodurre lato server:

Baseline = SOMMA(gen–lug)/7 (oppure “tot gen-ago – agosto” diviso 7)

Residuo (Set–Dic) = Baseline × (w_Set + w_Ott + w_Nov + w_Dic)

Stima annua SSN = Tot gen–ago + Residuo

Se vuoi, preparo un JSON di mapping (foglio → chiave → cella) pronto per essere letto dal backend del sito, così il consumo è ancora più semplice e robusto.