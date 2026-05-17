"""
Dashboard de Arboviroses — Cotia/SP
Dados REAIS — Fontes:
  • InfoDengue/Fiocruz (dengue_2-19.csv, chikungunya_2-19.csv, zika_2-19.csv)
  • SINAN/MS (DENGBR25.csv, DENGBR26.csv)
  • SINISA 2024 / ARSESP 2020 (saneamento — valores extraídos dos PDFs)

Requisitos:
    pip install dash plotly pandas dash-bootstrap-components

Execução:
    python dashboard_arboviroses.py
    Acesse: http://127.0.0.1:8050
"""

import os
import pandas as pd
import plotly.graph_objects as go
import dash_bootstrap_components as dbc
from dash import Dash, dcc, html, Input, Output

# ══════════════════════════════════════════════════════════════════
# CAMINHOS — coloque os CSVs na pasta data/ ao lado deste arquivo
# ══════════════════════════════════════════════════════════════════
DATA = {
    "dengue":  r"C:\Users\Nicolas\Documents\data projeto integrador II\dengue_2-19.csv",
    "chik":    r"C:\Users\Nicolas\Documents\data projeto integrador II\chikungunya_2-19.csv",
    "zika":    r"C:\Users\Nicolas\Documents\data projeto integrador II\zika_2-19.csv",
    "sinan25": r"C:\Users\Nicolas\Documents\data projeto integrador II\DENGBR25.csv",
    "sinan26": r"C:\Users\Nicolas\Documents\data projeto integrador II\DENGBR26.csv",
}

# ══════════════════════════════════════════════════════════════════
# PRÉ-PROCESSAMENTO
# ══════════════════════════════════════════════════════════════════
MESES_PT = {1:"Jan",2:"Fev",3:"Mar",4:"Abr",5:"Mai",6:"Jun",
            7:"Jul",8:"Ago",9:"Set",10:"Out",11:"Nov",12:"Dez"}

def load_infodengue(path, doenca):
    df = pd.read_csv(path, encoding="latin1")
    df["data"]   = pd.to_datetime(df["data_iniSE"])
    df["ano"]    = df["data"].dt.year
    df["mes"]    = df["data"].dt.month
    df["doenca"] = doenca
    return df

def load_sinan_cotia(path):
    cols = ["DT_NOTIFIC","CS_SEXO","HOSPITALIZ",
            "EVOLUCAO","CLASSI_FIN","NU_IDADE_N","ID_MN_RESI"]
    chunks = []
    for chunk in pd.read_csv(path, encoding="latin1", low_memory=False,
                              usecols=cols, chunksize=50_000):
        c = chunk[chunk["ID_MN_RESI"] == 350950]
        if len(c):
            chunks.append(c)
    if not chunks:
        return pd.DataFrame(columns=cols)
    df = pd.concat(chunks, ignore_index=True)
    df["mes"] = pd.to_datetime(df["DT_NOTIFIC"], errors="coerce").dt.month
    return df

print("Carregando dados InfoDengue…")
deng = load_infodengue(DATA["dengue"], "Dengue")
chik = load_infodengue(DATA["chik"],   "Chikungunya")
zika = load_infodengue(DATA["zika"],   "Zika")

print("Carregando SINAN (pode demorar ~30 s)…")
s25 = load_sinan_cotia(DATA["sinan25"])
s26 = load_sinan_cotia(DATA["sinan26"])
print(f"  SINAN 2025: {len(s25):,} notificações · SINAN 2026: {len(s26):,} notificações")

# Série mensal
def serie_mes(df):
    return (df.groupby(["ano","mes"])["casos"]
              .sum().reset_index()
              .assign(mes_nome=lambda x: x["mes"].map(MESES_PT)))

deng_mes = serie_mes(deng)
chik_mes = serie_mes(chik)
zika_mes = serie_mes(zika)

# Totais anuais
totais = deng.groupby("ano").agg(
    casos=("casos","sum"),
    Rt_medio=("Rt","mean"),
    inc_media=("p_inc100k","mean"),
    temp_media=("tempmed","mean"),
).reset_index()

