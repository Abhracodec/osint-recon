import { useParams } from "react-router-dom";
import { Shield, Globe, Server, Key } from "lucide-react";
import { useEffect, useState } from "react";

type Summary = {
  totalFindings: number;
  severityCounts: { Low: number; Medium: number; High: number; Critical: number };
};

type Subdomain = { subdomain: string; source: string; ips: string[] };

type Certificate = {
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  sans: string[];
};

type Tech = { name: string; category: string; confidence: number };

type Finding = {
  id?: string;
  title?: string;
  description?: string;
  severity?: "Low" | "Medium" | "High" | "Critical";
  confidence?: number;
  source?: string;
  timestamp?: string;
  url?: string;
};

type ScanData = {
  summary: Summary;
  subdomains: Subdomain[];
  certificates: Certificate[];
  techstack: Tech[];
  findings: Finding[];
};

export default function Results() {
  const { jobId } = useParams();
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let mounted = true;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ fixed endpoint
        const res = await fetch(`/api/scan/${jobId}/results`);
        if (!res.ok) throw new Error(`Backend returned ${res.status}`);
        const json = (await res.json()) as ScanData;
        if (mounted) setScanData(json);
      } catch (err: any) {
        if (mounted) {
          console.error("Scan fetch error:", err);
          setError("Failed to fetch scan results");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchResults();
    return () => {
      mounted = false;
    };
  }, [jobId]);

  const severityClass = (sev?: string) => {
    switch (sev) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      case "Critical":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Scan Results</h2>
        <p className="text-gray-600">Job ID: {jobId}</p>
        {loading && <p className="text-sm text-gray-500 mt-1">Loading results…</p>}
        {error && <p className="text-sm text-red-600 mt-1">Error: {error}</p>}
      </div>

      {scanData ? (
        <>
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard label="Total Findings" value={scanData.summary.totalFindings} color="text-blue-600" />
              <SummaryCard label="Medium Risk" value={scanData.summary.severityCounts.Medium} color="text-yellow-600" />
              <SummaryCard label="High Risk" value={scanData.summary.severityCounts.High} color="text-red-600" />
              <SummaryCard label="Subdomains" value={scanData.subdomains.length} color="text-green-600" />
            </div>
          </div>

          {/* Subdomains */}
          <Section title="Subdomains" icon={<Globe className="h-5 w-5 text-blue-600" />}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Subdomain</th>
                  <th className="text-left py-2">Source</th>
                  <th className="text-left py-2">IP Addresses</th>
                </tr>
              </thead>
              <tbody>
                {scanData.subdomains.map((s, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 font-mono">{s.subdomain}</td>
                    <td className="py-2">{s.source}</td>
                    <td className="py-2 font-mono">{s.ips.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Tech stack */}
          <Section title="Technology Stack" icon={<Server className="h-5 w-5 text-green-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scanData.techstack.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-gray-600">{t.category}</div>
                  </div>
                  <div className="text-sm font-medium text-blue-600">{t.confidence}%</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Certificates */}
          <Section title="SSL Certificates" icon={<Key className="h-5 w-5 text-purple-600" />}>
            {scanData.certificates.map((c, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-md mb-4 text-sm">
                <div>Issuer: {c.issuer}</div>
                <div>Subject: {c.subject}</div>
                <div>Valid From: {c.validFrom}</div>
                <div>Valid To: {c.validTo}</div>
                <div>SANs: {c.sans.join(", ")}</div>
              </div>
            ))}
          </Section>

          {/* Findings */}
          <Section title="Security Findings" icon={<Shield className="h-5 w-5 text-red-600" />}>
            {scanData.findings.length > 0 ? (
              scanData.findings.map((f, i) => (
                <div key={f.id || i} className="p-4 border border-gray-200 rounded-md mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{f.title || f.url || `Finding ${i + 1}`}</h4>
                    {f.severity && (
                      <span className={`px-2 py-1 text-xs rounded-full ${severityClass(f.severity)}`}>{f.severity}</span>
                    )}
                  </div>
                  {f.url && (
                    <div className="mt-1">
                      <a href={f.url} target="_blank" rel="noreferrer" className="text-indigo-600 underline">
                        {f.url}
                      </a>
                    </div>
                  )}
                  {f.description && <p className="text-sm text-gray-600 mt-1">{f.description}</p>}
                  <div className="text-xs text-gray-500 mt-2">
                    {f.confidence != null && `Confidence: ${f.confidence}% • `} {f.source}{" "}
                    {f.timestamp && `• ${new Date(f.timestamp).toLocaleString()}`}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No findings available.</p>
            )}
          </Section>
        </>
      ) : (
        <p className="text-sm text-gray-500">No results available yet. Please wait for the scan to finish.</p>
      )}
    </div>
  );
}

// Small helper components
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
