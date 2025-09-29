import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Bell, User, Zap } from "lucide-react";

export function Header() {
  return (
    <header className="glass border-b border-slate-800 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition-colors">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">
                CoderAI
              </span>
              <div className="text-xs text-slate-400">
                Agent Factory v3.0
              </div>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/create-agent">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
          </Link>
          
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <Bell className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}