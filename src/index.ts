import { Stream } from 'node:stream';
import type {
  AddNewTorrentOptions,
  AutoDownloadingRule,
  BuildInfo,
  CallMethodOptions,
  CallMethodResponse,
  Categories,
  File,
  GetLogOptions,
  GetTorrentListOptions,
  GlobalTransferInfo,
  LogEntry,
  MainData,
  PeerLogEntry,
  Preferences,
  RSSItems,
  SearchPlugin,
  SearchResult,
  SearchStatus,
  SetTorrentShareLimitOptions,
  Torrent,
  TorrentPeersData,
  TorrentProperties,
  Tracker,
  WebSeed,
} from './types';
import * as fs from 'node:fs';
import qs from 'qs';

enum APINames {
  auth = 'auth',
  app = 'app',
  log = 'log',
  sync = 'sync',
  transfer = 'transfer',
  torrents = 'torrents',
  rss = 'rss',
  search = 'search',
}

/**
 * Error thrown when a request to the qBittorrent API fails.
 */
export class RequestError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.name = 'RequestError';
    this.message = message;
    this.code = code;
  }
}

/**
 * qBittorrent API wrapper.
 */
class QBittorrent {
  url: string;
  authCookie?: string;

  protected async callMethod<T>(
    apiName: APINames,
    methodName: string,
    options?: CallMethodOptions,
  ): Promise<CallMethodResponse<T>> {
    const method = options?.method ?? 'GET';
    const query = qs.stringify(options?.query, { arrayFormat: 'repeat' });
    const url = new URL(`${apiName}/${methodName}`, this.url);
    if (query !== '') url.search = query;

    const headers = new Headers();
    headers.append('Referer', new URL(this.url).origin);
    if (typeof this.authCookie === 'string' && this.authCookie.trim() !== '') headers.append('Cookie', this.authCookie);

    const response = await fetch(url, { method, headers, body: options?.body });
    const body = await response.text();
    if (!response.ok) throw new RequestError(response.status, body);

    try {
      return { body: JSON.parse(body), headers: response.headers };
    } catch (e) {
      return { body: body as T, headers: response.headers };
    }
  }

