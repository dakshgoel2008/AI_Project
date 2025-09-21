import os
import logging
from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
from typing import Optional, List
import google.generativeai as genai
from PIL import Image
import io
import base64
import json
from dotenv import load_dotenv
import time
import asyncio
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Global variables for API client
gemini_model = None

async def initialize_gemini():
    """Initialize Gemini API with proper error handling"""
    global gemini_model
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY not found in environment variables")
            raise ValueError("GEMINI_API_KEY not found")
        
        genai.configure(api_key=api_key)
        gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        logger.info("Gemini API initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Gemini API: {e}")
        return False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Sahayak API...")
    await initialize_gemini()
    yield
    # Shutdown
    logger.info("Shutting down Sahayak API...")

app = FastAPI(
    title="Sahayak API", 
    description="AI Teaching Assistant for Multi-Grade Classrooms",
    version="1.0.0",
    lifespan=lifespan
)
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint to verify API status"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "gemini_initialized": gemini_model is not None
    }

class TextRequest(BaseModel):
    prompt: str
    grade_levels: Optional[List[int]] = [4, 5, 6]
    subject: Optional[str] = "general"
    location: Optional[str] = "rural India"
    max_tokens: Optional[int] = 500
    
    @validator('prompt')
    def prompt_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Prompt cannot be empty')
        return v.strip()
    
    @validator('grade_levels')
    def grade_levels_must_be_valid(cls, v):
        if not v or not all(1 <= grade <= 12 for grade in v):
            raise ValueError('Grade levels must be between 1 and 12')
        return v

class ImageAnalysisRequest(BaseModel):
    image_data: str
    prompt: Optional[str] = None
    grade_levels: Optional[List[int]] = [4, 5, 6]
    
    @validator('image_data')
    def validate_base64_image(cls, v):
        if not v:
            raise ValueError('Image data cannot be empty')
        try:
            # Try to decode base64 to validate format
            base64.b64decode(v.split(',')[-1])
        except Exception:
            raise ValueError('Invalid base64 image data')
        return v

class LessonPlanRequest(BaseModel):
    topic: str
    grade_levels: List[int]
    duration_minutes: int = 45
    resources: str = "blackboard, chalk, local materials"
    location: str = "rural India"
    
    @validator('topic')
    def topic_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Topic cannot be empty')
        return v.strip()
    
    @validator('grade_levels')
    def validate_grade_levels(cls, v):
        if not v or not all(1 <= grade <= 12 for grade in v):
            raise ValueError('Grade levels must be between 1 and 12')
        return v

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
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is required")
        
        try:
            genai.configure(api_key=self.api_key)
            self.text_model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=SAHAYAK_SYSTEM_PROMPT
            )
            
            self.vision_model = genai.GenerativeModel(
                model_name="gemini-1.5-pro-vision",
                system_instruction=VISION_SYSTEM_PROMPT
            )
            
            logger.info("Sahayak API initialized with Gemini successfully")
        except Exception as e:
            logger.error(f"Failed to initialize SahayakAPI: {e}")
            raise
    
    async def generate_educational_content_with_retry(self, prompt: str, max_retries: int = 3, **kwargs) -> str:
        """Generate educational content with retry logic"""
        for attempt in range(max_retries):
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
                if response and response.text:
                    logger.info(f"Content generated successfully on attempt {attempt + 1}")
                    return response.text
                else:
                    raise Exception("Empty response from API")
                    
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    logger.error(f"All {max_retries} attempts failed for content generation")
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Content generation failed after {max_retries} attempts: {str(e)}"
                    )
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
    
    def generate_educational_content(self, prompt: str, **kwargs) -> str:
        """Synchronous wrapper for content generation"""
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        return loop.run_until_complete(
            self.generate_educational_content_with_retry(prompt, **kwargs)
        )
    
    async def analyze_educational_image_with_retry(self, image_data: str, prompt: str = None, max_retries: int = 3) -> str:
        """Analyze educational image with retry logic"""
        for attempt in range(max_retries):
            try:
                # Validate and process image data
                if ',' in image_data:
                    image_data = image_data.split(',')[1]  # Remove data URL prefix
                
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes))
                
                # Resize image if too large (to reduce API costs)
                max_size = (1024, 1024)
                image.thumbnail(max_size, Image.Resampling.LANCZOS)
                
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
                if response and response.text:
                    logger.info(f"Image analysis successful on attempt {attempt + 1}")
                    return response.text
                else:
                    raise Exception("Empty response from vision API")
                    
            except Exception as e:
                logger.warning(f"Image analysis attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    logger.error(f"All {max_retries} attempts failed for image analysis")
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Image analysis failed after {max_retries} attempts: {str(e)}"
                    )
                await asyncio.sleep(2 ** attempt)
    
    def analyze_educational_image(self, image_data: str, prompt: str = None) -> str:
        """Synchronous wrapper for image analysis"""
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        return loop.run_until_complete(
            self.analyze_educational_image_with_retry(image_data, prompt)
        )
    
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
# Global API instance
sahayak_api = None

async def get_sahayak_api():
    """Get or create Sahayak API instance"""
    global sahayak_api
    if sahayak_api is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY not found in environment variables")
            raise HTTPException(
                status_code=500, 
                detail="API key not configured. Please set GEMINI_API_KEY environment variable."
            )
        
        try:
            sahayak_api = SahayakAPI(api_key)
            logger.info("Sahayak API instance created successfully")
        except Exception as e:
            logger.error(f"Failed to create Sahayak API: {e}")
            raise HTTPException(status_code=500, detail=f"API initialization failed: {str(e)}")
    
    return sahayak_api

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
    """Generate educational content with enhanced error handling"""
    try:
        api = await get_sahayak_api()
        
        logger.info(f"Generating content for grades {request.grade_levels}, subject: {request.subject}")
        
        content = await api.generate_educational_content_with_retry(
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
                "location": request.location,
                "timestamp": time.time()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Content generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Content generation failed: {str(e)}")

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...), grade_levels: str = "4,5,6"):
    """Analyze educational image with enhanced validation"""
    try:
        api = await get_sahayak_api()
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Check file size (limit to 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        file_size = 0
        image_bytes = b""
        
        async for chunk in file.stream():
            file_size += len(chunk)
            if file_size > max_size:
                raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB")
            image_bytes += chunk
        
        image_data = base64.b64encode(image_bytes).decode('utf-8')
        
        # Parse grade levels
        try:
            grade_list = [int(g.strip()) for g in grade_levels.split(",")]
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid grade levels format")
        
        logger.info(f"Analyzing image for grades {grade_list}")
        
        analysis = await api.analyze_educational_image_with_retry(image_data)
        
        return {
            "analysis": analysis,
            "metadata": {
                "grade_levels": grade_list,
                "file_name": file.filename,
                "file_size": file_size,
                "timestamp": time.time()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

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

# @app.post("/quick-math-problem")
# async def quick_math_problem(grade: int = 5, topic: str = "addition"):
#     try:
#         api = await get_sahayak_api()
        
#         prompt = f"Create a culturally relevant math problem about {topic} for grade {grade} students in rural India. Use local examples like farming, market, or festivals."
        
#         content = await api.generate_educational_content_with_retry(
#             prompt=prompt,
#             grade_levels=[grade],
#             subject="mathematics"
#         )
#         return {"problem": content}
#     except Exception as e:
#         logger.error(f"Quick math problem error: {e}")
#         raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Welcome to Sahayak Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)