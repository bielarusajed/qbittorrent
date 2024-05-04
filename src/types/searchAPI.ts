export type SearchStatusString = 'Running' | 'Stopped';

export interface SearchStatus {
  id: number;
  status: SearchStatusString;
  total: number;
}

export interface SearchResultItem {
  /** URL of the torrent's description page. */
  descrLink: string;
  /** Name of the file. */
  fileName: string;
  /** Size of the file in Bytes. */
  fileSize: number;
  /** Torrent download link (usually either .torrent file or magnet link). */
  fileUrl: string;
  /** Number of leechers. */
  nbLeechers: number;
  /** Number of seeders. */
  nbSeeders: number;
  /** URL of the torrent site. */
  siteUrl: string;
}

export interface SearchResult {
  /** Array of `result` objects. */
  results: SearchResultItem[];
  /** Current status of the search job (either Running or Stopped). */
  status: SearchStatusString;
  /** Total number of results. If the status is Running this number may continue to increase. */
  total: number;
}

export interface SearchPlugin {
  /** Whether the plugin is enabled. */
  enabled: boolean;
  /** Full name of the plugin. */
  fullName: string;
  /** Short name of the plugin. */
  name: string;
  /** List of category objects. */
  supportedCategories: Array<{ id: string; name: string }>;
  /** URL of the torrent site. */
  url: string;
  /** Installed version of the plugin. */
  version: string;
}
