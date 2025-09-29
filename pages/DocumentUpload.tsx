import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Users,
  Loader2,
  Download,
  Trash2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ProcessingJob {
  job_id: string;
  filename: string;
  document_type: string;
  status: string;
  processing_stage: string;
  file_size: number;
  created_at: string;
  team_created?: boolean;
  team_details?: {
    agents: Array<{
      name: string;
      type: string;
      role: string;
    }>;
  };
  extracted_requirements?: string[];
}

export function DocumentUpload() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
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

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('create_team', 'true');

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 80));
      }, 500);

      const response = await fetch('/api/document-upload/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      const newJob: ProcessingJob = {
        job_id: result.job_id,
        filename: result.filename,
        document_type: result.document_type,
        status: 'processing',
        processing_stage: 'completed',
        file_size: result.file_size,
        created_at: new Date().toISOString(),
        team_created: result.team_created,
        team_details: result.team_details,
        extracted_requirements: result.extracted_requirements
      };

      setProcessingJobs(prev => [newJob, ...prev]);

      toast({
        title: "Upload Successful",
        description: result.message,
      });

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    multiple: false,
    disabled: uploading
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold gradient-text">Document Upload & Processing</h1>
        <p className="text-slate-400 mt-1">
          Upload requirements documents to automatically create agentic teams
        </p>
      </div>

      {/* Upload Area */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            Upload Document
          </CardTitle>
          <CardDescription className="text-slate-400">
            Upload PDF, Word, TXT, or Markdown files containing your requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-blue-400 bg-blue-500/10' 
                : 'border-slate-600 hover:border-slate-500'
              }
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-blue-400 mx-auto animate-spin" />
                <div>
                  <p className="text-white font-medium">Uploading and Processing...</p>
                  <p className="text-slate-400 text-sm">Creating agentic team from requirements</p>
                </div>
                <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                <div>
                  <p className="text-white font-medium">
                    {isDragActive ? 'Drop file here' : 'Drag & drop file here'}
                  </p>
                  <p className="text-slate-400 text-sm">
                    or click to browse (PDF, Word, TXT, Markdown)
                  </p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Jobs */}
      {processingJobs.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Processing History
            </CardTitle>
            <CardDescription className="text-slate-400">
              Your uploaded documents and created agentic teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processingJobs.map((job) => (
                <div key={job.job_id} className="border border-slate-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(job.status)}
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{job.filename}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                          <span>{job.document_type.toUpperCase()}</span>
                          <span>{formatFileSize(job.file_size)}</span>
                          <span>{new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        {/* Requirements Preview */}
                        {job.extracted_requirements && job.extracted_requirements.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-slate-500 mb-2">Extracted Requirements:</p>
                            <div className="space-y-1">
                              {job.extracted_requirements.slice(0, 3).map((req, idx) => (
                                <div key={idx} className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded">
                                  {req.length > 100 ? `${req.substring(0, 100)}...` : req}
                                </div>
                              ))}
                              {job.extracted_requirements.length > 3 && (
                                <div className="text-xs text-slate-500">
                                  +{job.extracted_requirements.length - 3} more requirements
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Team Information */}
                        {job.team_created && job.team_details && (
                          <div className="mt-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400">
                              Agentic team created with {job.team_details.agents?.length || 0} agents
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`
                          ${job.status === 'completed' ? 'border-green-500 text-green-400' : ''}
                          ${job.status === 'processing' ? 'border-blue-500 text-blue-400' : ''}
                          ${job.status === 'failed' ? 'border-red-500 text-red-400' : ''}
                        `}
                      >
                        {job.status}
                      </Badge>
                      
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Download className="w-3 h-3" />
                      </Button>
                      
                      <Button size="sm" variant="outline" className="border-slate-600 text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}