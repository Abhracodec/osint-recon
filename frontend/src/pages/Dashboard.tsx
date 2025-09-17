import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ScanStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number; // 0–100, optional from backend
  currentTask?: string;
}

export default function Dashboard() {
  const { jobId } = useParams<{ jobId: string }>();

  const { data, isLoading, isError } = useQuery<ScanStatus>(
    ['scanStatus', jobId],
    async () => {
      const res = await axios.get(`/api/scan/${jobId}/status`);
      return res.data;
    },
    {
      enabled: !!jobId, // only run if jobId is present
      refetchInterval: 5000, // poll every 5s
    }
  );

  if (!jobId) {
    return (
      <div className="text-gray-600">
        No job started yet. Please run a scan first.
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-gray-600">Fetching scan status...</div>;
  }

  if (isError || !data) {
    return (
      <div className="flex items-center text-red-600 space-x-2">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to fetch scan status.</span>
      </div>
    );
  }

  const { status, progress = 0, currentTask } = data;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Scan Dashboard</h2>
        <p className="text-gray-600">Job ID: {jobId}</p>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Scan Progress</h3>
          <div className="flex items-center space-x-2">
            {status === 'running' && <Clock className="h-5 w-5 text-blue-500" />}
            {status === 'completed' && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {status === 'failed' && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm font-medium capitalize">{status}</span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 ${
              status === 'completed'
                ? 'bg-green-500'
                : status === 'failed'
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="mt-2 text-sm text-gray-600">{progress}% complete</div>
      </div>

      {/* Current Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Current Activity</h3>
        <div className="space-y-2">
          {currentTask ? (
            <div className="flex items-center space-x-2">
              {status === 'running' ? (
                <Clock className="h-4 w-4 text-blue-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm">{currentTask}</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Waiting for updates from backend...
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-green-800 font-semibold">Scan Complete!</h3>
              <p className="text-green-700 text-sm">
                Your reconnaissance scan has finished successfully.
              </p>
            </div>
            <Link
              to={`/results/${jobId}`}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              View Results
            </Link>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span>Scan failed. Check backend logs for details.</span>
          </div>
        </div>
      )}
    </div>
  );
}
