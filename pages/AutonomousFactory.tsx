import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  FileText, 
  Users, 
  Play, 
  Package, 
  Cloud, 
  MessageCircle,
  History,
  Database,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function AutonomousFactory() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [solutionId, setSolutionId] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, Word, TXT, or Markdown files only",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    setDocumentFile(file);
    
    // Process document
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/autonomous-factory/process-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Document Processed",
        description: result.message,
      });
      
      setSolutionId(result.solution_id || 'demo-solution-id');
      
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!solutionId) {
      toast({
        title: "No Solution",
        description: "Please process a document first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/autonomous-factory/execute-workflow/demo-team-id`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Workflow execution failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Workflow Executed",
        description: result.message,
      });
      
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateDeliverables = async () => {
    if (!solutionId) {
      toast({
        title: "No Solution",
        description: "Please process a document first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/autonomous-factory/generate-deliverables/demo-workflow-id?team_id=demo-team-id`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Deliverable generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Deliverables Generated",
        description: result.message,
      });
      
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeploySolution = async () => {
    if (!solutionId) {
      toast({
        title: "No Solution",
        description: "Please process a document first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/autonomous-factory/deploy-solution/${solutionId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Deployment failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Solution Deployed",
        description: result.message,
      });
      
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChatMessage = async () => {
    if (!chatMessage.trim()) return;
    if (!solutionId) {
      toast({
        title: "No Solution",
        description: "Please process a document first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/autonomous-factory/chat/${solutionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: chatMessage }),
      });

      if (!response.ok) {
        throw new Error(`Chat failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Response Received",
        description: result.agent_response,
      });
      
      setChatMessage('');
      
    } catch (error) {
      toast({
        title: "Chat Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold gradient-text">Autonomous Agent Factory</h1>
        <p className="text-slate-400 mt-1">
          Upload requirements documents to automatically create agentic teams and deploy complete solutions
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-2">
        <Button
          variant={activeTab === 'upload' ? 'default' : 'outline'}
          className={activeTab === 'upload' ? 'bg-blue-600' : ''}
          onClick={() => setActiveTab('upload')}
        >
          <Upload className="w-4 h-4 mr-2" />
          Document Upload
        </Button>
        <Button
          variant={activeTab === 'workflow' ? 'default' : 'outline'}
          className={activeTab === 'workflow' ? 'bg-blue-600' : ''}
          onClick={() => setActiveTab('workflow')}
        >
          <Play className="w-4 h-4 mr-2" />
          Workflow Execution
        </Button>
        <Button
          variant={activeTab === 'deliverables' ? 'default' : 'outline'}
          className={activeTab === 'deliverables' ? 'bg-blue-600' : ''}
          onClick={() => setActiveTab('deliverables')}
        >
          <Package className="w-4 h-4 mr-2" />
          Deliverables
        </Button>
        <Button
          variant={activeTab === 'deployment' ? 'default' : 'outline'}
          className={activeTab === 'deployment' ? 'bg-blue-600' : ''}
          onClick={() => setActiveTab('deployment')}
        >
          <Cloud className="w-4 h-4 mr-2" />
          Deployment
        </Button>
        <Button
          variant={activeTab === 'chat' ? 'default' : 'outline'}
          className={activeTab === 'chat' ? 'bg-blue-600' : ''}
          onClick={() => setActiveTab('chat')}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'outline'}
          className={activeTab === 'history' ? 'bg-blue-600' : ''}
          onClick={() => setActiveTab('history')}
        >
          <History className="w-4 h-4 mr-2" />
          History
        </Button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'upload' && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Upload Requirements Document
              </CardTitle>
              <CardDescription className="text-slate-400">
                Upload PDF, Word, TXT, or Markdown files containing your project requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                  <Input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.md"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                    className="hidden"
                    id="document-upload"
                  />
                  <label 
                    htmlFor="document-upload" 
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <Upload className="w-12 h-12 text-slate-400" />
                    <div>
                      <p className="text-white font-medium">
                        {documentFile ? documentFile.name : 'Click to upload or drag & drop'}
                      </p>
                      <p className="text-slate-400 text-sm">
                        PDF, Word, TXT, Markdown (Max 10MB)
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-slate-600 text-slate-300"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Choose File'}
                    </Button>
                  </label>
                </div>
                
                {documentFile && (
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Document Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-slate-400">Name:</div>
                      <div className="text-slate-200">{documentFile.name}</div>
                      <div className="text-slate-400">Size:</div>
                      <div className="text-slate-200">{(documentFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      <div className="text-slate-400">Type:</div>
                      <div className="text-slate-200">{documentFile.type}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'workflow' && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-green-400" />
                Workflow Execution
              </CardTitle>
              <CardDescription className="text-slate-400">
                Execute the SDLC workflow for your autonomous agent team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Workflow Status</h3>
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span>Ready to execute</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleExecuteWorkflow}
                  disabled={isProcessing || !solutionId}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? 'Executing Workflow...' : 'Execute SDLC Workflow'}
                </Button>
                
                <div className="text-sm text-slate-400">
                  <p>The workflow will automatically execute these SDLC stages:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Requirements Analysis</li>
                    <li>System Design</li>
                    <li>Implementation</li>
                    <li>Testing</li>
                    <li>Documentation</li>
                    <li>Deployment Planning</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'deliverables' && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Deliverable Generation
              </CardTitle>
              <CardDescription className="text-slate-400">
                Generate code and documentation deliverables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Code Generation
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Production-ready implementation code
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Documentation
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Technical and user documentation
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateDeliverables}
                  disabled={isProcessing || !solutionId}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isProcessing ? 'Generating Deliverables...' : 'Generate Deliverables'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'deployment' && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Cloud className="w-5 h-5 text-cyan-400" />
                Cloud Deployment
              </CardTitle>
              <CardDescription className="text-slate-400">
                Deploy your solution to the cloud autonomously
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-cyan-400">AWS</div>
                    <p className="text-slate-400 text-sm mt-1">Amazon Web Services</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400">Azure</div>
                    <p className="text-slate-400 text-sm mt-1">Microsoft Azure</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">GCP</div>
                    <p className="text-slate-400 text-sm mt-1">Google Cloud</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-400">Self</div>
                    <p className="text-slate-400 text-sm mt-1">Self-hosted</p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleDeploySolution}
                  disabled={isProcessing || !solutionId}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  {isProcessing ? 'Deploying Solution...' : 'Deploy Solution'}
                </Button>
                
                <div className="text-sm text-slate-400">
                  <p>The deployment manager will automatically:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Analyze requirements for optimal deployment target</li>
                    <li>Create deployment configuration</li>
                    <li>Execute deployment process</li>
                    <li>Provide deployment URL and access details</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'chat' && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-pink-400" />
                Chat with Assistant
              </CardTitle>
              <CardDescription className="text-slate-400">
                Ask questions about your solution and get clarifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-lg h-64 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="flex justify-start">
                      <div className="bg-slate-700 p-3 rounded-lg max-w-xs">
                        <p className="text-slate-200 text-sm">Hello! I'm your autonomous assistant. How can I help you with your solution?</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-blue-600 p-3 rounded-lg max-w-xs">
                        <p className="text-white text-sm">Can you explain the architecture decisions?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-slate-700 p-3 rounded-lg max-w-xs">
                        <p className="text-slate-200 text-sm">The architecture was designed using microservices pattern with REST APIs for communication...</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask a question about your solution..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 bg-slate-800 border-slate-700 text-white"
                    rows={2}
                  />
                  <Button 
                    onClick={handleChatMessage}
                    disabled={isProcessing || !solutionId || !chatMessage.trim()}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'history' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-orange-400" />
                  Document History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-white text-sm font-medium">Project Requirements v1</p>
                    <p className="text-slate-400 text-xs">PDF • 2.4 MB • 2 hours ago</p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-white text-sm font-medium">System Design Doc</p>
                    <p className="text-slate-400 text-xs">DOCX • 1.1 MB • 1 day ago</p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-white text-sm font-medium">API Specification</p>
                    <p className="text-slate-400 text-xs">TXT • 0.8 MB • 3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-400" />
                  Solution Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Processing</span>
                      <span className="text-white">85%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-teal-400">12</div>
                      <div className="text-slate-400 text-xs">Agents</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-teal-400">6</div>
                      <div className="text-slate-400 text-xs">Workflows</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-green-400"></div>
                    <div>
                      <p className="text-white text-sm">Solution deployed successfully</p>
                      <p className="text-slate-400 text-xs">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-400"></div>
                    <div>
                      <p className="text-white text-sm">Deliverables generated</p>
                      <p className="text-slate-400 text-xs">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-purple-400"></div>
                    <div>
                      <p className="text-white text-sm">Workflow executed</p>
                      <p className="text-slate-400 text-xs">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}