export interface GetTorrentListOptions {
  filter?: string[];
  category?: string[];
  tags?: string[];
  sort?: string;
  reverse?: boolean;
  limit?: number;
  offset?: number;
  hashes?: string;
}

export interface Torrent {
  /** Time (Unix Epoch) when the torrent was added to the client. */
  added_on: number;
  /** Amount of data left to download (bytes) */
  amount_left: number;
  /** Whether this torrent is managed by Automatic Torrent Management. */
  auto_tmm: boolean;
  /** Percentage of file pieces currently available. */
  availability: number;
  /** Category of the torrent. */
  category: string;
  /** Amount of transfer data completed (bytes) */
  completed: number;
  /** Time (Unix Epoch) when the torrent completed. */
  completion_on: number;
  /** Absolute path of torrent content (root path for multifile torrents, absolute file path for singlefile torrents) */
  content_path: string;
  /** Torrent download speed limit (bytes/s) `-1` if ulimited. */
  dl_limit: number;
  /** Torrent download speed (bytes/s) */
  dlspeed: number;
  /** !UNDOCUMENTED PROPERTY! */
  download_path?: string;
  /** Amount of data downloaded. */
  downloaded: number;
  /** Amount of data downloaded this session. */
  downloaded_session: number;
  /** Torrent ETA (seconds) */
  eta: number;
  /** True if first last piece are prioritized. */
  f_l_piece_prio: boolean;
  /** True if force start is enabled for this torrent. */
  force_start: boolean;
  /** Torrent hash. */
  /** !UNDOCUMENTED PROPERTY! */
  hash?: string;
  /** !UNDOCUMENTED PROPERTY! */
  inactive_seeding_time_limit?: number;
  /** !UNDOCUMENTED PROPERTY! */
  infohash_v1?: string;
  /** !UNDOCUMENTED PROPERTY! */
  infohash_v2?: string;
  /** Last time (Unix Epoch) when a chunk was downloaded/uploaded. */
  last_activity: number;
  /** Magnet URI corresponding to this torrent. */
  magnet_uri: string;
  /** !UNDOCUMENTED PROPERTY! */
  max_inactive_seeding_time?: number;
  /** Maximum share ratio until torrent is stopped from seeding/uploading. */
  max_ratio: number;
  /** Maximum seeding time (seconds) until torrent is stopped from seeding. */
  max_seeding_time: number;
  /** Torrent name. */
  name: string;
  /** Number of seeds in the swarm. */
  num_complete: number;
  /** Number of leechers in the swarm. */
  num_incomplete: number;
  /** Number of leechers connected to. */
  num_leechs: number;
  /** Number of seeds connected to. */
  num_seeds: number;
  /** Torrent priority. Returns -1 if queuing is disabled or torrent is in seed mode. */
  priority: number;
  /** Torrent progress (percentage/100) */
  progress: number;
  /** Torrent share ratio. Max ratio value: 9999. */
  ratio: number;
  /** TODO (what is different from `max_ratio`?) */
  ratio_limit: number;
  /** Path where this torrent's data is stored. */
  save_path: string;
  /** Torrent elapsed time while complete (seconds) */
  seeding_time: number;
  /** TODO (what is different from `max_seeding_time`?)
   *
   * seeding_time_limit is a per torrent setting, when Automatic Torrent Management is disabled, furthermore then max_seeding_time is set to seeding_time_limit for this torrent. If Automatic Torrent Management is enabled, the value is -2. And if max_seeding_time is unset it have a default value -1. */
  seeding_time_limit: number;
  /** Time (Unix Epoch) when this torrent was last seen complete. */
  seen_complete: number;
  /** True if sequential download is enabled. */
  seq_dl: boolean;
  /** Total size (bytes) of files selected for download. */
  size: number;
  /** Torrent state. */
  state:
    | 'error'
    | 'missingFiles'
    | 'uploading'
    | 'pausedUP'
    | 'queuedUP'
    | 'stalledUP'
    | 'checkingUP'
    | 'forcedUP'
    | 'allocating'
    | 'downloading'
    | 'metaDL'
    | 'pausedDL'
    | 'queuedDL'
    | 'stalledDL'
    | 'checkingDL'
    | 'forcedDL'
    | 'checkingResumeData'
    | 'moving'
    | 'unknown';
  /** True if super seeding is enabled. */
  super_seeding: boolean;
  /** Comma-concatenated tag list of the torrent. */
  tags: string;
  /** Total active time (seconds) */
  time_active: number;
  /** Total size (bytes) of all file in this torrent (including unselected ones) */
  total_size: number;
  /** The first tracker with working status. Returns empty string if no tracker is working. */
  tracker: string;
  /** Torrent upload speed limit (bytes/s) `-1` if ulimited. */
  up_limit: number;
  /** Amount of data uploaded. */
  uploaded: number;
  /** Amount of data uploaded this session. */
  uploaded_session: number;
  /** Torrent upload speed (bytes/s) */
  upspeed: number;
}

