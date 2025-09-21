import mongoose, { Schema } from "mongoose";

// Teacher Profile Schema
const teacherSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    school: {
        name: { type: String, required: true },
        location: { type: String, required: true },
        type: { type: String, enum: ['government', 'private', 'rural'], required: true }
    },
    classes: [{
        grade: { type: Number, required: true },
        subject: { type: String, required: true },
        studentCount: { type: Number, required: true }
    }],
    specialization: {
        type: [String],
        enum: ['mathematics', 'science', 'language', 'social_studies', 'multi_grade']
    },
    experience: { type: Number, required: true }, // years
    languages: [String], // languages teacher can speak
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Student Schema for Classes
const studentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    rollNumber: { type: String, required: true },
    grade: { type: Number, required: true },
    section: { type: String, default: 'A' },
    classId: { type: String },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    faceEncodingId: { type: String }, // for attendance recognition
    parentContact: {
        phone: { type: String, default: "Not specified" },
        email: { type: String, default: "Not specified" },
        name: { type: String, default: "Not specified" }
    },
    attendance: [{
        date: { type: Date, required: true },
        present: { type: Boolean, required: true },
        method: { type: String, enum: ['manual', 'face_recognition'], default: 'manual' }
    }],
    performance: [{
        subject: String,
        topic: String,
        score: Number,
        maxScore: Number,
        date: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

// Lesson Plan Schema
const lessonPlanSchema = new Schema({
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    gradelevels: [Number], // multi-grade support
    topic: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes
    objectives: [String],
    content: {
        introduction: String,
        mainContent: String,
        activities: [String],
        assessment: String,
        homework: String
    },
    resources: [String],
    culturalContext: {
        region: String,
        localExamples: [String],
        language: String
    },
    aiGenerated: { type: Boolean, default: true },
    generatedBy: { type: String, default: 'sahayak_ai' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Question Bank Schema
const questionSchema = new Schema({
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    grade: { type: Number, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    questionType: { 
        type: String, 
        enum: ['mcq', 'short_answer', 'long_answer', 'fill_blank', 'true_false'], 
        required: true 
    },
    question: { type: String, required: true },
    options: [String], // for MCQ
    correctAnswer: { type: String, required: true },
    explanation: String,
    culturalContext: {
        localizedExamples: [String],
        region: String
    },
    ncertAlignment: {
        chapter: String,
        section: String
    },
    aiGenerated: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Attendance Session Schema
const attendanceSessionSchema = new Schema({
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    classId: { type: String, required: true },
    date: { type: Date, required: true },
    method: { type: String, enum: ['manual', 'face_recognition'], required: true },
    imageUrl: String, // for face recognition sessions
    students: [{
        studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
        present: Boolean,
        confidence: Number // for face recognition
    }],
    summary: {
        totalStudents: Number,
        presentCount: Number,
        absentCount: Number,
        attendanceRate: Number
    },
    createdAt: { type: Date, default: Date.now }
});

// Educational Content Schema
const educationalContentSchema = new Schema({
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    title: { type: String, required: true },
    contentType: { 
        type: String, 
        enum: ['lesson_plan', 'worksheet', 'assessment', 'activity', 'animation'], 
        required: true 
    },
    subject: { type: String, required: true },
    gradelevels: [Number],
    topic: { type: String, required: true },
    content: {
        text: String,
        images: [String],
        videos: [String],
        animations: [String]
    },
    metadata: {
        aiPrompt: String,
        generationTime: Number,
        model: { type: String, default: 'gemini-1.5-pro' },
        culturalContext: String
    },
    usage: {
        viewCount: { type: Number, default: 0 },
        downloadCount: { type: Number, default: 0 },
        rating: { type: Number, min: 1, max: 5 }
    },
    createdAt: { type: Date, default: Date.now }
});

// Export all models
const Teacher = mongoose.model('Teacher', teacherSchema);
const Student = mongoose.model('Student', studentSchema);
const LessonPlan = mongoose.model('LessonPlan', lessonPlanSchema);
const Question = mongoose.model('Question', questionSchema);
const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
const EducationalContent = mongoose.model('EducationalContent', educationalContentSchema);

export { Teacher, Student, LessonPlan, Question, AttendanceSession, EducationalContent };