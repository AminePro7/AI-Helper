import requests
import json

GEMINI_API_KEY = "AIzaSyDW9ZqpYq4J5rRlL0a-GbKhVWw9zguw7oU"
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

def translate_text(text, target_language):
    """
    Translate text to the target language using Gemini API
    """
    prompt = f"Please translate the following text to {target_language}:\n{text}"
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    data = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response = requests.post(
            f"{API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=data
        )
        response.raise_for_status()
        result = response.json()
        
        # Extract the translated text from the response
        if 'candidates' in result and len(result['candidates']) > 0:
            translated_text = result['candidates'][0]['content']['parts'][0]['text']
            return translated_text
        else:
            return "Translation failed: No response from API"
            
    except requests.exceptions.RequestException as e:
        return f"Translation failed: {str(e)}"

def main():
    print("Welcome to the AI Translator!")
    print("Available languages: Arabic, French, English")
    
    while True:
        text = input("\nEnter the text to translate (or 'quit' to exit): ")
        if text.lower() == 'quit':
            break
            
        target_lang = input("Enter target language (arabic/french/english): ").lower()
        if target_lang not in ['arabic', 'french', 'english']:
            print("Invalid language selection. Please choose from: arabic, french, english")
            continue
            
        translated = translate_text(text, target_lang)
        print("\nTranslated text:")
        print(translated)

if __name__ == "__main__":
    main()