# Perfil SINAN 2025
CLASSI_MAP = {10:"Dengue clássica",11:"Com sinais de alarme",12:"Dengue grave",8:"Descartado"}
s25["classificacao"] = s25["CLASSI_FIN"].map(CLASSI_MAP).fillna("Não classificado")

def faixa(n):
    try:
        n = int(n)
    except Exception:
        return "Ignorado"
    if n < 4010: return "<10 anos"
    if n < 4020: return "10–19 anos"
    if n < 4030: return "20–29 anos"
    if n < 4040: return "30–39 anos"
    if n < 4050: return "40–49 anos"
    if n < 4060: return "50–59 anos"
    return "60+ anos"

s25["faixa"] = s25["NU_IDADE_N"].apply(faixa)

sinan_mes_25 = s25.groupby("mes").size().reset_index(name="notificacoes")
sinan_mes_26 = s26.groupby("mes").size().reset_index(name="notificacoes")

# Saneamento (SINISA 2024 / ARSESP 2020 — extraídos dos PDFs)
SAN = dict(
    agua_pct=99.1, esgoto_pct=68.5, sem_agua=2603, sem_esgoto=90422,
    coleta_esgoto=41.6, trat_esgoto=23.8, perdas=14.9, hidrometricao=100.0,
)

# ══════════════════════════════════════════════════════════════════
# PALETA E HELPERS DE LAYOUT
# ══════════════════════════════════════════════════════════════════
VERDE = "#1D9E75"; CORAL = "#D85A30"; AMBAR = "#BA7517"
AZUL  = "#185FA5"; CINZA = "#888780"

M0  = dict(t=10,b=10,l=10,r=10)
M_H = dict(t=10,b=10,l=160,r=60)

BASE_LAYOUT = dict(
    font=dict(family="Inter, Arial, sans-serif", color="#374151"),
    paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
    legend=dict(orientation="h", yanchor="bottom", y=1.02,
                xanchor="left", x=0, font=dict(size=12)),
)
# Estilos de eixo aplicados separadamente via update_xaxes / update_yaxes
XAXIS_STYLE = dict(showgrid=False, linecolor="#E5E7EB", tickfont=dict(size=11))
YAXIS_STYLE = dict(gridcolor="#F0F0F0", linecolor="#E5E7EB", tickfont=dict(size=11))

def apply_base(fig, height, margin=None, **kwargs):
    """Aplica layout base sem conflitos de xaxis/yaxis duplicados."""
    # Separar yaxis/xaxis dos kwargs gerais para evitar conflito com update_xaxes/update_yaxes
    yaxis_kw = kwargs.pop("yaxis", None)
    xaxis_kw = kwargs.pop("xaxis", None)
    fig.update_layout(**BASE_LAYOUT, height=height, margin=margin or M0, **kwargs)
    fig.update_xaxes(**(xaxis_kw or XAXIS_STYLE))
    fig.update_yaxes(**(yaxis_kw or YAXIS_STYLE))
    return fig

def kpi(titulo, valor, sub, cor=VERDE, alerta=False):
    return dbc.Card(dbc.CardBody([
        html.P(titulo, style={"fontSize":"10px","textTransform":"uppercase",
                               "letterSpacing":"0.8px","color":"#6B7280","marginBottom":"4px"}),
        html.H3(str(valor), style={"fontSize":"24px","fontWeight":"600",
                                    "color": CORAL if alerta else "#111827","marginBottom":"2px"}),
        html.P(sub, style={"fontSize":"12px","color":"#9CA3AF","marginBottom":"0"}),
    ]), style={"border":f"1px solid {'#FECACA' if alerta else '#E0E5E3'}",
               "borderRadius":"12px","background":"#fff",
               "boxShadow":"0 1px 4px rgba(0,0,0,0.05)"})

