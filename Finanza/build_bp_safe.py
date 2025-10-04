# build_bp_safe.py
# Crea Eco3D_BP_Financial_Model_v0_7e_Interactive_Compat_SAFE.xlsx con formule "compatibili"
import xlsxwriter
from xlsxwriter.utility import xl_col_to_name

fn = "Eco3D_BP_Financial_Model_v0_7e_Interactive_Compat_SAFE.xlsx"
wb = xlsxwriter.Workbook(fn, {'strings_to_formulas': False})  # << evita conversioni involontarie

fmt_h = wb.add_format({"bold": True, "bg_color": "#EEEEEE"})
fmt_title = wb.add_format({"bold": True, "font_size": 14})
fmt_note = wb.add_format({"font_color":"#555555", "italic": True})

# --- Control ---
ws = wb.add_worksheet("Control")
ws.write("A1", "Eco 3D – Control Panel (SAFE)", fmt_title)
ws.write_row("A3", ["Parametro","Valore","Note"], fmt_h)
params = [
    ("Lead multiplier", 1.00, "0.6–1.6"),
    ("L2D (Lead→Demo)", 0.20, ""),
    ("D2P (Demo→Pilot)", 0.50, ""),
    ("P2Deal (Pilot→Deal)", 0.60, ""),
    ("Devices per deal", 1.20, "mix pacchetti"),
    ("ARPA (€/account/anno)", 14600, ""),
    ("GM% ricorrente", 0.80, ""),
    ("CapEx share", 0.30, ""),
    ("Prezzo device (€/unità)", 26000, ""),
    ("Churn annuo", 0.08, ""),
    ("Growth QoQ leads post-Q8", 0.12, ""),
]
sr = 4
for i,(k,v,n) in enumerate(params):
    ws.write(sr+i,0,k); ws.write_number(sr+i,1,v); ws.write(sr+i,2,n)

ws.write("A17", "Leads per trimestre (Q1..Q8)", fmt_h)
ws.write_row("A18", ["Q1","Q2","Q3","Q4","Q5","Q6","Q7","Q8"], fmt_h)
ws.write_row("A19", [120,150,180,220,260,300,350,400])

ws.write("A22", "OPEX (M€) Y1..Y5", fmt_h); ws.write_row("B22", ["Y1","Y2","Y3","Y4","Y5"], fmt_h)
ws.write_row("B23", [1.80,2.50,3.50,4.50,5.50])
ws.write("A25", "CapEx (M€) Y1..Y5", fmt_h); ws.write_row("B25", ["Y1","Y2","Y3","Y4","Y5"], fmt_h)
ws.write_row("B26", [0.30,0.50,0.60,0.70,0.80])
ws.write("A28", "Equity-in (M€) Y1..Y5", fmt_h); ws.write_row("B28", ["Y1","Y2","Y3","Y4","Y5"], fmt_h)
ws.write_row("B29", [0.40,1.30,0.00,4.00,0.00])
ws.write("A31", "COGS device (€/u) Y1..Y5", fmt_h); ws.write_row("B31", ["Y1","Y2","Y3","Y4","Y5"], fmt_h)
ws.write_row("B32", [12000,11800,11200,10500,10000])
ws.write("A34", "DSO/DIO/DPO (giorni)", fmt_h); ws.write_row("B34", ["DSO","DIO","DPO"], fmt_h)
ws.write_row("B35", [60,60,45])
ws.write("A37", "Note:", fmt_h); ws.write("A38","Formule classiche; niente tabelle dati/volatili nella sensitivity.", fmt_note)

# Named ranges (solo dove servono)
wb.define_name("LeadMult", "=Control!$B$4")
wb.define_name("L2D", "=Control!$B$5")
wb.define_name("D2P", "=Control!$B$6")
wb.define_name("P2Deal", "=Control!$B$7")
wb.define_name("DevicesPerDeal", "=Control!$B$8")
wb.define_name("ARPA", "=Control!$B$9")
wb.define_name("GMrec", "=Control!$B$10")
wb.define_name("CapexShare", "=Control!$B$11")
wb.define_name("DevicePrice", "=Control!$B$12")
wb.define_name("ChurnAnn", "=Control!$B$13")
wb.define_name("LeadsQoQGrowth", "=Control!$B$14")

# --- BaseSeries ---
bs = wb.add_worksheet("BaseSeries")
bs.write_row("A1", ["Mese","Quarter","Leads base/mese"], fmt_h)
bs.write("E1","Mappa Q→Leads/trim (da Control)", fmt_h)
bs.write_row("E2", ["Q1","Q2","Q3","Q4","Q5","Q6","Q7","Q8"], fmt_h)
for i in range(8):
    bs.write_formula(1, 4+i, f"=Control!{chr(ord('A')+i)}19")
