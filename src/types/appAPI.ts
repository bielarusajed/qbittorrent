export interface BuildInfo {
  bitness: 32 | 64;
  boost: string;
  libtorrent: string;
  openssl: string;
  qt: string;
  zlib: string;
}

export interface Preferences {
  /** Currently selected language (e.g., en_GB for English) */
  locale: string;
  /** True if a subfolder should be created when adding a torrent */
  create_subfolder_enabled: boolean;
  /** True if torrents should be added in a Paused state */
  start_paused_enabled: boolean;
  /** TODO: THERE IS NO DESCRIPTION FOR THIS PROPERTY IN THE DOCUMENTATION */
  auto_delete_mode: number;
  /** True if disk space should be pre-allocated for all files */
  preallocate_all: boolean;
  /** True if ".!qB" should be appended to incomplete files */
  incomplete_files_ext: boolean;
  /** True if Automatic Torrent Management is enabled by default */
  auto_tmm_enabled: boolean;
  /** True if torrent should be relocated when its Category changes */
  torrent_changed_tmm_enabled: boolean;
  /** True if torrent should be relocated when the default save path changes */
  save_path_changed_tmm_enabled: boolean;
  /** True if torrent should be relocated when its Category's save path changes */
  category_changed_tmm_enabled: boolean;
  /** Default save path for torrents, separated by slashes */
  save_path: string;
  /** True if folder for incomplete torrents is enabled */
  temp_path_enabled: boolean;
  /** Path for incomplete torrents, separated by slashes */
  temp_path: string;
  /**
   * Property: directory to watch for torrent files.
   *
   * Value: where torrents loaded from this directory should be downloaded to.
   *
   * Possible values:
   * - `0` - Download to the monitored folder.
   * - `1` - Download to the default save path.
   * - `"/path/to/download/to"` - Download to this path.
   */
  scan_dirs: Record<string, string | number>;
  /** Path to directory to copy .torrent files to */
  export_dir: string;
  /** Path to directory to copy .torrent files of completed downloads to */
  export_dir_fin: string;
  /** True if e-mail notification should be enabled */
  mail_notification_enabled: boolean;
  /** E-mail where notifications should originate from */
  mail_notification_sender: string;
  /** E-mail to send notifications to */
  mail_notification_email: string;
  /** SMTP server for e-mail notifications */
  mail_notification_smtp: string;
  /** True if SMTP server requires SSL connection */
  mail_notification_ssl_enabled: boolean;
  /** True if SMTP server requires authentication */
  mail_notification_auth_enabled: boolean;
  /** Username for SMTP authentication */
  mail_notification_username: string;
  /** Password for SMTP authentication */
  mail_notification_password: string;
  /** True if external program should be run after torrent has finished downloading */
  autorun_enabled: boolean;
  /** Program path/name/arguments to run if autorun_enabled is enabled; path is separated by slashes; you can use %f and %n arguments, which will be expanded by qBittorent as path_to_torrent_file and torrent_name respectively */
  autorun_program: string;
  /** True if torrent queuing is enabled */
  queueing_enabled: boolean;
  /** Maximum number of active simultaneous downloads */
  max_active_downloads: number;
  /** Maximum number of active simultaneous downloads and uploads */
  max_active_torrents: number;
  /** Maximum number of active simultaneous uploads */
  max_active_uploads: number;
  /** If true torrents w/o any activity (stalled ones) will not be counted towards max_active_* limits */
  dont_count_slow_torrents: boolean;
  /** Download rate in KiB/s for a torrent to be considered "slow" */
  slow_torrent_dl_rate_threshold: number;
  /** Upload rate in KiB/s for a torrent to be considered "slow" */
  slow_torrent_ul_rate_threshold: number;
  /** Seconds a torrent should be inactive before considered "slow" */
  slow_torrent_inactive_timer: number;
  /** True if share ratio limit is enabled */
  max_ratio_enabled: boolean;
  /** Get the global share ratio limit */
  max_ratio: number;
  /**
   * Action performed when a torrent reaches the maximum share ratio.
   *
   * Possible values:
   * - `0` - Pause torrent
   * - `1` - Remove torrent
   */
  max_ratio_act: 0 | 1;
  /** Port for incoming connections */
  listen_port: number;
  /** True if UPnP/NAT-PMP is enabled */
  upnp: boolean;
  /** True if the port is randomly selected */
  random_port: boolean;
  /** Global download speed limit in KiB/s; -1 means no limit is applied */
  dl_limit: number;
  /** Global upload speed limit in KiB/s; -1 means no limit is applied */
  up_limit: number;
  /** Maximum global number of simultaneous connections */
  max_connec: number;
  /** Maximum number of simultaneous connections per torrent */
  max_connec_per_torrent: number;
  /** Maximum number of upload slots */
  max_uploads: number;
  /** Maximum number of upload slots per torrent */
  max_uploads_per_torrent: number;
  /** Timeout in seconds for a stopped announce request to trackers */
  stop_tracker_timeout: number;
  /** True if the advanced libtorrent option piece_extent_affinity is enabled */
  enable_piece_extent_affinity: boolean;
  /**
   * Possible values:
   * - `0` - TCP and μTP
   * - `1` - TCP
   * - `2` - μTP
   */
  bittorrent_protocol: 0 | 1 | 2;
  /** True if [du]l_limit should be applied to uTP connections; this option is only available in qBittorent built against libtorrent version 0.16.X and higher */
  limit_utp_rate: boolean;
  /** True if [du]l_limit should be applied to estimated TCP overhead (service data: e.g. packet headers) */
  limit_tcp_overhead: boolean;
  /** True if [du]l_limit should be applied to peers on the LAN */
  limit_lan_peers: boolean;
  /** Alternative global download speed limit in KiB/s */
  alt_dl_limit: number;
  /** Alternative global upload speed limit in KiB/s */
  alt_up_limit: number;
  /** True if alternative limits should be applied according to schedule */
  scheduler_enabled: boolean;
  /** Scheduler starting hour */
  schedule_from_hour: number;
  /** Scheduler starting minute */
  schedule_from_min: number;
  /** Scheduler ending hour */
  schedule_to_hour: number;
  /** Scheduler ending minute */
  schedule_to_min: number;
  /**
   * Scheduler days.
   *
   * Possible values:
   * - `0` - Every day
   * - `1` - Every weekday
   * - `2` - Every weekend
   * - `3` - Every Monday
   * - `4` - Every Tuesday
   * - `5` - Every Wednesday
   * - `6` - Every Thursday
   * - `7` - Every Friday
   * - `8` - Every Saturday
   * - `9` - Every Sunday
   *
   */
  scheduler_days: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  /** True if DHT is enabled */
  dht: boolean;
  /** True if PeX is enabled */
  pex: boolean;
  /** True if LSD is enabled */
  lsd: boolean;
  /**
   * Possible values:
   * - `0` - Prefer encryption
   * - `1` - Force encryption on
   * - `2` - Force encryption off
   *
   * NB: the first options allows you to use both encrypted and unencrypted connections (this is the default); other options are mutually exclusive: e.g. by forcing encryption on you won't be able to use unencrypted connections and vice versa.
   */
  encryption: 0 | 1 | 2;
  /** If true anonymous mode will be enabled; read more [here](https://github.com/qbittorrent/qBittorrent/wiki/Anonymous-Mode); this option is only available in qBittorent built against libtorrent version 0.16.X and higher */
  anonymous_mode: boolean;
  /**
   * Possible values:
   * - `-1` -	Proxy is disabled
   * - `1` -	HTTP proxy without authentication
   * - `2` -	SOCKS5 proxy without authentication
   * - `3` -	HTTP proxy with authentication
   * - `4` -	SOCKS5 proxy with authentication
   * - `5` -	SOCKS4 proxy without authentication
   */
  proxy_type: -1 | 1 | 2 | 3 | 4 | 5;
  /** Proxy IP address or domain name */
  proxy_ip: string;
  /** Proxy port */
  proxy_port: number;
  /** True if peer and web seed connections should be proxified; this option will have any effect only in qBittorent built against libtorrent version 0.16.X and higher */
  proxy_peer_connections: boolean;
  /** True if proxy requires authentication; doesn't apply to SOCKS4 proxies */
  proxy_auth_enabled: boolean;
  /** Username for proxy authentication */
  proxy_username: string;
  /** Password for proxy authentication */
  proxy_password: string;
  /** True if proxy is only used for torrents */
  proxy_torrents_only: boolean;
  /** True if external IP filter should be enabled */
  ip_filter_enabled: boolean;
  /** Path to IP filter file (.dat, .p2p, .p2b files are supported); path is separated by slashes */
  ip_filter_path: string;
  /** True if IP filters are applied to trackers */
  ip_filter_trackers: boolean;
  /** Comma-separated list of domains to accept when performing Host header validation */
  web_ui_domain_list: string;
  /** IP address to use for the WebUI */
  web_ui_address: string;
  /** WebUI port */
  web_ui_port: number;
  /** True if UPnP is used for the WebUI port */
  web_ui_upnp: boolean;
  /** WebUI username */
  web_ui_username: string;
  /** WebUI password */
  web_ui_password: string;
  /** True if WebUI CSRF protection is enabled */
  web_ui_csrf_protection_enabled: boolean;
  /** True if WebUI clickjacking protection is enabled */
  web_ui_clickjacking_protection_enabled: boolean;
  /** True if WebUI cookie Secure flag is enabled */
  web_ui_secure_cookie_enabled: boolean;
  /** Maximum number of authentication failures before WebUI access ban */
  web_ui_max_auth_fail_count: number;
  /** WebUI access ban duration in seconds */
  web_ui_ban_duration: number;
  /** Seconds until WebUI is automatically signed off */
  web_ui_session_timeout: number;
  /** True if WebUI host header validation is enabled */
  web_ui_host_header_validation_enabled: boolean;
  /** True if authentication challenge for loopback address (127.0.0.1) should be disabled */
  bypass_local_auth: boolean;
  /** True if webui authentication should be bypassed for clients whose IP resides within (at least) one of the subnets on the whitelist */
  bypass_auth_subnet_whitelist_enabled: boolean;
  /** (White)list of IPv4/IPv6 subnets for which webui authentication should be bypassed; list entries are separated by commas */
  bypass_auth_subnet_whitelist: string;
  /** True if an alternative WebUI should be used */
  alternative_webui_enabled: boolean;
  /** File path to the alternative WebUI */
  alternative_webui_path: string;
  /** True if WebUI HTTPS access is enabled */
  use_https: boolean;
  /** SSL keyfile contents (this is not a path) */
  ssl_key: string;
  /** SSL certificate contents (this is not a path) */
  ssl_cert: string;
  /** Path to SSL keyfile */
  web_ui_https_key_path: string;
  /** Path to SSL certificate */
  web_ui_https_cert_path: string;
  /** True if server DNS should be updated dynamically */
  dyndns_enabled: boolean;
  /**
   * Possible values:
   * - `0` - Use DyDNS
   * - `1` - Use NOIP
   */
  dyndns_service: 0 | 1;
  /** Username for DDNS service */
  dyndns_username: string;
  /** Password for DDNS service */
  dyndns_password: string;
  /** Your DDNS domain name */
  dyndns_domain: string;
  /** RSS refresh interval */
  rss_refresh_interval: number;
  /** Max stored articles per RSS feed */
  rss_max_articles_per_feed: number;
  /** Enable processing of RSS feeds */
  rss_processing_enabled: boolean;
  /** Enable auto-downloading of torrents from the RSS feeds */
  rss_auto_downloading_enabled: boolean;
  /** Enable downloading of repack/proper Episodes */
  rss_download_repack_proper_episodes: boolean;
  /** List of RSS Smart Episode Filters */
  rss_smart_episode_filters: string;
  /** Enable automatic adding of trackers to new torrents */
  add_trackers_enabled: boolean;
  /** List of trackers to add to new torrent */
  add_trackers: string;
  /** Enable custom HTTP headers for WebUI */
  web_ui_use_custom_http_headers_enabled: boolean;
  /** List of custom HTTP headers for WebUI */
  web_ui_custom_http_headers: string;
  /** True enables max seeding time */
  max_seeding_time_enabled: boolean;
  /** Number of minutes to seed a torrent */
  max_seeding_time: number;
  /** TODO: THERE IS NO DESCRIPTION FOR THIS PROPERTY IN THE DOCUMENTATION */
  announce_ip: string;
  /** True always announce to all tiers */
  announce_to_all_tiers: boolean;
  /** True always announce to all trackers in a tier */
  announce_to_all_trackers: boolean;
  /** Number of asynchronous I/O threads */
  async_io_threads: number;
  /** List of banned IPs */
  banned_IPs: string;
  /** Outstanding memory when checking torrents in MiB */
  checking_memory_use: number;
  /** IP Address to bind to. Empty String means All addresses */
  current_interface_address: string;
  /** Network Interface used */
  current_network_interface: string;
  /** Disk cache used in MiB */
  disk_cache: number;
  /** Disk cache expiry interval in seconds */
  disk_cache_ttl: number;
  /** Port used for embedded tracker */
  embedded_tracker_port: number;
  /** True enables coalesce reads & writes */
  enable_coalesce_read_write: boolean;
  /** True enables embedded tracker */
  enable_embedded_tracker: boolean;
  /** True allows multiple connections from the same IP address */
  enable_multi_connections_from_same_ip: boolean;
  /** True enables OS cache */
  enable_os_cache: boolean;
  /** True enables sending of upload piece suggestions */
  enable_upload_suggestions: boolean;
  /** File pool size */
  file_pool_size: number;
  /** Maximal outgoing port (0: Disabled) */
  outgoing_ports_max: number;
  /** Minimal outgoing port (0: Disabled) */
  outgoing_ports_min: number;
  /** True rechecks torrents on completion */
  recheck_completed_torrents: boolean;
  /** True resolves peer countries */
  resolve_peer_countries: boolean;
  /** Save resume data interval in min */
  save_resume_data_interval: number;
  /** Send buffer low watermark in KiB */
  send_buffer_low_watermark: number;
  /** Send buffer watermark in KiB */
  send_buffer_watermark: number;
  /** Send buffer watermark factor in percent */
  send_buffer_watermark_factor: number;
  /** Socket backlog size */
  socket_backlog_size: number;
  /**
   * Upload choking algorithm used.
   *
   * Possible values:
   * - `0` - Round-robin
   * - `1` - Fastest upload
   * - `2` - Anti-leech
   */
  upload_choking_algorithm: 0 | 1 | 2;
  /**
   * Upload slots behavior used.
   *
   * Possible values:
   * - `0` - Fixed slots
   * - `1` - Upload rate based
   */
  upload_slots_behavior: 0 | 1;
  /** UPnP lease duration (0: Permanent lease) */
  upnp_lease_duration: number;
  /**
   * μTP-TCP mixed mode algorithm.
   *
   * Possible values:
   * - `0` - Prefer TCP
   * - `1` - Peer proportional
   */
  utp_tcp_mixed_mode: 0 | 1;
}
