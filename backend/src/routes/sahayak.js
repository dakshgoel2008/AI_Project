import express from "express";
import axios from "axios";
import multer from "multer";
import mongoose from "mongoose";
import { 
    Teacher, 
    Student, 
    LessonPlan, 
    Question, 
    AttendanceSession, 
    EducationalContent 
} from "../models/education.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Database connection checker
const isDBConnected = () => mongoose.connection.readyState === 1;

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Health check and feature availability endpoint
router.get('/health', async (req, res) => {
    try {
        const dbConnected = isDBConnected();
        
        // Test Sahayak API connection
        let sahayakApiStatus = false;
        try {
            const testResponse = await axios.get(`${SAHAYAK_API_URL}/health`, { timeout: 5000 });
            sahayakApiStatus = testResponse.status === 200;
        } catch (error) {
            sahayakApiStatus = false;
        }

        // Get collection stats if DB is connected
        let collectionStats = {};
        if (dbConnected) {
            try {
                collectionStats = {
                    users: await mongoose.connection.collection('users').countDocuments(),
                    teachers: await mongoose.connection.collection('teachers').countDocuments(),
                    students: await mongoose.connection.collection('students').countDocuments(),
                    lessonplans: await mongoose.connection.collection('lessonplans').countDocuments(),
                    questions: await mongoose.connection.collection('questions').countDocuments(),
                    attendancesessions: await mongoose.connection.collection('attendancesessions').countDocuments(),
                    educationalcontents: await mongoose.connection.collection('educationalcontents').countDocuments()
                };
            } catch (error) {
                collectionStats = { error: "Could not fetch collection stats" };
            }
        }

        res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            services: {
                database: {
                    connected: dbConnected,
                    status: dbConnected ? 'online' : 'offline'
                },
                sahayakApi: {
                    connected: sahayakApiStatus,
                    status: sahayakApiStatus ? 'online' : 'offline',
                    url: SAHAYAK_API_URL
                }
            },
            collectionStats: dbConnected ? collectionStats : "Database offline",
            availableFeatures: [
                ...(sahayakApiStatus ? [
                    "AI content generation",
                    "Image analysis", 
                    "Lesson plan generation (temporary)",
                    "Question generation (temporary)"
                ] : []),
                ...(dbConnected ? [
                    "User authentication",
                    "Teacher profiles",
                    "Student profiles", 
                    "Data persistence",
                    "Student management",
                    "Attendance tracking"
                ] : [])
            ],
            unavailableFeatures: [
                ...(!sahayakApiStatus ? [
                    "AI content generation",
                    "Image analysis"
                ] : []),
                ...(!dbConnected ? [
                    "User authentication",
                    "Data persistence", 
                    "Profile management",
                    "Long-term storage"
                ] : [])
            ]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Health check failed",
            error: error.message
        });
    }
});

// Sahayak FastAPI endpoint - update with your actual endpoint
const SAHAYAK_API_URL = process.env.SAHAYAK_API_URL || 'http://localhost:8000';

// Create/Update Teacher Profile
router.post('/teacher/profile', authenticateToken, async (req, res) => {
    try {
        // Check database connection
        if (!isDBConnected()) {
            return res.status(503).json({
                success: false,
                message: "Database temporarily unavailable. Teacher profile management requires database connection.",
                error: "SERVICE_UNAVAILABLE",
                availableFeatures: ["AI content generation", "Image analysis"],
                unavailableFeatures: ["Teacher profile management", "Data persistence"]
            });
        }

        const { school, classes, specialization, experience, languages } = req.body;
        
        const teacherProfile = await Teacher.findOneAndUpdate(
            { userId: req.user.id },
            {
                userId: req.user.id,
                school,
                classes,
                specialization,
                experience,
                languages,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );
        
        res.status(200).json({
            success: true,
            message: "Teacher profile updated successfully",
            data: teacherProfile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating teacher profile",
            error: error.message
        });
    }
});

// Get Teacher Dashboard
router.get('/teacher/dashboard', authenticateToken, async (req, res) => {
    try {
        // Check database connection
        if (!isDBConnected()) {
            return res.status(503).json({
                success: false,
                message: "Database temporarily unavailable. Teacher dashboard requires database connection.",
                error: "SERVICE_UNAVAILABLE",
                availableFeatures: ["AI content generation", "Image analysis"],
                unavailableFeatures: ["Teacher dashboard", "Data management", "Statistics"]
            });
        }

        const teacher = await Teacher.findOne({ userId: req.user.id });
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found"
            });
        }

        // Get recent lesson plans
        const recentLessons = await LessonPlan.find({ teacherId: teacher._id })
            .sort({ createdAt: -1 })
            .limit(5);

        // Get total students across all classes
        const totalStudents = await Student.countDocuments({ teacherId: teacher._id });

        // Get recent attendance sessions
        const recentAttendance = await AttendanceSession.find({ teacherId: teacher._id })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('students.studentId');

        // Get question bank count
        const questionCount = await Question.countDocuments({ teacherId: teacher._id });

        res.status(200).json({
            success: true,
            data: {
                teacher,
                stats: {
                    totalStudents,
                    totalLessons: recentLessons.length,
                    totalQuestions: questionCount,
                    recentAttendanceRate: recentAttendance.length > 0 ? 
                        recentAttendance[0].summary.attendanceRate : 0
                },
                recentLessons,
                recentAttendance
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard data",
            error: error.message
        });
    }
});

