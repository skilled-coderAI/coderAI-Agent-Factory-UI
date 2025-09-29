import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  PlusCircle, 
  Users, 
  Zap, 
  FileText, 
  Settings, 
  Database,
  Bot,
  Brain,
  Workflow,
  Cloud,
  MessageSquare,
  History,
  Factory
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Create Agent', href: '/create-agent', icon: PlusCircle },
    { name: 'Agent Teams', href: '/teams/create', icon: Users },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Deep Agents', href: '/deep-agents', icon: Brain },
    { name: 'Semantic Agents', href: '/semantic-agents', icon: Bot },
    { name: 'Todo Planner', href: '/todo-planner', icon: Workflow },
    { name: 'Document Upload', href: '/document-upload', icon: FileText },
    { name: 'Autonomous Factory', href: '/autonomous-factory', icon: Factory },
    { name: 'Analytics', href: '/analytics', icon: Database },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-1 min-h-0 bg-slate-900/80 border-r border-slate-800 vibe-bg-dark backdrop-blur-lg">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Bot className="w-8 h-8 text-blue-400 animate-bounce" />
            <span className="ml-2 text-2xl font-bold gradient-text">CoderAI</span>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white border-r-2 border-blue-400'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  } group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 glass-hover`}
                >
                  <Icon
                    className={`${
                      isActive ? 'text-blue-400 animate-pulse' : 'text-slate-400 group-hover:text-slate-300'
                    } mr-3 flex-shrink-0 h-5 w-5 transition-all duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-shrink-0 p-4 border-t border-slate-800">
          <Link
            to="/settings"
            className="flex-shrink-0 block w-full group"
          >
            <div className="flex items-center p-3 rounded-lg hover:bg-slate-800/50 transition-all duration-300">
              <div className="bg-slate-700 p-2 rounded-lg group-hover:bg-slate-600 transition-all duration-300">
                <Settings className="h-5 w-5 text-slate-400 group-hover:text-slate-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-300">Settings</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}