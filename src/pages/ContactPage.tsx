import React, { useEffect } from 'react';

const triangles = [
  { style: 'top-10 left-10 w-24 h-24 opacity-30', rotate: 'rotate-12', delay: 'animate-float-slow' },
  { style: 'top-1/2 left-1/4 w-32 h-32 opacity-20', rotate: '-rotate-6', delay: 'animate-float-medium' },
  { style: 'bottom-20 right-20 w-40 h-40 opacity-25', rotate: 'rotate-45', delay: 'animate-float-fast' },
  { style: 'bottom-10 left-1/2 w-20 h-20 opacity-15', rotate: '-rotate-12', delay: 'animate-float-slow' },
  { style: 'top-1/3 right-10 w-28 h-28 opacity-20', rotate: 'rotate-3', delay: 'animate-float-medium' },
];

const dots = Array.from({ length: 24 }, (_, i) => ({
  top: Math.random() * 90 + '%',
  left: Math.random() * 90 + '%',
  size: Math.random() * 6 + 4,
  opacity: Math.random() * 0.5 + 0.5,
  delay: Math.random() * 2,
}));

const ContactPage: React.FC = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 relative overflow-hidden font-[\'Poppins\'],sans-serif">
      {/* Animated Triangles */}
      {triangles.map((t, i) => (
        <div
          key={i}
          className={`absolute ${t.style} ${t.rotate} ${t.delay} pointer-events-none`}
          style={{ zIndex: 1 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
            <polygon points="50,0 100,100 0,100" fill="#fff" fillOpacity="0.12" />
          </svg>
        </div>
      ))}
      {/* Glowing Dots */}
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            filter: 'blur(1px)',
            zIndex: 2,
            animation: `twinkle 2.5s infinite ${d.delay}s alternate`,
          }}
        />
      ))}
      {/* Contact Form Card */}
      <div className="relative z-10 w-full max-w-md mx-auto p-8 rounded-lg bg-blue-900 border-2 border-blue-400 shadow-xl flex flex-col items-center" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide mb-2 text-center">CONTACT US</h1>
        <p className="text-blue-200 text-sm md:text-base mb-8 text-center">
          Debattle is your platform for intelligent, respectful, and AI-powered debates. We connect passionate minds from around the world to discuss, learn, and grow together.<br className="hidden md:block" />
          Have questions, feedback, or want to partner with us? Reach out below—our team would love to hear from you!
        </p>
        <form
          action="https://formsubmit.co/sid.dev.2006@gmail.com"
          method="POST"
          className="w-full flex flex-col gap-6"
        >
          <input type="hidden" name="_next" value="/thank-you" />
          <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            className="bg-transparent border-0 border-b border-blue-300 focus:border-blue-400 focus:ring-0 text-white placeholder-blue-300 py-2 px-0 outline-none transition-all duration-200 focus:shadow-[0_0_8px_0_#60a5fa]"
            autoComplete="off"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Mail"
            className="bg-transparent border-0 border-b border-blue-300 focus:border-blue-400 focus:ring-0 text-white placeholder-blue-300 py-2 px-0 outline-none transition-all duration-200 focus:shadow-[0_0_8px_0_#60a5fa]"
            autoComplete="off"
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            rows={4}
            className="bg-transparent border-0 border-b border-blue-300 focus:border-blue-400 focus:ring-0 text-white placeholder-blue-300 py-2 px-0 outline-none resize-none transition-all duration-200 focus:shadow-[0_0_8px_0_#60a5fa]"
            required
          />
          <button
            type="submit"
            className="mt-2 w-full flex items-center justify-center gap-2 border border-blue-200 text-white font-semibold py-2 rounded transition-all duration-200 hover:bg-blue-700 hover:border-blue-300 hover:shadow-[0_0_12px_0_#60a5fa] focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            SUBMIT <span className="ml-1">&rarr;</span>
          </button>
        </form>
      </div>
      {/* Custom keyframes for floating and twinkle */}
      <style>{`
        @keyframes float-slow { 0% { transform: translateY(0); } 100% { transform: translateY(-18px); } }
        @keyframes float-medium { 0% { transform: translateY(0); } 100% { transform: translateY(-30px); } }
        @keyframes float-fast { 0% { transform: translateY(0); } 100% { transform: translateY(-12px); } }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite alternate; }
        .animate-float-medium { animation: float-medium 5s ease-in-out infinite alternate; }
        .animate-float-fast { animation: float-fast 3.5s ease-in-out infinite alternate; }
        @keyframes twinkle { 0% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ContactPage; 