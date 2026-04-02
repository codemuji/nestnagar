import React from 'react';
import { Home } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle, illustration }) => {
  return (
    <main className="relative min-h-screen flex flex-col md:flex-row overflow-hidden bg-brand-background">
      {/* Left Side: Visual Anchor (Hidden on small mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-border-light overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="NestNagar Heritage" 
            className="w-full h-full object-cover grayscale-[20%] contrast-[1.1]" 
            src={illustration || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Home size={32} />
              <span className="text-2xl font-headings font-bold tracking-tighter">NestNagar</span>
            </div>
            <h1 className="text-5xl font-headings font-semibold leading-tight max-w-md">
              Find your place in the modern landscape.
            </h1>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl max-w-sm text-brand-primary border border-white/20">
            <p className="text-xs font-medium mb-2 opacity-80 uppercase tracking-widest">Curated Experience</p>
            <p className="italic leading-relaxed">
              "NestNagar transformed how I view urban living. Every home feels like an architectural masterpiece."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-accent"></div>
              <div>
                <p className="font-bold text-sm">Elena Rodriguez</p>
                <p className="text-xs opacity-60">Architectural Consultant</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 bg-brand-background z-10">
        {/* Mobile Header */}
        <div className="lg:hidden w-full max-w-md mb-12 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Home className="text-brand-secondary" size={24} />
            <span className="text-xl font-headings font-bold tracking-tighter text-brand-primary">NestNagar</span>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-headings font-bold text-brand-primary tracking-tight mb-3">
              {title}
            </h2>
            <p className="text-text-secondary font-sans">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
