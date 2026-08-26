import os
import sys
import subprocess
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configure directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)

@app.route('/api/run-pipeline', methods=['POST'])
def run_pipeline():
    try:
        # Check if files were uploaded
        files = request.files
        if not files:
            return jsonify({'error': 'No files provided'}), 400

        # Save uploaded files to the data directory
        for key in files:
            file = files[key]
            if file.filename:
                filename = secure_filename(file.filename)
                file_path = os.path.join(DATA_DIR, filename)
                file.save(file_path)

        # Execute the pipeline script
        pipeline_script = os.path.join(BASE_DIR, 'run_pipeline.py')
        output_file = os.path.join(BASE_DIR, 'my_submission.csv')
        
        # Run as a subprocess
        process = subprocess.run(
            [sys.executable, pipeline_script, '--data_path', DATA_DIR, '--output', output_file],
            cwd=BASE_DIR,
            capture_output=True,
            text=True
        )

        if process.returncode != 0:
            return jsonify({
                'error': 'Pipeline execution failed',
                'details': process.stderr
            }), 500

        # Read the generated CSV file
        if not os.path.exists(output_file):
            return jsonify({'error': 'Output file not generated'}), 500

        df = pd.read_csv(output_file)
        
        # Ensure we can import from src
        if BASE_DIR not in sys.path:
            sys.path.append(BASE_DIR)
        from src.data_ingestion import read_docx
        
        # Read Job Description
        jd_path = os.path.join(DATA_DIR, "job_description.docx")
        jd_text = read_docx(jd_path) if os.path.exists(jd_path) else "Job description not found."
        
        # Read Candidates to attach profiles
        candidates_path = os.path.join(DATA_DIR, "candidates.jsonl")
        candidates_dict = {}
        if os.path.exists(candidates_path):
            candidates_df = pd.read_json(candidates_path, lines=True)
            id_col = 'candidate_id' if 'candidate_id' in candidates_df.columns else candidates_df.columns[0]
            candidates_df = candidates_df.fillna('')
            for _, row in candidates_df.iterrows():
                cid = str(row[id_col])
                candidates_dict[cid] = row.to_dict()

        # Combine into results
        results = []
        for _, row in df.iterrows():
            res_dict = row.to_dict()
            cid = str(res_dict.get('candidate_id', res_dict.get('Candidate ID', res_dict.get('id', ''))))
            res_dict['jd_text'] = jd_text
            res_dict['raw_profile'] = candidates_dict.get(cid, {})
            results.append(res_dict)

        return jsonify({
            'status': 'success',
            'results': results,
            'logs': process.stdout
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
