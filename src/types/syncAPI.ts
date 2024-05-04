import type { GlobalTransferInfo } from './transferAPI';

export interface MainData {
  /** Response ID */
  rid: number;
  /** Whether the response contains all the data or partial data */
  full_update?: boolean;
  /** Property: torrent hash, value: same as [torrent list](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-torrent-list) */
  torrents?: object;
  /** List of hashes of torrents removed since last request */
  torrents_removed?: string[];
  /** Info for categories added since last request */
  categories?: Record<string, { name: string; savePath: string }>;
  /** List of categories removed since last request */
  categories_removed?: string[];
  /** List of tags added since last request */
  tags?: string[];
  /** List of tags removed since last request */
  tags_removed?: string[];
  /** Global transfer info
   *
   * Note: `server_state` is typed from official documentation, but my local qBittorrent instance returns a much more properties in this object. Maybe use `MainData.server_state as Record<string, number | string | boolean>` to get access to all the properties.
   */
  server_state?: GlobalTransferInfo;
}

export interface TorrentPeersData {
  full_update?: true;
  peers?: Record<
    string,
    {
      client: string;
      connection: string;
      country: string;
      country_code: string;
      dl_speed: number;
      downloaded: number;
      files: string;
      flags: string;
      flags_desc: string;
      ip: string;
      peer_id_client: string;
      port: number;
      progress: number;
      relevance: number;
      up_speed: number;
      uploaded: number;
    }
  >;
  rid: number;
  show_flogs?: boolean;
}