for m in range(1,61):
    r = m
    bs.write(r,0,m)
    bs.write_formula(r,1, f"=INT((A{r+1}-1)/3)+1")
    bs.write_formula(r,2, f"=IF(B{r+1}<=8, INDEX($E$2:$L$2, 1, B{r+1})/3, ($L$2*(1+LeadsQoQGrowth)^(B{r+1}-8))/3)")
bs.set_column("A:C", 18); bs.set_column("E:L", 14)

# --- GTM_Monthly ---
gm = wb.add_worksheet("GTM_Monthly")
gm.write_row("A1", ["Mese","Anno","Leads/m","Deals/m","Accounts","Devices/m","Devices attivi",
                    "Ricavi Rec (M€/m)","Ricavi CapEx (M€/m)","Ricavi Tot (M€/m)","COGS (M€/m)","GM (M€/m)"], fmt_h)
for m in range(1,61):
    r = m
    gm.write(r,0,m)
    gm.write_formula(r,1, f"=INT((A{r+1}-1)/12)+1")
    gm.write_formula(r,2, f"=INDEX(BaseSeries!$C$2:$C$61, A{r+1})*LeadMult")
    gm.write_formula(r,3, f"=C{r+1}*(L2D*D2P*P2Deal)")
    if m == 1:
        gm.write_formula(r,4, f"=D{r+1}")
        gm.write_formula(r,6, f"=F{r+1}")
    else:
        gm.write_formula(r,4, f"=E{r}*(1-(1-ChurnAnn)^(1/12))+D{r+1}")
        gm.write_formula(r,6, f"=G{r}+F{r+1}")
    gm.write_formula(r,5, f"=D{r+1}*DevicesPerDeal")
    gm.write_formula(r,7, f"=E{r+1}*(ARPA/12)/1e6")
    gm.write_formula(r,8, f"=F{r+1}*CapexShare*DevicePrice/1e6")
    gm.write_formula(r,9, f"=H{r+1}+I{r+1}")
    gm.write_formula(r,10, f"=(1-GMrec)*H{r+1} + F{r+1}*CHOOSE(B{r+1}, Control!$B$32, Control!$C$32, Control!$D$32, Control!$E$32, Control!$F$32)/1e6 * CapexShare")
    gm.write_formula(r,11, f"=J{r+1}-K{r+1}")
gm.set_column("A:L", 20)

# --- Annual ---
an = wb.add_worksheet("Annual")
an.write_row("A1", ["Anno","Ricavi Rec (M€)","Ricavi CapEx (M€)","Ricavi Tot (M€)","COGS (M€)","GM (M€)","GM%","OPEX (M€)","EBITDA (M€)","ARR (M€)"], fmt_h)
for y in range(1,6):
    r=y
    an.write(r,0, f"Y{y}")
    an.write_formula(r,1, f"=SUMIF(GTM_Monthly!$B$2:$B$61, {y}, GTM_Monthly!$H$2:$H$61)")
    an.write_formula(r,2, f"=SUMIF(GTM_Monthly!$B$2:$B$61, {y}, GTM_Monthly!$I$2:$I$61)")
    an.write_formula(r,3, f"=SUMIF(GTM_Monthly!$B$2:$B$61, {y}, GTM_Monthly!$J$2:$J$61)")
    an.write_formula(r,4, f"=SUMIF(GTM_Monthly!$B$2:$B$61, {y}, GTM_Monthly!$K$2:$K$61)")
    an.write_formula(r,5, f"=SUMIF(GTM_Monthly!$B$2:$B$61, {y}, GTM_Monthly!$L$2:$L$61)")
    an.write_formula(r,6, f"=IFERROR(F{r+1}/D{r+1},0)")
    an.write_formula(r,7, f"=Control!{['B','C','D','E','F'][y-1]}23")
    an.write_formula(r,8, f"=F{r+1}-H{r+1}")
    an.write_formula(r,9, f"=INDEX(GTM_Monthly!$E$2:$E$61, {y}*12)*ARPA/1e6")
an.set_column("A:J", 22)

