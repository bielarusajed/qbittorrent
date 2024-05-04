export interface GetLogOptions {
  /** Include normal messages (default: `true`) */
  normal?: boolean;
  /** Include info messages (default: `true`) */
  info?: boolean;
  /** Include warning messages (default: `true`) */
  warning?: boolean;
  /** Include critical messages (default: `true`) */
  critical?: boolean;
  /** Exclude messages with "message id" <= `last_known_id` (default: `-1`) */
  last_known_id?: number;
}

export interface LogEntry {
  /** ID of the message */
  id: number;
  /** Seconds since epoch (Note: switched from milliseconds to seconds in v4.5.0) */
  timestamp: number;
  /** Text of the message */
  message: string;
}

export interface PeerLogEntry {
  /** ID of the peer */
  id: number;
  /** IP of the peer */
  ip: number;
  /** Seconds since epoch
   */
  timestamp: number;
  /** Whether or not the peer was blocked */
  blocked: boolean;
  /** Reason of the block */
  reason: string;
}
