
import { motion } from "framer-motion";
import ChatBot from "@/components/ChatBot";

const Index = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-b from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-8"
      >
        <motion.div 
          className="inline-block mb-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-800 dark:text-blue-200 text-xs font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          AI Assistant
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          Minimalist Chat
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          A beautifully designed conversational interface
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="w-full max-w-4xl"
      >
        <ChatBot initialMessage="Hello! I'm your minimalist assistant. How can I help you today?" />
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-6 text-sm text-gray-500 dark:text-gray-400"
      >
        Try asking a question to see a response.
      </motion.p>
    </div>
  );
};

export default Index;
