import { Shield, AlertTriangle } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OSINT Recon</h1>
              <p className="text-sm text-gray-600">Ethical Reconnaissance Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Authorized Use Only</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Legal Notice:</strong> This tool is for ethical, consensual reconnaissance only. 
            You must have explicit written permission to scan any target. 
            Unauthorized scanning is illegal and unethical.
          </p>
        </div>
      </div>
    </header>
  );
}