import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { MessageCircle, Linkedin, Mail, Award, Shield, Users, Zap, Trophy, Brain, Sparkles, Globe, BarChart2, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';


const features = [
  {
    icon: <Brain className="w-8 h-8 text-primary" />,
    title: 'AI-Powered Feedback',
    description: 'Get instant, detailed feedback on your arguments and delivery.'
  },
  {
    icon: <Trophy className="w-8 h-8 text-primary" />,
    title: 'Competitive Rankings',
    description: 'Climb the leaderboards and earn recognition for your skills.'
  },
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: 'Flexible Timing',
    description: 'Customizable debate formats to fit your schedule.'
  },
  {
    icon: <BarChart2 className="w-8 h-8 text-primary" />,
    title: 'Performance Analytics',
    description: 'Track your progress and identify areas for improvement.'
  }
];

const AboutPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-950 text-foreground dark:text-gray-200">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-background dark:from-primary/5 dark:to-gray-950 py-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              Debate. Learn. Excel.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-xl text-secondary dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Join a global community of critical thinkers and master the art of persuasion through structured, AI-enhanced debates.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={signInWithGoogle}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Join Now - It's Free
              </button>
              <Link
                to="/features"
                className="px-6 py-3 border border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/5 rounded-lg font-medium transition-colors"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-20 dark:opacity-5">
          <div className="absolute inset-0 bg-grid-gray-300 dark:bg-grid-gray-800 [mask-image:linear-gradient(0deg,white,transparent_20%)]"></div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-16">
        {/* Mission & Vision */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              Our Mission & Vision
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-secondary dark:text-gray-300"
            >
              We're on a mission to democratize access to high-quality debate education and create a global platform where anyone can develop critical thinking, public speaking, and argumentation skills in a supportive, engaging environment.
            </motion.p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-secondary dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Technologies Section */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Built With Cutting-Edge Technology
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-secondary dark:text-gray-300"
            >
              We leverage the latest technologies to deliver a seamless and powerful debating experience.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {[
              { name: 'React 19', icon: '⚛️' },
              { name: 'TypeScript', icon: '📝' },
              { name: 'Vite', icon: '⚡' },
              { name: 'Tailwind CSS', icon: '🎨' },
              { name: 'Firebase', icon: '🔥' },
              { name: 'Google Gemini AI', icon: '🤖' },
              { name: 'Framer Motion', icon: '🎬' },
              { name: 'Zustand', icon: '🔄' },
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.05 * index, duration: 0.3 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
              >
                <span className="text-3xl mb-2">{tech.icon}</span>
                <span className="font-medium">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How Ratings Are Calculated Section */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              How Ratings Are Calculated
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg text-secondary dark:text-gray-300"
            >
              Our platform uses a modified Elo rating system, similar to what's used in chess, to quantify your debate skills. Here's a simplified breakdown.
            </motion.p>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 text-left">
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-bold mb-3 text-primary">The Core Idea</h3>
              <p className="text-secondary dark:text-gray-300">
                Your rating changes based on the outcome of your debates. Winning increases your rating, while losing decreases it. The magnitude of the change depends on the rating difference between you and your opponent.
              </p>
            </motion.div>
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-bold mb-3 text-primary">Expected Outcome</h3>
              <p className="text-secondary dark:text-gray-300">
                The system calculates an "expected score" for each player. If you have a much higher rating, you're expected to win. Beating a much stronger opponent will earn you significantly more points than beating a weaker one.
              </p>
            </motion.div>
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-3 text-primary">The Formula</h3>
              <p className="text-secondary dark:text-gray-300 mb-2">
                The change in your rating is calculated using the following formula:
              </p>
              <code className="text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded-md block text-center">
                New Rating = Old Rating + K × (Actual Score - Expected Score)
              </code>
              <p className="text-sm text-secondary dark:text-gray-400 mt-2">
                Where <strong>K</strong> is a constant (32 in our case) that determines rating volatility, <strong>Actual Score</strong> is 1 for a win, 0.5 for a draw, and 0 for a loss, and <strong>Expected Score</strong> is based on the rating difference.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      
      {/* Meet the Developer Section */}
      <section className="bg-secondary/5 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-8 md:p-12">
              <motion.h2 
                className="text-3xl font-bold mb-4 text-gray-900 dark:text-white"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Meet the Developer
              </motion.h2>
              
              <motion.div 
                className="prose prose-gray dark:prose-invert max-w-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <p className="text-lg mb-4">
                  Hello! I'm Sid, the creator of Debattle. I'm passionate about building impactful, user-friendly web applications that empower people to learn, grow, and connect through meaningful discussions.
                </p>
                <p className="mb-6">
                  With a background in both technology and debate, I wanted to create a platform that combines the best of both worlds - leveraging AI to help people improve their critical thinking and communication skills in a fun, engaging way.
                </p>
                
                <div className="flex space-x-4 mt-8">
                  <a 
                    href="https://www.linkedin.com/in/siddharth-brijesh-tripathi/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a 
                    href="mailto:sid.dev.2006@gmail.com" 
                    className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default AboutPage; 