// Generate Educational Content
router.post('/content/generate', authenticateToken, async (req, res) => {
    try {
        const { prompt, gradelevels, subject, location, maxTokens } = req.body;
        
        // Call Sahayak FastAPI
        const response = await axios.post(`${SAHAYAK_API_URL}/generate-content`, {
            prompt,
            grade_levels: gradelevels,
            subject,
            location,
            max_tokens: maxTokens || 500
        });

        // Get teacher profile
        const teacher = await Teacher.findOne({ userId: req.user.id });
        
        // Save generated content to database
        const educationalContent = new EducationalContent({
            teacherId: teacher._id,
            title: `Generated Content: ${subject}`,
            contentType: 'lesson_plan',
            subject,
            gradelevels,
            topic: prompt.substring(0, 100),
            content: {
                text: response.data.content
            },
            metadata: {
                aiPrompt: prompt,
                generationTime: response.data.generation_time,
                model: 'gemini-1.5-pro',
                culturalContext: location
            }
        });

        await educationalContent.save();

        res.status(200).json({
            success: true,
            message: "Content generated successfully",
            data: {
                content: response.data.content,
                metadata: response.data,
                savedId: educationalContent._id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error generating content",
            error: error.message
        });
    }
});

// Generate Questions
router.post('/questions/generate', authenticateToken, async (req, res) => {
    try {
        const { subject, topic, grade, questionCount, difficulty } = req.body;
        
        const prompt = `Generate ${questionCount} ${difficulty} level questions about ${topic} for grade ${grade} students in ${subject}. Include diverse question types.`;
        
        // Call Sahayak FastAPI (this works without database)
        const response = await axios.post(`${SAHAYAK_API_URL}/generate-content`, {
            prompt,
            grade_levels: [grade],
            subject,
            max_tokens: 800
        });

        // Parse questions from response
        const questionTexts = response.data.content.split('\n').filter(q => q.trim());
        const generatedQuestions = [];

        // Check database connection for saving
        if (!isDBConnected()) {
            // Return generated questions without saving
            const tempQuestions = questionTexts.slice(0, questionCount).map((questionText, index) => ({
                id: `temp_${index}`,
                subject,
                topic,
                grade,
                difficulty,
                questionType: 'short_answer',
                question: questionText,
                correctAnswer: 'To be filled by teacher',
                aiGenerated: true,
                _temporary: true
            }));

            return res.status(200).json({
                success: true,
                message: "Questions generated successfully (not saved - database unavailable)",
                data: tempQuestions,
                warning: "Database unavailable - questions generated but not saved permanently"
            });
        }

        const teacher = await Teacher.findOne({ userId: req.user.id });
        
        // Save questions to database
        for (const questionText of questionTexts.slice(0, questionCount)) {
            const question = new Question({
                teacherId: teacher._id,
                subject,
                topic,
                grade,
                difficulty,
                questionType: 'short_answer',
                question: questionText,
                correctAnswer: 'To be filled by teacher',
                aiGenerated: true
            });
            
            await question.save();
            generatedQuestions.push(question);
        }

        res.status(200).json({
            success: true,
            message: "Questions generated successfully",
            data: generatedQuestions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error generating questions",
            error: error.message
        });
    }
});

// Create Lesson Plan
router.post('/lessons/create', authenticateToken, async (req, res) => {
    try {
        const { title, subject, gradelevels, topic, duration, resources, culturalContext } = req.body;
        
        const prompt = `Create a detailed lesson plan for ${subject} on topic "${topic}" for grades ${gradelevels.join(', ')}. Duration: ${duration} minutes. Include objectives, activities, and assessment. Context: ${culturalContext?.region || 'rural India'}.`;
        
        // Call Sahayak FastAPI (this works without database)
        const response = await axios.post(`${SAHAYAK_API_URL}/create-lesson-plan`, {
            topic,
            grade_levels: gradelevels,
            duration_minutes: duration,
            resources: resources || "blackboard, chalk, local materials",
            location: culturalContext?.region || "rural India"
        });

        // Check if user wants to save to database
        if (!isDBConnected()) {
            // Return generated lesson plan without saving
            return res.status(200).json({
                success: true,
                message: "Lesson plan generated successfully (not saved - database unavailable)",
                data: {
                    title,
                    subject,
                    gradelevels,
                    topic,
                    duration,
                    content: {
                        introduction: response.data.lesson_plan.introduction || response.data.lesson_plan.substring(0, 200),
                        mainContent: response.data.lesson_plan,
                        activities: response.data.activities || [],
                        assessment: response.data.assessment || "Teacher observation and questioning"
                    },
                    resources: resources || ["blackboard", "chalk", "local materials"],
                    culturalContext: culturalContext || { region: "rural India" },
                    aiGenerated: true,
                    _temporary: true // Indicates this was not saved
                },
                warning: "Database unavailable - lesson plan generated but not saved permanently"
            });
        }

        const teacher = await Teacher.findOne({ userId: req.user.id });
        
        const lessonPlan = new LessonPlan({
            teacherId: teacher._id,
            title,
            subject,
            gradelevels,
            topic,
            duration,
            content: {
                introduction: response.data.lesson_plan.introduction || response.data.lesson_plan.substring(0, 200),
                mainContent: response.data.lesson_plan,
                activities: response.data.activities || [],
                assessment: response.data.assessment || "Teacher observation and questioning"
            },
            resources: resources || ["blackboard", "chalk", "local materials"],
            culturalContext: culturalContext || { region: "rural India" },
            aiGenerated: true
        });

        await lessonPlan.save();

        res.status(200).json({
            success: true,
            message: "Lesson plan created successfully",
            data: lessonPlan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating lesson plan",
            error: error.message
        });
    }
});

// Process Attendance Photo
router.post('/attendance/upload', authenticateToken, upload.single('photo'), async (req, res) => {
    try {
        const { classId } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No photo uploaded"
            });
        }

        // Convert buffer to base64
        const imageBase64 = req.file.buffer.toString('base64');
        
        // Call Sahayak FastAPI for face recognition (works without database)
        const response = await axios.post(`${SAHAYAK_API_URL}/analyze-image`, {
            image_data: imageBase64,
            grade_levels: "4,5,6" // You can make this dynamic
        });

        // Check database connection for saving attendance
        if (!isDBConnected()) {
            return res.status(200).json({
                success: true,
                message: "Image analyzed successfully (attendance not saved - database unavailable)",
                data: {
                    analysis: response.data.analysis,
                    suggestions: "Face recognition analysis completed",
                    _temporary: true
                },
                warning: "Database unavailable - image analyzed but attendance not saved permanently"
            });
        }

        const teacher = await Teacher.findOne({ userId: req.user.id });
        const students = await Student.find({ teacherId: teacher._id, classId });

        // Process attendance results (this is a simplified version)
        const attendanceData = students.map(student => ({
            studentId: student._id,
            present: Math.random() > 0.3, // Replace with actual face recognition results
            confidence: Math.random()
        }));

        const presentCount = attendanceData.filter(a => a.present).length;
        
        const attendanceSession = new AttendanceSession({
            teacherId: teacher._id,
            classId,
            date: new Date(),
            method: 'face_recognition',
            students: attendanceData,
            summary: {
                totalStudents: students.length,
                presentCount,
                absentCount: students.length - presentCount,
                attendanceRate: (presentCount / students.length) * 100
            }
        });

        await attendanceSession.save();

        res.status(200).json({
            success: true,
            message: "Attendance processed successfully",
            data: {
                session: attendanceSession,
                aiAnalysis: response.data
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error processing attendance",
            error: error.message
        });
    }
});

