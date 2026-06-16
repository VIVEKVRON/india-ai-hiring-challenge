import torch
import time
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct

def build_vector_database(candidates_df, id_col, db_path="./qdrant_db"):
    """Embeds candidate profiles and saves them to a persistent Qdrant database."""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Initializing Bi-Encoder on {device.upper()}...")
    
    embedding_model = SentenceTransformer('BAAI/bge-m3', device=device)
    
    # Initialize persistent local storage instead of :memory:
    client = QdrantClient(path=db_path)
    
    if client.collection_exists(collection_name="challenge_candidates"):
        client.delete_collection(collection_name="challenge_candidates")
        
    client.create_collection(
        collection_name="challenge_candidates",
        vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
    )
    
    print("Generating Embeddings for Candidates...")
    start_time = time.time()
    
    candidate_texts = candidates_df['semantic_text'].tolist()
    embeddings = embedding_model.encode(
        candidate_texts, 
        batch_size=128, 
        show_progress_bar=True,
        normalize_embeddings=True
    )
    
    print("Upserting vectors into Qdrant...")
    points = [
        PointStruct(
            id=idx, 
            vector=emb.tolist(), 
            payload={"candidate_id": str(row[id_col]), "text": row['semantic_text']}
        )
        for idx, (row_idx, row), emb in zip(range(len(candidates_df)), candidates_df.iterrows(), embeddings)
    ]
    
    chunk_size = 500
    for i in range(0, len(points), chunk_size):
        client.upsert(
            collection_name="challenge_candidates", 
            points=points[i:i + chunk_size]
        )
        
    print(f"Index built successfully in {(time.time() - start_time) / 60:.2f} minutes.")
    return embedding_model  # Return to reuse in the inference step