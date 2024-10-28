# Painel de Pesquisas Eleitorais

Um painel desenvolvido em React para visualização de dados de pesquisas eleitorais com análise ponderada por população. Esta aplicação processa dados de pesquisas e pondera os resultados com base nos dados populacionais dos municípios do IBGE.
![image](https://github.com/user-attachments/assets/6e6a0210-db84-4e7b-83e7-dd29fffd6108)

## Funcionalidades

- Upload e processamento de arquivos CSV com dados de pesquisas
- Sincronização com dados populacionais municipais do IBGE
- Cálculos de votos ponderados por população
- Visualização interativa em gráfico de linha

## Pré-requisitos

- Node.js (v14 ou superior)
- pnpm

## Instalação

1. Clone o repositório:
```bash
git clone [url-do-seu-repositório]
cd election-dashboard
```

2. Instale as dependências:
```bash
pnpm install
```

## Como Usar

1. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

2. Abra seu navegador e acesse `http://localhost:3000`

3. Clique em "Atualizar Base IBGE" para buscar os dados atuais dos municípios

4. Faça upload do seu arquivo CSV de pesquisa usando o botão "Upload CSV"

## Formato do Arquivo CSV

Seu arquivo CSV de pesquisa deve seguir este formato:

```csv
ID_PESQUISA,DATA_PESQUISA,MUNICÍPIO,ESTADO,INTENÇÃO DE VOTO
P1,04/09/2022,Quixaba,PE,A
P1,04/09/2022,Jatobá,PE,B
P1,04/09/2022,Brasília,DF,B
```

## Dependências Principais

Principais dependências utilizadas no projeto:

- Next.js
- React
- Recharts (para visualização de dados)
- Axios (para requisições API)
- Lucide React (para ícones)
- shadcn/ui (para componentes de interface)