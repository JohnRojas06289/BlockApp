<div align="center">

<br />

# ◈ BlockApp

### Your crypto portfolio, always with you.

**Real-time market data · On-chain wallet auditing · Offline-first**

<br />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-blockapp.vercel.app-6366f1?style=for-the-badge&logoColor=white)](https://blockapp.vercel.app)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-0a0a12?style=for-the-badge)](https://blockapp.vercel.app)
[![Built with Expo](https://img.shields.io/badge/Built%20with-Expo%20SDK%2054-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)

<br />

</div>

---

## What is BlockApp?

BlockApp is a **cross-platform crypto portfolio tracker** built for investors who want clarity over their on-chain assets without compromise.

No bloat. No subscriptions. No 3-second load times.

Connect any public wallet, browse live market prices, and audit your holdings across Bitcoin, Ethereum, and Solana — even when you're offline. BlockApp stores everything locally on your device and syncs when you're back online.

---

## Features

<table>
<tr>
<td width="50%">

### 📈 Live Market Data
Real-time prices, 24h changes, and market cap for thousands of crypto assets. Powered by CoinGecko's industry-standard API with local caching so data is always available.

</td>
<td width="50%">

### 🔗 On-Chain Wallet Audit
Paste any public wallet address and get a full breakdown of your on-chain holdings. No seed phrase. No private keys. Ever.

</td>
</tr>
<tr>
<td width="50%">

### ⚡ Offline First
Your portfolio never disappears. All data is persisted locally using SQLite. Open the app on a plane, in a subway, or anywhere — it just works.

</td>
<td width="50%">

### 🔐 Secure Authentication
Sign in with email, Google, or GitHub via Clerk. Session tokens stored in the device's native keychain — never in plain text.

</td>
</tr>
</table>

---

## Supported Networks

| Network | Status |
|---------|--------|
| ₿ Bitcoin | ✅ Live |
| Ξ Ethereum | ✅ Live |
| ◎ Solana | ✅ Live |
| More chains | 🔜 Coming soon |

---

## Tech Stack

BlockApp is built on a foundation of modern, production-grade tools chosen for performance and reliability.

| Layer | Technology |
|-------|-----------|
| **Framework** | [Expo SDK 54](https://expo.dev) + [Expo Router 6](https://expo.github.io/router) |
| **UI** | React Native · React Native Web |
| **Auth** | [Clerk](https://clerk.com) (Email · Google · GitHub OAuth) |
| **Local DB** | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) + [Drizzle ORM](https://orm.drizzle.team) |
| **Market Data** | [CoinGecko API](https://www.coingecko.com/en/api) |
| **Chain Data** | [Blockchair API](https://blockchair.com/api) |
| **State** | [TanStack Query v5](https://tanstack.com/query) |
| **Deployment** | [Vercel](https://vercel.com) |
| **Language** | TypeScript (strict) |

### Architecture

BlockApp follows **Hexagonal Architecture** (ports & adapters) organized per module — keeping domain logic completely decoupled from infrastructure concerns.

```
src/
└── modules/
    ├── market/
    │   ├── domain/          # Entities, ports (interfaces)
    │   ├── application/     # Use cases, hooks
    │   └── infrastructure/  # API clients, local data sources
    ├── wallet/
    │   └── ...
    └── profile/
        └── ...
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) (for mobile) or a web browser (for web)

### 1. Clone and install

```bash
git clone https://github.com/JohnRojas06289/BlockApp.git
cd BlockApp
npm install
```

### 2. Set environment variables

Create a `.env.local` file at the root:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_COINGECKO_API_KEY=your_key_here
EXPO_PUBLIC_BLOCKCHAIR_API_KEY=your_key_here
```

> Get your Clerk key at [clerk.com](https://clerk.com) · CoinGecko key at [coingecko.com/api](https://www.coingecko.com/en/api) · Blockchair key at [blockchair.com/api](https://blockchair.com/api)

### 3. Run

```bash
# Web
npm run web

# iOS
npm run ios

# Android
npm run android
```

---

## Deployment

BlockApp ships as a static web app via Vercel. A single command deploys everything:

```bash
vercel --prod
```

The web build uses Expo's static export (`expo export --platform web`) with Expo Router's static rendering for instant page loads.

---

## Roadmap

- [ ] **Multi-wallet dashboard** — track multiple addresses in one view
- [ ] **Price alerts** — push notifications when assets hit your target
- [ ] **DeFi positions** — display LP and staking positions
- [ ] **Cloud sync** — optional Turso-powered cross-device sync
- [ ] **Portfolio analytics** — P&L charts, allocation breakdowns
- [ ] **More networks** — Polygon, Arbitrum, Base, Avalanche

---

## Data & Privacy

BlockApp is built with privacy as a default, not an afterthought.

- **No wallet connection required** — public addresses only
- **Private keys never touched** — read-only chain queries via Blockchair
- **Local-first storage** — your data lives on your device
- **Auth tokens in native keychain** — iOS Keychain / Android Keystore

---

<div align="center">

<br />

**Built for the on-chain community**

Market data by [CoinGecko](https://www.coingecko.com) · Chain data by [Blockchair](https://blockchair.com)

<br />

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JohnRojas06289/BlockApp)

</div>