# --- CashFlow (sintetico) ---
cf = wb.add_worksheet("CashFlow")
cf.write_row("A1", ["Anno","EBITDA (M€)","Depr (M€)","EBIT (M€)","Imposte (M€)","AR (M€)","Inventario (M€)","AP (M€)","ΔNWC (M€)","CFO (M€)","CFI (M€)","CFF (M€)","ΔCassa (M€)","Cassa iniziale (M€)","Cassa finale (M€)"], fmt_h)
for y in range(1,6):
    r=y
    cf.write_formula(r,1, f"=Annual!I{r+1}")
    terms = "+".join([f"Control!{['B','C','D','E','F'][k-1]}26/3" for k in range(max(1,y-2), y+1)])
    cf.write_formula(r,2, "="+terms)
    cf.write_formula(r,3, f"=B{r+1}-C{r+1}")
    cf.write_formula(r,4, f"=IF(D{r+1}>0, D{r+1}*0.24, 0)")
    cf.write_formula(r,5, f"=Annual!D{r+1} * Control!$B$35 / 365")
    cf.write_formula(r,6, f"=Annual!E{r+1} * Control!$C$35 / 365")
    cf.write_formula(r,7, f"=Annual!E{r+1} * Control!$D$35 / 365")
    if y==1:
        cf.write_formula(r,8, f"=(F{r+1}+G{r+1}-H{r+1})"); cf.write(r,13, 0.30)
    else:
        cf.write_formula(r,8, f"=(F{r+1}+G{r+1}-H{r+1}) - (F{r}+G{r}-H{r})"); cf.write_formula(r,13, f"=O{r}")
    cf.write_formula(r,9, f"=B{r+1}+C{r+1}-E{r+1}-I{r+1}")
    cf.write_formula(r,10, f"=-Control!{['B','C','D','E','F'][y-1]}26")
    cf.write_formula(r,11, f"=Control!{['B','C','D','E','F'][y-1]}29")
    cf.write_formula(r,12, f"=J{r+1}+K{r+1}+L{r+1}")
    cf.write_formula(r,14, f"=N{r+1}+M{r+1}")
cf.set_column("A:O", 20)

# --- Sensitivity_Cases (senza SUMIFS/OFFSET/nomi complessi) ---
sc = wb.add_worksheet("Sensitivity_Cases")
cases = [
    ("ARPA x0.8",   {"arpa_mult":0.8}),
    ("ARPA x1.2",   {"arpa_mult":1.2}),
    ("Leads x0.85", {"lead_mult":0.85}),
    ("Leads x1.15", {"lead_mult":1.15}),
    ("Conv x0.8",   {"conv_mult":0.8}),
    ("Conv x1.2",   {"conv_mult":1.2}),
    ("CapEx 20%",   {"capex_share":0.20}),
    ("CapEx 40%",   {"capex_share":0.40}),
    ("COGS -2000",  {"cogs_delta":-2000}),
    ("COGS +2000",  {"cogs_delta": 2000}),
    ("OPEX x0.9",   {"opex_mult":0.9}),
    ("OPEX x1.2",   {"opex_mult":1.2}),
]
sc.write_row(0,0,["Parametro/Caso"]+[n for n,_ in cases], fmt_h)
param_rows = {"lead_mult":2,"conv_mult":3,"arpa_mult":4,"capex_share":5,"cogs_delta":6,"opex_mult":7}
sc.write(1,0,"Moltiplicatori/override", fmt_h)
for k,rw in param_rows.items(): sc.write(rw,0,k)
for j,(_,over) in enumerate(cases, start=1):
    sc.write_number(param_rows["lead_mult"], j, over.get("lead_mult",1))
    sc.write_number(param_rows["conv_mult"], j, over.get("conv_mult",1))
    sc.write_number(param_rows["arpa_mult"], j, over.get("arpa_mult",1))
    if "capex_share" in over: sc.write_number(param_rows["capex_share"], j, over["capex_share"])
    else: sc.write_formula(param_rows["capex_share"], j, "=Control!$B$11")
    sc.write_number(param_rows["cogs_delta"], j, over.get("cogs_delta",0))
    sc.write_number(param_rows["opex_mult"], j, over.get("opex_mult",1))

start_row = 10
sc.write_row(start_row, 0, ["Mese","Anno"], fmt_h)
for j in range(1, len(cases)+1):
    base_col = 2 + (j-1)*9
    sc.write_row(start_row, base_col, ["Leads/m","Deals/m","Accounts","Devices/m","Ricavi Rec (M€/m)",
                                       "Ricavi CapEx (M€/m)","Ricavi Tot (M€/m)","COGS (M€/m)","GM (M€/m)"], fmt_h)

for m in range(1,61):
    r = start_row + m
    sc.write(r,0,m)
    sc.write_formula(r,1, f"=INT((A{r+1}-1)/12)+1")

def pref(j,key):
    # cell assoluta del parametro caso (riga fissa, colonna del caso)
    row = param_rows[key]
    col = j
    return f"{xlsxwriter.utility.xl_rowcol_to_cell(row, col, row_abs=True, col_abs=True)}"

