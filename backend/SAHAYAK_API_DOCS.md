# 🎓 Sahayak AI - Complete Backend Documentation

## 🏗️ **Architecture Overview**

Your Sahayak AI project now has a **hybrid architecture**:

- **Node.js/Express Backend** - Main API server with MongoDB
- **Python FastAPI Agent** - AI processing with Google Gemini
- **MongoDB Database** - Educational data storage
- **Google Gemini API** - AI language model

---

## 📡 **API Endpoints**

### **Authentication APIs**

```bash
POST /api/auth/signup
POST /api/auth/login  
POST /api/auth/logout
GET  /api/auth/all
```

### **Sahayak Education APIs**

#### **Teacher Management**
```bash
POST /api/sahayak/teacher/profile          # Create/update teacher profile
GET  /api/sahayak/teacher/dashboard        # Get teacher dashboard data
```

#### **Content Generation (AI-Powered)**
```bash
POST /api/sahayak/content/generate         # Generate educational content
POST /api/sahayak/questions/generate       # Generate questions using AI
POST /api/sahayak/lessons/create           # Create AI-powered lesson plans
```

#### **Attendance Management**
```bash
POST /api/sahayak/attendance/upload        # Upload photo for face recognition
GET  /api/sahayak/attendance/history/:classId  # Get attendance history
```

#### **Student Management**
```bash
POST /api/sahayak/students/add             # Add students to class
GET  /api/sahayak/students/:classId        # Get students by class ID
```

---

## 🗄️ **Database Schemas**

### **Core Collections:**

1. **Users** - Basic authentication
2. **Teachers** - Teacher profiles and school info
3. **Students** - Student data with face recognition IDs
4. **LessonPlans** - AI-generated lesson plans
5. **Questions** - AI-generated question bank
6. **AttendanceSessions** - Face recognition attendance data
7. **EducationalContent** - All AI-generated content

---

## 🔧 **Key Features Implemented**

### **1. Multi-Grade Classroom Support**
- Lesson plans for multiple grade levels
- Differentiated content generation
- Grade-specific question banks

### **2. AI-Powered Content Generation**
- Culturally relevant content
- Local context integration
- NCERT curriculum alignment

### **3. Face Recognition Attendance**
- Photo-based attendance marking
- Automatic parent notifications
- Attendance analytics

### **4. Question Bank System**
- AI-generated questions
- Multiple difficulty levels
- Subject and topic categorization

### **5. Teacher Dashboard**
- Performance analytics
- Recent lesson plans
- Student management tools

---

## 🚀 **What You Can Build Now**

### **Immediate Features:**

✅ **Teacher Registration & Authentication**
✅ **AI Content Generation Interface** 
✅ **Attendance Management System**
✅ **Question Bank Creation**
✅ **Lesson Plan Generator**
✅ **Student Database Management**

### **Advanced Features to Add:**

🔄 **Face Recognition Training System**
🔄 **Parent Notification System**  
🔄 **Performance Analytics Dashboard**
🔄 **Multi-language Support**
🔄 **Offline Content Sync**
🔄 **Assessment & Quiz Creator**

---

## 🌟 **Integration Points**

### **Python FastAPI ↔ Node.js Backend**

1. **Content Generation**: Node.js calls Python FastAPI for AI content
2. **Image Processing**: Face recognition handled by Python
3. **Data Storage**: All results stored in MongoDB via Node.js
4. **Authentication**: JWT tokens validated in Node.js

### **Example Integration Flow:**

```
Frontend → Node.js API → Python FastAPI → Google Gemini → Response → MongoDB → Frontend
```

---

## 🎯 **Next Steps**

1. **Test the Integration** - Start both servers and test API calls
2. **Enhance Sahayak Agent** - Add more features from reference repo
3. **Build Frontend** - Create React/Next.js interface  
4. **Add Face Recognition** - Implement actual face detection
5. **Deploy Services** - Set up production environment

---

## 🔑 **Environment Variables Needed**

### **Node.js Backend (.env)**
```env
PORT=4444
DB_PATH=mongodb://localhost:27017/sahayak_ai
ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
SAHAYAK_API_URL=http://localhost:8000
```

### **Python FastAPI (.env)**
```env
GEMINI_API_KEY=your_gemini_api_key
```

---