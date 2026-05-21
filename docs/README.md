# 🦟 Vigilância de Arboviroses — Cotia/SP

> **Projeto Integrador II** · Dashboard interativo de análise epidemiológica de dengue, chikungunya e zika no município de Cotia/SP, construído com dados reais de fontes públicas.

---

## 📋 Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Fontes de Dados](#fontes-de-dados)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como obter os dados](#como-obter-os-dados)
- [Como executar](#como-executar)
- [Funcionalidades do Dashboard](#funcionalidades-do-dashboard)
- [Indicadores e Métricas](#indicadores-e-métricas)
- [Limitações Conhecidas](#limitações-conhecidas)
- [Contribuição](#contribuição)
- [Referências](#referências)

---

## Sobre o Projeto

Este projeto foi desenvolvido no contexto da disciplina **Projeto Integrador II**, com o objetivo de transformar dados de vigilância epidemiológica de arboviroses em visualizações analíticas úteis para gestores e equipes de saúde pública.

**Pergunta central:**
> *Como transformar dados de vigilância do mosquito da dengue em visualizações que apoiem o monitoramento, a compreensão territorial e a comunicação de resultados?*

### Objetivo Geral

Extrair, tratar e analisar dados de arboviroses (dengue, chikungunya e zika) em Cotia/SP, desenvolvendo um dashboard interativo que permita identificar padrões sazonais, perfil epidemiológico dos casos e relação com indicadores de saneamento básico.

---

## Fontes de Dados

> ⚠️ **Os arquivos de dados não estão no repositório** por excederem o limite de tamanho do GitHub (alguns chegam a 1,7 GB). Veja a seção [Como obter os dados](#como-obter-os-dados) para instruções de download.

| Arquivo | Fonte | Descrição | Tamanho aprox. |
|---|---|---|---|
| `dengue_2-19.csv` | InfoDengue/Fiocruz | Série semanal de dengue em Cotia · 2024–2026 | ~80 KB |
| `chikungunya_2-19.csv` | InfoDengue/Fiocruz | Série semanal de chikungunya em Cotia · 2024–2026 | ~80 KB |
| `zika_2-19.csv` | InfoDengue/Fiocruz | Série semanal de zika em Cotia · 2024–2026 | ~80 KB |
| `DENGBR25.csv` | SINAN/MS | Notificações individuais de dengue no Brasil · 2025 | ~435 MB |
| `DENGBR26.csv` | SINAN/MS | Notificações individuais de dengue no Brasil · 2026 | ~80 MB |

### Dados de Saneamento (embutidos no código)

Os indicadores de saneamento básico foram extraídos manualmente dos seguintes documentos e estão incorporados diretamente no dashboard:

| Documento | Fonte | Ano |
|---|---|---|
| Relatório Analítico de Saneamento Básico — Cotia | ARSESP | 2020 |
| Painel Municípios e Saneamento — Cotia/SP | Instituto Água e Saneamento / SINISA | 2024 |

---

## Estrutura do Repositório

```
Projeto-Integrador-II/
│
├── dashboard_arboviroses.py   # Aplicação principal (Dash)
├── requirements.txt           # Dependências Python
├── README.md                  # Este arquivo
├── .gitignore                 # Exclui CSVs grandes e arquivos temporários
│
├── data/
│   ├── README.md              # Instruções de download dos dados
│   ├── dengue_2-19.csv        # ← baixar (não incluso)
│   ├── chikungunya_2-19.csv   # ← baixar (não incluso)
│   ├── zika_2-19.csv          # ← baixar (não incluso)
│   ├── DENGBR25.csv           # ← baixar (não incluso)
│   └── DENGBR26.csv           # ← baixar (não incluso)
│
└── docs/
    └── Arboviroses_Cotia_SP.pptx   # Apresentação dos resultados
```

---

## Pré-requisitos

- **Python 3.10 ou superior** (testado com Python 3.12)
- **pip** (gerenciador de pacotes Python)
- Conexão com internet para carregar os temas do dashboard (Bootstrap CDN)
- Pelo menos **4 GB de RAM livre** para carregar os arquivos SINAN (DENGBR25.csv tem ~435 MB)

### Verificar versão do Python

```bash
python --version
# ou
python3 --version
```

---

## Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/soaresdossantosnicolas-wq/Projeto-Integrador-II.git
cd Projeto-Integrador-II
```

### 2. Criar ambiente virtual (recomendado)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

---

## Como obter os dados

### InfoDengue (dengue, chikungunya, zika)

1. Acesse [https://info.dengue.mat.br](https://info.dengue.mat.br)
2. Clique em **"Consulta"** no menu superior
3. Preencha os campos:
   - **Municipio:** Cotia – SP
   - **Doença:** Dengue / Chikungunya / Zika (uma por vez)
   - **Início:** 2024-01-01
   - **Fim:** data atual
4. Clique em **"Baixar CSV"**
5. Renomeie e mova para `data/`:
   - Dengue → `data/dengue_2-19.csv`
   - Chikungunya → `data/chikungunya_2-19.csv`
   - Zika → `data/zika_2-19.csv`

### SINAN — Notificações individuais de dengue

> ⚠️ Os arquivos DENGBR têm mais de 1 GB. Reserve tempo e espaço em disco.

1. Acesse o DATASUS: [https://datasus.saude.gov.br/transferencia-de-arquivos](https://datasus.saude.gov.br/transferencia-de-arquivos)
2. Navegue até **Morbidade e Mortalidade → SINAN → Dengue**
3. Selecione o ano (**2025** e **2026**) e **Brasil**
4. Baixe os arquivos `.dbc`
5. Converta de `.dbc` para `.csv` usando o **TabWin** (Windows) ou o pacote `read.dbc` no R:
   ```r
   # R — instalar pacote e converter
   install.packages("read.dbc")
   library(read.dbc)
   df <- read.dbc("DENGBR25.dbc")
   write.csv(df, "DENGBR25.csv", row.names = FALSE)
   ```
6. Mova os arquivos convertidos para `data/`:
   - `data/DENGBR25.csv`
   - `data/DENGBR26.csv`

### Verificar estrutura dos arquivos

Após baixar, confirme que os arquivos têm as colunas esperadas:

```bash
# Verificar cabeçalho do InfoDengue
head -1 data/dengue_2-19.csv

# Verificar cabeçalho do SINAN
head -1 data/DENGBR25.csv
```

**Colunas esperadas do InfoDengue:**
`SE, casos, casos_est, casos_est_min, casos_est_max, municipio_geocodigo, p_inc100k, Rt, tempmed, umidmed, data_iniSE, ...`

**Colunas esperadas do SINAN (mínimo necessário):**
`DT_NOTIFIC, CS_SEXO, HOSPITALIZ, EVOLUCAO, CLASSI_FIN, NU_IDADE_N, ID_MN_RESI`

---

## Como executar

### Configurar caminhos dos dados

Abra o arquivo `dashboard_arboviroses.py` e localize o dicionário `DATA` (próximo ao início do arquivo). Ajuste os caminhos absolutos conforme o seu sistema:

**Windows:**
```python
DATA = {
    "dengue":  r"C:\Users\SeuUsuario\Projeto-Integrador-II\data\dengue_2-19.csv",
    "chik":    r"C:\Users\SeuUsuario\Projeto-Integrador-II\data\chikungunya_2-19.csv",
    "zika":    r"C:\Users\SeuUsuario\Projeto-Integrador-II\data\zika_2-19.csv",
    "sinan25": r"C:\Users\SeuUsuario\Projeto-Integrador-II\data\DENGBR25.csv",
    "sinan26": r"C:\Users\SeuUsuario\Projeto-Integrador-II\data\DENGBR26.csv",
}
```

> ⚠️ **Use sempre `r"..."` (raw string)** antes das aspas ao escrever caminhos Windows. Isso evita que barras invertidas `\` sejam interpretadas como sequências de escape Python (`\n`, `\t`, `\U`, etc.), o que causaria erros na leitura dos arquivos.

**Linux/macOS:**
```python
DATA = {
    "dengue":  "/home/seu_usuario/Projeto-Integrador-II/data/dengue_2-19.csv",
    "chik":    "/home/seu_usuario/Projeto-Integrador-II/data/chikungunya_2-19.csv",
    "zika":    "/home/seu_usuario/Projeto-Integrador-II/data/zika_2-19.csv",
    "sinan25": "/home/seu_usuario/Projeto-Integrador-II/data/DENGBR25.csv",
    "sinan26": "/home/seu_usuario/Projeto-Integrador-II/data/DENGBR26.csv",
}
```

### Executar o dashboard

```bash
python dashboard_arboviroses.py
```

Aguarde as mensagens de carregamento no terminal:

```
Carregando dados InfoDengue…
Carregando SINAN (pode demorar ~30 s)…
  SINAN 2025: 46.187 notificações · SINAN 2026: 3.905 notificações

==========================================
  Dashboard Arboviroses — Cotia/SP
  InfoDengue/Fiocruz · SINAN/MS · SINISA 2024
==========================================
  Acesse: http://127.0.0.1:8050
==========================================
```

Abra o navegador e acesse: **http://127.0.0.1:8050**

> O carregamento do SINAN pode demorar entre 30 segundos e 2 minutos dependendo do hardware. Os dados são carregados apenas uma vez na inicialização.

---

## Funcionalidades do Dashboard

O dashboard possui um seletor de **ano** (2024, 2025, 2026) no topo que atualiza todos os gráficos. Está organizado em **4 abas**:

### 📈 Série Temporal

Visualizações do comportamento da dengue ao longo do ano selecionado:

| Gráfico | Descrição |
|---|---|
| Casos confirmados × temperatura | Barras mensais com sobreposição de temperatura média (InfoDengue) |
| Rt semanal | Número reprodutivo ao longo do ano; Rt > 1 = transmissão em expansão |
| Incidência × umidade | Casos por 100 mil habitantes e umidade média mensal |

### 🦟 Arboviroses

Comparativo entre as três doenças e entre anos:

| Gráfico | Descrição |
|---|---|
| Comparativo anual | Dengue vs Chikungunya vs Zika por ano (destaque no ano selecionado) |
| Sazonalidade | Curva mensal 2024 × 2025 × 2026 sobrepostas (destaque no selecionado) |
| Notificações SINAN | Notificações mensais do SINAN para o ano selecionado |

### 👤 Perfil dos Casos

Análise demográfica e clínica baseada no SINAN:

| Gráfico | Descrição |
|---|---|
| Distribuição por sexo | Pizza com proporção feminino/masculino/ignorado |
| Classificação final | Dengue clássica, com sinais de alarme, grave e descartados |
| Faixas etárias | Distribuição por grupo etário (< 10 até 60+ anos) |
| Tabela síntese | Hospitalizados, óbitos, dengue grave em valores absolutos e % |

> 📌 Para 2024, o perfil SINAN não está disponível (nenhum arquivo DENGBR24 incluso). Uma mensagem informativa é exibida com orientação de uso.

### 🚰 Saneamento

Indicadores estruturais de saneamento básico de Cotia comparados ao Estado de SP e ao Brasil:

| Indicador | Cotia | Estado SP | Brasil |
|---|---|---|---|
| Acesso à água | 99,1% | 97,4% | 84,1% |
| Esgoto coletado | 68,5% | 93,3% | 62,3% |
| Coleta de esgoto | 41,6% | 83,9% | 61,8% |
| Tratamento de esgoto | 23,8% | 72,9% | 51,8% |
| Perdas na distribuição | 14,9% | 33,6% | 36,2% |

> 📌 Esses dados são de referência fixa (SINISA 2024 / ARSESP 2020) e não variam com o ano selecionado.

---

## Indicadores e Métricas

### InfoDengue/Fiocruz

| Coluna | Descrição |
|---|---|
| `casos` | Casos confirmados reportados na semana epidemiológica |
| `casos_est` | Estimativa de casos (inclui subnotificação) |
| `p_inc100k` | Incidência por 100.000 habitantes |
| `Rt` | Número reprodutivo instantâneo (R efetivo) |
| `tempmed` | Temperatura média da semana (°C) |
| `umidmed` | Umidade relativa média da semana (%) |
| `SE` | Semana epidemiológica (formato YYYYWW) |

### SINAN/MS

| Coluna | Descrição |
|---|---|
| `ID_MN_RESI` | Código IBGE do município de residência (Cotia = 350950) |
| `DT_NOTIFIC` | Data da notificação |
| `CS_SEXO` | Sexo: F = feminino, M = masculino, I = ignorado |
| `HOSPITALIZ` | Hospitalização: 1 = sim, 2 = não |
| `EVOLUCAO` | Evolução do caso: 1 = cura, 2 = óbito |
| `CLASSI_FIN` | Classificação final: 10 = clássica, 11 = com alarme, 12 = grave, 8 = descartado |
| `NU_IDADE_N` | Idade codificada: 4010–4019 = 10–19 anos, 4020–4029 = 20–29, etc. |

---

## Limitações Conhecidas

| Limitação | Impacto | Mitigação |
|---|---|---|
| SINAN inclui casos suspeitos não confirmados | Superestimativa dos totais de notificações | Usar InfoDengue para casos confirmados; SINAN para perfil clínico |
| Dados SISAWEB/SUCEN não acessados | Dashboard sem indicadores operacionais de campo (visitas, focos, armadilhas) | Plano B/C do escopo: dados SINAN e InfoDengue |
| Subnotificação estrutural do SINAN | Casos reais podem ser 3–10× superiores | Coluna `casos_est` do InfoDengue estima o real |
| Saneamento com dados de 2020 e 2024 | Sem série histórica anual para análise de tendência | Valores são referencias estruturais, não pontuais |
| Arquivo DENGBR24 não disponível | Perfil de casos 2024 indisponível no dashboard | Dados de série temporal 2024 disponíveis via InfoDengue |
| Faixas etárias SINAN estimadas | Valores proporcionais, não exatos por faixa | Usar como referência indicativa, não absoluta |

---

## Contribuição

### Fluxo de trabalho do grupo

```
main         ← versão estável, recebe merge revisado
dev          ← integração do grupo
feat/nome    ← cada integrante trabalha na sua branch
```

### Passos para contribuir

```bash
# 1. Atualizar branch dev antes de trabalhar
git checkout dev
git pull origin dev

# 2. Criar sua branch de trabalho
git checkout -b feat/sua-tarefa

# 3. Fazer alterações e commitar
git add .
git commit -m "descrição clara do que foi feito"

# 4. Subir para o GitHub
git push origin feat/sua-tarefa

# 5. Abrir Pull Request: feat/sua-tarefa → dev
```

### Regras de commit

Use prefixos descritivos:

```
feat:  nova funcionalidade
fix:   correção de bug
data:  atualização ou tratamento de dados
docs:  atualização de documentação
style: ajustes visuais/formatação
```

Exemplos:
```
feat: adiciona filtro por bairro no mapa
fix: corrige erro no callback da aba saneamento
data: atualiza DENGBR26 com dados de maio/2026
docs: adiciona instruções de download do SINAN
```

---

## Referências

- **InfoDengue/Fiocruz:** [https://info.dengue.mat.br](https://info.dengue.mat.br)
- **SINAN/DATASUS:** [https://datasus.saude.gov.br](https://datasus.saude.gov.br)
- **SINISA 2024 — Instituto Água e Saneamento:** [https://www.aguaesaneamento.org.br/municipios-e-saneamento](https://www.aguaesaneamento.org.br/municipios-e-saneamento)
- **ARSESP — Relatório Analítico 2020 — Cotia:** [https://www.arsesp.sp.gov.br](https://www.arsesp.sp.gov.br)
- **IBGE Cidades — Cotia/SP:** [https://cidades.ibge.gov.br/brasil/sp/cotia](https://cidades.ibge.gov.br/brasil/sp/cotia)
- **SISAWEB/SUCEN:** [https://vigent.saude.sp.gov.br/sisawebinfo](https://vigent.saude.sp.gov.br/sisawebinfo)
- **Plotly Dash:** [https://dash.plotly.com](https://dash.plotly.com)
- **Dash Bootstrap Components:** [https://dash-bootstrap-components.opensource.faculty.ai](https://dash-bootstrap-components.opensource.faculty.ai)

---

## Informações do Projeto

| Campo | Informação |
|---|---|
| **Disciplina** | Projeto Integrador II |
| **Município de análise** | Cotia — São Paulo |
| **Código IBGE** | 350950 |
| **Período dos dados** | 2024–2026 |
| **Última atualização** | Maio de 2026 |
| **Repositório** | [github.com/soaresdossantosnicolas-wq/Projeto-Integrador-II](https://github.com/soaresdossantosnicolas-wq/Projeto-Integrador-II) |

---

*Dados de vigilância epidemiológica são de domínio público. Este projeto tem fins exclusivamente acadêmicos.*