for j in range(1, len(cases)+1):
    base_col = 2 + (j-1)*9
    def col(off): return xl_col_to_name(base_col+off)
    for m in range(1,61):
        r = start_row + m; prev = r-1
        # Leads base (INDEX su range finito)
        sc.write_formula(r, base_col+0, f"=INDEX(BaseSeries!$C$2:$C$61, A{r+1}) * Control!$B$4 * {pref(j,'lead_mult')}")
        # Deals (conversioni * eventuale conv_mult)
        sc.write_formula(r, base_col+1, f"={col(0)}{r+1}*(Control!$B$5*Control!$B$6*Control!$B$7)*{pref(j,'conv_mult')}")
        # Accounts
        if m == 1:
            sc.write_formula(r, base_col+2, f"={col(1)}{r+1}")
        else:
            sc.write_formula(r, base_col+2, f"={col(2)}{prev+1}*(1-(1-Control!$B$13)^(1/12)) + {col(1)}{r+1}")
        # Devices/m
        sc.write_formula(r, base_col+3, f"={col(1)}{r+1}*Control!$B$8")
        # Ricavi ricorrenti
        sc.write_formula(r, base_col+4, f"={col(2)}{r+1}*(Control!$B$9*{pref(j,'arpa_mult')}/12)/1e6")
        # Ricavi CapEx
        sc.write_formula(r, base_col+5, f"={col(3)}{r+1}*{pref(j,'capex_share')}*Control!$B$12/1e6")
        # Ricavi Tot
        sc.write_formula(r, base_col+6, f"={col(4)}{r+1}+{col(5)}{r+1}")
        # COGS: CHOOSE su anno, più delta COGS caso
        sc.write_formula(r, base_col+7, f"=(1-Control!$B$10)*{col(4)}{r+1} + {col(3)}{r+1}*(CHOOSE(B{r+1}, Control!$B$32, Control!$C$32, Control!$D$32, Control!$E$32, Control!$F$32) + {pref(j,'cogs_delta')})/1e6 * {pref(j,'capex_share')}")
        # GM
        sc.write_formula(r, base_col+8, f"={col(6)}{r+1}-{col(7)}{r+1}")

# Annual per caso: somme di blocchi fissi (no SUMIFS)
sum_row = start_row + 62
sc.write_row(sum_row, 0, ["Anno","EBITDA Base (M€)"]+[n for n,_ in cases], fmt_h)
for y in range(1,6):
    r = sum_row + y
    sc.write(r,0, f"Y{y}")
    sc.write_formula(r,1, f"=Annual!I{y+1}")
    startR = start_row + (y-1)*12 + 1
    endR   = start_row + y*12
    for j in range(1, len(cases)+1):
        base_col = 2 + (j-1)*9
        gm_col = xl_col_to_name(base_col+8)
        opex_y = f"Control!{['B','C','D','E','F'][y-1]}23"
        sc.write_formula(r, 1+j, f"=SUM({gm_col}{startR+1}:{gm_col}{endR+1}) - {pref(j,'opex_mult')}*{opex_y}")

# Y5 + delta
y5_row = sum_row + 7
sc.write_row(y5_row, 0, ["KPI Y5","EBITDA Base (M€)"]+[n for n,_ in cases], fmt_h)
sc.write_formula(y5_row,1, "=Annual!I6")
for j in range(1, len(cases)+1):
    sc.write_formula(y5_row, 1+j, f"=Sensitivity_Cases!{xlsxwriter.utility.xl_rowcol_to_cell(sum_row+5, 1+j)}")
delta_row = y5_row + 1
sc.write_row(delta_row, 0, ["Δ vs Base (Y5) — EBITDA (M€)"], fmt_h)
for j in range(1, len(cases)+1):
    sc.write_formula(delta_row, 1+j, f"={xlsxwriter.utility.xl_rowcol_to_cell(y5_row,1+j)} - {xlsxwriter.utility.xl_rowcol_to_cell(y5_row,1)}")

# --- Tornado ---
tor = wb.add_worksheet("Tornado")
tor.write_row("A1", ["Caso","Δ EBITDA Y5 (M€)"], fmt_h)
for j,(name,_) in enumerate(cases, start=1):
    tor.write(j,0,name)
    tor.write_formula(j,1, f"=Sensitivity_Cases!{xlsxwriter.utility.xl_rowcol_to_cell(delta_row, 1+j)}")
chart = wb.add_chart({"type":"bar"})
chart.add_series({"name":"Δ EBITDA Y5",
                  "categories": f"=Tornado!$A$2:$A${len(cases)+1}",
                  "values":     f"=Tornado!$B$2:$B${len(cases)+1}"})
chart.set_title({"name":"Tornado — impatto su EBITDA Y5"})
chart.set_legend({"none": True})
tor.insert_chart("D2", chart, {"x_scale":1.5, "y_scale":1.6})

wb.close()
print("Creato:", fn)