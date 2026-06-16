import argparse
import os
from src.data_ingestion import prepare_data
from src.build_index import build_vector_database
from src.rerank_inference import generate_final_submission

def main(data_dir, output_file):
    print("=== Phase 1: Data Ingestion ===")
    candidates_df, combined_query, id_col = prepare_data(data_dir)
    
    print("\n=== Phase 2: Building Bi-Encoder Index ===")
    # We catch the embedding_model so we don't have to load it twice
    embedding_model = build_vector_database(candidates_df, id_col)
    
    print("\n=== Phase 3: Cross-Encoder Inference ===")
    generate_final_submission(embedding_model, combined_query, output_file)
    
    print("\n=== Pipeline Complete ===")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Two-Stage AI Candidate Ranking Pipeline")
    parser.add_argument("--data_path", type=str, default="./data/", help="Path to directory containing jsonl and docx files")
    parser.add_argument("--output", type=str, default="my_submission.csv", help="Output file name")
    
    args = parser.parse_args()
    
    # Ensure data path exists
    if not os.path.exists(args.data_path):
        print(f"Error: Data directory '{args.data_path}' not found. Please check your path.")
    else:
        main(args.data_path, args.output)