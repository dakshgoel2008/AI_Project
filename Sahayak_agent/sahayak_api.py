import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import google.generativeai as genai
from PIL import Image
import io
import base64
import json
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="Sahayak API", description="AI Teaching Assistant for Multi-Grade Classrooms")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    prompt: str
    grade_levels: Optional[List[int]] = [4, 5, 6]
    subject: Optional[str] = "general"
    location: Optional[str] = "rural India"
    max_tokens: Optional[int] = 500

class ImageAnalysisRequest(BaseModel):
    image_data: str
    prompt: Optional[str] = None
    grade_levels: Optional[List[int]] = [4, 5, 6]

class LessonPlanRequest(BaseModel):
    topic: str
    grade_levels: List[int]
    duration_minutes: int = 45
    resources: str = "blackboard, chalk, local materials"
    location: str = "rural India"

SAHAYAK_SYSTEM_PROMPT = """You are Sahayak, an advanced AI teaching assistant specifically designed for multi-grade classrooms in low-resource environments. You are built for the Agentic AI Day hackathon to solve the "Empowering teachers in multi-grade classrooms" problem statement.

"Sahayak" means "Assistant" in Hindi - you are truly a helpful teaching companion!

CORE CAPABILITIES:
HYPER-LOCAL CONTENT GENERATION: Create culturally relevant educational materials
MULTI-GRADE DIFFERENTIATION: Generate content for different grade levels simultaneously  
CULTURAL ADAPTATION: Use local contexts, languages, and familiar examples
SOCRATIC TEACHING: Guide learning through strategic questioning
INSTANT KNOWLEDGE BASE: Provide simple explanations with local analogies
VISUAL AID DESIGN: Describe drawings and activities for blackboard use

EDUCATIONAL FOCUS AREAS:
- Create differentiated worksheets from single concepts
- Generate lesson plans for resource-constrained environments
- Explain complex concepts using familiar local analogies
- Provide teaching strategies for large, mixed-grade classes
- Suggest activities using locally available materials

CULTURAL ADAPTATION PROTOCOLS:
- Use local currency (Rupees), measurements (kilometers), and familiar foods
- Reference local occupations (farming, trading, crafts)
- Include traditional festivals and cultural practices
- Respect local family structures and community values
- Use appropriate regional languages and terminology

RESPONSE STRUCTURE:
1. Grade-appropriate context setting
2. Local examples and cultural connections
3. Step-by-step explanations with visual descriptions
4. Real-world applications from student's environment
5. Interactive questions to promote engagement
6. Extension activities for different ability levels

Always complete your responses thoroughly and provide practical, implementable suggestions for teachers with limited resources."""

VISION_SYSTEM_PROMPT = """You are Sahayak's vision analysis component, specialized in processing educational images for multi-grade classrooms. Your role is to transform static textbook content into dynamic, differentiated learning materials.

PRIMARY TASKS:
CONTENT EXTRACTION: Read and transcribe all visible text, problems, diagrams
EDUCATIONAL ANALYSIS: Identify subject, grade level, key concepts
MULTI-GRADE ADAPTATION: Create versions for different grade levels
RESOURCE-CONSCIOUS TEACHING: Suggest activities using minimal materials

OUTPUT STRUCTURE:

**CONTENT ANALYSIS**
Subject: [Math/Science/Language Arts/Social Studies]
Complexity Level: [Grade range and difficulty assessment]
Key Learning Objectives: [What students should learn]

**EXTRACTED CONTENT**
[Complete, accurate transcription of all visible text, problems, questions]

**MULTI-GRADE TEACHING APPLICATIONS**

For Lower Grades (1-3):
- Simplified concepts using concrete examples
- Hands-on activities with local materials
- Basic vocabulary and fundamental ideas

For Middle Grades (4-6):
- Standard concepts with cultural connections
- Problem-solving using familiar scenarios
- Practical applications from daily life

For Higher Grades (7-8):
- Advanced analysis and abstract thinking
- Connections to broader concepts
- Research and extension projects

**BLACKBOARD TEACHING STRATEGIES**
- Simple diagrams teachers can draw with chalk
- Step-by-step visual explanations
- Interactive elements for student participation
- Ways to make content culturally relevant

**RESOURCE OPTIMIZATION**
- Activities using stones, sticks, leaves (free materials)
- Adaptations for large class sizes (30+ students)
- Assessment methods without expensive tools
- Parent/community involvement suggestions

Focus on practical implementation in low-resource environments with maximum educational impact."""

