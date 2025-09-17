export type TargetType = 'domain' | 'email' | 'ip' | 'person';
export type ScanScope = 'public-web' | 'subdomains-only' | 'ip-range';
export type RateProfile = 'low' | 'medium' | 'high';
export type ConsentType = 'typed' | 'upload';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ConsentInfo {
  type: ConsentType;
  value: string;
  uploadedFile?: {
    filename: string;
    size: number;
    hash: string;
  };
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface ScanScope {
  type: ScanScope;
  includeSubdomains?: boolean;
  cidrRange?: string;
  maxDepth?: number;
}

export interface ScanRequest {
  target: string;
  targetType: TargetType;
  modules: string[];
  scope: ScanScope;
  consent: ConsentInfo;
  rateProfile: RateProfile;
  enableActiveModules: boolean;
  metadata?: Record<string, unknown>;
}

export interface JobProgress {
  jobId: string;
  status: JobStatus;
  progress: number; // 0-100
  currentModule: string;
  completedModules: string[];
  totalModules: number;
  startedAt: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;
  logs: LogEntry[];
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  module?: string;
  data?: Record<string, unknown>;
}

// Result interfaces
export interface SubdomainResult {
  subdomain: string;
  source: string;
  ips: string[];
  ports?: number[];
  technologies?: string[];
  certificates?: CertificateInfo[];
  lastSeen: string;
}

export interface CertificateInfo {
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  sans: string[];
  fingerprint: string;
}

export interface EmailResult {
  email: string;
  source: string;
  domain: string;
  isPersonal: boolean;
  isRole: boolean;
  confidence: number;
  lastSeen: string;
}

export interface ShodanResult {
  ip: string;
  hostname?: string;
  ports: {
    port: number;
    protocol: string;
    service: string;
    version?: string;
    banner?: string;
    vulnerability?: string[];
  }[];
  organization?: string;
  location?: {
    country: string;
    city: string;
    region: string;
  };
  lastUpdate: string;
}

export interface GitHubResult {
  repository: string;
  filename: string;
  snippet: string; // Redacted snippet
  type: 'api-key' | 'password' | 'private-key' | 'token' | 'secret';
  confidence: number;
  url: string;
  lastCommit: string;
}

export interface TechStackResult {
  domain: string;
  technologies: {
    name: string;
    category: string;
    version?: string;
    confidence: number;
  }[];
  webServer?: string;
  cms?: string;
  programming?: string[];
  analytics?: string[];
  security?: string[];
}

export interface GoogleDorkResult {
  query: string;
  results: {
    title: string;
    url: string;
    snippet: string;
    cacheUrl?: string;
  }[];
}

export interface Finding {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  confidence: number;
  source: string;
  evidence: Record<string, unknown>;
  recommendations: string[];
  references: string[];
  timestamp: string;
}

export interface ScanResults {
  jobId: string;
  target: string;
  targetType: TargetType;
  startedAt: string;
  completedAt: string;
  duration: number; // seconds
  
  summary: {
    totalFindings: number;
    severityCounts: Record<SeverityLevel, number>;
    modulesCovered: string[];
    dataPoints: number;
  };
  
  subdomains: SubdomainResult[];
  emails: EmailResult[];
  shodan: ShodanResult[];
  github: GitHubResult[];
  techstack: TechStackResult[];
  certificates: CertificateInfo[];
  googleDorks: GoogleDorkResult[];
  findings: Finding[];
  recommendations: string[];
  
  metadata: {
    consentHash: string;
    rateProfile: RateProfile;
    activeModulesUsed: boolean;
    totalApiCalls: number;
    costEstimate?: number;
  };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface JobResponse {
  jobId: string;
  statusUrl: string;
  estimatedDuration: number;
}

// Database models
export interface Job {
  id: string;
  target: string;
  targetType: TargetType;
  status: JobStatus;
  progress: number;
  modules: string[];
  enableActiveModules: boolean;
  adminApproved: boolean;
  consentHash: string;
  consentData: ConsentInfo;
  results?: ScanResults;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  userId?: string;
  ipAddress: string;
  userAgent: string;
}

export interface User {
  id: string;
  email?: string;
  role: 'user' | 'admin';
  apiKeyHash?: string;
  rateLimit: number;
  totalScans: number;
  lastScanAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  userId?: string;
  jobId?: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Module configuration
export interface ModuleConfig {
  name: string;
  enabled: boolean;
  requiresConsent: boolean;
  requiresAdminApproval: boolean;
  estimatedDuration: number; // seconds
  dependencies: string[];
  apiKeysRequired: string[];
  rateLimit: {
    requests: number;
    window: number; // seconds
  };
}

// Error types
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ExternalApiError extends Error {
  constructor(
    message: string,
    public service: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ExternalApiError';
  }
}