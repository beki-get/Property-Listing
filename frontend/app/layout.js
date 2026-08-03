import './globals.css';
import Navbar from '../components/layout/Navbar';
import HydrationGuard from '../components/shared/HydrationGuard';

export const metadata = {
  title: 'MelaHome — Ethiopian Property Listings',
  description: 'Find, list and manage properties across Ethiopia. Apartments, houses, villas and commercial spaces.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <HydrationGuard>
          <Navbar />
          <main>{children}</main>
        </HydrationGuard>
      </body>
    </html>
  );
}