  constructor(url: string = 'http://localhost:8080') {
    this.url = new URL('/api/v2/', url.replace(/\/$/, '')).href;
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#login). */
  async login(username: string, password: string): Promise<void> {
    const requestBody = new URLSearchParams({ username, password });
    const { headers } = await this.callMethod(APINames.auth, 'login', {
      method: 'POST',
      body: requestBody,
    });
    this.authCookie = headers.getSetCookie().find(cookie => cookie.startsWith('SID='));
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#logout). */
  async logout(): Promise<void> {
    await this.callMethod(APINames.auth, 'logout');
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-application-version). */
  async getApplicationVersion(): Promise<string> {
    const { body } = await this.callMethod<string>(APINames.app, 'version');
    return body;
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-api-version). */
  async getAPIVersion(): Promise<string> {
    const { body } = await this.callMethod<string>(APINames.app, 'webapiVersion');
    return body;
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-build-info). */
  async getBuildInfo(): Promise<BuildInfo> {
    const { body } = await this.callMethod<BuildInfo>(APINames.app, 'buildInfo');
    return body;
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#shutdown-application). */
  async shutdownApplication(): Promise<void> {
    await this.callMethod(APINames.app, 'shutdown', { method: 'POST' });
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-application-preferences). */
  async getApplicationPreferences(): Promise<Preferences> {
    const { body } = await this.callMethod<Preferences>(APINames.app, 'preferences');
    return body;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-application-preferences).
   *
   * Notes:
   * 1. There is no need to pass all possible preferences' token:value pairs if you only want to change one option
   * 2. Paths in scan_dirs must exist, otherwise this option will have no effect
   * 3. String values must be quoted; integer and boolean values must never be quoted
   *
   * For a list of possible preference options see Get application preferences
   *
   * @param preferences See documentation or type descriptions for more info.
   */
  async setApplicationPreferences(preferences: Partial<Preferences>): Promise<void> {
    const body = new URLSearchParams({ json: JSON.stringify(preferences) });
    await this.callMethod(APINames.app, 'setPreferences', { method: 'POST', body });
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-default-save-path). */
  async getDefaultSavePath(): Promise<string> {
    const { body } = await this.callMethod<string>(APINames.app, 'defaultSavePath');
    return body;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-log).
   * @param options See documentation or type descriptions for more info.
   */
  async getLog(options?: GetLogOptions): Promise<LogEntry[]> {
    const { body } = await this.callMethod<LogEntry[]>(APINames.log, 'main', { query: options });
    return body;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-peer-log).
   * @param lastKnownId Exclude messages with "message id" <= `lastKnownId` (default: `-1`).
   */
  async getPeerLog(lastKnownId?: number): Promise<PeerLogEntry[]> {
    const { body } = await this.callMethod<PeerLogEntry[]>(APINames.log, 'peers', {
      query: { last_known_id: lastKnownId },
    });
    return body;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-main-data).
   * @param rid Response ID. If not provided, `rid=0` will be assumed. If the given `rid` is different from the one of last server reply, `full_update` will be `true` (see the server reply details for more info).
   */
  async getMainData(rid?: number): Promise<MainData> {
    const { body } = await this.callMethod<MainData>(APINames.sync, 'maindata', { query: { rid } });
    return body;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-torrent-peers-data).
   * @param hash Torrent hash
   * @param rid Response ID. If not provided, `rid=0` will be assumed. If the given `rid` is different from the one of last server reply, `full_update` will be `true` (see the server reply details for more info)
   * @todo Response is not described in the official documentation yet, it marked as `TODO`. Currently typed response from a local qBittorrent instance.
   */
  async getTorrentPeersData(hash: string, rid?: number): Promise<TorrentPeersData> {
    const query = { hash, rid };
    const { body } = await this.callMethod<TorrentPeersData>(APINames.sync, 'torrentPeers', { query });
    return body;
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-global-transfer-info). */
  async getGlobalTransferInfo(): Promise<GlobalTransferInfo> {
    const { body } = await this.callMethod<GlobalTransferInfo>(APINames.transfer, 'info');
    return body;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-alternative-speed-limits-state).
   * @return The response is 1 if alternative speed limits are enabled, 0 otherwise.
   */
  async getAlternativeSpeedLimitsState(): Promise<number> {
    const { body } = await this.callMethod<number>(APINames.transfer, 'speedLimitsMode');
    return body;
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#toggle-alternative-speed-limits). */
  async toggleAlternativeSpeedLimits(): Promise<void> {
    await this.callMethod<number>(APINames.transfer, 'toggleSpeedLimitsMode', { method: 'POST' });
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-global-download-limit). */
  async getGlobalDownloadLimit(): Promise<number> {
    const { body } = await this.callMethod<number>(APINames.transfer, 'downloadLimit');
    return body;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-global-download-limit).
   * @param limit The global download speed limit to set in bytes/second. Set to `0` to remove the limit. If not provided, the limit will be removed.
   */
  async setGlobalDownloadLimit(limit: number = 0): Promise<void> {
    const body = new URLSearchParams({ limit: limit.toString() });
    await this.callMethod<number>(APINames.transfer, 'setDownloadLimit', { method: 'POST', body });
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-global-upload-limit). */
  async getGlobalUploadLimit(): Promise<number> {
    const { body } = await this.callMethod<number>(APINames.transfer, 'uploadLimit');
    return body;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-global-upload-limit).
   * @param limit The global upload speed limit to set in bytes/second. Set to `0` to remove the limit. If not provided, the limit will be removed.
   */
  async setGlobalUploadLimit(limit: number = 0): Promise<void> {
    const body = new URLSearchParams({ limit: limit.toString() });
    await this.callMethod<number>(APINames.transfer, 'setUploadLimit', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#ban-peers).
   * @param peers Peers to ban. Each peer is a colon-separated host:port.
   */
  async banPeers(peers: string[]): Promise<void> {
    const body = new URLSearchParams({ peers: peers.join('|') });
    await this.callMethod(APINames.transfer, 'banPeers', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-torrent-list).
   * @param options See documentation or type descriptions for more info.
   */
  async getTorrentList(options?: GetTorrentListOptions): Promise<Torrent[]> {
    const { body } = await this.callMethod<Torrent[]>(APINames.torrents, 'info', { query: options });
    return body;
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-torrent-generic-properties). */
  async getTorrentGenericProperties(hash: string): Promise<TorrentProperties> {
    const query = { hash };
    const { body } = await this.callMethod<TorrentProperties>(APINames.torrents, 'properties', { query });
    return body;
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-torrent-trackers). */
  async getTorrentTrackers(hash: string): Promise<Tracker[]> {
    const query = { hash };
    const { body } = await this.callMethod<Tracker[]>(APINames.torrents, 'trackers', { query });
    return body;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-torrent-web-seeds).
   * @param hash The hash of the torrent you want to get the webseeds of
   */
  async getTorrentWebSeeds(hash: string): Promise<WebSeed[]> {
    const query = { hash };
    const { body } = await this.callMethod<WebSeed[]>(APINames.torrents, 'webseeds', { query });
    return body;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-torrent-contents).
   * @param hash The hash of the torrent you want to get the contents of
   * @param indexes The indexes of the files you want to retrieve.
   */
  async getTorrentContents(hash: string, indexes?: number[]): Promise<File[]> {
    const query = { hash, indexes: Array.isArray(indexes) ? indexes.join('|') : undefined };
    const { body } = await this.callMethod<File[]>(APINames.torrents, 'files', { query });
    return body;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-torrent-pieces-states).
   * @param hash The hash of the torrent you want to get the pieces' states of
   * @return An array of states (integers) of all pieces (in order) of a specific torrent.
   * Value meanings are:
   * - `0` - Not downloaded yet
   * - `1` - Now downloading
   * - `2` - Already downloaded
   */
  async getTorrentPiecesStates(hash: string): Promise<number[]> {
    const query = { hash };
    const { body } = await this.callMethod<number[]>(APINames.torrents, 'pieceStates', { query });
    return body;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-torrent-pieces-hashes).
   * @param hash The hash of the torrent you want to get the pieces' hashes of
   * @return An array of hashes (strings) of all pieces (in order) of a specific torrent.
   */
  async getTorrentPiecesHashes(hash: string): Promise<string[]> {
    const query = { hash };
    const { body } = await this.callMethod<string[]>(APINames.torrents, 'pieceHashes', { query });
    return body;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#pause-torrents).
   * @param hashes The hashes of the torrents you want to pause.
   */
  async pauseTorrents(hashes: string[]): Promise<void> {
    const body = new URLSearchParams({ hashes: hashes.join('|') });
    await this.callMethod(APINames.torrents, 'pause', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#resume-torrents).
   * @param hashes The hashes of the torrents you want to resume.
   */
  async resumeTorrents(hashes: string[]): Promise<void> {
    const body = new URLSearchParams({ hashes: hashes.join('|') });
    await this.callMethod(APINames.torrents, 'resume', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#delete-torrents).
   * @param hashes The hashes of the torrents you want to delete.
   * @param deleteFiles f set to `true`, the downloaded data will also be deleted, otherwise has no effect.
   */
  async deleteTorrents(hashes: string[] | 'all', deleteFiles: boolean = false): Promise<void> {
    const body = new URLSearchParams({
      hashes: Array.isArray(hashes) ? hashes.join('|') : hashes,
      deleteFiles: deleteFiles.toString(),
    });
    await this.callMethod(APINames.torrents, 'delete', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#recheck-torrents).
   * @param hashes The hashes of the torrents you want to recheck.
   */
  async recheckTorrents(hashes: string[]): Promise<void> {
    const body = new URLSearchParams({ hashes: hashes.join('|') });
    await this.callMethod(APINames.torrents, 'recheck', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#reannounce-torrents).
   * @param hashes The hashes of the torrents you want to reannounce.
   */
  async reannounceTorrents(hashes: string[]): Promise<void> {
    const body = new URLSearchParams({ hashes: hashes.join('|') });
    await this.callMethod(APINames.torrents, 'reannounce', { method: 'POST', body });
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#add-new-torrent).
   * @param torrents The torrent(s) you want to add.
   * A torrent can be either a string or a binary data.
   * If torrent is a string, it could be a URL or a path to a torrent file.
   * `http://`, `https://`, `magnet:` and `bc://bt/` links are supported.
   * @param options See documentation or type descriptions for more info.
   */
  async addNewTorrent(torrents: Array<string | Blob | Stream | Buffer>, options?: AddNewTorrentOptions): Promise<void> {
    const body = new FormData();
    Object.entries(options ?? {}).forEach(([key, value]) => {
      body.append(key, value);
    });

    const urls = (torrents.filter(v => typeof v === 'string') as string[]).filter(
      v => v.startsWith('http://') || v.startsWith('https://') || v.startsWith('magnet:') || v.startsWith('bc://bt/'),
    );
    body.set('urls', urls.join('\n'));

    for (const torrent of torrents) {
      if (typeof torrent === 'string' && !urls.includes(torrent)) {
        const file = fs.readFileSync(torrent);
        body.append('torrents', new Blob([file], { type: 'application/x-bittorrent' }));
      }
      if (torrent instanceof Blob) body.append('torrents', torrent);
      if (torrent instanceof Buffer) body.append('torrents', new Blob([torrent], { type: 'application/x-bittorrent' }));
      if (torrent instanceof Stream) {
        const blob: Blob = await new Promise(resolve => {
          const chunks: any[] = [];
          torrent
            .on('data', chunk => chunks.push(chunk))
            .once('end', () => {
              resolve(new Blob(chunks, { type: 'application/x-bittorrent' }));
            });
        });
        body.append('torrents', blob);
      }
    }

    await this.callMethod(APINames.torrents, 'add', { method: 'POST', body });
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#add-trackers-to-torrent). */
  async addTrackersToTorrent(hash: string, urls: string[]): Promise<void> {
    const body = new URLSearchParams({ hash, urls: urls.join('\n') });
    await this.callMethod(APINames.torrents, 'addTrackers', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#edit-trackers).
   * @param hash The hash of the torrent.
   * @param origUrl The tracker URL you want to edit.
   * @param newUrl The new URL to replace the origUrl.
   */
  async editTrackers(hash: string, origUrl: string, newUrl: string): Promise<void> {
    const body = new URLSearchParams({ hash, origUrl, newUrl });
    await this.callMethod(APINames.torrents, 'editTracker', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#remove-trackers).
   * @param hash The hash of the torrent.
   * @param urls 	URLs to remove.
   */
  async removeTrackers(hash: string, urls: string[]): Promise<void> {
    const body = new URLSearchParams({ hash, urls: urls.join('\n') });
    await this.callMethod(APINames.torrents, 'removeTrackers', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#add-peers).
   * @param hashes The hashes of the torrents.
   * @param peers Peers to add. Each peer is a colon-separated host:port.
   */
  async addPeers(hashes: string[], peers: string[]): Promise<void> {
    const body = new URLSearchParams({ hashes: hashes.join('|'), peers: peers.join('|') });
    await this.callMethod(APINames.torrents, 'addPeers', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#increase-torrent-priority).
   * @param hashes The hashes of the torrents you want to increase the priority of. Set to all, to increase the priority of all torrents.
   */
  async increaseTorrentPriority(hashes: string[] | 'all'): Promise<void> {
    const body = new URLSearchParams({ hashes: Array.isArray(hashes) ? hashes.join('|') : hashes });
    await this.callMethod(APINames.torrents, 'increasePrio', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#decrease-torrent-priority).
   * @param hashes The hashes of the torrents you want to decrease the priority of. Set to all, to decrease the priority of all torrents.
   */
  async decreaseTorrentPriority(hashes: string[] | 'all'): Promise<void> {
    const body = new URLSearchParams({ hashes: Array.isArray(hashes) ? hashes.join('|') : hashes });
    await this.callMethod(APINames.torrents, 'decreasePrio', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#maximal-torrent-priority).
   * @param hashes The hashes of the torrents you want to maximize the priority of. Set to all, to maximize the priority of all torrents.
   */
  async maximalTorrentPriority(hashes: string[] | 'all'): Promise<void> {
    const body = new URLSearchParams({ hashes: Array.isArray(hashes) ? hashes.join('|') : hashes });
    await this.callMethod(APINames.torrents, 'topPrio', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#minimal-torrent-priority).
   * @param hashes The hashes of the torrents you want to minimize the priority of. Set to all, to minimize the priority of all torrents.
   */
  async minimalTorrentPriority(hashes: string[] | 'all'): Promise<void> {
    const body = new URLSearchParams({ hashes: Array.isArray(hashes) ? hashes.join('|') : hashes });
    await this.callMethod(APINames.torrents, 'bottomPrio', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-file-priority).
   * @param hash The hash of the torrent.
   * @param id File ids.
   * `id` values correspond to file position inside the array returned by torrent contents API, e.g. `id=0` for first file, `id=1` for second file, etc.
   * Since 2.8.2 it is reccomended to use `index` field returned by torrent contents API (since the files can be filtered and the `index` value may differ from the position inside the response array).
   * @param priority File priority to set.
   * Possible values of priority:
   * - `0` - Do not download
   * - `1` - Normal priority
   * - `6` - High priority
   * - `7` - Maximal priority
   */
  async setFilePriority(hash: string, id: number[], priority: number): Promise<void> {
    const body = new URLSearchParams({ hash, id: id.join('|'), priority: priority.toString() });
    await this.callMethod(APINames.torrents, 'filePrio', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-torrent-download-limit).
   * @param hashes Can contain multiple hashes or set to `all`.
   */
  async getTorrentDownloadLimit(hashes: string[] | 'all'): Promise<Record<string, number>> {
    const body = new URLSearchParams({ hashes: Array.isArray(hashes) ? hashes.join('|') : hashes });
    const { body: response } = await this.callMethod<Record<string, number>>(APINames.torrents, 'downloadLimit', {
      method: 'POST',
      body,
    });
    return response;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-torrent-download-limit).
   * @param hashes Can contain multiple hashes or set to `all`.
   * @param limit The download speed limit in bytes per second you want to set.
   */
  async setTorrentDownloadLimit(hashes: string[] | 'all', limit: number): Promise<void> {
    const body = new URLSearchParams({
      hashes: Array.isArray(hashes) ? hashes.join('|') : hashes,
      limit: limit.toString(),
    });
    await this.callMethod(APINames.torrents, 'setDownloadLimit', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-torrent-share-limit).
   * @param hashes Can contain multiple hashes or set to `all`.
   * @param options See documentation or type description for more info.
   */
  async setTorrentShareLimit(hashes: string[] | 'all', options: SetTorrentShareLimitOptions): Promise<void> {
    const body = new URLSearchParams({ hashes: Array.isArray(hashes) ? hashes.join('|') : hashes });
    if (options.ratioLimit !== undefined) body.set('ratioLimit', options.ratioLimit.toString());
    if (options.seedingTimeLimit !== undefined) body.set('ratioLimit', options.seedingTimeLimit.toString());
    await this.callMethod(APINames.torrents, 'setShareLimits', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-torrent-upload-limit).
   * @param hashes Can contain multiple hashes or set to `all`.
   */
  async getTorrentUploadLimit(hashes: string[] | 'all'): Promise<Record<string, number>> {
    const body = new URLSearchParams({ hashes: Array.isArray(hashes) ? hashes.join('|') : hashes });
    const { body: response } = await this.callMethod<Record<string, number>>(APINames.torrents, 'uploadLimit', {
      method: 'POST',
      body,
    });
    return response;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-torrent-upload-limit).
   * @param hashes Can contain multiple hashes or set to `all`.
   * @param limit The upload speed limit in bytes per second you want to set.
   */
  async setTorrentUploadLimit(hashes: string[] | 'all', limit: number): Promise<void> {
    const body = new URLSearchParams({
      hashes: Array.isArray(hashes) ? hashes.join('|') : hashes,
      limit: limit.toString(),
    });
    await this.callMethod(APINames.torrents, 'setUploadLimit', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-torrent-location).
   * @param hashes Can contain multiple hashes or set to `all`.
   * @param location The location to download the torrent to.
   * If the location doesn't exist, the torrent's location is unchanged.
   */
  async setTorrentLocation(hashes: string[] | 'all', location: string): Promise<void> {
    const body = new URLSearchParams({ hashes: Array.isArray(hashes) ? hashes.join('|') : hashes, location });
    await this.callMethod(APINames.torrents, 'setLocation', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-torrent-category).
   * @param hash The hash of the torrent to rename.
   * @param name The new name of the torrent.
   */
  async setTorrentName(hash: string, name: string): Promise<void> {
    const body = new URLSearchParams({ hash, name });
    await this.callMethod(APINames.torrents, 'rename', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-torrent-category).
   * @param hashes Can contain multiple hashes or set to `all`.
   * @param category The category to set the torrent to.
   * Pass empty string to unset the category.
   */
  async setTorrentCategory(hashes: string[] | 'all', category: string): Promise<void> {
    const body = new URLSearchParams({ hashes: Array.isArray(hashes) ? hashes.join('|') : hashes, category });
    await this.callMethod(APINames.torrents, 'setCategory', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-all-categories).
   */
  async getAllCategories(): Promise<Categories> {
    const { body: response } = await this.callMethod<Categories>(APINames.torrents, 'categories');
    return response;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#edit-category).
   * @param category The name of the category to edit.
   * @param savePath The new save path of the category.
   */
  async editCategory(category: string, savePath: string): Promise<void> {
    const body = new URLSearchParams({ category, savePath });
    await this.callMethod(APINames.torrents, 'editCategory', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#remove-categories).
   * @param categories Names of the categories to remove.
   */
  async removeCategory(categories: string[]): Promise<void> {
    const body = new URLSearchParams({ categories: categories.join('|') });
    await this.callMethod(APINames.torrents, 'removeCategories', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#add-torrent-tags).
   * @param hashes Can contain multiple hashes or set to `all`.
   * @param tags The list of tags you want to add to passed torrents.
   */
  async addTorrentTags(hashes: string[] | 'all', tags: string[]): Promise<void> {
    const body = new URLSearchParams({
      hashes: Array.isArray(hashes) ? hashes.join('|') : hashes,
      tags: tags.join(','),
    });
    await this.callMethod(APINames.torrents, 'addTags', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#remove-torrent-tags).
   * @param hashes Can contain multiple hashes or set to `all`.
   * @param tags The list of tags you want to remove from passed torrents.
   * Pass empty list all don't pass tags at all to removes all tags from relevant torrents.
   */
  async removeTorrentTags(hashes: string[] | 'all', tags?: string[]): Promise<void> {
    const body = new URLSearchParams({ hashes: Array.isArray(hashes) ? hashes.join('|') : hashes });
    if (Array.isArray(tags)) body.set('tags', tags.join(','));
    await this.callMethod(APINames.torrents, 'removeTags', { method: 'POST', body });
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-all-tags). */
  async getAllTags(): Promise<string[]> {
    const { body: response } = await this.callMethod<string[]>(APINames.torrents, 'tags');
    return response;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#create-tags).
   * @param tags A list of tags you want to create.
   */
  async createTags(tags: string[]): Promise<void> {
    const body = new URLSearchParams({ tags: tags.join(',') });
    await this.callMethod(APINames.torrents, 'createTags', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#delete-tags).
   * @param tags A list of tags you want to delete.
   */
  async deleteTags(tags: string[]): Promise<void> {
    const body = new URLSearchParams({ tags: tags.join(',') });
    await this.callMethod(APINames.torrents, 'deleteTags', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-automatic-torrent-management).
   * @param hashes Can contain multiple hashes or set to `all`.
   * @param enable `true` to enable, `false` to disable.
   */
  async setAutomaticTorrentManagement(hashes: string[] | 'all', enable: boolean = false): Promise<void> {
    const body = new URLSearchParams({
      hashes: Array.isArray(hashes) ? hashes.join('|') : hashes,
      enable: enable.toString(),
    });
    await this.callMethod(APINames.torrents, 'setAutoManagement', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-sequential-download).
   * @param hashes The hashes of the torrents you want to toggle sequential download for. Can contain multiple hashes or set to `all`.
   */
  async toggleSequentialDownload(hashes: string[] | 'all'): Promise<void> {
    const body = new URLSearchParams({ hashes: Array.isArray(hashes) ? hashes.join('|') : hashes });
    await this.callMethod(APINames.torrents, 'toggleSequentialDownload', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-prioritize-first-last-piece).
   * @param hashes The hashes of the torrents you want to toggle prioritize first last piece for. Can contain multiple hashes or set to `all`.
   */
  async setFirstLastPiecePriority(hashes: string[] | 'all'): Promise<void> {
    const body = new URLSearchParams({ hashes: Array.isArray(hashes) ? hashes.join('|') : hashes });
    await this.callMethod(APINames.torrents, 'toggleFirstLastPiecePrio', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-force-start).
   * @param hashes Can contain multiple hashes or set to `all`.
   * @param value A boolean, affects the torrents listed in `hashes`.
   */
  async setForceStart(hashes: string[] | 'all', value: boolean = false): Promise<void> {
    const body = new URLSearchParams({
      hashes: Array.isArray(hashes) ? hashes.join('|') : hashes,
      value: value.toString(),
    });
    await this.callMethod(APINames.torrents, 'setForceStart', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-super-seeding).
   * @param hashes Can contain multiple hashes or set to `all`.
   * @param value A boolean, affects the torrents listed in `hashes`.
   */
  async setSuperSeeding(hashes: string[] | 'all', value: boolean = false): Promise<void> {
    const body = new URLSearchParams({
      hashes: Array.isArray(hashes) ? hashes.join('|') : hashes,
      value: value.toString(),
    });
    await this.callMethod(APINames.torrents, 'setSuperSeeding', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#rename-file).
   * @param hash The hash of the torrent.
   * @param oldPath The old path of the torrent.
   * @param newPath The new path to use for the file.
   */
  async renameFile(hash: string[] | 'all', oldPath: string, newPath: string): Promise<void> {
    const body = new URLSearchParams({ hash: Array.isArray(hash) ? hash.join('|') : hash, oldPath, newPath });
    await this.callMethod(APINames.torrents, 'renameFile', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#rename-folder).
   * @param hash The hash of the torrent.
   * @param oldPath The old path of the torrent.
   * @param newPath The new path to use for the folder.
   */
  async renameFolder(hash: string[] | 'all', oldPath: string, newPath: string): Promise<void> {
    const body = new URLSearchParams({ hash: Array.isArray(hash) ? hash.join('|') : hash, oldPath, newPath });
    await this.callMethod(APINames.torrents, 'renameFolder', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#add-folder).
   * @param path Full path of added folder (e.g. "The Pirate Bay\Top100").
   */
  async addFolder(path: string): Promise<void> {
    const body = new URLSearchParams({ path });
    await this.callMethod(APINames.rss, 'addFolder', { method: 'POST', body });
  }

  /**
   *  For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#add-feed).
   *  @param url URL of RSS feed.
   *  @param path Full path of added folder (e.g. "The Pirate Bay\Top100\Video").
   */
  async addFeed(url: string, path: string): Promise<void> {
    const body = new URLSearchParams({ url, path });
    // body.set('url', url);
    // if (path !== undefined) body.set('path', path);
    await this.callMethod(APINames.rss, 'addFeed', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#remove-item).
   * @param path Full path of removed item (e.g. "The Pirate Bay\Top100").
   */
  async removeItem(path: string): Promise<void> {
    const body = new URLSearchParams({ path });
    await this.callMethod(APINames.rss, 'removeItem', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#move-item).
   * @param itemPath Current full path of item (e.g. "The Pirate Bay\Top100").
   * @param destPath New full path of item (e.g. "The Pirate Bay").
   */
  async moveItem(itemPath: string, destPath: string): Promise<void> {
    const body = new URLSearchParams({ itemPath, destPath });
    await this.callMethod(APINames.rss, 'moveItem', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-all-items).
   * @param withData True if you need current feed articles. Default to false, if not provided.
   */
  async getAllItems<T extends boolean>(withData?: T): Promise<RSSItems<T>> {
    const { body: response } = await this.callMethod<any>(APINames.rss, 'items', {
      query: { withData: withData ?? false },
    });
    return response;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#mark-as-read).
   * @param itemPath Current full path of item (e.g. "The Pirate Bay\Top100").
   * @param articleId ID of article. If articleId is provided only the article is marked as read otherwise the whole feed is going to be marked as read.
   */
  async markAsRead(itemPath: string, articleId?: string): Promise<void> {
    const body = new URLSearchParams({ itemPath });
    if (articleId !== undefined) body.set('articleId', articleId);
    await this.callMethod(APINames.rss, 'markAsRead', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#refresh-item).
   * @param itemPath Current full path of item (e.g. "The Pirate Bay\Top100").
   */
  async refreshItem(itemPath: string): Promise<void> {
    const body = new URLSearchParams({ itemPath });
    await this.callMethod(APINames.rss, 'refreshItem', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#set-auto-downloading-rule).
   * @param ruleName Rule name (e.g. "Punisher").
   * @param ruleDef Rule definition.
   */
  async setAutoDownloadingRule(ruleName: string, ruleDef: AutoDownloadingRule): Promise<void> {
    const body = new URLSearchParams({ ruleName, ruleDef: JSON.stringify(ruleDef) });
    await this.callMethod(APINames.rss, 'setRule', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#rename-auto-downloading-rule).
   * @param ruleName Rule name (e.g. "Punisher").
   * @param newRuleName New rule name (e.g. "The Punisher").
   */
  async renameAutoDownloadingRule(ruleName: string, newRuleName: string): Promise<void> {
    const body = new URLSearchParams({ ruleName, newRuleName });
    await this.callMethod(APINames.rss, 'renameRule', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#remove-auto-downloading-rule).
   * @param ruleName Rule name (e.g. "Punisher").
   */
  async removeAutoDownloadingRule(ruleName: string): Promise<void> {
    const body = new URLSearchParams({ ruleName });
    await this.callMethod(APINames.rss, 'removeRule', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-all-auto-downloading-rules).
   */
  async getAllAutoDownloadingRules(): Promise<Record<string, AutoDownloadingRule>> {
    const { body: response } = await this.callMethod<Record<string, AutoDownloadingRule>>(APINames.rss, 'rules');
    return response;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-all-articles-matching-a-rule).
   * @param ruleName Rule name (e.g. "Linux").
   */
  async getAllArticlesMatchingRule(ruleName: string): Promise<Record<string, string[]>> {
    const body = new URLSearchParams({ ruleName });
    const { body: response } = await this.callMethod<any>(APINames.rss, 'matchingArticles', { method: 'POST', body });
    return response;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#start-search).
   * @param pattern Pattern to search for (e.g. "Ubuntu 18.04").
   * @param plugins Plugins to use for searching (e.g. "legittorrents").
   * @param category Categories to limit your search to (e.g. "legittorrents"). Available categories depend on the specified `plugins`. Also supports `all`.
   */
  async startSearch(
    pattern: string,
    plugins: string[] | 'all' | 'enabled' = 'all',
    category: string | 'all' = 'all',
  ): Promise<{ id: number }> {
    const body = new URLSearchParams({
      pattern,
      plugins: Array.isArray(plugins) ? plugins.join('|') : plugins,
      category,
    });
    const { body: response } = await this.callMethod<{ id: number }>(APINames.search, 'start', {
      method: 'POST',
      body,
    });
    return response;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#stop-search).
   * @param id ID of the search job.
   */
  async stopSearch(id: number): Promise<void> {
    const body = new URLSearchParams({ id: id.toString() });
    await this.callMethod(APINames.search, 'stop', { method: 'POST', body });
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-search-status).
   * @param id ID of the search job. If not specified, all search jobs are returned.
   */
  async getSearchStatus(id?: number): Promise<SearchStatus[]> {
    const body = new URLSearchParams();
    if (id !== undefined) body.set('id', id.toString());
    const { body: response } = await this.callMethod<SearchStatus[]>(APINames.search, 'status', {
      method: 'POST',
      body,
    });
    return response;
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-search-results).
   * @param id ID of the search job.
   * @param limit Max number of results to return. 0 or negative means no limit.
   * @param offset Result to start at. A negative number means count backwards (e.g. -2 returns the 2 most recent results).
   */
  async getSearchResults(id: number, limit: number = 0, offset: number = 0): Promise<SearchResult[]> {
    const body = new URLSearchParams({ id: id.toString(), limit: limit.toString(), offset: offset.toString() });
    const { body: response } = await this.callMethod<SearchResult[]>(APINames.search, 'results', {
      method: 'POST',
      body,
    });
    return response;
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#delete-search).
   * @param id ID of the search job.
   */
  async deleteSearch(id: number): Promise<void> {
    const body = new URLSearchParams({ id: id.toString() });
    await this.callMethod(APINames.search, 'delete', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#get-search-plugins).
   */
  async getSearchPlugins(): Promise<SearchPlugin[]> {
    const { body: response } = await this.callMethod<SearchPlugin[]>(APINames.search, 'plugins');
    return response;
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#install-search-plugin).
   * @param sources Url or file path of the plugin to install (e.g. "https://raw.githubusercontent.com/qbittorrent/search-plugins/master/nova3/engines/legittorrents.py").
   */
  async installSearchPlugin(sources: string[]): Promise<void> {
    const body = new URLSearchParams({ sources: sources.join('|') });
    await this.callMethod(APINames.search, 'installPlugin', { method: 'POST', body });
  }

  /** For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#uninstall-search-plugin).
   * @param names Name of the plugin to uninstall (e.g. "legittorrents").
   */
  async uninstallSearchPlugin(names: string[]): Promise<void> {
    const body = new URLSearchParams({ names: names.join('|') });
    await this.callMethod(APINames.search, 'uninstallPlugin', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#enable-search-plugin).
   * @param names Name of the plugin to enable/disable (e.g. "legittorrents").
   * @param enable Whether the plugins should be enabled.
   */
  async enableSearchPlugin(names: string[], enable: boolean = true): Promise<void> {
    const body = new URLSearchParams({ names: names.join('|'), enable: enable.toString() });
    await this.callMethod(APINames.search, 'enablePlugin', { method: 'POST', body });
  }

  /**
   * For more info see [official documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#update-search-plugins).
   */
  async updateSearchPlugins(): Promise<void> {
    await this.callMethod(APINames.search, 'updatePlugins', { method: 'POST' });
  }
}

export default QBittorrent;
