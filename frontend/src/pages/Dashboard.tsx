import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ScanStatus {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting';
  progress?: number; // 0–100, optional from backend
  currentModule?: string;
  completedModules?: string[];
  totalModules?: number;
  startedAt?: string;
  logs?: string[];
}

export default function Dashboard() {
  const { jobId } = useParams<{ jobId: string }>();

  console.log('Dashboard component rendered with jobId:', jobId);

  // Simple fallback to ensure something always renders
  if (!jobId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800">Error: No Job ID</h2>
          <p className="text-red-700">No job ID found in URL. Please start a scan first.</p>
        </div>
      </div>
    );
  }

  const { data, isLoading, isError, error } = useQuery<ScanStatus>({
    queryKey: ['scanStatus', jobId],
    queryFn: async () => {
      console.log('Fetching status for jobId:', jobId);
      const res = await axios.get(`/api/scan/${jobId}/status`);
      console.log('Backend response:', res.data);
      // Backend returns nested structure: { status: { jobId, status, progress, ... } }
      const statusData = res.data.status;
      console.log('Extracted status data:', statusData);
      return statusData;
    },
    enabled: !!jobId, // only run if jobId is present
    refetchInterval: 2000, // poll every 2s for faster updates
  });

  console.log('Query state:', { data, isLoading, isError, error });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-800">Loading...</h2>
          <p className="text-blue-700">Fetching scan status for job: {jobId}</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    console.error('Dashboard error:', error);
    console.error('Data:', data);
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800">Error Loading Dashboard</h2>
          <p className="text-red-700">Failed to fetch scan status for job: {jobId}</p>
          {error && (
            <div className="mt-2 p-2 bg-red-100 rounded text-sm">
              <strong>Error Details:</strong> {error.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  const { status, progress = 0, currentModule, completedModules = [], totalModules = 0 } = data;

  console.log('Dashboard rendering with data:', { status, progress, currentModule, completedModules, totalModules });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Scan Dashboard</h2>
        <p className="text-gray-600">Job ID: {jobId}</p>
        <p className="text-sm text-gray-500">Status: {status}</p>
        <p className="text-xs text-green-600">✅ Dashboard component loaded successfully!</p>
      </div>

      {/* Simple status display for debugging */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Debug Info</h3>
        <div className="space-y-2 text-sm">
          <div>Status: {status}</div>
          <div>Progress: {progress}%</div>
          <div>Current Module: {currentModule || 'None'}</div>
          <div>Completed Modules: {completedModules.length}</div>
          <div>Total Modules: {totalModules}</div>
          <div>Started At: {data.startedAt ? new Date(data.startedAt).toLocaleString() : 'Unknown'}</div>
          <div>Logs Count: {data.logs?.length || 0}</div>
        </div>
        
        {/* Manual refresh button */}
        <div className="mt-4">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Status
          </button>
        </div>
      </div>

      {/* Show results if available */}
      {status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Scan Complete!</h3>
          <p className="text-green-700 mb-4">Your reconnaissance scan has finished successfully.</p>
          <a 
            href={`/results/${jobId}`}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 inline-block"
          >
            View Detailed Results
          </a>
        </div>
      )}

      {/* Show running status with progress */}
      {(status === 'running' || status === 'waiting') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Scan in Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {progress}%</span>
              <span>Module: {currentModule}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-blue-700">
              Completed: {completedModules.length}/{totalModules} modules
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
