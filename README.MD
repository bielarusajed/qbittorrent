# qbittorrent

This is a library to work with qBittorrent WebUI API v2. It provides a TypeScript interface to interact with the qBittorrent WebUI, allowing you to manage torrents, categories, tags, and more.

## Installation

IDK. Don't use it at all. Probably won't be published to npm. Probably won't be maintained properly. Made for personal use.

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
