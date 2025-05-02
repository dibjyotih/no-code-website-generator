from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
import os

# Load your Gemini API key
genai.configure(api_key="Your API Key")

app = FastAPI()

# Allow all CORS (for local frontend dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Prompt(BaseModel):
    prompt: str

@app.post("/generate")
def generate_website(prompt: Prompt):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        print(genai.list_models())

        response = model.generate_content(
            f"""Generate a complete responsive HTML page for: {prompt.prompt}. 
            Include basic styling and a clean layout. It has to only be a comprehensive html code, nothing else, not text no nothing create it in an industry standard. Exclude html backticks"""
        )
        full_html = f"{response.text}"

        # Log the generated HTML in the terminal
        print("=== Generated HTML ===")
        print(full_html)
        print("======================")

        return {"html": full_html}

    except Exception as e:
        print("=== ERROR ===")
        print(str(e))
        print("=============")
        return {"error": str(e)}