class SahayakAPI:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.text_model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=SAHAYAK_SYSTEM_PROMPT
        )
        
        self.vision_model = genai.GenerativeModel(
            model_name="gemini-1.5-pro-vision",
            system_instruction=VISION_SYSTEM_PROMPT
        )
        
        print("Sahayak API initialized with Gemini!")
    
    def generate_educational_content(self, prompt: str, **kwargs) -> str:
        try:
            enhanced_prompt = f"""
            Context: Multi-grade classroom in {kwargs.get('location', 'rural India')}
            Grade levels: {kwargs.get('grade_levels', [4, 5, 6])}
            Subject: {kwargs.get('subject', 'general')}
            
            User Request: {prompt}
            
            Please create comprehensive educational content that addresses all grade levels mentioned,
            uses culturally relevant examples, and provides practical implementation suggestions.
            """
            
            response = self.text_model.generate_content(enhanced_prompt)
            return response.text
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Content generation failed: {str(e)}")
    
    def analyze_educational_image(self, image_data: str, prompt: str = None) -> str:
        try:
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            if not prompt:
                prompt = "Analyze this educational image and provide multi-grade teaching suggestions for a low-resource classroom."
            enhanced_prompt = f"""
            {prompt}
            
            Please extract all educational content and provide specific suggestions for:
            1. Different grade levels (adaptations)
            2. Blackboard activities using this content
            3. Cultural adaptations for local context
            4. Resource-minimal teaching strategies
            5. Assessment without expensive tools
            """
            
            response = self.vision_model.generate_content([enhanced_prompt, image])
            return response.text
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")
    
    def create_lesson_plan(self, topic: str, grade_levels: List[int], **kwargs) -> str:
        try:
            prompt = f"""
            Create a detailed lesson plan for teaching "{topic}" in a multi-grade classroom.
            
            Specifications:
            - Grade levels: {grade_levels}
            - Duration: {kwargs.get('duration_minutes', 45)} minutes
            - Available resources: {kwargs.get('resources', 'blackboard, chalk, local materials')}
            - Location context: {kwargs.get('location', 'rural India')}
            
            Include:
            1. Learning objectives for each grade level
            2. Cultural connections and local examples
            3. Activities using available materials only
            4. Differentiation strategies for mixed abilities
            5. Assessment methods without expensive tools
            6. Extension activities for fast finishers
            7. Homework suggestions involving families
            8. Visual aids that can be drawn on blackboard
            
            Make it immediately implementable by a teacher with minimal resources.
            """
            
            response = self.text_model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lesson plan generation failed: {str(e)}")
sahayak_api = None

@app.on_event("startup")
async def startup_event():
    global sahayak_api
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found in environment variables")
        print("Set your API key: export GEMINI_API_KEY='your_key_here'")
        return
    
    try:
        sahayak_api = SahayakAPI(api_key)
        print("Sahayak API server ready!")
    except Exception as e:
        print(f"Failed to initialize Sahayak API: {e}")

@app.get("/")
async def root():
    return {
        "message": "Sahayak API - AI Teaching Assistant for Multi-Grade Classrooms",
        "version": "2.0",
        "hackathon": "Agentic AI Day 2025",
        "problem_statement": "Empowering teachers in multi-grade classrooms"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "api_initialized": sahayak_api is not None}

@app.post("/generate-content")
async def generate_content(request: TextRequest):
    if not sahayak_api:
        raise HTTPException(status_code=503, detail="Sahayak API not initialized")
    
    try:
        content = sahayak_api.generate_educational_content(
            prompt=request.prompt,
            grade_levels=request.grade_levels,
            subject=request.subject,
            location=request.location
        )
        
        return {
            "content": content,
            "metadata": {
                "grade_levels": request.grade_levels,
                "subject": request.subject,
                "location": request.location
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...), grade_levels: str = "4,5,6"):
    if not sahayak_api:
        raise HTTPException(status_code=503, detail="Sahayak API not initialized")
    
    try:
        image_bytes = await file.read()
        image_data = base64.b64encode(image_bytes).decode('utf-8')       
        # Parse grade levels
        grades = [int(g.strip()) for g in grade_levels.split(",")]
        
        analysis = sahayak_api.analyze_educational_image(
            image_data=image_data,
            prompt=f"Analyze this educational content for grades {grades}"
        )
        
        return {
            "analysis": analysis,
            "metadata": {
                "filename": file.filename,
                "grade_levels": grades
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create-lesson-plan")
async def create_lesson_plan(request: LessonPlanRequest):
    #Create comprehensive lesson plans for multi-grade classrooms
    if not sahayak_api:
        raise HTTPException(status_code=503, detail="Sahayak API not initialized")
    
    try:
        lesson_plan = sahayak_api.create_lesson_plan(
            topic=request.topic,
            grade_levels=request.grade_levels,
            duration_minutes=request.duration_minutes,
            resources=request.resources,
            location=request.location
        )
        
        return {
            "lesson_plan": lesson_plan,
            "metadata": {
                "topic": request.topic,
                "grade_levels": request.grade_levels,
                "duration": request.duration_minutes,
                "location": request.location
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quick-math-problem")
async def quick_math_problem(grade: int = 5, topic: str = "addition"):
    if not sahayak_api:
        raise HTTPException(status_code=503, detail="Sahayak API not initialized")
    
    prompt = f"Create a culturally relevant math problem about {topic} for grade {grade} students in rural India. Use local examples like farming, market, or festivals."
    
    try:
        content = sahayak_api.generate_educational_content(
            prompt=prompt,
            grade_levels=[grade],
            subject="mathematics"
        )
        return {"problem": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Sahayak API Server...")
    print("📖 Perfect for Agentic AI Day Hackathon!")
    print("🔧 Make sure to set GEMINI_API_KEY environment variable")
    uvicorn.run(app, host="0.0.0.0", port=8000)