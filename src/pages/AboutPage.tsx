import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Github, Linkedin, Mail, Award, Shield, Users, Zap, Trophy, Brain, Sparkles, Globe, BarChart2, MessageSquare, Clock, CheckCircle } from 'lucide-react';

const teamMembers = [
  {
    name: 'Alex Johnson',
    role: 'Founder & CEO',
    bio: 'Debate champion with 10+ years of experience in competitive debating and education.',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    social: { linkedin: '#', twitter: '#' }
  },
  {
    name: 'Sarah Chen',
    role: 'Lead Developer',
    bio: 'Full-stack developer passionate about creating seamless user experiences.',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    social: { linkedin: '#', github: '#' }
  },
  {
    name: 'Michael Rodriguez',
    role: 'AI/ML Engineer',
    bio: 'Specializes in natural language processing and machine learning models.',
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    social: { linkedin: '#', github: '#' }
  }
];

const stats = [
  { value: '10,000+', label: 'Active Users', icon: Users },
  { value: '50+', label: 'Countries', icon: Globe },
  { value: '1M+', label: 'Debates Hosted', icon: MessageSquare },
  { value: '95%', label: 'Satisfaction Rate', icon: CheckCircle }
];

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
              <Link
                to="/auth/register"
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Join Now - It's Free
              </Link>
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

      {/* Stats Section */}
      <section className="py-16 bg-secondary/5 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-secondary dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
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

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-white mb-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold mb-4"
            >
              Ready to Join the Debate?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-lg mb-8 text-primary-100"
            >
              Join thousands of critical thinkers and start improving your debate skills today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/auth/register"
                className="px-6 py-3 bg-white text-primary hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Get Started for Free
              </Link>
              <Link
                to="/features"
                className="px-6 py-3 border border-white/20 hover:bg-white/10 rounded-lg font-medium transition-colors"
              >
                Learn More
              </Link>
            </motion.div>
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

        {/* Final CTA */}
        <section className="text-center py-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Ready to Start Debating?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-lg text-secondary dark:text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of debaters who are already improving their skills on our platform.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/auth/register"
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              Get Started for Free
            </Link>
            <Link
              to="/features"
              className="px-6 py-3 border border-primary text-primary hover:bg-primary/5 rounded-lg font-medium transition-colors"
            >
              Learn More
            </Link>
          </motion.div>
        </section>
      </main>
      
      {/* Meet the Developer Section */}
      <section className="bg-secondary/5 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row">
              {/* Developer Image */}
              <div className="md:w-1/2 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <img 
                  src="/me.png" 
                  alt="Sid - Developer" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Developer Info */}
              <div className="md:w-1/2 p-8 md:p-12">
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
                      href="https://github.com/sidwebworks" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                      aria-label="GitHub"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                    <a 
                      href="https://linkedin.com/in/sidwebworks" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a 
                      href="mailto:sidwebworks@gmail.com" 
                      className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                      aria-label="Email"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default AboutPage; 