from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
import os
import re
from PIL import Image
import io

# Load your Gemini API key

genai.configure(api_key="AIzaSyAgrZPGbg0DAKoHOqGdkSsrEzPwvPcXUhQ")

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
    prompt: str | None = None  # Make prompt optional

@app.post("/generate")
async def generate_website(prompt: str | None = Form(None), file: UploadFile | None = File(None)):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        print(genai.list_models())

        content = []
        if prompt:
            content.append(
                f"""Generate a complete responsive HTML page based on the following description: {prompt}. 
                Include basic styling and a clean layout. Return only comprehensive HTML code, 
                nothing else, no text, no backticks, in an industry standard."""
            )
        if file:
            # Process uploaded image
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            content.append(image)
            if not prompt:
                content.insert(
                    0,
                    "Generate a complete responsive HTML page based on the content of this image. "
                    "Include basic styling and a clean layout. Return only comprehensive HTML code, "
                    "nothing else, no text, no backticks, in an industry standard."
                )

        if not content:
            raise ValueError("Either a prompt or an image must be provided")

        response = model.generate_content(content)

        full_html = response.text

        # Extract CSS from <style> tags
        css_match = re.search(r'<style[^>]*>(.*?)</style>', full_html, re.DOTALL)
        css_content = css_match.group(1).strip() if css_match else ""

        # Extract JavaScript from <script> tags
        js_match = re.search(r'<script[^>]*>(.*?)</script>', full_html, re.DOTALL)
        js_content = js_match.group(1).strip() if js_match else ""

        # Remove <style> and <script> tags from HTML
        html_content = re.sub(r'<style[^>]*>.*?</style>', '', full_html, flags=re.DOTALL)
        html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL)

        # Log the extracted content in the terminal
        print("=== Generated HTML ===")
        print(html_content)
        print("=== Generated CSS ===")
        print(css_content)
        print("=== Generated JS ===")
        print(js_content)
        print("======================")

        return {
            "html": html_content.strip(),
            "css": css_content,
            "js": js_content
        }

    except Exception as e:
        print("=== ERROR ===")
        print(str(e))
        print("=============")
        return {"error": str(e)}