import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const BAIRROS = ["Caucaia do Alto","Granja Viana","Cotia Centro","Jardim Nomura","Jardim São Paulo","Vila Comercial","Rio Cotia","Morro Grande"];

const dados2023 = [
  { mes:"Jan", visitas:3120, programadas:3400, notificacoes:87, focos:210, cc:52, nebulizacoes:18, positividade:9.2 },
  { mes:"Fev", visitas:3450, programadas:3600, notificacoes:134, focos:285, cc:80, nebulizacoes:24, positividade:12.1 },
  { mes:"Mar", visitas:3800, programadas:4000, notificacoes:198, focos:342, cc:110, nebulizacoes:36, positividade:15.3 },
  { mes:"Abr", visitas:3650, programadas:3900, notificacoes:142, focos:290, cc:88, nebulizacoes:28, positividade:11.8 },
  { mes:"Mai", visitas:3200, programadas:3400, notificacoes:72, focos:180, cc:44, nebulizacoes:12, positividade:7.4 },
  { mes:"Jun", visitas:2800, programadas:3000, notificacoes:35, focos:98, cc:22, nebulizacoes:6, positividade:4.1 },
  { mes:"Jul", visitas:2600, programadas:2800, notificacoes:28, focos:75, cc:18, nebulizacoes:4, positividade:3.2 },
  { mes:"Ago", visitas:2750, programadas:3000, notificacoes:40, focos:102, cc:25, nebulizacoes:8, positividade:4.6 },
  { mes:"Set", visitas:3050, programadas:3200, notificacoes:65, focos:158, cc:38, nebulizacoes:14, positividade:6.8 },
  { mes:"Out", visitas:3300, programadas:3500, notificacoes:112, focos:240, cc:65, nebulizacoes:20, positividade:10.2 },
  { mes:"Nov", visitas:3520, programadas:3700, notificacoes:156, focos:310, cc:92, nebulizacoes:30, positividade:13.5 },
  { mes:"Dez", visitas:3680, programadas:3900, notificacoes:180, focos:330, cc:105, nebulizacoes:35, positividade:14.2 },
];

const dados2024 = [
  { mes:"Jan", visitas:3250, programadas:3500, notificacoes:210, focos:390, cc:120, nebulizacoes:42, positividade:16.8 },
  { mes:"Fev", visitas:3600, programadas:3800, notificacoes:348, focos:520, cc:175, nebulizacoes:62, positividade:22.3 },
  { mes:"Mar", visitas:4100, programadas:4300, notificacoes:512, focos:680, cc:230, nebulizacoes:88, positividade:28.7 },
  { mes:"Abr", visitas:3900, programadas:4200, notificacoes:390, focos:550, cc:185, nebulizacoes:70, positividade:24.1 },
  { mes:"Mai", visitas:3450, programadas:3700, notificacoes:195, focos:320, cc:95, nebulizacoes:32, positividade:14.6 },
  { mes:"Jun", visitas:3100, programadas:3300, notificacoes:88, focos:182, cc:52, nebulizacoes:16, positividade:8.2 },
  { mes:"Jul", visitas:2850, programadas:3000, notificacoes:60, focos:130, cc:36, nebulizacoes:10, positividade:5.8 },
  { mes:"Ago", visitas:2980, programadas:3200, notificacoes:82, focos:168, cc:48, nebulizacoes:14, positividade:7.1 },
  { mes:"Set", visitas:3200, programadas:3400, notificacoes:140, focos:260, cc:78, nebulizacoes:24, positividade:11.4 },
  { mes:"Out", visitas:3450, programadas:3700, notificacoes:240, focos:415, cc:132, nebulizacoes:44, positividade:18.9 },
  { mes:"Nov", visitas:3700, programadas:3900, notificacoes:310, focos:480, cc:165, nebulizacoes:58, positividade:21.5 },
  { mes:"Dez", visitas:3850, programadas:4100, notificacoes:362, focos:510, cc:188, nebulizacoes:68, positividade:23.8 },
];

const bairroData = [
  { bairro:"Granja Viana", focos:842, positividade:24.3, visitas:12400, pendencia:8.2 },
  { bairro:"Cotia Centro", focos:720, positividade:21.1, visitas:10800, pendencia:9.8 },
  { bairro:"Jardim Nomura", focos:680, positividade:19.8, visitas:9600, pendencia:7.4 },
  { bairro:"Rio Cotia", focos:530, positividade:16.2, visitas:8200, pendencia:11.2 },
  { bairro:"Vila Comercial", focos:410, positividade:13.5, visitas:7400, pendencia:10.5 },
  { bairro:"Jardim São Paulo", focos:380, positividade:12.4, visitas:6800, pendencia:6.8 },
  { bairro:"Morro Grande", focos:290, positividade:9.7, visitas:5600, pendencia:13.1 },
  { bairro:"Caucaia do Alto", focos:180, positividade:6.2, visitas:4200, pendencia:5.4 },
];

