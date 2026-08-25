# Semantic Syntax ATS: Context-Aware Candidate Ranking Pipeline

**A Two-Stage Hybrid AI Architecture for deep semantic candidate evaluation, now with a modern Web UI.**

Traditional Applicant Tracking Systems (ATS) rely on rigid boolean keyword matching, often filtering out highly qualified talent due to phrasing differences. This pipeline replaces keyword searches with a mathematically grounded, context-aware semantic search to rank candidates based on their true trajectory, experience, and implicit capabilities.

## Architecture Overview

This project utilizes a Two-Stage Machine Learning Pipeline to balance speed (recall) and accuracy (precision):

1. **Stage 1: Broad Dense Retrieval (Bi-Encoder)**
   * **Model:** `BAAI/bge-m3`
   * **Database:** Qdrant Vector DB
   * **Function:** Parses deeply nested candidate JSON profiles, flattens them into semantic narratives, and converts them into 1024-dimensional vectors. It instantly calculates cosine similarity against the Job Description to filter out irrelevant profiles and retrieve the top 100 closest matches.

2. **Stage 2: Deep Contextual Reranking (Cross-Encoder)**
   * **Model:** `Qwen/Qwen3-Reranker-0.6B`
   * **Function:** Evaluates the Job Description and candidate profiles simultaneously. Using self-attention mechanisms, it accurately scores the contextual overlap, re-ordering the top 100 candidates into a highly precise final shortlist.

3. **Stage 3: Interactive User Interface**
   * **Frontend:** Next.js 15, React, Tailwind CSS
   * **Backend API:** Python Flask
   * **Function:** Provides a minimalist web interface for recruiters to drag-and-drop resumes/JDs, execute the ranking pipeline visually, and explore the results via an interactive explainability dashboard.

## Repository Structure

```text
india-ai-hiring-challenge/
│
├── api/                         # Flask Backend API layer
│   ├── app.py                   # API server executing the pipeline
│   └── requirements.txt         # API dependencies
│
├── frontend/                    # Next.js Web Application
│   ├── src/app/                 # Next.js App Router (Pages & Layout)
│   ├── src/components/          # UI Components (Dropzone, Results, etc.)
│   └── package.json             # Node.js dependencies
│
├── data/                        # Datasets (Ignored by git)
│
├── src/                         # AI Pipeline Source Code
│   ├── data_ingestion.py        # Parses DOCX/JSONL and flattens schemas
│   ├── build_index.py           # Embeds profiles and builds Qdrant DB
│   └── rerank_inference.py      # Executes cross-encoder and generates output
│
├── .gitignore                   # Excludes massive datasets and local DBs
├── requirements.txt             # Core AI Pipeline dependencies
├── run_pipeline.py              # Master CLI execution script
└── README.md
```

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/YourUsername/india-ai-hiring-challenge.git
cd india-ai-hiring-challenge
```

### 2. Install AI Pipeline & API Dependencies

It is recommended to use a virtual environment.

```bash
# Create and activate virtual environment (Windows example)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install all requirements
pip install -r requirements.txt
pip install -r api\requirements.txt
```

### 3. Install Frontend Dependencies

You will need [Node.js](https://nodejs.org/) installed to run the frontend.

```bash
cd frontend
npm install
cd ..
```

## Running the Application

You can run the ATS via the new Web Interface or via the Command Line.

### Option A: Web Interface (Recommended)

Start the Backend API (make sure your virtual environment is active):
```bash
python api/app.py
```
*(Runs on http://127.0.0.1:5000)*

In a separate terminal, start the Frontend UI:
```bash
cd frontend
npm run dev
```
*(Runs on http://localhost:3000)*

Navigate to `http://localhost:3000` in your browser. Drag and drop your `candidates.jsonl`, `job_description.docx`, and `redrob_signals_doc.docx` files, and click "Run AI Ranking".

### Option B: Command Line

Place your files in the `data/` folder and execute the pipeline directly:

```bash
python run_pipeline.py --data_path ./data/ --output my_submission.csv
```

## Hardware Requirements & Optimizations

This pipeline is engineered for production and optimized for execution on an NVIDIA T4 GPU (or equivalent CUDA-enabled device).

To prevent Out-Of-Memory (OOM) crashes when evaluating varying-length text sequences, the architecture includes:
- **Strict Mini-Batching:** Cross-encoder inference is chunked (`rerank_batch_size=4`).
- **VRAM Management:** Explicit garbage collection and `torch.cuda.empty_cache()` execution between attention cycles.
- **Dynamic Tokenization:** Explicit End-of-Sequence (eos_token) padding configuration to ensure robust multi-sequence processing.

The pipeline gracefully falls back to CPU execution if CUDA is unavailable, though processing time will increase significantly.
