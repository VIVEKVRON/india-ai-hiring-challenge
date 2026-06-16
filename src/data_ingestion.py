import os
import json
import pandas as pd
import docx

def read_docx(file_path):
    """Extracts text from a .docx file."""
    if not os.path.exists(file_path):
        print(f"Warning: File not found at {file_path}")
        return ""
    try:
        doc = docx.Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return ""

def flatten_candidate_profile(row):
    """Dynamically converts a nested JSON row into a single semantic string."""
    import json # Ensure json is imported at the top of your file
    
    profile_parts = []
    for col in row.index:
        val = row[col]
        
        # 1. Skip if it is explicitly None
        if val is None:
            continue
            
        # 2. Handle Lists and Dictionaries safely (Bypass pd.isna)
        if isinstance(val, (list, dict)):
            if len(val) == 0:  # Skip empty lists/dicts
                continue
            profile_parts.append(f"{col.upper()}: {json.dumps(val)}")
            
        # 3. Handle standard text, numbers, and actual NaNs
        else:
            if pd.isna(val) or str(val).strip() == "":
                continue
            profile_parts.append(f"{col.upper()}: {str(val)}")
            
    raw_text = " | ".join(profile_parts)
    return " ".join(raw_text.split())

def prepare_data(data_dir):
    """Loads all raw datasets and returns the cleaned dataframe and JD query."""
    print("Loading datasets...")
    
    # Load Candidates
    candidates_path = os.path.join(data_dir, "candidates.jsonl")
    candidates_df = pd.read_json(candidates_path, lines=True)
    
    print("Flattening candidate profiles...")
    candidates_df['semantic_text'] = candidates_df.apply(flatten_candidate_profile, axis=1)
    
    id_col = 'candidate_id' if 'candidate_id' in candidates_df.columns else candidates_df.columns[0]
    
    # Load JD and Signals
    jd_path = os.path.join(data_dir, "job_description.docx")
    signals_path = os.path.join(data_dir, "redrob_signals_doc.docx")
    
    jd_text = read_docx(jd_path)
    signals_text = read_docx(signals_path)
    combined_query = jd_text + "\n\nAdditional Signals:\n" + signals_text
    
    return candidates_df, combined_query, id_col