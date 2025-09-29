import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Bell, User, Zap } from "lucide-react";

export function Header() {
  return (
    <header className="glass border-b border-slate-800 px-6 py-4 sticky top-0 z-50 vibe-bg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg group-hover:from-blue-400 group-hover:to-purple-500 transition-all duration-300 animate-pulse neon-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold gradient-text animate-pulse">
                CoderAI
              </span>
              <div className="text-xs text-slate-300 gradient-text-subtle">
                Agent Factory v3.0
              </div>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/create-agent">
            <Button className="btn-vibe shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
          </Link>
          
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300 rounded-full p-2">
            <Bell className="w-5 h-5 wave-animation" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300 rounded-full p-2">
            <User className="w-5 h-5 wave-animation" />
          </Button>
        </div>
      </div>
    </header>
  );
}