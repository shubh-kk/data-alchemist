**Product Requirements Document (PRD)**
**Milestone 1: Data Ingestion & Validation**

---

## 1. Purpose & Objectives

Enable non‑technical users to upload, view, and validate three core data sets—clients, tasks, and workers—via a web interface. Errors appear immediately, so users can correct bad data before further processing.

**Key Goals:**

* Rapidly ingest CSV/XLSX files
* Display data in an interactive grid
* Perform at least eight essential validations
* Surface errors clearly for end‑users

---

## 2. Scope

**In Scope:**

* File upload of clients, tasks, and workers sheets (CSV or XLSX)
* Parsing into uniform JSON arrays
* Rendering each sheet in its own editable/read‑only grid
* Running eight core validations (see §4)
* Highlighting validation errors and listing them in a pane

**Out of Scope (for Milestone 1):**

* AI‑powered features (natural‑language filters, rule builders)
* Business‑rule creation or priority‑weight controls
* Data export or download

---

## 3. User Personas & Stories

| Persona            | Story                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Data Manager       | “As a Data Manager, I need to upload my clients/tasks/workers files so I can spot data issues before running assignments.” |
| Operations Analyst | “As an Analyst, I want errors highlighted inline, so I know exactly where to fix typos, duplicates, or missing values.”    |

---

## 4. Data Entities & File Format

1. **clients**

   * **Columns**:

     * `ClientID` (string)
     * `ClientName` (string)
     * `PriorityLevel` (integer 1–5)
     * `RequestedTaskIDs` (comma‑ or semicolon‑separated list of `TaskID`)
     * `AttributesJSON` (JSON text)
2. **tasks**

   * **Columns**:

     * `TaskID` (string)
     * `TaskName` (string)
     * `Category` (string)
     * `Duration` (number, ≥ 1)
     * `RequiredSkills` (comma‑separated)
     * `PreferredPhases` (comma‑separated integers)
     * `MaxConcurrent` (integer, ≥ 1)
3. **workers**

   * **Columns**:

     * `WorkerID` (string)
     * `WorkerName` (string)
     * `Skills` (comma‑separated)
     * `AvailableSlots` (number, ≥ 0)
     * `MaxLoadPerPhase` (number, ≥ 0)
     * `WorkerGroup` (string)
     * `QualificationLevel` (integer)

*All files may be provided as **`.csv`** or **`.xlsx`**. Filenames must include “client”, “task”, or “worker” to map to the correct entity.*

---

## 5. Core Validations (Minimum 8)

Each sheet is validated on upload; errors accumulate in an array of `{ row, message }`.

1. **Required‑column check**

   * Ensure each sheet contains its full set of headers.
2. **Unique‑ID enforcement**

   * No duplicate `ClientID` / `TaskID` / `WorkerID` within the same sheet.
3. **Non‑empty mandatory fields**

   * `ClientName`, `TaskName`, `WorkerName` must not be blank.
4. **Numeric‑range validation**

   * `PriorityLevel` ∈ \[1, 5]; `Duration` ≥ 1.
5. **Non‑negative integers**

   * `AvailableSlots`, `MaxLoadPerPhase` ≥ 0 (whole numbers).
6. **JSON‑syntax check**

   * `AttributesJSON` must parse as valid JSON.
7. **Cross‑reference integrity**

   * Every ID in `RequestedTaskIDs` must exist in the tasks sheet.
8. **MaxConcurrent ≥ 1**

   * Ensure every `MaxConcurrent` is at least 1.

*Additional validations (bonus) may include skills‑coverage, phase capacity, etc., but are optional for Milestone 1.*

---

## 6. Functional Requirements

| Feature               | Description                                                                         |
| --------------------- | ----------------------------------------------------------------------------------- |
| **File Uploader**     | Multi‑file input for `.csv` & `.xlsx`, auto‑detects sheet type by filename.         |
| **Parser**            | Uses `papaparse` for CSV, `exceljs` for XLSX → outputs uniform arrays of objects.   |
| **Interactive Grid**  | Renders each entity in `react-data-grid`, allows cell‑level highlighting on errors. |
| **Validation Engine** | Runs all eight validators; returns structured error list.                           |
| **Error Display**     | Inline cell highlighting + separate pane listing row‑by‑row messages.               |
| **Responsive Design** | Works on desktop and tablet viewports.                                              |

---

## 7. Technical Stack

* **Framework**: Next.js 13 (App Router, React 18, TypeScript)
* **Parsing**: `papaparse` (CSV), `exceljs` (XLSX)
* **Grid UI**: `react-data-grid`
* **State Management**: React `useState` / Context (simple)
* **Styling**: Tailwind CSS v4 (already in new Next.js starter)
* **Testing**: Manual with provided sample files; no unit tests required for Milestone 1

---

## 8. Architecture & File Layout

```
/src
  /app
    page.tsx           ← main uploader + grid + error pane
  /components
    FileUploader.tsx   ← file input & parsing logic
  /lib
    validators.ts      ← core validation functions
  /public
    samples/           ← provided CSV/XLSX for manual testing
```

---

## 9. Timeline & Deliverables

| Day   | Tasks                                                                     |
| ----- | ------------------------------------------------------------------------- |
| Day 1 | Scaffold project, install deps, build FileUploader, parse samples         |
| Day 2 | Implement grid UI, wire parsing → grid, set up validators                 |
| Day 3 | Polish error display, test all eight rules, finalize README & push to Git |

**Deliverable:**

* GitHub repo with `main` branch containing Milestone 1 code
* README describing setup, how to test with sample files, and validation summary

---

## 10. Success Criteria

* ✅ Users can upload all three entity files and immediately see data rendered
* ✅ All eight core validations run on every upload
* ✅ Errors are clearly highlighted and listed
* ✅ No console errors; application runs on `npm run dev` under Next.js App Router

---

This document outlines the requirements and expectations for the first milestone of the Data Alchemist project, focusing on data ingestion and validation. The goal is to create a user-friendly interface that allows non-technical users to upload, view, and validate client, task, and worker data efficiently. The outlined features and validations ensure that the application meets the needs of its users while maintaining a clear structure for development. Proceed with the implementation as specified, ensuring all requirements are met and tested thoroughly.