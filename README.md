# Context-Aware Candidate Ranking Pipeline

**A Two-Stage Hybrid AI Architecture for deep semantic candidate evaluation.**

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

## Repository Structure

```
india-ai-hiring-challenge/
│
├── data/
│   ├── .gitkeep                 # Ensures data directory exists
│   └── candidates.jsonl       # Sample subset for local testing
│
├── src/
│   ├── __init__.py
│   ├── data_ingestion.py        # Parses DOCX/JSONL and flattens schemas
│   ├── build_index.py           # Embeds profiles and builds Qdrant DB
│   └── rerank_inference.py      # Executes cross-encoder and generates output
│
├── .gitignore                   # Excludes massive datasets and local DBs
├── requirements.txt             # Environment dependencies
├── run_pipeline.py              # Master execution script
└── README.md
```

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/YourUsername/india-ai-hiring-challenge.git
cd india-ai-hiring-challenge
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Provide the data

Place the actual `candidates.jsonl`, `job_description.docx`, and `redrob_signals_doc.docx` files into the `data/` folder.

*Note: To test the pipeline locally without the full dataset, simply rename `data/dummy_sample.jsonl` to `data/candidates.jsonl`.*

### 4. Execute the pipeline

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
