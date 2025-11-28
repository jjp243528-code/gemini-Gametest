export interface AdAttribute {
  id: string;
  key: string;   // e.g., "广告类型", "出现位置"
  value: string; // e.g., "激励视频", "结算页"
}

export interface AdGroup {
  id: string;
  name: string; // e.g., "广告策略组 1"
  gameTime?: string; // New field for Game Time/Progress
  attributes: AdAttribute[];
}

export interface GameEntry {
  id: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  gameName: string;
  genre: string;
  duration?: string; // New field for play duration
  
  // Dynamic Ad Modules
  adGroups: AdGroup[];

  notes: string; // General feedback
  aiAnalysis?: string; // Field for Gemini analysis
}

// Type for storing user-defined attribute templates
export type CustomAttributeMap = Record<string, string[]>;

export interface AppSettings {
  enableAutoSave: boolean;
  exportFileName: string;
}