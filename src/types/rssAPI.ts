interface RSSItemShort {
  uid: string;
  url: string;
}

interface RSSItemLong extends RSSItemShort {
  title: string;
  lastBuildDate: string;
  isLoading: boolean;
  hasError: boolean;
  articles: unknown[];
}

export interface RSSItems<T extends boolean> {
  [key: string]: RSSItems<T> | T extends true ? RSSItemShort : RSSItemLong;
}

export interface AutoDownloadingRule {
  /** Whether the rule is enabled */
  enabled: boolean;
  /** The substring that the torrent name must contain */
  mustContain: string;
  /** The substring that the torrent name must not contain */
  mustNotContain: string;
  /** Enable regex mode in "mustContain" and "mustNotContain" */
  useRegex: boolean;
  /** Episode filter definition */
  episodeFilter: string;
  /** Enable smart episode filter */
  smartFilter: boolean;
  /** The list of episode IDs already matched by smart filter */
  previouslyMatchedEpisodes: string[];
  /** The feed URLs the rule applied to */
  affectedFeeds: string[];
  /** Ignore sunsequent rule matches */
  ignoreDays: number;
  /** The rule last match time */
  lastMatch: string;
  /** Add matched torrent in paused mode */
  addPaused: boolean;
  /** Assign category to the torrent */
  assignedCategory: string;
  /** Save torrent to the given directory */
  savePath: string;
}
