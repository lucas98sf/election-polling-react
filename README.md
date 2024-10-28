# Election Dashboard

A React-based dashboard for visualizing election poll data with population-weighted analysis. This application processes poll data and weights the results based on municipality population data from IBGE.

## Features

- Upload and process CSV poll data files
- Sync with IBGE municipality population data
- Population-weighted vote calculations
- Interactive line chart visualization

## Prerequisites

- Node.js (v14 or higher)
- pnpm

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd election-dashboard
```

2. Install dependencies:
```bash
pnpm install
```

## Usage

1. Start the development server:
```bash
pnpm dev
```

2. Open your browser and navigate to `http://localhost:3000`

3. Click "Atualizar Base IBGE" to fetch current municipality data

4. Upload your poll data CSV file using the "Upload CSV" button

## CSV File Format

Your poll data CSV file should follow this format:

```csv
ID_PESQUISA,DATA_PESQUISA,MUNICÍPIO,ESTADO,INTENÇÃO DE VOTO
P1,04/09/2022,Quixaba,PE,A
P1,04/09/2022,Jatobá,PE,B
P1,04/09/2022,Brasília,DF,B
```

## Dependencies

Main dependencies used in this project:

- Next.js
- React
- Recharts (for data visualization)
- Axios (for API requests)
- Lucide React (for icons)
- shadcn/ui (for UI components)