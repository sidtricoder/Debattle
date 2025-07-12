import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { MessageSquare, Clock, Users, Target } from 'lucide-react';
import Layout from '../components/layout/Layout';

const DebatePage: React.FC = () => {
  const { id } = useParams();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Debate Room
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Debate ID: {id}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
          >
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Debate Interface Coming Soon
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              This is where the live debate interface will be implemented. It will include 
              real-time messaging, argument submission, AI judging, and more advanced features.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Real-time Chat</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Live messaging system</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">AI Judge</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instant feedback and scoring</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Argument Tracking</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Score and analyze arguments</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Planned Features:</h3>
              <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Real-time debate messaging with typing indicators</li>
                <li>• Argument submission with character limits and timers</li>
                <li>• AI-powered judging and scoring system</li>
                <li>• Live spectator mode with chat</li>
                <li>• Debate timer and round management</li>
                <li>• Post-debate analysis and feedback</li>
                <li>• Rating adjustments based on performance</li>
                <li>• Achievement unlocks and progress tracking</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default DebatePage;