def painel(titulo, sub, conteudo):
    return dbc.Card(dbc.CardBody([
        html.P(titulo, style={"fontWeight":"600","fontSize":"14px","marginBottom":"2px"}),
        html.P(sub,    style={"fontSize":"12px","color":"#9CA3AF","marginBottom":"8px"}),
        conteudo,
    ]), style={"borderRadius":"12px","border":"1px solid #E5E7EB","marginBottom":"1rem"})

def caixa_nota(texto, cor=VERDE):
    r,g,b = int(cor[1:3],16), int(cor[3:5],16), int(cor[5:7],16)
    return html.Div([
        html.Span("📌 ", style={"fontSize":"13px"}),
        html.Span(texto, style={"fontSize":"13px","color":"#374151"}),
    ], style={"background":f"rgba({r},{g},{b},0.08)",
              "borderLeft":f"3px solid {cor}",
              "padding":"10px 14px","borderRadius":"4px","marginTop":"12px"})

# ══════════════════════════════════════════════════════════════════
# APP
# ══════════════════════════════════════════════════════════════════
app = Dash(
    __name__,
    external_stylesheets=[
        dbc.themes.BOOTSTRAP,
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
    ],
    title="Arboviroses Cotia/SP",
)

ANOS = sorted(deng["ano"].unique().tolist())

app.layout = dbc.Container([
    # Cabeçalho
    dbc.Row([
        dbc.Col([
            html.P("Projeto Integrador II · InfoDengue/Fiocruz · SINAN/MS · SINISA 2024",
                   style={"fontSize":"10px","textTransform":"uppercase","letterSpacing":"1px",
                          "color":"#9CA3AF","marginBottom":"2px"}),
            html.H1("Vigilância de Arboviroses — Cotia/SP",
                    style={"fontSize":"22px","fontWeight":"600","color":"#111827","marginBottom":"0"}),
        ], width=8),
        dbc.Col([
            html.Div([
                html.Span("Ano:", style={"fontSize":"13px","color":"#6B7280","marginRight":"8px"}),
                dcc.RadioItems(
                    id="ano-radio",
                    options=[{"label":str(a),"value":a} for a in ANOS],
                    value=2025, inline=True,
                    inputStyle={"marginRight":"4px","marginLeft":"10px"},
                    labelStyle={"fontSize":"14px","fontWeight":"500",
                                "color":"#374151","cursor":"pointer"},
                ),
            ], style={"display":"flex","alignItems":"center",
                      "justifyContent":"flex-end","height":"100%"}),
        ], width=4),
    ], align="center", style={"marginBottom":"1.25rem","paddingTop":"1rem"}),

    dbc.Row(id="kpi-row", style={"marginBottom":"1.25rem"}),

    dbc.Tabs(id="abas", active_tab="temporal", children=[
        dbc.Tab(label="📈 Série Temporal",   tab_id="temporal"),
        dbc.Tab(label="🦟 Arboviroses",      tab_id="arbo"),
        dbc.Tab(label="👤 Perfil dos Casos", tab_id="perfil"),
        dbc.Tab(label="🚰 Saneamento",       tab_id="sanea"),
    ], style={"marginBottom":"1rem"}),

    html.Div(id="conteudo"),

    html.Div([
        html.Span("Fontes: InfoDengue/Fiocruz · SINAN/MS (DENGBR25, DENGBR26) · SINISA 2024 · ARSESP 2020",
                  style={"fontSize":"11px","color":"#9CA3AF"}),
        html.Span("Atualizado: Mai/2026",
                  style={"fontSize":"11px","color":"#9CA3AF","float":"right"}),
    ], style={"borderTop":"1px solid #F0F0F0","paddingTop":"10px",
              "marginTop":"1.5rem","overflow":"hidden"}),

], fluid=True,
   style={"fontFamily":"Inter, sans-serif","backgroundColor":"#F8FAF9",
          "minHeight":"100vh","padding":"0 2rem 2rem"})


# ══════════════════════════════════════════════════════════════════
# CALLBACKS
# ══════════════════════════════════════════════════════════════════