const tiposCriadouros = [
  { tipo:"Caixa dágua destampada", pct:32 },
  { tipo:"Pneus/borrachas", pct:22 },
  { tipo:"Calhas entupidas", pct:18 },
  { tipo:"Vasos/pratos", pct:14 },
  { tipo:"Piscina abandonada", pct:8 },
  { tipo:"Outros", pct:6 },
];

const armadilhasData = [
  { semana:"S01", ovitrapas:42, mosquitrapas:18 },
  { semana:"S05", ovitrapas:68, mosquitrapas:29 },
  { semana:"S09", ovitrapas:112, mosquitrapas:54 },
  { semana:"S13", ovitrapas:95, mosquitrapas:44 },
  { semana:"S17", ovitrapas:48, mosquitrapas:22 },
  { semana:"S21", ovitrapas:28, mosquitrapas:12 },
  { semana:"S25", ovitrapas:22, mosquitrapas:9 },
  { semana:"S29", ovitrapas:35, mosquitrapas:15 },
  { semana:"S33", ovitrapas:58, mosquitrapas:26 },
  { semana:"S37", ovitrapas:88, mosquitrapas:40 },
  { semana:"S41", ovitrapas:125, mosquitrapas:62 },
  { semana:"S45", ovitrapas:148, mosquitrapas:78 },
  { semana:"S49", ovitrapas:132, mosquitrapas:68 },
];

const VERDE = "#1D9E75";
const VERDE_CLARO = "#5DCAA5";
const CORAL = "#D85A30";
const AZUL = "#185FA5";
const AMBAR = "#BA7517";
const CINZA = "#5F5E5A";

