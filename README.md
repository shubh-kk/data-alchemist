# Data Alchemist - Milestone 1

Data ingestion and validation tool for client, task, and worker data.

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Features

- **File Upload**: Upload CSV or XLSX files for clients, tasks, and workers
- **Data Visualization**: View data in interactive grids
- **Validation**: Automatic validation with error highlighting
- **Error Display**: Clear listing of validation errors with location information

## How to Test with Sample Files

Sample files are provided in the UI for testing:

1. Click on the download links for the sample CSV files (clients.csv, tasks.csv, workers.csv)
2. Upload the downloaded files using the file uploader
3. Review the validation results and data grids

### Expected Validation Issues in Sample Files

#### Clients Sample
- Duplicate ClientID (C001)
- Missing PriorityLevel (C004)
- Invalid PriorityLevel range (C005)
- Invalid JSON syntax (C004)
- Reference to non-existent TaskID (C005 references T999)

#### Tasks Sample
- Missing TaskName (T005)
- Invalid MaxConcurrent value (T004, T006)

#### Workers Sample
- Missing WorkerName (W005)
- Duplicate WorkerID (W001)
- Negative values for AvailableSlots and MaxLoadPerPhase (W006)

## Core Validations

The application implements all eight core validations:

1. **Required-column check**: Ensures each sheet contains its full set of headers
2. **Unique-ID enforcement**: No duplicate ClientID/TaskID/WorkerID within sheets
3. **Non-empty mandatory fields**: ClientName, TaskName, WorkerName must not be blank
4. **Numeric-range validation**: PriorityLevel ∈ [1, 5]; Duration ≥ 1
5. **Non-negative integers**: AvailableSlots, MaxLoadPerPhase ≥ 0
6. **JSON-syntax check**: AttributesJSON must parse as valid JSON
7. **Cross-reference integrity**: Every ID in RequestedTaskIDs must exist in tasks
8. **MaxConcurrent ≥ 1**: Ensures every MaxConcurrent is at least 1

## Technical Implementation

- **Framework**: Next.js with App Router
- **UI Components**: React components with Tailwind CSS
- **File Parsing**: PapaParse for CSV, ExcelJS for XLSX
- **Data Grid**: react-data-grid for tabular display
- **Validation**: Custom validation engine with error highlighting
