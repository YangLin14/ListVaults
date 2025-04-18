# ListVaults

ListVaults is a modern inventory management system built with Next.js and Firebase, providing a secure and efficient way to manage your inventory items.

## Features

- User Authentication (Sign up, Sign in, Sign out)
- Real-time Database with Firestore
- Secure Data Management
- Modern and Responsive UI
- Inventory Management Capabilities

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14 or higher)
- npm or yarn package manager
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YangLin14/ListVaults.git
cd ListVaults
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up Firebase Configuration:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication and Firestore in your Firebase project
   - Copy your Firebase configuration from the Firebase Console
   - Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app` - Next.js application pages and components
- `/components` - Reusable React components
- `/firebase.js` - Firebase configuration and utility functions
- `/styles` - CSS and styling files

## Firebase Features Used

- **Authentication**: Email/Password authentication
- **Firestore**: Real-time database for storing inventory data

## Security

- Firebase Security Rules should be properly configured in your Firebase Console
- Environment variables are used for sensitive configuration
- Client-side authentication is implemented
- All database operations are secured with proper authentication checks

## Deployment

The application can be deployed using Vercel:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Configure environment variables in Vercel
4. Deploy

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the project maintainers.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