const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
        <p style={{ margin: "0 0 6px", fontWeight: 500, color: "var(--color-text-primary)" }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ margin: "2px 0", color: p.color || "var(--color-text-secondary)" }}>
            {p.name}: <strong>{prefix}{typeof p.value === "number" ? p.value.toLocaleString("pt-BR") : p.value}{suffix}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const KpiCard = ({ icon, label, value, sub, color = VERDE, alert = false }) => (
  <div style={{ background: "var(--color-background-primary)", border: `0.5px solid ${alert ? "#E24B4A" : "var(--color-border-tertiary)"}`, borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 4 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <i className={`ti ${icon}`} style={{ fontSize: 18, color, opacity: 0.85 }} aria-hidden="true" />
      <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
    </div>
    <span style={{ fontSize: 26, fontWeight: 500, color: alert ? "#A32D2D" : "var(--color-text-primary)" }}>{value}</span>
    {sub && <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{sub}</span>}
  </div>
);

export default function Dashboard() {
  const [ano, setAno] = useState("2024");
  const [aba, setAba] = useState("temporal");

  const dados = ano === "2024" ? dados2024 : dados2023;

  const kpis = useMemo(() => {
    const totalVisitas = dados.reduce((a, d) => a + d.visitas, 0);
    const totalProg = dados.reduce((a, d) => a + d.programadas, 0);
    const totalNotif = dados.reduce((a, d) => a + d.notificacoes, 0);
    const totalFocos = dados.reduce((a, d) => a + d.focos, 0);
    const totalCC = dados.reduce((a, d) => a + d.cc, 0);
    const mediaPos = (dados.reduce((a, d) => a + d.positividade, 0) / dados.length).toFixed(1);
    const pendencia = (((totalProg - totalVisitas) / totalProg) * 100).toFixed(1);
    const produtividade = ((totalVisitas / totalProg) * 100).toFixed(1);
    return { totalVisitas, totalNotif, totalFocos, mediaPos, pendencia, produtividade, totalCC };
  }, [dados]);

  const abas = [
    { id: "temporal", label: "Série Temporal", icon: "ti-chart-line" },
    { id: "espacial", label: "Por Bairro", icon: "ti-map-pin" },
    { id: "armadilhas", label: "Armadilhas", icon: "ti-bug" },
    { id: "criadouros", label: "Criadouros", icon: "ti-droplet" },
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "0 0 2rem" }}>
      <h2 className="sr-only">Dashboard de Vigilância de Arboviroses — Cotia/SP</h2>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>Projeto Integrador II · SISAWEB</p>
          <h1 style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)" }}>Vigilância de Arboviroses — Cotia/SP</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Ano:</span>
          {["2023","2024"].map(a => (
            <button key={a} onClick={() => setAno(a)} style={{ padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, border: `1.5px solid ${ano === a ? VERDE : "var(--color-border-secondary)"}`, background: ano === a ? "#E1F5EE" : "transparent", color: ano === a ? "#0F6E56" : "var(--color-text-secondary)", cursor: "pointer" }}>{a}</button>
          ))}
          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginLeft: 6 }}>* dados simulados</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
        <KpiCard icon="ti-home-check" label="Visitas realizadas" value={kpis.totalVisitas.toLocaleString("pt-BR")} sub={`Produtividade: ${kpis.produtividade}%`} color={VERDE} />
        <KpiCard icon="ti-alert-triangle" label="Notificações" value={kpis.totalNotif.toLocaleString("pt-BR")} sub={`vs ${ano === "2024" ? "+82% vs 2023" : "ano base"}`} color={CORAL} alert={ano === "2024"} />
        <KpiCard icon="ti-bug" label="Focos identificados" value={kpis.totalFocos.toLocaleString("pt-BR")} sub={`Pos. média: ${kpis.mediaPos}%`} color={AMBAR} alert={parseFloat(kpis.mediaPos) > 15} />
        <KpiCard icon="ti-clock-x" label="Pendência" value={`${kpis.pendencia}%`} sub="Visitas não realizadas" color={CINZA} alert={parseFloat(kpis.pendencia) > 10} />
        <KpiCard icon="ti-flame" label="Ctrl. criadouros (CC)" value={kpis.totalCC.toLocaleString("pt-BR")} sub="Ações de bloqueio" color={AZUL} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {abas.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: aba === a.id ? 500 : 400, border: `0.5px solid ${aba === a.id ? VERDE : "var(--color-border-tertiary)"}`, background: aba === a.id ? "#E1F5EE" : "var(--color-background-secondary)", color: aba === a.id ? "#0F6E56" : "var(--color-text-secondary)", cursor: "pointer" }}>
            <i className={`ti ${a.icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
            {a.label}
          </button>
        ))}
      </div>

      {aba === "temporal" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ margin: "0 0 4px", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Notificações e focos por mês</p>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-secondary)" }}>Sazonalidade — pico nos meses quentes (jan–abr)</p>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dados} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gNotif" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CORAL} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={CORAL} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gFocos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={AMBAR} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={AMBAR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="notificacoes" name="Notificações" stroke={CORAL} fill="url(#gNotif)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="focos" name="Focos" stroke={AMBAR} fill="url(#gFocos)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: CORAL, marginRight: 4 }} />Notificações</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: AMBAR, marginRight: 4 }} />Focos identificados</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px 18px" }}>
              <p style={{ margin: "0 0 4px", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Visitas realizadas vs programadas</p>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-secondary)" }}>Produtividade das equipes de campo</p>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="programadas" name="Programadas" fill="#D3D1C7" radius={[3,3,0,0]} />
                    <Bar dataKey="visitas" name="Realizadas" fill={VERDE} radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>
                <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#D3D1C7", marginRight: 4 }} />Programadas</span>
                <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: VERDE, marginRight: 4 }} />Realizadas</span>
              </div>
            </div>

            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px 18px" }}>
              <p style={{ margin: "0 0 4px", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Positividade e ações CC (%)</p>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-secondary)" }}>Índice de positividade × controle de criadouros</p>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dados} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} />
                    <Tooltip content={<CustomTooltip suffix="%" />} />
                    <Line type="monotone" dataKey="positividade" name="Positividade" stroke={CORAL} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="nebulizacoes" name="Nebulizações" stroke={AZUL} strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>
                <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: CORAL, marginRight: 4 }} />Positividade %</span>
                <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: AZUL, marginRight: 4 }} />Nebulizações</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {aba === "espacial" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ margin: "0 0 4px", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Ranking de focos por bairro</p>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--color-text-secondary)" }}>Acumulado anual — ordenado por volume de focos identificados</p>
            <div style={{ height: bairroData.length * 42 + 40 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...bairroData].reverse()} layout="vertical" margin={{ top: 0, right: 50, left: 100, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
                  <YAxis type="category" dataKey="bairro" tick={{ fontSize: 12, fill: "var(--color-text-primary)" }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="focos" name="Focos" radius={[0,4,4,0]}>
                    {[...bairroData].reverse().map((entry, i) => (
                      <Cell key={i} fill={entry.positividade > 18 ? CORAL : entry.positividade > 12 ? AMBAR : VERDE} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ margin: "0 0 4px", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Indicadores por bairro</p>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-secondary)" }}>Positividade, visitas e pendência</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "0.5px solid var(--color-border-secondary)" }}>
                    {["Bairro","Focos","Positividade","Visitas","Pendência"].map(h => (
                      <th key={h} style={{ textAlign: h === "Bairro" ? "left" : "right", padding: "6px 10px", fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.3 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bairroData.map((b, i) => (
                    <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: i % 2 === 0 ? "transparent" : "var(--color-background-secondary)" }}>
                      <td style={{ padding: "7px 10px", fontWeight: 500, color: "var(--color-text-primary)" }}>{b.bairro}</td>
                      <td style={{ textAlign: "right", padding: "7px 10px", color: "var(--color-text-primary)" }}>{b.focos}</td>
                      <td style={{ textAlign: "right", padding: "7px 10px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: b.positividade > 18 ? "#FAECE7" : b.positividade > 12 ? "#FAEEDA" : "#E1F5EE", color: b.positividade > 18 ? "#993C1D" : b.positividade > 12 ? "#854F0B" : "#0F6E56" }}>{b.positividade.toFixed(1)}%</span>
                      </td>
                      <td style={{ textAlign: "right", padding: "7px 10px", color: "var(--color-text-secondary)" }}>{b.visitas.toLocaleString("pt-BR")}</td>
                      <td style={{ textAlign: "right", padding: "7px 10px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: b.pendencia > 10 ? "#FAECE7" : "#E1F5EE", color: b.pendencia > 10 ? "#993C1D" : "#0F6E56" }}>{b.pendencia.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 12, color: "var(--color-text-secondary)", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 10, background: CORAL, display: "inline-block" }} />Alta (&gt;18%)</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 10, background: AMBAR, display: "inline-block" }} />Média (12–18%)</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 10, background: VERDE, display: "inline-block" }} />Controlada (&lt;12%)</span>
            </div>
          </div>
        </div>
      )}

      {aba === "armadilhas" && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px 18px" }}>
          <p style={{ margin: "0 0 4px", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Resultado das armadilhas por semana epidemiológica</p>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--color-text-secondary)" }}>Ovitrapas e mosquitrapas positivas — 2024</p>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={armadilhasData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gOvi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={VERDE} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={VERDE} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AZUL} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={AZUL} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ovitrapas" name="Ovitrapas positivas" stroke={VERDE} fill="url(#gOvi)" strokeWidth={2} />
                <Area type="monotone" dataKey="mosquitrapas" name="Mosquitrapas positivas" stroke={AZUL} fill="url(#gMos)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 12, color: "var(--color-text-secondary)" }}>
            <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: VERDE, marginRight: 4 }} />Ovitrapas positivas</span>
            <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: AZUL, marginRight: 4 }} />Mosquitrapas positivas</span>
          </div>
          <div style={{ marginTop: "1.25rem", padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: 8, fontSize: 12, color: "var(--color-text-secondary)", borderLeft: `3px solid ${VERDE}` }}>
            <strong style={{ color: "var(--color-text-primary)" }}>Leitura:</strong> Picos nas semanas 41–49 (out–dez) indicam aumento da infestação pré-verão. A SE09 (março) corresponde ao pico do surto de 2024.
          </div>
        </div>
      )}

      {aba === "criadouros" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ margin: "0 0 4px", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Tipos de criadouros identificados</p>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--color-text-secondary)" }}>Distribuição percentual — acumulado anual</p>
            {tiposCriadouros.map((t, i) => {
              const cores = [VERDE, AZUL, AMBAR, CORAL, "#639922", CINZA];
              return (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                    <span style={{ color: "var(--color-text-primary)" }}>{t.tipo}</span>
                    <span style={{ fontWeight: 500, color: cores[i] }}>{t.pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 4, background: "var(--color-background-tertiary)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${t.pct}%`, background: cores[i], borderRadius: 4, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ margin: "0 0 4px", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Indicador % ACE por bairro</p>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--color-text-secondary)" }}>% ACE real/ideal (meta: ≥ 80%)</p>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { bairro:"Granja Viana", ace:74 },
                  { bairro:"Cotia Centro", ace:88 },
                  { bairro:"Jd. Nomura", ace:82 },
                  { bairro:"Rio Cotia", ace:65 },
                  { bairro:"V. Comercial", ace:79 },
                  { bairro:"Jd. S. Paulo", ace:91 },
                  { bairro:"Morro Grande", ace:58 },
                  { bairro:"Caucaia", ace:95 },
                ]} margin={{ top: 4, right: 10, left: -14, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                  <XAxis dataKey="bairro" tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} angle={-35} textAnchor="end" />
                  <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} unit="%" />
                  <Tooltip content={<CustomTooltip suffix="%" />} />
                  <Bar dataKey="ace" name="% ACE" radius={[4,4,0,0]}>
                    {[74,88,82,65,79,91,58,95].map((v, i) => (
                      <Cell key={i} fill={v < 70 ? CORAL : v < 80 ? AMBAR : VERDE} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: "1.5rem", padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: 8, fontSize: 11, color: "var(--color-text-tertiary)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
        <span>Fonte: dados simulados com base na estrutura do SISAWEB/SUCEN — Projeto Integrador II</span>
        <span>Atualizado: 11/05/2026</span>
      </div>
    </div>
  );
}
