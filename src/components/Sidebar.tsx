import { NavLink } from 'react-router-dom';
import {
  Home,
  FunctionSquare,
  Calculator,
  Database,
  Code,
  Lightbulb,
  User,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/store';

// 导航菜单配置
const menuItems = [
  { path: '/', icon: Home, label: '首页', id: 'home' },
  { path: '/functions', icon: FunctionSquare, label: '智能函数', id: 'functions' },
  { path: '/formula', icon: Calculator, label: '公式工具', id: 'formula' },
  { path: '/data', icon: Database, label: '数据处理', id: 'data' },
  { path: '/code', icon: Code, label: '代码助手', id: 'code' },
  { path: '/creative', icon: Lightbulb, label: '创意工具', id: 'creative' },
  { path: '/history', icon: History, label: '历史记录', id: 'history' },
];

const bottomMenuItems = [
  { path: '/profile', icon: User, label: '个人中心', id: 'profile' },
  { path: '/settings', icon: Settings, label: '系统设置', id: 'settings' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, setActiveMenu } = useStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-primary-950/30 backdrop-blur-xl border-r border-white/10 
        transition-all duration-300 z-40 flex flex-col
        ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo区域 */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent-400" />
            <span className="text-lg font-bold text-white">Excel AI</span>
          </div>
        )}
        {sidebarCollapsed && <Sparkles className="w-6 h-6 text-accent-400 mx-auto" />}
      </div>

      {/* 主导航 */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-1 px-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setActiveMenu(item.id)}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''} ${sidebarCollapsed ? 'justify-center px-2' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* 底部导航 */}
      <div className="py-4 border-t border-white/10">
        <div className="space-y-1 px-2">
          {bottomMenuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setActiveMenu(item.id)}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''} ${sidebarCollapsed ? 'justify-center px-2' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* 折叠按钮 */}
        <button
          onClick={toggleSidebar}
          className={`mt-4 mx-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 
            transition-colors flex items-center justify-center
            ${sidebarCollapsed ? 'w-12' : 'w-full'}`}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5 text-white/70" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-white/70" />
          )}
        </button>
      </div>
    </aside>
  );
}