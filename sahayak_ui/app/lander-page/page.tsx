"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Calendar, 
  Lightbulb, 
  Users, 
  MessageCircle, 
  Headphones,
  GraduationCap,
  UserCheck,
  Star,
  Menu,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const SahayakLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Personalized Learning Paths",
      description: "Tailored educational journeys that adapt to your learning style and pace for optimal knowledge retention."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Study Scheduling", 
      description: "AI-powered scheduling that optimizes your study sessions based on your availability and learning patterns."
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Interactive Learning Methods",
      description: "Engage with dynamic content including quizzes, simulations, and interactive exercises for better understanding."
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "AI-Powered Tutoring",
      description: "Get instant help and explanations from our advanced AI tutor available 24/7 for all your questions."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Collaborative Study Groups",
      description: "Connect with peers, form study groups, and learn together in a collaborative environment."
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "24/7 Q&A Support",
      description: "Round-the-clock support system to help you overcome any learning obstacle instantly."
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Student",
      content: "Sahayak AI transformed my learning experience. The personalized approach helped me improve my grades significantly!",
      rating: 5
    },
    {
      name: "Rahul Gupta", 
      role: "Teacher",
      content: "As an educator, I find Sahayak AI incredibly valuable. It helps me create engaging content and track student progress effectively.",
      rating: 5
    },
    {
      name: "Anita Patel",
      role: "Parent",
      content: "My daughter's confidence in studies has increased dramatically since using Sahayak AI. Highly recommended!",
      rating: 5
    }
  ];

  const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <div 
      className="opacity-0 translate-y-8 animate-fade-in-up"
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(32px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .bg-gradient-mesh {
          background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Sahayak AI
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-blue-400 transition-colors duration-300">Features</a>
              <a href="#about" className="hover:text-blue-400 transition-colors duration-300">For Students</a>
              <a href="#teachers" className="hover:text-blue-400 transition-colors duration-300">For Teachers</a>
              <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-300">
                Login
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300">
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-700">
              <div className="flex flex-col space-y-4 mt-4">
                <a href="#features" className="hover:text-blue-400 transition-colors duration-300">Features</a>
                <a href="#about" className="hover:text-blue-400 transition-colors duration-300">For Students</a>
                <a href="#teachers" className="hover:text-blue-400 transition-colors duration-300">For Teachers</a>
                <div className="flex space-x-4 pt-4">
                  <Button variant="outline" size="sm">Login</Button>
                  <Button size="sm">Sign Up</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 bg-gradient-mesh">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <AnimatedCard>
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  Unlock Your
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                    Learning Potential
                  </span>
                  <span className="block">with Sahayak AI</span>
                </h1>
              </AnimatedCard>
              
              <AnimatedCard delay={200}>
                <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
                  Experience personalized learning with our AI-powered educational tool. Get intelligent support, interactive content, and adaptive learning paths.
                </p>
              </AnimatedCard>

              <AnimatedCard delay={400}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4"
                  >
                    Get Started For Free
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-slate-600 hover:bg-slate-800 text-lg px-8 py-4 transition-all duration-300"
                  >
                    Watch Demo
                  </Button>
                </div>
              </AnimatedCard>
            </div>

            {/* Hero Image/Animation */}
            <div className="relative">
              <AnimatedCard delay={600}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl animate-float"></div>
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700">
                    <div className="grid grid-cols-2 gap-4 opacity-80">
                      {[...Array(12)].map((_, i) => (
                        <div 
                          key={i} 
                          className="h-4 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded animate-pulse"
                          style={{ animationDelay: `${i * 100}ms` }}
                        ></div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse-glow">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded"></div>
                        <div className="h-3 bg-gradient-to-r from-purple-500/40 to-pink-500/40 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-800/30">
        <div className="container mx-auto max-w-7xl">
          <AnimatedCard>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Explore the Power of 
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Sahayak AI</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Our AI-driven platform offers a range of features designed to enhance your learning experience and accelerate your educational journey.
              </p>
            </div>
          </AnimatedCard>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedCard key={index} delay={index * 100}>
                <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 group hover:transform hover:scale-105">
                  <CardContent className="p-8">
                    <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* For Students & Teachers Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <AnimatedCard>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Empowering Students and Educators
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Sahayak AI provides tailored solutions for both students and teachers, creating a comprehensive learning ecosystem.
              </p>
            </div>
          </AnimatedCard>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* For Students */}
            <AnimatedCard delay={200}>
              <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <GraduationCap className="w-10 h-10 text-blue-400 mr-4" />
                    <h3 className="text-2xl font-bold">For Students</h3>
                  </div>
                  <p className="text-slate-300 mb-6 text-lg">
                    Transform your learning experience with AI-driven personalization, interactive content, and collaborative study tools.
                  </p>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Adaptive learning paths
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Real-time progress tracking
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Interactive study materials
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Peer collaboration tools
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </AnimatedCard>

            {/* For Teachers */}
            <AnimatedCard delay={400}>
              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <UserCheck className="w-10 h-10 text-purple-400 mr-4" />
                    <h3 className="text-2xl font-bold">For Teachers</h3>
                  </div>
                  <p className="text-slate-300 mb-6 text-lg">
                    Enhance your teaching effectiveness with AI-powered insights, automated grading, and comprehensive analytics.
                  </p>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      Automated content creation
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      Student performance analytics
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      Curriculum planning tools
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      Classroom management
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-slate-800/30">
        <div className="container mx-auto max-w-7xl">
          <AnimatedCard>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">What Our Users Say</h2>
              <p className="text-xl text-slate-300">Real feedback from students, teachers, and parents who love Sahayak AI</p>
            </div>
          </AnimatedCard>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedCard key={index} delay={index * 200}>
                <Card className="bg-slate-800/50 border-slate-700 h-full hover:border-yellow-500/50 transition-all duration-300 group hover:transform hover:scale-105">
                  <CardContent className="p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-300 mb-6 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="border-t border-slate-700 pt-4">
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-slate-400 text-sm">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 px-6 border-t border-slate-800">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">Sahayak AI</span>
              </div>
              <p className="text-slate-400">Empowering education through artificial intelligence</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Get In Touch</h4>
              <p className="text-slate-400">Ready to transform your learning experience?</p>
              <Button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Contact Us
              </Button>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Sahayak AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SahayakLanding;