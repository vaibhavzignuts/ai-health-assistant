"use client";
import { getCurrentUser } from "@/lib/auth";
import { Heart, Shield, Users, Stethoscope, Pill, MapPin, Star, CheckCircle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

// Mock Button component since we can't import the actual one
const Button = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    secondary: "bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl"
  };
  
  const sizes = {
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Mock Link component
const Link = ({ href, children, className = "" }) => (
  <a href={href} className={className}>{children}</a>
);

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Mock authentication check
    const getUser = async () => {
      const currentUser = await getCurrentUser();
      setIsAuthenticated(!currentUser.is_anonymous);
    };
    getUser();
  }, []);

  const features = [
    {
      icon: Stethoscope,
      title: "AI Symptom Checker",
      description: "Describe your symptoms and get AI-powered insights about possible conditions and next steps",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: MapPin,
      title: "Facility Finder",
      description: "Locate nearby hospitals, clinics, and pharmacies with contact details and directions",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Pill,
      title: "Medicine Reminders",
      description: "Never miss a dose with customizable medication reminders and tracking",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Users,
      title: "Health Tips",
      description: "Personalized health advice based on your profile and medical conditions",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Emergency Contacts",
      description: "Quick access to emergency contacts and SOS features for urgent situations",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Heart,
      title: "Community Focus",
      description: "Designed specifically for underserved communities with accessible, user-friendly interface",
      color: "from-pink-500 to-rose-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Health Checks" },
    { number: "99%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
<header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
      {/* Logo and Title */}
      <div className="flex items-center space-x-3 group">
        <div className="relative">
          <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 transform group-hover:scale-110 transition-transform duration-200" />
          <div className="absolute -inset-1 bg-blue-600 rounded-full opacity-20 animate-ping"></div>
        </div>
        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          HealthCare+
        </span>
      </div>

      {/* Navigation Buttons */}
      {isAuthenticated ? (
        <Link href="/dashboard">
          <Button className="flex items-center space-x-2 w-full sm:w-auto justify-center">
            <span>Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      ) : (
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 w-full sm:w-auto">
          <Link href="/login">
            <Button variant="outline" className="w-full sm:w-auto">Login</Button>
          </Link>
          <Link href="/register">
            <Button className="w-full sm:w-auto">Sign Up</Button>
          </Link>
        </div>
      )}
    </div>
  </div>
</header>


      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce">
              <Star className="w-4 h-4" />
              <span>Trusted by 10,000+ users</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your AI-Powered
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                Health Companion
              </span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Empowering underserved communities with accessible healthcare
            information, symptom checking, and local facility finder - all
            <span className="font-semibold text-blue-600"> powered by AI</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center ">
            <Link href={isAuthenticated ? '/dashboard' : '/register'}>
              <Button size="lg" className="w-full sm:w-auto flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-blue-600 hover:shadow-lg">
                Learn More
              </Button>
            </Link>
          </div>

      
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white/50 backdrop-blur-sm py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center ">
            <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4 " />
              <span>Comprehensive Healthcare Tools</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                Better Health
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 ">
              Comprehensive healthcare tools designed specifically for your community&apos;s needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index}
                  className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-200 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                  
                  {/* Icon with gradient background */}
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-blue-600 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Hover effect border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-300"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-400 py-24 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <div className="mb-8">
            <Heart className="w-16 h-16 text-blue-200 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Take Control of
              <span className="block text-blue-200">Your Health?</span>
            </h2>
          </div>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed">
            Join thousands of users who are already using our platform to stay
            healthy and connected with their community
          </p>
          
          <Link href={isAuthenticated ? '/dashboard' : '/register'}>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center space-x-3 mx-auto"
            >
              <span>Start Your Health Journey</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="mt-8 text-blue-200 text-sm">
            ✓ Free to get started  ✓ No credit card required  ✓ 24/7 support
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8 group">
              <div className="relative">
                <Heart className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-200" />
                <div className="absolute -inset-1 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                HealthCare+
              </span>
            </div>
            
            <div className="border-t border-gray-700 pt-8">
              <p className="text-gray-400 text-lg">
                © 2024 HealthCare+. Making healthcare accessible for everyone.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Empowering communities • Building healthier futures • One person at a time
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}