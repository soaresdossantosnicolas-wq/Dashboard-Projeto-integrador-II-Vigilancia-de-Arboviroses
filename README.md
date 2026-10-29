# Vigilância de arboviroses em Cotia/SP

**Projeto Integrador II · Ciência de Dados · Fatec Cotia**

Dashboard acadêmico em Python para explorar séries temporais de **dengue, chikungunya e zika**, perfil das notificações de dengue e indicadores de saneamento de Cotia/SP.

## O que o projeto apresenta

| Eixo | Conteúdo |
|---|---|
| Séries temporais | Casos, incidência, Rt e variáveis climáticas do InfoDengue |
| Comparação entre arboviroses | Distribuição temporal de dengue, chikungunya e zika |
| Perfil das notificações | Informações demográficas e clínicas do SINAN |
| Saneamento | Indicadores de referência incorporados ao código |

**Ferramentas:** Python, pandas, Plotly, Dash e Dash Bootstrap Components.  
**Fontes declaradas no projeto:** InfoDengue/Fiocruz, SINAN/MS, SINISA e ARSESP.

## Navegar pelo projeto

- [Aplicação principal](code/app.py)
- [Dependências](code/requirements.txt)
- [Documentação detalhada](docs/README.md)
- [Orientações sobre os dados](docs/data_README.md)

## Preparar a execução local

A partir da raiz do repositório, crie e ative um ambiente virtual Python. Instale as dependências:

```bash
python -m pip install -r code/requirements.txt
```

Os CSVs necessários não estão incluídos. Consulte as orientações em `docs/` e ajuste o dicionário `DATA` em `code/app.py` para apontar aos arquivos locais. Depois, execute:

```bash
python code/app.py
```

**Estado de reprodução:** os comandos acima correspondem aos caminhos existentes no repositório; a aplicação não foi executada nesta revisão de apresentação. A documentação detalhada contém nomes e caminhos antigos. Para localizar o código e as dependências, use os caminhos desta página.

## Cuidados de interpretação

- As bases têm conceitos, períodos e atualizações diferentes; notificações não equivalem automaticamente a casos confirmados.
- Os indicadores de saneamento são referências fixas, sem atualização pelo filtro de ano.
- A aplicação depende dos arquivos externos e de configuração local dos caminhos.
- Estudo acadêmico: a apresentação não constitui validação epidemiológica nem comprova uso operacional por órgãos de saúde.