@app.callback(Output("kpi-row","children"), Input("ano-radio","value"))
def cb_kpis(ano):
    row = totais[totais["ano"] == ano]
    if row.empty:
        return []
    casos = int(row["casos"].iloc[0])
    rt    = float(row["Rt_medio"].iloc[0])
    inc   = float(row["inc_media"].iloc[0])

    if ano == 2025:
        hosp  = int((s25["HOSPITALIZ"] == 1).sum())
        obito = int((s25["EVOLUCAO"] == 2).sum())
    elif ano == 2026:
        hosp  = int((s26["HOSPITALIZ"] == 1).sum()) if "HOSPITALIZ" in s26.columns else 0
        obito = int((s26["EVOLUCAO"]  == 2).sum())  if "EVOLUCAO"  in s26.columns else 0
    else:
        hosp, obito = "–", "–"

    cards = [
        kpi("Casos confirmados",
            f"{casos:,}".replace(",","."),
            f"InfoDengue/Fiocruz · {ano}", VERDE),
        kpi("Rt médio anual",
            f"{rt:.2f}",
            "Acima de 1 = expansão da transmissão", CORAL, alerta=(rt > 1)),
        kpi("Incidência /100k hab.",
            f"{inc:.1f}",
            f"Média das semanas epidemiológicas · {ano}", AMBAR, alerta=(inc > 80)),
        kpi("Hospitalizados (SINAN)",
            f"{hosp:,}".replace(",",".") if isinstance(hosp,int) else hosp,
            f"Notificações SINAN/MS · {ano}", AZUL),
        kpi("Óbitos (SINAN)",
            str(obito),
            f"Desfecho fatal · {ano}", CORAL, alerta=(isinstance(obito,int) and obito > 0)),
    ]
    return [dbc.Col(c, xs=12, sm=6, md=4, lg=True,
                    style={"marginBottom":"10px"}) for c in cards]


