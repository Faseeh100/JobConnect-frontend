import Link from 'next/link';
import { MoveRight, Sparkles, TrendingUp, Users, Briefcase, Star, Award } from 'lucide-react';

export default function Main() {
  return (
    <main className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow animate-delay-1000" />
        <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow animate-delay-500" />
        <div className="absolute top-2/3 right-1/4 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow animate-delay-1500" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px),
                             linear-gradient(to bottom, #fff 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }} />
        </div>
      </div>

      {/* Floating Icons */}
      <div className="absolute top-20 left-10 animate-float-slow">
        <Briefcase className="w-8 h-8 text-blue-400/30" />
      </div>
      <div className="absolute top-40 right-20 animate-float-slow animate-delay-300">
        <Star className="w-6 h-6 text-purple-400/30" />
      </div>
      <div className="absolute bottom-40 left-1/8 animate-float-slow animate-delay-500">
        <Award className="w-7 h-7 text-cyan-400/30" />
      </div>

      <div className="relative z-10 cursor-pointer container mx-auto px-4 py-20 md:py-32 flex flex-col items-center justify-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">Trusted by 10,000+ companies</span>
          <TrendingUp className="w-4 h-4 text-blue-400 ml-2" />
        </div>

        {/* Main Heading */}
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight">
            <span className="bg-linear-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent animate-gradient">
              Find Your Dream
            </span>
            <br />
            <span className="text-white mt-2 md:mt-4 block">
              Job <span className="relative inline-block">
                Opportunity
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-transparent rounded-full animate-underline"></span>
              </span>
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="mt-6 md:mt-8 text-lg md:text-xl lg:text-2xl text-gray-300 text-center max-w-2xl md:max-w-3xl leading-relaxed animate-fade-in-up animate-delay-100">
          Discover thousands of curated job opportunities from top companies.
          <span className="block text-blue-300 font-medium mt-2 md:mt-3">
            Your next career move starts here
          </span>
        </p>

        {/* Stats */}
        <div className="mt-10 md:mt-12 flex flex-wrap justify-center gap-6 md:gap-12 lg:gap-16 animate-fade-in-up animate-delay-200">
          <div className="text-center group transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">15K+</span>
            </div>
            <p className="text-gray-400 text-sm md:text-base mt-1 md:mt-2">Active Jobs</p>
          </div>
          <div className="text-center group transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">50K+</span>
            </div>
            <p className="text-gray-400 text-sm md:text-base mt-1 md:mt-2">Successful Hires</p>
          </div>
          <div className="text-center group transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">95%</span>
            </div>
            <p className="text-gray-400 text-sm md:text-base mt-1 md:mt-2">Satisfaction Rate</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-10 md:mt-12 animate-fade-in-up animate-delay-300">
          <Link href="/postings">
            <button className="group relative px-8 py-3 md:px-10 md:py-4 bg-linear-to-r from-blue-600 via-blue-500 to-indigo-600 text-white rounded-xl md:rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 hover:from-blue-500 hover:to-indigo-500 flex items-center justify-center gap-2 md:gap-3 cursor-pointer overflow-hidden">
              <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span className="text-base md:text-lg font-semibold tracking-wide relative z-10">
                Explore All Jobs
              </span>
              <MoveRight className="w-4 h-4 md:w-5 md:h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
          
          {/* Secondary CTA */}
          <div className="mt-4 text-center">
            <Link href="/register" className="text-sm text-gray-400 hover:text-blue-300 transition-colors duration-300">
              Create free account →
            </Link>
          </div>
        </div>

        {/* Trusted Companies */}
        <div className="mt-16 md:mt-20 animate-fade-in-up animate-delay-400">
          <p className="text-gray-400 text-center mb-4 md:mb-6 text-sm md:text-base">
            Trusted by industry leaders worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 lg:gap-8">
            {[
              { name: 'Google', color: 'text-red-400' },
              { name: 'Microsoft', color: 'text-blue-400' },
              { name: 'Amazon', color: 'text-yellow-400' },
              { name: 'Apple', color: 'text-gray-300' },
              { name: 'Netflix', color: 'text-red-500' },
              { name: 'Meta', color: 'text-blue-300' },
            ].map((company) => (
              <div 
                key={company.name} 
                className={`${company.color} font-semibold text-base md:text-lg hover:scale-110 transition-all duration-300 cursor-pointer px-3 py-2 rounded-lg hover:bg-white/5`}
              >
                {company.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center text-gray-400">
          {/* <span className="text-sm mb-1">Scroll</span> */}
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </div>
    </main>
  );
}