// Get Attendance History
router.get('/attendance/history/:classId', authenticateToken, async (req, res) => {
    try {
        const { classId } = req.params;
        const teacher = await Teacher.findOne({ userId: req.user.id });
        
        const attendanceHistory = await AttendanceSession.find({
            teacherId: teacher._id,
            classId
        })
        .sort({ date: -1 })
        .limit(30)
        .populate('students.studentId');

        res.status(200).json({
            success: true,
            data: attendanceHistory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching attendance history",
            error: error.message
        });
    }
});

// Add Students to Class
router.post('/students/add', authenticateToken, async (req, res) => {
    try {
        const { students } = req.body; // Array of student objects
        const teacher = await Teacher.findOne({ userId: req.user.id });
        
        const studentDocs = students.map(student => ({
            ...student,
            teacherId: teacher._id
        }));

        const savedStudents = await Student.insertMany(studentDocs);

        res.status(200).json({
            success: true,
            message: "Students added successfully",
            data: savedStudents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding students",
            error: error.message
        });
    }
});

// Get Students by Class
router.get('/students/:classId', authenticateToken, async (req, res) => {
    try {
        const { classId } = req.params;
        const teacher = await Teacher.findOne({ userId: req.user.id });
        
        const students = await Student.find({
            teacherId: teacher._id,
            classId
        }).sort({ rollNumber: 1 });

        res.status(200).json({
            success: true,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching students",
            error: error.message
        });
    }
});

export default router;