# World ID Minecraft Web

This is the web frontend for the [World ID Minecraft plugin](https://github.com/worldcoin/world-id-minecraft). It is built with [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), and [Redis](https://redis.io/).

## Getting Started

This guide assumes you're also running a Minecraft server and have the World ID plugin installed. If you don't, see the [World ID Minecraft plugin README](https://github.com/worldcoin/world-id-minecraft).

First, set the correct Node.js version using `nvm` and run the development server:

```bash
nvm use 18
pnpm i && pnpm dev
```

Copy `.env.example` to `.env.local` and add your Redis URL.

At this point, you're ready to begin testing! Ensure you set the URL of the locally-running web server in the World ID plugin config.