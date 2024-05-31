# qbittorrent

This is a library to work with qBittorrent WebUI API v2. It provides a TypeScript interface to interact with the qBittorrent WebUI, allowing you to manage torrents, categories, tags, and more.

## Installation

> [!CAUTION]
> This package was made for the one-time use and probably won't be maintained properly, if the API updates.
> It was tested with qBittorrent v4.6.5 (API version v2.9.3) — the latest version at the moment, it was created.
> There are no guarantees, that it will perfectly work, even with a tested API version. THERE ARE NO PROPER TESTS AT ALL.

You can install it from JSR: [@bielarusajed/qbittorrent](https://jsr.io/@bielarusajed/qbittorrent)

## Usage

Here's a basic example of how to use this library:

```typescript
import QBittorrent from 'qbittorrent';

async function main() {
  const client = new QBittorrent('http://localhost:8080');

  try {
    // Login to the qBittorrent WebUI
    await client.login('admin', 'adminadmin');
    console.log('Logged in!');

    // Get the API version
    const version = await client.getAPIVersion();
    console.log('API Version:', version);
  } catch (error) {
    console.error('Failed:', error);
  }
}

main();
```

## Documentation

For detailed documentation of all the methods available in this library, please refer to the [official qBittorrent WebUI API documentation](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)).

## License

This project is licensed under the ISC License.
