import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Users, 
  Code, 
  Laptop, 
  Brain, 
  Cpu, 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Globe 
} from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error' | 'loading';
  lastActive: string;
  tasksCompleted: number;
  errorCount: number;
}

interface TeamMemberProps {
  agent: Agent;
  onAssignTask: (agentId: number) => void;
}

const TeamMember: React.FC<TeamMemberProps> = ({ agent, onAssignTask }) => {
  const getRoleIcon = () => {
    switch (agent.type) {
      case 'product_manager': return <User className="w-5 h-5" />;
      case 'frontend_team_lead': return <Laptop className="w-5 h-5" />;
      case 'backend_team_lead': return <Code className="w-5 h-5" />;
      case 'frontend_architect': return <Brain className="w-5 h-5" />;
      case 'backend_architect': return <Cpu className="w-5 h-5" />;
      case 'developer': return <Code className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (agent.status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'loading': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
      <div className="flex items-center space-x-4">
        <div className={getStatusColor() + " w-3 h-3 rounded-full"} />
        <div className="flex items-center space-x-2">
          {getRoleIcon()}
          <span className="font-medium">{agent.name}</span>
        </div>
        <Badge variant="outline">{agent.type.replace('_', ' ')}</Badge>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-slate-400">Tasks: {agent.tasksCompleted}</div>
        {agent.errorCount > 0 && (
          <div className="text-sm text-red-400">Errors: {agent.errorCount}</div>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onAssignTask(agent.id)}
          className="hover:bg-blue-600/20 hover:text-blue-400"
        >
          Assign Task
        </Button>
      </div>
    </div>
  );
};

interface Team {
  id: string;
  name: string;
  description: string;
  productManager: Agent;
  frontendTeamLead: Agent;
  backendTeamLead: Agent;
  frontendArchitect: Agent;
  backendArchitect: Agent;
  developers: Agent[];
  createdAt: Date;
}

interface TeamManagementDashboardProps {
  teamId: string;
  onTaskAssigned?: (agentId: number) => void;
}

const TeamManagementDashboard: React.FC<TeamManagementDashboardProps> = ({ 
  teamId, 
  onTaskAssigned = (agentId) => console.log(`Assign task to agent ${agentId}`) 
}) => {
  // Mock data for team members
  const team: Team = {
    id: teamId,
    name: 'Web Development Team',
    description: 'Full stack web development team with AI capabilities',
    productManager: { 
      id: 1, 
      name: 'Product Manager', 
      type: 'product_manager', 
      status: 'active', 
      lastActive: '2 minutes ago',
      tasksCompleted: 15,
      errorCount: 0
    },
    frontendTeamLead: { 
      id: 2, 
      name: 'Frontend Team Lead', 
      type: 'frontend_team_lead', 
      status: 'active', 
      lastActive: '5 minutes ago',
      tasksCompleted: 22,
      errorCount: 1
    },
    backendTeamLead: { 
      id: 3, 
      name: 'Backend Team Lead', 
      type: 'backend_team_lead', 
      status: 'active', 
      lastActive: '3 minutes ago',
      tasksCompleted: 18,
      errorCount: 0
    },
    frontendArchitect: { 
      id: 4, 
      name: 'Frontend Architect', 
      type: 'frontend_architect', 
      status: 'active', 
      lastActive: '4 minutes ago',
      tasksCompleted: 10,
      errorCount: 0
    },
    backendArchitect: { 
      id: 5, 
      name: 'Backend Architect', 
      type: 'backend_architect', 
      status: 'active', 
      lastActive: '6 minutes ago',
      tasksCompleted: 13,
      errorCount: 2
    },
    developers: [
      { id: 6, name: 'Developer 1', type: 'developer', status: 'active', lastActive: '1 minute ago', tasksCompleted: 5, errorCount: 0 },
      { id: 7, name: 'Developer 2', type: 'developer', status: 'active', lastActive: '2 minutes ago', tasksCompleted: 8, errorCount: 1 },
      { id: 8, name: 'Developer 3', type: 'developer', status: 'inactive', lastActive: '10 minutes ago', tasksCompleted: 12, errorCount: 0 },
      { id: 9, name: 'Developer 4', type: 'developer', status: 'active', lastActive: '3 minutes ago', tasksCompleted: 7, errorCount: 0 },
      { id: 10, name: 'Developer 5', type: 'developer', status: 'active', lastActive: '4 minutes ago', tasksCompleted: 9, errorCount: 0 },
      { id: 11, name: 'Developer 6', type: 'developer', status: 'active', lastActive: '5 minutes ago', tasksCompleted: 6, errorCount: 1 },
      { id: 12, name: 'Developer 7', type: 'developer', status: 'active', lastActive: '2 minutes ago', tasksCompleted: 11, errorCount: 0 },
      { id: 13, name: 'Developer 8', type: 'developer', status: 'inactive', lastActive: '8 minutes ago', tasksCompleted: 4, errorCount: 0 },
      { id: 14, name: 'Developer 9', type: 'developer', status: 'active', lastActive: '1 minute ago', tasksCompleted: 14, errorCount: 0 },
      { id: 15, name: 'Developer 10', type: 'developer', status: 'active', lastActive: '3 minutes ago', tasksCompleted: 10, errorCount: 0 }
    ],
    createdAt: new Date()
  };

  // Get all agents in the team
  const allAgents = [
    team.productManager,
    team.frontendTeamLead,
    team.backendTeamLead,
    team.frontendArchitect,
    team.backendArchitect,
    ...team.developers
  ];

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>{team.name}</span>
          </div>
          <Badge variant="outline">Team ID: {team.id}</Badge>
        </CardTitle>
        <p className="text-slate-400 text-sm">{team.description}</p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-1">
            {allAgents.map((agent) => (
              <TeamMember 
                key={agent.id} 
                agent={agent} 
                onAssignTask={onTaskAssigned} 
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TeamManagementDashboard;