export interface TorrentProperties {
  /** Torrent save path. */
  save_path: string;
  /** Torrent creation date (Unix timestamp) */
  creation_date: number;
  /** Torrent piece size (bytes) */
  piece_size: number;
  /** Torrent comment. */
  comment: string;
  /** Total data wasted for torrent (bytes) */
  total_wasted: number;
  /** Total data uploaded for torrent (bytes) */
  total_uploaded: number;
  /** Total data uploaded this session (bytes) */
  total_uploaded_session: number;
  /** Total data downloaded for torrent (bytes) */
  total_downloaded: number;
  /** Total data downloaded this session (bytes) */
  total_downloaded_session: number;
  /** Torrent upload limit (bytes/s) */
  up_limit: number;
  /** Torrent download limit (bytes/s) */
  dl_limit: number;
  /** Torrent elapsed time (seconds) */
  time_elapsed: number;
  /** Torrent elapsed time while complete (seconds) */
  seeding_time: number;
  /** Torrent connection count. */
  nb_connections: number;
  /** Torrent connection count limit. */
  nb_connections_limit: number;
  /** Torrent share ratio. */
  share_ratio: number;
  /** When this torrent was added (unix timestamp) */
  addition_date: number;
  /** Torrent completion date (unix timestamp) */
  completion_date: number;
  /** Torrent creator. */
  created_by: string;
  /** Torrent average download speed (bytes/second) */
  dl_speed_avg: number;
  /** Torrent download speed (bytes/second) */
  dl_speed: number;
  /** Torrent ETA (seconds) */
  eta: number;
  /** Last seen complete date (unix timestamp) */
  last_seen: number;
  /** Number of peers connected to. */
  peers: number;
  /** Number of peers in the swarm. */
  peers_total: number;
  /** Number of pieces owned. */
  pieces_have: number;
  /** Number of pieces of the torrent. */
  pieces_num: number;
  /** Number of seconds until the next announce. */
  reannounce: number;
  /** Number of seeds connected to. */
  seeds: number;
  /** Number of seeds in the swarm. */
  seeds_total: number;
  /** Torrent total size (bytes) */
  total_size: number;
  /** Torrent average upload speed (bytes/second) */
  up_speed_avg: number;
  /** Torrent upload speed (bytes/second) */
  up_speed: number;
}

export interface Tracker {
  /** Tracker url. */
  url: string;
  /**
   * Tracker status.
   *
   * Possible values:
   * - `0` - Tracker is disabled (used for DHT, PeX, and LSD)
   * - `1` - Tracker has not been contacted yet
   * - `2` - Tracker has been contacted and is working
   * - `3` - Tracker is updating
   * - `4` - Tracker has been contacted, but it is not working (or doesn't send proper replies)
   */
  status: number;
  /** Tracker priority tier. Lower tier trackers are tried before higher tiers. Tier numbers are valid when `>= 0`, `< 0` is used as placeholder when `tier` does not exist for special entries (such as DHT) */
  tier: number;
  /** Number of peers for current torrent, as reported by the tracker. */
  num_peers: number;
  /** Number of seeds for current torrent, asreported by the tracker. */
  num_seeds: number;
  /** Number of leeches for current torrent, as reported by the tracker. */
  num_leeches: number;
  /** Number of completed downlods for current torrent, as reported by the tracker. */
  num_downloaded: number;
  /** Tracker message (there is no way of knowing what this message is - it's up to tracker admins) */
  msg: string;
}

export interface WebSeed {
  /** URL of the web seed. */
  url: string;
}

export interface File {
  /** File index *(since 2.8.2)*. */
  index?: number;
  /** File name (including relative path) */
  name: string;
  /** File size (bytes) */
  size: number;
  /** File progress (percentage/100) */
  progress: number;
  /**
   * File priority. See possible values here below.
   *
   * Possible values:
   * - `0` - Do not download
   * - `1` - Normal priority
   * - `6` - High priority
   * - `7` - Maximal priority
   */
  priority: 0 | 1 | 6 | 7;
  /** True if file is seeding/complete. */
  is_seed: boolean;
  /** array	The first number is the starting piece index and the second number is the ending piece index (inclusive) */
  piece_range: number;
  /** Percentage of file pieces currently available (percentage/100) */
  availability: number;
}

export interface AddNewTorrentOptions {
  /** Download folder. */
  savepath?: string;
  /** Cookie sent to download the .torrent file. */
  cookie?: string;
  /** Category for the torrent. */
  category?: string;
  /** Tags for the torrent, split by ','. */
  tags?: string;
  /** Skip hash checking. Possible values are true, false (default). */
  skip_checking?: string;
  /** Add torrents in the paused state. Possible values are true, false (default). */
  paused?: string;
  /** Create the root folder. Possible values are true, false, unset (default). */
  root_folder?: string;
  /** Rename torrent. */
  rename?: string;
  /** Set torrent upload speed limit. Unit in bytes/second. */
  upLimit?: number;
  /** Set torrent download speed limit. Unit in bytes/second. */
  dlLimit?: number;
  /** Set torrent share ratio limit *(since 2.8.1)* */
  ratioLimit?: number;
  /** Set torrent seeding time limit. Unit in minutes *(since 2.8.1)* */
  seedingTimeLimit?: number;
  /** Whether Automatic Torrent Management should be used. */
  autoTMM?: boolean;
  /** Enable sequential download. Possible values are true, false (default) */
  sequentialDownload?: string;
  /** Prioritize download first last piece. Possible values are true, false (default) */
  firstLastPiecePrio?: string;
}

export interface SetTorrentShareLimitOptions {
  /**
   * The max ratio the torrent should be seeded until.
   * Possible values:
   * - `-2` - The global limit should be used
   * - `-1` - No limit
   */
  ratioLimit?: number;

  /**
   * The max amount of time (minutes) the torrent should be seeded.
   * Possible values:
   * - `-2` - The global limit should be used
   * - `-1` - No limit
   */
  seedingTimeLimit?: number;
}

export type Categories = Record<string, { name: string; save_path: string }>;
