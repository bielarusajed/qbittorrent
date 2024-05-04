export interface CallMethodResponse<T> {
  body: T;
  headers: Headers;
}

export interface CallMethodOptions {
  method?: 'GET' | 'POST';
  query?: any;
  body?: FormData | URLSearchParams | string;
  headers?: Headers;
}
