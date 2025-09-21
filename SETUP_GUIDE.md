# Sahayak - Full Stack Setup Guide

## Backend Setup & Running

### 1. Start the Node.js Backend (Port 4444)
```bash
cd AI_Project/backend
npm install
npm start
```

### 2. Start the Python AI API (Port 8000)
```bash
cd AI_Project/Sahayak_agent
pip install -r requirements.txt
python sahayak_api.py
```

### 3. Start the Next.js Frontend (Port 3000)
```bash
cd AI_Project/sahayak_ui
npm install
npm run dev
```

## Environment Variables Required

### For Python AI API (.env in Sahayak_agent folder):
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### For Next.js Frontend (.env.local in sahayak_ui folder):
```
NEXT_PUBLIC_API_URL=http://localhost:4444/api
NEXT_PUBLIC_SAHAYAK_API_URL=http://localhost:8000
```

## API Flow

1. **Frontend (Next.js)** → Sends user input + files
2. **Python AI API** → Processes with Gemini AI model
3. **Node.js Backend** → Handles user management & data storage
4. **Frontend** → Displays AI responses

## Features Integrated

✅ **Text Messages**: Send prompts to AI model
✅ **Image Upload**: Analyze educational images
✅ **PDF Upload**: Process document content
✅ **Camera Capture**: Take photos and analyze them
✅ **File Validation**: 10MB limit, image/PDF only
✅ **Error Handling**: Proper error messages
✅ **Loading States**: Visual feedback during processing
✅ **Responsive Design**: Works on all devices

## Troubleshooting

### Backend Not Starting?
- Check if ports 3000, 4444, and 8000 are available
- Install dependencies in each folder
- Check environment variables are set

### API Connection Issues?
- Verify all three servers are running
- Check CORS settings in Python API
- Ensure URLs in .env.local match running servers

### Gemini API Issues?
- Verify GEMINI_API_KEY in .env file
- Check API key has proper permissions
- Monitor API usage limits

## File Structure
```
AI_Project/
├── backend/ (Node.js - Port 4444)
├── Sahayak_agent/ (Python AI - Port 8000) 
└── sahayak_ui/ (Next.js Frontend - Port 3000)
```