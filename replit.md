# FairPay Laos - Cross-Border Payment Solution

## Overview

FairPay Laos is a multi-currency e-wallet and QR payment system designed for seamless transactions in Laos. The platform enables tourists, expats, and local businesses to transact with multiple currencies (USD, THB, EUR, LAK) using QR codes and real-time currency exchange with low fees (0.5%).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for FairPay branding
- **State Management**: React Query (TanStack Query) for server state and React Context for authentication
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Responsive layout optimized for mobile devices with bottom navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Payment Processing**: Stripe integration for international payments

## Key Components

### User Management
- **Authentication System**: JWT-based auth with passport-based KYC (no Lao bank account required)
- **User Types**: Regular users (tourists/expats) and vendors (Lao businesses)
- **Verification**: Email verification and business KYC for vendors

### Wallet System
- **Multi-Currency Support**: USD, THB, EUR, LAK wallets per user
- **Balance Management**: Decimal precision for accurate financial calculations
- **Top-up Methods**: International cards via Stripe, planned Thai bank transfers (PromptPay)

### Transaction Engine
- **Payment Types**: Top-up, QR payments, currency exchange, withdrawals
- **Exchange Rates**: Real-time currency conversion with 0.5% fee
- **QR Code System**: Generate and scan QR codes for vendor payments
- **Transaction History**: Comprehensive logging with status tracking

### Vendor Features
- **Business Registration**: KYC onboarding with business verification
- **QR Code Generation**: Dynamic QR codes for payment acceptance
- **Settlement**: Instant settlement to e-wallet with withdrawal options to BCEL/BFL

## Data Flow

1. **User Registration**: Passport + foreign phone number → Account creation → Email verification
2. **Wallet Top-up**: Select currency → Payment method (Stripe) → Fund wallet
3. **QR Payment**: Scan vendor QR → Confirm payment → Currency exchange (if needed) → Transfer funds
4. **Vendor Settlement**: Receive payment → Convert to LAK (if needed) → Withdraw to local bank

## External Dependencies

### Payment Processing
- **Stripe**: International card payments and customer management
- **Planned Integrations**: PromptPay for Thai bank transfers, BCEL/BFL for Lao bank settlements

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development and deployment platform

### UI & Components
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Deployment Strategy

### Development
- **Environment**: Replit with hot reloading via Vite
- **Database**: Neon serverless PostgreSQL
- **Environment Variables**: JWT secrets, Stripe keys, database URL

### Production Build
- **Frontend**: Vite build output to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Deployment**: Single server deployment with static file serving

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Schema**: Shared TypeScript definitions between client and server
- **Connection**: Connection pooling via Neon serverless

The architecture prioritizes simplicity, type safety, and mobile user experience while maintaining compliance requirements for financial services in Laos.