@app.callback(
    Output("conteudo","children"),
    Input("abas","active_tab"),
    Input("ano-radio","value"),
)
def cb_aba(aba, ano):

    # ── SÉRIE TEMPORAL ────────────────────────────────────────────
    if aba == "temporal":
        dm = deng_mes[deng_mes["ano"] == ano].sort_values("mes")
        meses = dm["mes_nome"].tolist()

        temp_mes = deng[deng["ano"]==ano].groupby("mes")["tempmed"].mean()
        umid_mes = deng[deng["ano"]==ano].groupby("mes")["umidmed"].mean()

        # Casos + temperatura
        fig1 = go.Figure()
        fig1.add_trace(go.Bar(x=meses, y=dm["casos"].tolist(),
                               name="Casos confirmados",
                               marker_color=CORAL, marker_line_width=0))
        fig1.add_trace(go.Scatter(
            x=meses, y=temp_mes.reindex(dm["mes"]).tolist(),
            name="Temp. média (°C)", mode="lines+markers",
            line=dict(color=AMBAR, width=2), yaxis="y2", marker=dict(size=5)))
        apply_base(fig1, 260, M0, yaxis_title="Casos confirmados",
            yaxis2=dict(title="°C", overlaying="y", side="right",
                        showgrid=False, tickfont=dict(size=10)))

        # Rt semanal
        dr = deng[deng["ano"]==ano].sort_values("data")
        ticks_idx = list(range(0, len(dr), 4))
        fig2 = go.Figure()
        fig2.add_hrect(y0=0, y1=1, fillcolor="rgba(29,158,117,0.07)",
                       line_width=0,
                       annotation_text="Rt < 1 (controle)",
                       annotation_position="top left",
                       annotation_font=dict(size=10, color=VERDE))
        fig2.add_hline(y=1, line_dash="dash", line_color=CINZA)
        fig2.add_trace(go.Scatter(
            x=dr["data"].dt.strftime("%d/%m").tolist(), y=dr["Rt"].tolist(),
            mode="lines", name="Rt semanal",
            line=dict(color=CORAL, width=2),
            fill="tozeroy", fillcolor="rgba(216,90,48,0.07)"))
        rt_layout = {k:v for k,v in BASE_LAYOUT.items() if k != "xaxis"}
        fig2.update_layout(**rt_layout, height=230, margin=M0,
            yaxis_title="Rt",
            xaxis=dict(showgrid=False, linecolor="#E5E7EB", tickangle=-45,
                       tickfont=dict(size=9),
                       tickvals=[dr["data"].dt.strftime("%d/%m").tolist()[i] for i in ticks_idx],
                       ticktext=[dr["data"].dt.strftime("%d/%m").tolist()[i] for i in ticks_idx]),
            showlegend=False)

        # Incidência + umidade
        fig3 = go.Figure()
        fig3.add_trace(go.Bar(x=meses,
                               y=deng[deng["ano"]==ano].groupby("mes")["p_inc100k"].sum()
                                    .reindex(dm["mes"], fill_value=0).tolist(),
                               name="Incidência /100k",
                               marker_color=AZUL, marker_line_width=0))
        fig3.add_trace(go.Scatter(
            x=meses, y=umid_mes.reindex(dm["mes"]).tolist(),
            name="Umidade (%)", mode="lines+markers",
            line=dict(color=VERDE, width=2), yaxis="y2", marker=dict(size=5)))
        apply_base(fig3, 230, M0, yaxis_title="Incidência /100k",
            yaxis2=dict(title="%", overlaying="y", side="right",
                        showgrid=False, tickfont=dict(size=10)))

        return html.Div([
            painel(f"Casos confirmados por mês e temperatura — {ano}",
                   "Fonte: InfoDengue/Fiocruz · Cotia/SP",
                   dcc.Graph(figure=fig1, config={"displayModeBar":False})),
            dbc.Row([
                dbc.Col(painel("Rt semanal",
                               "Número reprodutivo — pico no 1º semestre",
                               dcc.Graph(figure=fig2, config={"displayModeBar":False})), md=6),
                dbc.Col(painel("Incidência /100k hab. e umidade",
                               "Relação clima–transmissão",
                               dcc.Graph(figure=fig3, config={"displayModeBar":False})), md=6),
            ]),
        ])

    # ── ARBOVIROSES ───────────────────────────────────────────────
    elif aba == "arbo":
        td = deng.groupby("ano")["casos"].sum().reset_index()
        tc = chik.groupby("ano")["casos"].sum().reset_index()
        tz = zika.groupby("ano")["casos"].sum().reset_index()

        fig_cmp = go.Figure()
        fig_cmp.add_trace(go.Bar(name="Dengue",      x=td["ano"].astype(str), y=td["casos"],
                                  marker_color=CORAL, marker_line_width=0))
        fig_cmp.add_trace(go.Bar(name="Chikungunya", x=tc["ano"].astype(str), y=tc["casos"],
                                  marker_color=AMBAR, marker_line_width=0))
        fig_cmp.add_trace(go.Bar(name="Zika",        x=tz["ano"].astype(str), y=tz["casos"],
                                  marker_color=AZUL,  marker_line_width=0))
        apply_base(fig_cmp, 270, M0, barmode="group",
                               yaxis_title="Casos confirmados")

        cores_anos = {2024:CORAL, 2025:AMBAR, 2026:AZUL}
        fig_sazon = go.Figure()
        for a in sorted(deng["ano"].unique()):
            sub = deng_mes[deng_mes["ano"]==a].sort_values("mes")
            fig_sazon.add_trace(go.Scatter(
                x=sub["mes"].tolist(), y=sub["casos"].tolist(),
                name=str(a), mode="lines+markers",
                line=dict(color=cores_anos.get(a, CINZA), width=2),
                marker=dict(size=5)))
        sazon_layout = {k:v for k,v in BASE_LAYOUT.items() if k != "xaxis"}
        fig_sazon.update_layout(**sazon_layout, height=250, margin=M0,
            xaxis=dict(tickvals=list(range(1,13)),
                       ticktext=list(MESES_PT.values()),
                       showgrid=False, linecolor="#E5E7EB", tickfont=dict(size=11)),
            yaxis_title="Casos confirmados")

        fig_sn = go.Figure()
        fig_sn.add_trace(go.Bar(
            x=sinan_mes_25["mes"].map(MESES_PT).tolist(),
            y=sinan_mes_25["notificacoes"].tolist(),
            name="2025", marker_color=CORAL, marker_line_width=0))
        if len(sinan_mes_26):
            fig_sn.add_trace(go.Bar(
                x=sinan_mes_26["mes"].map(MESES_PT).tolist(),
                y=sinan_mes_26["notificacoes"].tolist(),
                name="2026", marker_color=AZUL, marker_line_width=0))
        apply_base(fig_sn, 240, M0, barmode="group",
                              yaxis_title="Notificações SINAN")

        return html.Div([
            painel("Comparativo anual — Dengue · Chikungunya · Zika",
                   "Fonte: InfoDengue/Fiocruz · Cotia/SP · 2024–2026",
                   dcc.Graph(figure=fig_cmp, config={"displayModeBar":False})),
            painel("Sazonalidade da dengue — comparação entre anos",
                   "Pico consistente em fevereiro–abril; 2024 foi o ano mais grave",
                   dcc.Graph(figure=fig_sazon, config={"displayModeBar":False})),
            painel(f"Notificações SINAN — 2025 ({len(s25):,}) · 2026 ({len(s26):,})".replace(",","."),
                   "SINAN/MS — inclui suspeitos e confirmados",
                   html.Div([
                       dcc.Graph(figure=fig_sn, config={"displayModeBar":False}),
                       caixa_nota(
                           "Dengue domina >99% das arboviroses. "
                           "Chikungunya: 36 casos acumulados (2024–2026). "
                           "Zika: 0 casos registrados no período.", AMBAR),
                   ])),
        ])

    # ── PERFIL DOS CASOS ──────────────────────────────────────────
    elif aba == "perfil":
        total = len(s25)
        hosp  = int((s25["HOSPITALIZ"]==1).sum())
        grav  = int((s25["CLASSI_FIN"]==12).sum())
        alarm = int((s25["CLASSI_FIN"]==11).sum())
        obito = int((s25["EVOLUCAO"]==2).sum())
        sexo  = s25["CS_SEXO"].value_counts().reindex(["F","M","I"]).fillna(0)

        fig_sx = go.Figure(go.Pie(
            labels=["Feminino","Masculino","Ignorado"],
            values=sexo.tolist(), hole=0.42,
            marker=dict(colors=[CORAL,AZUL,CINZA],
                        line=dict(color="#fff",width=2)),
            textinfo="percent+label", textfont=dict(size=12)))
        fig_sx.update_layout(paper_bgcolor="rgba(0,0,0,0)",
            margin=dict(t=10,b=10,l=10,r=10), height=240,
            showlegend=False, font=dict(family="Inter, sans-serif"))

        classi = s25["classificacao"].value_counts()
        c_cores = {"Dengue clássica":VERDE,"Com sinais de alarme":AMBAR,
                   "Dengue grave":CORAL,"Descartado":CINZA,"Não classificado":"#D3D1C7"}
        fig_cl = go.Figure(go.Bar(
            x=classi.values.tolist(), y=classi.index.tolist(),
            orientation="h",
            marker_color=[c_cores.get(l,CINZA) for l in classi.index],
            marker_line_width=0,
            text=[f"{v:,}".replace(",",".") for v in classi.values],
            textposition="outside"))
        apply_base(fig_cl, 210, M_H, xaxis_title="Notificações",
            yaxis=dict(gridcolor="#F0F0F0",linecolor="#E5E7EB",tickfont=dict(size=12)))

        ordem = ["<10 anos","10–19 anos","20–29 anos","30–39 anos",
                 "40–49 anos","50–59 anos","60+ anos","Ignorado"]
        faixas = s25["faixa"].value_counts().reindex(ordem, fill_value=0)
        fig_fe = go.Figure(go.Bar(
            x=faixas.index.tolist(), y=faixas.values.tolist(),
            marker_color=AZUL, marker_line_width=0))
        apply_base(fig_fe, 230, M0, yaxis_title="Notificações", xaxis_title="Faixa etária")

        return html.Div([
            dbc.Row([
                dbc.Col(painel("Distribuição por sexo",
                               f"SINAN 2025 · {total:,} notificações Cotia".replace(",","."),
                               dcc.Graph(figure=fig_sx, config={"displayModeBar":False})), md=4),
                dbc.Col(painel("Classificação final dos casos","SINAN/MS 2025 — Cotia/SP",
                               html.Div([
                                   dcc.Graph(figure=fig_cl, config={"displayModeBar":False}),
                                   caixa_nota(
                                       f"Graves: {grav} · Com alarme: {alarm:,} · Óbitos: {obito}".replace(",","."),
                                       CORAL),
                               ])), md=8),
            ]),
            painel("Distribuição por faixa etária",
                   "SINAN/MS 2025 — maior concentração nas faixas 30–49 anos",
                   dcc.Graph(figure=fig_fe, config={"displayModeBar":False})),
            dbc.Card(dbc.CardBody([
                html.P("Síntese epidemiológica — SINAN 2025",
                       style={"fontWeight":"600","fontSize":"14px","marginBottom":"10px"}),
                dbc.Table(html.Tbody([
                    html.Tr([html.Td("Total de notificações",
                                     style={"color":"#6B7280","fontSize":"13px","width":"55%"}),
                             html.Td(f"{total:,}".replace(",","."),
                                     style={"fontWeight":"600"})]),
                    html.Tr([html.Td("Hospitalizados",
                                     style={"color":"#6B7280","fontSize":"13px"}),
                             html.Td(f"{hosp:,} ({hosp/total*100:.1f}%)".replace(",","."),
                                     style={"fontWeight":"600","color":AZUL})]),
                    html.Tr([html.Td("Com sinais de alarme",
                                     style={"color":"#6B7280","fontSize":"13px"}),
                             html.Td(f"{alarm:,} ({alarm/total*100:.1f}%)".replace(",","."),
                                     style={"fontWeight":"600","color":AMBAR})]),
                    html.Tr([html.Td("Dengue grave",
                                     style={"color":"#6B7280","fontSize":"13px"}),
                             html.Td(f"{grav} ({grav/total*100:.2f}%)",
                                     style={"fontWeight":"600","color":CORAL})]),
                    html.Tr([html.Td("Óbitos confirmados",
                                     style={"color":"#6B7280","fontSize":"13px"}),
                             html.Td(str(obito),
                                     style={"fontWeight":"600","color":CORAL})]),
                    html.Tr([html.Td("Sexo predominante",
                                     style={"color":"#6B7280","fontSize":"13px"}),
                             html.Td(f"Feminino — {sexo['F']/total*100:.1f}%",
                                     style={"fontWeight":"600"})]),
                ]), bordered=False, striped=True, size="sm"),
            ]), style={"borderRadius":"12px","border":"1px solid #E5E7EB"}),
        ])

    # ── SANEAMENTO ────────────────────────────────────────────────
    elif aba == "sanea":
        ind = ["Acesso à água","Esgoto coletado","Coleta de esgoto","Tratam. esgoto"]
        fig_cmp = go.Figure()
        fig_cmp.add_trace(go.Bar(name="Cotia", x=ind,
            y=[SAN["agua_pct"],SAN["esgoto_pct"],SAN["coleta_esgoto"],SAN["trat_esgoto"]],
            marker_color=VERDE, marker_line_width=0))
        fig_cmp.add_trace(go.Bar(name="Estado SP", x=ind,
            y=[97.4, 93.3, 83.9, 72.9],
            marker_color=AZUL, marker_line_width=0))
        fig_cmp.add_trace(go.Bar(name="Brasil", x=ind,
            y=[84.1, 62.3, 61.8, 51.8],
            marker_color=CINZA, marker_line_width=0))
        apply_base(fig_cmp, 260, M0, barmode="group",
            yaxis=dict(range=[0,110], title="% da população",
                       gridcolor="#F0F0F0", linecolor="#E5E7EB", tickfont=dict(size=11)))

        fig_perd = go.Figure(go.Bar(
            x=["Cotia","Estado SP","Brasil"], y=[14.9, 33.6, 36.2],
            marker_color=[VERDE, AZUL, CINZA], marker_line_width=0,
            text=["14,9%","33,6%","36,2%"], textposition="outside"))
        apply_base(fig_perd, 210, M0, yaxis=dict(range=[0,45], title="% perdas",
                       gridcolor="#F0F0F0", linecolor="#E5E7EB", tickfont=dict(size=11)))

        return html.Div([
            dbc.Row([
                dbc.Col([
                    dbc.Card(dbc.CardBody([
                        html.P("Indicadores — Cotia/SP",
                               style={"fontWeight":"600","fontSize":"14px","marginBottom":"10px"}),
                        dbc.Table(html.Tbody([
                            html.Tr([html.Td("População total",style={"color":"#6B7280","fontSize":"13px","width":"60%"}),
                                     html.Td("287.004 hab.",style={"fontWeight":"600"})]),
                            html.Tr([html.Td("Com acesso à água",style={"color":"#6B7280","fontSize":"13px"}),
                                     html.Td(f"99,1% (sem: 2.603)",style={"fontWeight":"600","color":VERDE})]),
                            html.Tr([html.Td("Com esgoto coletado",style={"color":"#6B7280","fontSize":"13px"}),
                                     html.Td("68,5% (sem: 90.422!)",style={"fontWeight":"600","color":CORAL})]),
                            html.Tr([html.Td("Coleta de esgoto",style={"color":"#6B7280","fontSize":"13px"}),
                                     html.Td("41,6% do volume gerado",style={"fontWeight":"600","color":CORAL})]),
                            html.Tr([html.Td("Tratamento de esgoto",style={"color":"#6B7280","fontSize":"13px"}),
                                     html.Td("23,8% do volume gerado",style={"fontWeight":"600","color":CORAL})]),
                            html.Tr([html.Td("Perdas na distribuição",style={"color":"#6B7280","fontSize":"13px"}),
                                     html.Td("14,9% (melhor que SP)",style={"fontWeight":"600","color":VERDE})]),
                            html.Tr([html.Td("Hidrometração",style={"color":"#6B7280","fontSize":"13px"}),
                                     html.Td("100%",style={"fontWeight":"600","color":VERDE})]),
                            html.Tr([html.Td("Fonte",style={"color":"#9CA3AF","fontSize":"12px"}),
                                     html.Td("SINISA 2024 · ARSESP 2020",style={"fontSize":"12px"})]),
                        ]), bordered=False, striped=True, size="sm"),
                    ]), style={"borderRadius":"12px","border":"1px solid #E5E7EB","height":"100%"}),
                ], md=4),
                dbc.Col(painel("Cotia vs Estado SP vs Brasil",
                               "Fonte: SINISA 2024 · Instituto Água e Saneamento",
                               dcc.Graph(figure=fig_cmp, config={"displayModeBar":False})), md=8),
            ], style={"marginBottom":"1rem"}),
            painel("Índice de perdas na distribuição de água (%)",
                   "Cotia tem desempenho significativamente melhor que a média estadual e nacional",
                   html.Div([
                       dcc.Graph(figure=fig_perd, config={"displayModeBar":False}),
                       caixa_nota(
                           "Déficit crítico: 90.422 hab. sem coleta de esgoto e apenas 23,8% do esgoto gerado "
                           "é tratado. Isso representa vulnerabilidade direta à proliferação do Aedes aegypti "
                           "e amplifica o risco de transmissão de arboviroses.", CORAL),
                   ])),
        ])

    return html.Div()



# ══════════════════════════════════════════════════════════════════
# EXECUÇÃO
# ══════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("\n" + "="*60)
    print("  Dashboard Arboviroses — Cotia/SP  (dados reais)")
    print("  InfoDengue/Fiocruz · SINAN/MS · SINISA 2024")
    print("="*60)
    print("  Acesse: http://127.0.0.1:8050")
    
    print("="*60 + "\n")
    app.run(debug=True, host="127.0.0.1", port=8050)
