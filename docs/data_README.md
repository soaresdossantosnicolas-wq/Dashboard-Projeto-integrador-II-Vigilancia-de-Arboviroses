# 📂 Dados — Instruções de Download

Os arquivos CSV **não estão no repositório** por excederem o limite de tamanho do GitHub (alguns chegam a 1,7 GB). Baixe-os manualmente e coloque nesta pasta (`data/`).

---

## Arquivos necessários

| Arquivo | Fonte | Link | Tamanho |
|---|---|---|---|
| `dengue_2-19.csv` | InfoDengue/Fiocruz | https://info.dengue.mat.br | ~80 KB |
| `chikungunya_2-19.csv` | InfoDengue/Fiocruz | https://info.dengue.mat.br | ~80 KB |
| `zika_2-19.csv` | InfoDengue/Fiocruz | https://info.dengue.mat.br | ~80 KB |
| `DENGBR25.csv` | SINAN/DATASUS | https://datasus.saude.gov.br | ~435 MB |
| `DENGBR26.csv` | SINAN/DATASUS | https://datasus.saude.gov.br | ~80 MB |

---

## Como baixar o InfoDengue

1. Acesse https://info.dengue.mat.br → **Consulta**
2. Município: **Cotia – SP** · Início: **2024-01-01** · Fim: data atual
3. Baixe um CSV por doença (Dengue, Chikungunya, Zika)
4. Renomeie para `dengue_2-19.csv`, `chikungunya_2-19.csv`, `zika_2-19.csv`

## Como baixar o SINAN

1. Acesse https://datasus.saude.gov.br → Transferência de Arquivos → SINAN → Dengue
2. Selecione os anos 2025 e 2026 — Brasil completo
3. Converta de `.dbc` para `.csv` usando TabWin (Windows) ou `read.dbc` no R:

```r
install.packages("read.dbc")
library(read.dbc)
df <- read.dbc("DENGBR25.dbc")
write.csv(df, "DENGBR25.csv", row.names = FALSE)
```

---

Após baixar todos os arquivos, a pasta deve ficar assim:

```
data/
├── README.md              ← este arquivo
├── dengue_2-19.csv
├── chikungunya_2-19.csv
├── zika_2-19.csv
├── DENGBR25.csv
└── DENGBR26.csv
```
