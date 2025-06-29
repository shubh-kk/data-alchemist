# Data Alchemist

A simple Next.js app that helps you upload, view, validate, and build rules around your CSV/XLSX data for clients, tasks, and workers.

---

## 📝 Overview

- **Upload** CSV or Excel files for three entities: Clients, Tasks, and Workers  
- **View** your data in an interactive, editable grid  
- **Validate** data with 8 built-in checks (missing columns, duplicate IDs, bad JSON, out-of-range numbers, etc.)  
- **Build rules** (co-run groups, phase restrictions, load limits) with plain React forms  
- **Preview & export** your final rules as a `rules.json` file  

*No AI or external “smart” features—everything runs locally in the browser.*

---

## 🚀 Tech Stack

- **Next.js 13** (App Router + React 18 + TypeScript)  
- **Tailwind CSS v4** for styling and dark/light themes  
- **papaparse** for parsing CSV files  
- **exceljs** for reading `.xlsx` spreadsheets  
- **react-data-grid** for the data table (highlight errors, edit cells)  

---

## 📦 Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/shubh-kk/data-alchemist.git
   cd data-alchemist
   ```
2. **Install dependencies**

   ```bash
      npm install
   ```
3. **Run the dev server**
   ```bash
      npm run dev
   ```
4. **Open your browser at** [http://localhost:3000](http://localhost:3000)

---

## How to Use
1. **Upload files**

   - Click the file picker and select your clients.csv, tasks.csv, and workers.csv (or .xlsx).

   - Filenames must include “client”, “task”, or “worker” so the app knows which is which.

2. **See your data**
   - The app parses your files and shows each sheet in its own grid.
   - If any core validation fails, rows/cells turn red and an error list appears above the table.

3. **Core Validations**

   - Required columns present
   - IDs are unique
   - Mandatory fields not empty
   - Numbers in range (e.g. priority 1–5, duration ≥ 1)
   - Non-negative integers (e.g. slots ≥ 0)
   - Valid JSON (for attributes field)
   - Cross-reference (requested TaskIDs must exist)
   - MaxConcurrent ≥ 1


4. **Build Rules**

   - **Co-Run Groups**: Define named groups of tasks that must run together
   - **Phase Restrictions**: Lock a task to specific phase numbers
   - **Load Limits**: Set a max load per phase for each worker


5. **Preview & Export**

   - The app generates a `rules.json` file based on your data and rules
   - You can download this file to use in your backend or other systems

   ---




