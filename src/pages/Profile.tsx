import { motion } from 'framer-motion';
import {
  User,
  Zap,
  TrendingUp,
  Clock,
  CreditCard,
  Gift,
  Settings,
  LogOut,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Layout from '@/components/Layout';
import { useStore } from '@/store';

export default function Profile() {
  const { sidebarCollapsed, user, isLoggedIn, usageStats } = useStore();

  // 模拟用户数据
  const mockUser = {
    name: 'Excel用户',
    email: 'user@example.com',
    plan: 'free',
    credits: 100,
    avatar: null,
  };

  const displayUser = user || mockUser;

  return (
    <Layout>
      <Sidebar />
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="p-8">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">个人中心</h1>
                <p className="text-white/60">管理账户信息和使用统计</p>
              </div>
            </div>
          </motion.div>

          {/* 用户信息卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-6"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{displayUser.name}</h2>
                <p className="text-white/60">{displayUser.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 text-sm">
                    {displayUser.plan === 'free' ? '免费版' : '会员版'}
                  </span>
                  <span className="text-white/70">
                    余额: {displayUser.credits} AI电量
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary">充值</button>
                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Settings className="w-5 h-5 text-white/70" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* 使用统计 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent-500/20">
                  <Zap className="w-6 h-6 text-accent-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">今日使用</p>
                  <p className="text-2xl font-bold text-white">{usageStats.today}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary-500/20">
                  <TrendingUp className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">本月使用</p>
                  <p className="text-2xl font-bold text-white">{usageStats.thisMonth}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">累计使用</p>
                  <p className="text-2xl font-bold text-white">{usageStats.total}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 功能统计 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* 各功能使用统计 */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">功能使用统计</h3>
              <div className="space-y-3">
                {[
                  { name: '智能函数', count: 45, color: 'from-blue-500 to-cyan-500' },
                  { name: '公式工具', count: 32, color: 'from-purple-500 to-pink-500' },
                  { name: '数据处理', count: 28, color: 'from-green-500 to-emerald-500' },
                  { name: '代码助手', count: 15, color: 'from-orange-500 to-yellow-500' },
                  { name: '创意工具', count: 10, color: 'from-red-500 to-rose-500' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`} />
                    <span className="text-white/70 flex-1">{item.name}</span>
                    <span className="text-white font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">快捷操作</h3>
              <div className="space-y-3">
                <button className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-accent-400" />
                  <span className="text-white">充值AI电量</span>
                </button>
                <button className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-3">
                  <Gift className="w-5 h-5 text-primary-400" />
                  <span className="text-white">分享计划</span>
                </button>
                <button className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span className="text-white">账户设置</span>
                </button>
                <button className="w-full p-4 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-400" />
                  <span className="text-white">退出登录</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
}