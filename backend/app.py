from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import requests
import sqlite3
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import os

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "https://ai-helper-frontend.vercel.app"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route('/')
def home():
    return jsonify({
        "message": "AI Helper API is running",
        "status": "ok",
        "endpoints": [
            "/translate",
            "/explain",
            "/generate-presentation",
            "/generate-todos",
            "/todos",
            "/subjects"
        ]
    })

def init_db():
    conn = sqlite3.connect('todos.db')
    c = conn.cursor()
    
    # Create subjects table
    c.execute('''
        CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create todo_lists table
    c.execute('''
        CREATE TABLE IF NOT EXISTS todo_lists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_id INTEGER,
            title TEXT NOT NULL,
            priority TEXT NOT NULL,
            estimated_time TEXT,
            deadline TEXT,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (subject_id) REFERENCES subjects (id)
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

# Subject CRUD operations
@app.route('/subjects', methods=['GET'])
def get_subjects():
    conn = sqlite3.connect('todos.db')
    c = conn.cursor()
    c.execute('SELECT * FROM subjects ORDER BY name')
    subjects = [{'id': row[0], 'name': row[1], 'created_at': row[2]} for row in c.fetchall()]
    conn.close()
    return jsonify(subjects)

@app.route('/subjects', methods=['POST'])
def add_subject():
    data = request.json
    name = data.get('name')
    
    if not name:
        return jsonify({'error': 'Subject name is required'}), 400
        
    conn = sqlite3.connect('todos.db')
    c = conn.cursor()
    try:
        c.execute('INSERT INTO subjects (name) VALUES (?)', (name,))
        conn.commit()
        subject_id = c.lastrowid
        conn.close()
        return jsonify({'id': subject_id, 'name': name}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Subject already exists'}), 409

@app.route('/subjects/<int:subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    conn = sqlite3.connect('todos.db')
    c = conn.cursor()
    c.execute('DELETE FROM todo_lists WHERE subject_id = ?', (subject_id,))
    c.execute('DELETE FROM subjects WHERE id = ?', (subject_id,))
    conn.commit()
    conn.close()
    return '', 204

# Todo CRUD operations
@app.route('/todos', methods=['GET'])
def get_todos():
    subject_id = request.args.get('subject_id')
    conn = sqlite3.connect('todos.db')
    c = conn.cursor()
    
    if subject_id:
        c.execute('''
            SELECT t.*, s.name as subject_name 
            FROM todo_lists t 
            JOIN subjects s ON t.subject_id = s.id 
            WHERE t.subject_id = ? 
            ORDER BY t.created_at DESC
        ''', (subject_id,))
    else:
        c.execute('''
            SELECT t.*, s.name as subject_name 
            FROM todo_lists t 
            JOIN subjects s ON t.subject_id = s.id 
            ORDER BY t.created_at DESC
        ''')
    
    todos = [{
        'id': row[0],
        'subject_id': row[1],
        'title': row[2],
        'priority': row[3],
        'estimated_time': row[4],
        'deadline': row[5],
        'status': row[6],
        'notes': row[7],
        'created_at': row[8],
        'subject_name': row[9]
    } for row in c.fetchall()]
    
    conn.close()
    return jsonify(todos)

@app.route('/todos', methods=['POST'])
def add_todo():
    data = request.json
    required_fields = ['subject_id', 'title', 'priority']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
        
    conn = sqlite3.connect('todos.db')
    c = conn.cursor()
    
    c.execute('''
        INSERT INTO todo_lists (
            subject_id, title, priority, estimated_time, deadline, notes
        ) VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data['subject_id'],
        data['title'],
        data['priority'],
        data.get('estimated_time'),
        data.get('deadline'),
        data.get('notes')
    ))
    
    conn.commit()
    todo_id = c.lastrowid
    
    c.execute('''
        SELECT t.*, s.name as subject_name 
        FROM todo_lists t 
        JOIN subjects s ON t.subject_id = s.id 
        WHERE t.id = ?
    ''', (todo_id,))
    
    row = c.fetchone()
    todo = {
        'id': row[0],
        'subject_id': row[1],
        'title': row[2],
        'priority': row[3],
        'estimated_time': row[4],
        'deadline': row[5],
        'status': row[6],
        'notes': row[7],
        'created_at': row[8],
        'subject_name': row[9]
    }
    
    conn.close()
    return jsonify(todo), 201

@app.route('/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    data = request.json
    conn = sqlite3.connect('todos.db')
    c = conn.cursor()
    
    update_fields = []
    values = []
    
    for field in ['title', 'priority', 'estimated_time', 'deadline', 'status', 'notes']:
        if field in data:
            update_fields.append(f'{field} = ?')
            values.append(data[field])
    
    if update_fields:
        values.append(todo_id)
        query = f'''
            UPDATE todo_lists 
            SET {', '.join(update_fields)}
            WHERE id = ?
        '''
        c.execute(query, values)
        conn.commit()
    
    c.execute('''
        SELECT t.*, s.name as subject_name 
        FROM todo_lists t 
        JOIN subjects s ON t.subject_id = s.id 
        WHERE t.id = ?
    ''', (todo_id,))
    
    row = c.fetchone()
    todo = {
        'id': row[0],
        'subject_id': row[1],
        'title': row[2],
        'priority': row[3],
        'estimated_time': row[4],
        'deadline': row[5],
        'status': row[6],
        'notes': row[7],
        'created_at': row[8],
        'subject_name': row[9]
    }
    
    conn.close()
    return jsonify(todo)

@app.route('/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    conn = sqlite3.connect('todos.db')
    c = conn.cursor()
    c.execute('DELETE FROM todo_lists WHERE id = ?', (todo_id,))
    conn.commit()
    conn.close()
    return '', 204

@app.route('/translate', methods=['POST', 'OPTIONS'])
def translate():
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.json
    text = data.get('text')
    target_language = data.get('targetLanguage')
    
    if not text or not target_language:
        return jsonify({'error': 'Missing required parameters'}), 400
        
    prompt = f"Please translate the following text to {target_language}:\n{text}"
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response = requests.post(
            f"{API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        result = response.json()
        
        if 'candidates' in result and len(result['candidates']) > 0:
            translated_text = result['candidates'][0]['content']['parts'][0]['text']
            return jsonify({'translatedText': translated_text})
        else:
            return jsonify({'error': 'Translation failed'}), 500
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

@app.route('/explain', methods=['POST', 'OPTIONS'])
def explain_concept():
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.json
    concept = data.get('concept')
    language = data.get('language', 'english')  # Default to English if not specified
    
    if not concept:
        return jsonify({'error': 'Missing concept parameter'}), 400
        
    prompt = f"""Explain the concept of {concept} in {language} language. 
    Break it down into simple terms, provide relevant examples or analogies to enhance understanding, 
    and highlight any key principles or applications. 
    Ensure the explanation is accessible to someone with little to no prior knowledge of the topic.
    The explanation must be entirely in {language}."""
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response = requests.post(
            f"{API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        result = response.json()
        
        if 'candidates' in result and len(result['candidates']) > 0:
            explanation = result['candidates'][0]['content']['parts'][0]['text']
            return jsonify({'explanation': explanation})
        else:
            return jsonify({'error': 'Explanation failed'}), 500
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-presentation', methods=['POST', 'OPTIONS'])
def generate_presentation():
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.json
    topic = data.get('topic')
    language = data.get('language', 'english')
    presentation_type = data.get('presentationType', 'powerpoint')
    
    if not topic:
        return jsonify({'error': 'Missing topic parameter'}), 400
        
    prompt = f"""Create a detailed {presentation_type} presentation in {language} on the topic of {topic}. Include the following elements:

    Title Slide:
    - Suggest a compelling title
    - Recommend a relevant background image theme

    Introduction:
    - Brief overview of {topic}
    - Its importance and relevance
    - Key objectives of the presentation
    - Suggested visuals

    Main Content (4-5 sections):
    - Break down the main aspects of {topic}
    - Key points for each section
    - Suggested images, charts, or infographics
    - Data points and statistics when relevant

    Conclusion:
    - Summary of key points
    - Call-to-action
    - Suggested closing visuals

    Design Recommendations:
    - Color scheme
    - Font suggestions
    - Layout tips
    
    Please format the response in a structured way with clear sections and bullet points.
    The entire presentation content should be in {language}."""
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response = requests.post(
            f"{API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        result = response.json()
        
        if 'candidates' in result and len(result['candidates']) > 0:
            presentation_content = result['candidates'][0]['content']['parts'][0]['text']
            return jsonify({'presentationContent': presentation_content})
        else:
            return jsonify({'error': 'Presentation generation failed'}), 500
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-todos', methods=['POST', 'OPTIONS'])
def generate_todos():
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.json
    subjects = data.get('subjects', [])
    time_frame = data.get('timeFrame', 'week')
    language = data.get('language', 'english')
    
    if not subjects:
        return jsonify({'error': 'Missing subjects'}), 400
        
    subjects_str = ", ".join(subjects)
    prompt = f"""Create a detailed, organized to-do list in {language} for the following subjects: {subjects_str}. 
    Time frame: {time_frame}

    For each subject:
    1. Break down tasks into categories:
       - High Priority (Must do)
       - Medium Priority (Should do)
       - Low Priority (Nice to do)
    
    2. For each task include:
       - Estimated time to complete
       - Any prerequisites or dependencies
       - Suggested deadline within the {time_frame} timeframe
    
    3. Additional organization:
       - Group related tasks together
       - Suggest optimal order of completion
       - Add any helpful notes or resources needed
    
    Format the response in a clear, structured way using bullet points and sections.
    Make sure all content is in {language}."""
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response = requests.post(
            f"{API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        result = response.json()
        
        if 'candidates' in result and len(result['candidates']) > 0:
            todos = result['candidates'][0]['content']['parts'][0]['text']
            return jsonify({'todos': todos})
        else:
            return jsonify({'error': 'Todo list generation failed'}), 500
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

# Educational resources endpoints
@app.route('/api/resources/search', methods=['GET'])
def search_resources():
    website = request.args.get('website')
    query = request.args.get('query', '')
    level = request.args.get('level', '')
    subject = request.args.get('subject', '')
    
    try:
        results = []
        
        if website == 'devoir':
            url = 'https://www.devoir.tn/search'
            response = requests.get(url, params={
                'q': query,
                'level': level,
                'subject': subject
            })
            soup = BeautifulSoup(response.text, 'html.parser')
            items = soup.find_all('div', class_='resource-item')
            
            for item in items:
                results.append({
                    'title': item.find('h3').text.strip(),
                    'description': item.find('p', class_='description').text.strip(),
                    'url': urljoin('https://www.devoir.tn', item.find('a')['href']),
                    'type': 'exam' if 'exam' in item.get('class', []) else 'series',
                    'source': 'devoir.tn'
                })
                
        elif website == 'tunisiecollege':
            url = 'https://www.tunisiecollege.net/search'
            response = requests.get(url, params={
                'q': query,
                'level': level,
                'subject': subject
            })
            soup = BeautifulSoup(response.text, 'html.parser')
            items = soup.find_all('div', class_='document-item')
            
            for item in items:
                results.append({
                    'title': item.find('h4').text.strip(),
                    'description': item.find('div', class_='content').text.strip(),
                    'url': urljoin('https://www.tunisiecollege.net', item.find('a')['href']),
                    'type': item.find('span', class_='type').text.strip(),
                    'source': 'tunisiecollege.net'
                })
                
        elif website == 'classi':
            url = 'https://classi.tn/search'
            response = requests.get(url, params={
                'q': query,
                'level': level,
                'subject': subject
            })
            soup = BeautifulSoup(response.text, 'html.parser')
            items = soup.find_all('div', class_='resource-box')
            
            for item in items:
                results.append({
                    'title': item.find('h3').text.strip(),
                    'description': item.find('p').text.strip(),
                    'url': urljoin('https://classi.tn', item.find('a')['href']),
                    'type': item.find('span', class_='category').text.strip(),
                    'source': 'classi.tn'
                })
                
        elif website == 't3alem':
            url = 'https://t3alem.tn/search'
            response = requests.get(url, params={
                'q': query,
                'level': level,
                'subject': subject
            })
            soup = BeautifulSoup(response.text, 'html.parser')
            items = soup.find_all('div', class_='document')
            
            for item in items:
                results.append({
                    'title': item.find('h2').text.strip(),
                    'description': item.find('div', class_='summary').text.strip(),
                    'url': urljoin('https://t3alem.tn', item.find('a')['href']),
                    'type': item.find('span', class_='doc-type').text.strip(),
                    'source': 't3alem.tn'
                })
        
        return jsonify(results)
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/resources/download', methods=['GET'])
def download_resource():
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'URL is required'}), 400
        
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        # Get the filename from the URL or Content-Disposition header
        filename = response.headers.get('Content-Disposition', '').split('filename=')[-1]
        if not filename:
            filename = url.split('/')[-1]
            
        # Stream the file to the client
        return Response(
            response.iter_content(chunk_size=8192),
            content_type=response.headers['Content-Type'],
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"'
            }
        )
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'AIzaSyDW9ZqpYq4J5rRlL0a-GbKhVWw9zguw7oU')
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
