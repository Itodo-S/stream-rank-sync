# Stream Rank Sync

A real-time gaming leaderboard application powered by Somnia Data Streams. Experience instant rank updates, live tournaments, and Web3-powered player authentication with zero delay.

## Features

- **Real-Time Updates**: Instant rank changes powered by Somnia Data Streams
- **Web3 Authenticated**: Secure wallet-based player authentication and profile management
- **Live Tournaments**: Dynamic brackets with real-time match results and standings
- **Global Leaderboard**: Compete with players worldwide with live rank tracking
- **Achievement System**: Unlock achievements instantly as they happen on-chain
- **Player Profiles**: Track your stats, history, and compare with other players

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Blockchain Integration**: 
  - `@somnia-chain/streams` - Somnia Data Streams SDK
  - `viem` - Ethereum library for wallet and RPC interactions
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: Sonner (toast notifications)

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or yarn package manager
- A Web3 wallet (MetaMask or compatible)

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd stream-rank-sync
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Update `.env.local` with your configuration (see [Environment Configuration](#environment-configuration))

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Environment Configuration

Copy `env.example` to `.env.local` (or `.env`) and update the values for your target Somnia network.

### Network Configuration

- `VITE_SOMNIA_NETWORK` – Set to `testnet` or `mainnet` (default: `testnet`)

### Testnet Configuration (default)

- `VITE_SOMNIA_TESTNET_RPC_URL` – HTTPS RPC endpoint for Somnia Testnet
- `VITE_SOMNIA_TESTNET_WS_URL` – WebSocket RPC endpoint for Somnia Testnet
- `VITE_SOMNIA_TESTNET_EXPLORER_URL` – Block explorer URL for testnet

### Mainnet Configuration

- `VITE_SOMNIA_MAINNET_RPC_URL` – HTTPS RPC endpoint for Somnia Mainnet
- `VITE_SOMNIA_MAINNET_WS_URL` – WebSocket RPC endpoint for Somnia Mainnet
- `VITE_SOMNIA_MAINNET_EXPLORER_URL` – Block explorer URL for mainnet

### Data Stream Event IDs (Optional)

When you have specific Somnia Data Stream event IDs, you can configure them:

- `VITE_LEADERBOARD_STREAM_EVENT_ID` – Event ID for leaderboard updates
- `VITE_TOURNAMENT_STREAM_EVENT_ID` – Event ID for tournament updates

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run test:streams` - Test Somnia Data Streams connection

## Project Structure

```
stream-rank-sync/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Navbar.tsx       # Navigation component
│   │   ├── Footer.tsx       # Footer component
│   │   └── NavLink.tsx      # Navigation link component
│   ├── context/             # React context providers
│   │   ├── somnia-wallet-context.tsx    # Wallet connection context
│   │   └── data-streams-context.tsx     # Data streams context
│   ├── hooks/               # Custom React hooks
│   │   ├── use-somnia-wallet.ts         # Wallet hook
│   │   ├── use-leaderboard-stream.ts    # Leaderboard stream hook
│   │   ├── use-player-stream.ts         # Player stream hook
│   │   ├── use-tournament-stream.ts     # Tournament stream hook
│   │   └── use-tournaments-stream.ts   # Tournaments stream hook
│   ├── pages/               # Page components
│   │   ├── Landing.tsx      # Landing page
│   │   ├── Connect.tsx      # Wallet connection page
│   │   ├── Dashboard.tsx    # Player dashboard
│   │   ├── Leaderboard.tsx  # Global leaderboard
│   │   ├── Tournaments.tsx  # Tournaments list
│   │   ├── Achievements.tsx # Achievements page
│   │   └── Profile.tsx      # Player profile
│   ├── lib/                 # Utility libraries
│   │   ├── somnia.ts        # Somnia chain configuration
│   │   └── utils.ts         # Utility functions
│   ├── types/               # TypeScript type definitions
│   │   └── game-events.ts   # Game event type definitions
│   └── utils/               # Utility functions
│       ├── event-transformer.ts  # Event transformation utilities
│       └── mockData.ts           # Mock data for development
├── scripts/
│   └── test-somnia-streams.js    # Test script for data streams
├── public/                  # Static assets
└── package.json
```

## How It Works

### Real-Time Data Streams

This application uses **Somnia Data Streams** for real-time updates:

1. **Connect Wallet**: Users connect their wallet via MetaMask or compatible wallet
2. **Auto-Subscribe**: The app automatically subscribes to relevant data streams when connected
3. **Live Updates**: Events from Somnia Data Streams trigger instant UI updates
4. **Notifications**: Toast notifications alert users to important events (rank changes, achievements, match results)

### Event Types

The app handles four main event types:

- `scoreUpdate` – Player score changes
- `rankChange` – Player rank changes (up/down/same)
- `achievementUnlocked` – New achievement unlocked
- `matchResult` – Tournament match results

### Custom Hooks

The application provides custom hooks for subscribing to different data streams:

- `useLeaderboardStream()` - Subscribe to leaderboard updates
- `usePlayerStream(walletAddress)` - Subscribe to specific player updates
- `useTournamentStream(tournamentId)` - Subscribe to tournament updates
- `useTournamentsStream()` - Subscribe to all tournaments

## Testing Data Streams

To test the Somnia Data Streams connection:

```bash
npm run test:streams
```

This script will:
1. Create a public client with WebSocket transport
2. Initialize the Somnia SDK
3. Subscribe to the general stream (or specific event ID if configured)
4. Display received events and their structure
5. Provide a summary of received payloads

The script will run for 10 seconds and then display a summary. If you have `VITE_LEADERBOARD_STREAM_EVENT_ID` set, it will also test that specific stream.

## Deployment

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Deploy to Vercel

The project includes a `vercel.json` configuration file. To deploy:

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

### Deploy to Other Platforms

The project can be deployed to any static hosting provider:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any other static site host

Make sure to set your environment variables in your hosting platform's configuration.

## Customization

### Using Your Own Data Streams

To use your own data streams, update the stream event IDs in your environment variables or pass them directly to the subscription hooks:

```typescript
const { data } = useLeaderboardStream({
  eventId: 'your-custom-event-id'
})
```

### Styling

The project uses Tailwind CSS with shadcn/ui components. You can customize:
- Colors in `tailwind.config.ts`
- Component styles in `src/components/ui/`
- Global styles in `src/index.css`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of a hackathon submission. See the repository for license information.

## Support

For issues and questions:
- Check the [Somnia Documentation](https://docs.somnia.network)
- Open an issue in this repository
- Contact the development team
