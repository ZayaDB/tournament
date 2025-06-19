# Dance Tournament Management System

A comprehensive web application for managing dance tournaments with real-time judging, bracket management, and participant registration.

## Features

### 🎯 Core Features

- **Event & Tournament Management** - Create and manage dance events with multiple tournaments
- **Participant Registration** - Easy registration with image upload
- **Judge Registration** - Add judges to tournaments
- **Real-time Judging System** - Live scoring with auto-refresh
- **Bracket Generation** - Automatic tournament bracket creation
- **Match Management** - Admin control over match progression
- **Winner Determination** - Automatic winner selection based on scores

### 🎨 User Interface

- **Responsive Design** - Works on desktop and mobile
- **Real-time Updates** - Live score updates and match progression
- **Intuitive Navigation** - Easy-to-use admin and judge panels
- **Visual Progress Tracking** - Tournament progress indicators

### 🔧 Technical Features

- **Next.js 15** - Modern React framework with App Router
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Robust database with Railway hosting
- **Image Upload/Storage** - Railway Express server for image handling
- **TypeScript** - Full type safety
- **Tailwind CSS** - Modern styling

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Railway account (for hosting)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd tournament
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**
   Create a `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tournament"

# Admin Password (for match management)
ADMIN_PASSWORD="your-admin-password-here"

# Railway Image Server URL (for image uploads)
RAILWAY_IMAGE_SERVER_URL="https://your-railway-app.up.railway.app"
```

4. **Set up the database**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Admin Panel

1. Access admin panel with password
2. Create events and tournaments
3. Generate brackets when ready
4. Manage matches and determine winners

### Judge Panel

1. Register as a judge for a tournament
2. Score participants in real-time
3. View all judges' scores
4. Auto-refresh for live updates

### Participant Registration

1. Register with name and photo
2. Join tournaments
3. View bracket progression

## Deployment

### Netlify (Frontend)

- Deploy Next.js app to Netlify
- Set environment variables in Netlify dashboard
- Configure build command: `prisma generate && prisma migrate deploy && next build`

### Railway (Backend & Database)

- Deploy Express server for image handling
- Set up PostgreSQL database
- Configure environment variables

## API Endpoints

### Events

- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `DELETE /api/events/[id]` - Delete event

### Tournaments

- `GET /api/tournaments` - List tournaments
- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments/[id]` - Get tournament details
- `POST /api/tournaments/[id]/generate-brackets` - Generate brackets
- `GET /api/tournaments/[id]/current-match` - Get current match
- `POST /api/tournaments/[id]/finish-match` - Finish match

### Participants

- `POST /api/participants` - Register participant
- `GET /api/tournaments/[id]/participants` - Get tournament participants

### Judges

- `POST /api/judges` - Register judge
- `GET /api/tournaments/[id]/judges` - Get tournament judges

### Scores

- `POST /api/scores` - Submit score
- `GET /api/scores` - Get scores

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
