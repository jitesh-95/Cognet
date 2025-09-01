import { cookies } from 'next/headers';
import './globals.css';
import ThemeContextProvider from './ThemeContext';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Cognet',
  icons: {
    icon: '/images/logo.png', // default favicon
    apple: '/images/logo.png', // optional for Apple devices
    shortcut: '/images/logo.png', // optional
  },
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies(); // ✅ await required
  const theme = cookieStore.get('theme')?.value;
  const isDark = theme === 'dark';

  return (
    <html lang="en">
      <body>
        <ThemeContextProvider isDarkMode={isDark}>
          <Navbar />
          {/* <ThemeToggleButton /> */}
          {children}
        </ThemeContextProvider>
      </body>
    </html>
  );
}
