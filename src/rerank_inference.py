import pandas as pd
import torch
import os
from qdrant_client import QdrantClient
from transformers import AutoModelForSequenceClassification, AutoTokenizer

def generate_final_submission(embedding_model, combined_query, output_file, db_path="./qdrant_db", top_k=100, rerank_batch_size=4):
    """Retrieves top candidates and reranks them contextually to generate the submission."""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    # Step 1: Broad Dense Retrieval
    client = QdrantClient(path=db_path)
    jd_vector = embedding_model.encode(combined_query).tolist()
    
    search_response = client.query_points(
        collection_name="challenge_candidates",
        query=jd_vector,
        limit=top_k
    )
    retrieved = [hit.payload for hit in search_response.points]
    
    # Step 2: Initialize Cross-Encoder with Padding Fix
    print("Loading Cross-encoder...")
    tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen3-Reranker-0.6B")
    
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        
    reranker_model = AutoModelForSequenceClassification.from_pretrained("Qwen/Qwen3-Reranker-0.6B")
    if reranker_model.config.pad_token_id is None:
        reranker_model.config.pad_token_id = tokenizer.pad_token_id
        
    reranker_model.to(device).eval()
    
    # Step 3: Chunked Inference
    print(f"Reranking top {len(retrieved)} candidates...")
    pairs = [[combined_query, cand['text']] for cand in retrieved]
    all_scores = []
    
    for i in range(0, len(pairs), rerank_batch_size):
        batch_pairs = pairs[i:i + rerank_batch_size]
        with torch.no_grad():
            inputs = tokenizer(batch_pairs, padding=True, truncation=True, return_tensors='pt', max_length=512).to(device)
            batch_scores = reranker_model(**inputs, return_dict=True).logits.view(-1, ).float()
            all_scores.extend(batch_scores.cpu().tolist())
            
        del inputs, batch_scores
        if device == "cuda":
            torch.cuda.empty_cache()
            
    # Step 4: Formatting and Export
    for i, cand in enumerate(retrieved):
        cand['ai_fit_score'] = all_scores[i]
        
    ranked = sorted(retrieved, key=lambda x: x['ai_fit_score'], reverse=True)
    
    submission_data = [{'candidate_id': c['candidate_id'], 'rank': r, 'score': c['ai_fit_score']} 
                       for r, c in enumerate(ranked, start=1)]
    
    submission_df = pd.DataFrame(submission_data)
    submission_df.to_csv(output_file, index=False)
    print(f"\nSuccess! Ranked {len(submission_df)} candidates. Saved to: {output_file}")