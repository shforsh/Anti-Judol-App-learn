
export enum SiteStatus {
  ACTIVE = 'active',
  FLAGGED = 'flagged',
  FALSE_POSITIVE = 'false_positive'
}

export interface GamblingSite {
  id: string;
  site_name: string;
  normalized_name: string;
  first_seen: string;
  last_seen: string;
  confidence_score: number;
  status: SiteStatus;
  source_count: number;
  sources: string[];
}

export interface AgentLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface DiscoveryResult {
  sites: Partial<GamblingSite>[];
  logs: string[];
}
