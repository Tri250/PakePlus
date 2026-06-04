import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FunctionSquare,
  Calculator,
  Database,
  Code,
  Lightbulb,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Layout from '@/components/Layout';
import { useStore } from '@/store';

// 功能模块配置
const features = [
  {
    id: 'functions',
    title: '智能函数',
    description: 'AI驱动的智能函数，批量处理数据更高效',
    icon: FunctionSquare,
    path: '/functions',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'formula',
    title: '公式工具',
    description: '公式释义、改错、生成，让公式不再难懂',
    icon: Calculator,
    path: '/formula',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'data',
    title: '数据处理',
    description: '智能分析、生成数据，洞察数据价值',
    icon: Database,
    path: '/data',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'code',
    title: '代码助手',
    description: 'VBA/Python代码生成，自动化更简单',
    icon: Code,
    path: '/code',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    id: 'creative',
    title: '创意工具',
    description: '图片生成、思维导图、翻译，创意无限',
    icon: Lightbulb,
    path: '/creative',
    color: 'from-red-500 to-rose-500',
  },
];

// 动画配置
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const { sidebarCollapsed, usageStats } = useStore();

  return (
    <Layout>
      <Sidebar />
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="p-8">
          {/* Hero区域 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <Sparkles className="w-12 h-12 text-accent-400 animate-pulse" />
              <div>
                <h1 className="text-4xl font-bold title-gradient mb-2">
                  Excel AI 助手
                </h1>
                <p className="text-white/60 text-lg">
                  让AI为你的Excel工作赋能，效率提升不止一点点
                </p>
              </div>
            </div>
          </motion.div>

          {/* 使用统计卡片 */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent-500/20">
                  <Zap className="w-6 h-6 text-accent-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">今日使用</p>
                  <p className="text-2xl font-bold text-white">{usageStats.today}</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary-500/20">
                  <TrendingUp className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">本月使用</p>
                  <p className="text-2xl font-bold text-white">{usageStats.thisMonth}</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">累计使用</p>
                  <p className="text-2xl font-bold text-white">{usageStats.total}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* 功能模块网格 */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.id} variants={itemVariants}>
                <Link to={feature.path}>
                  <div className="feature-card group">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} 
                        flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 text-sm">{feature.description}</p>
                    <div
                      className={`mt-4 h-1 rounded-full bg-gradient-to-r ${feature.color} 
                        opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* 快速开始提示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-white/50 text-sm">
              点击任意功能卡片开始使用，或使用左侧导航切换模块
            </p>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
}