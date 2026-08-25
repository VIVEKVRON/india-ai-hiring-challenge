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
        # Convert DataFrame to JSON
        # Assuming CSV has Rank, Candidate ID, Fit Score, etc.
        # We can just use records format
        results = df.to_dict(orient='records')
        
        # We can also add mock raw text if it's not present in the CSV, but let's assume the frontend will handle it
        # or we could read it from the JSONL if needed.

        return jsonify({
            'status': 'success',
            'results': results,
            'logs': process.stdout
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
