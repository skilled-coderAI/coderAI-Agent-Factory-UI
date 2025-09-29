import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { CreateAgent } from '@/pages/CreateAgent';
import { AgentDetails } from '@/pages/AgentDetails';
import { Analytics } from '@/pages/Analytics';
import { Templates } from '@/pages/Templates';
import CreateTeamAgent from '@/pages/CreateTeamAgent';
import { DeepAgents } from '@/pages/DeepAgents';
import { SemanticAgents } from '@/pages/SemanticAgents';
import { TodoPlanner } from '@/pages/TodoPlanner';
import { DocumentUpload } from '@/pages/DocumentUpload';
import { AutonomousFactory } from '@/pages/AutonomousFactory';

function App() {
  return (
    <Router>
      <div className="min-h-full">
        <Sidebar />
        <div className="md:pl-64 flex flex-col flex-1">
          <Header />
          <main className="flex-1 pb-8">
            <div className="mt-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/create-agent" element={<CreateAgent />} />
                <Route path="/agent/:id" element={<AgentDetails />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/teams/create" element={<CreateTeamAgent />} />
                <Route path="/deep-agents" element={<DeepAgents />} />
                <Route path="/semantic-agents" element={<SemanticAgents />} />
                <Route path="/todo-planner" element={<TodoPlanner />} />
                <Route path="/document-upload" element={<DocumentUpload />} />
                <Route path="/autonomous-factory" element={<AutonomousFactory />} />
              </Routes>
            </div>
          </main>
        </div>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;