import { cookies } from 'next/headers';
import './globals.css';
import Navbar from './components/Navbar';
import ThemeContextProvider from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationProvider';
import Head from 'next/head';
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'Cognet',
  icons: {

  }
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies(); // ✅ await required
  const theme = cookieStore.get('theme')?.value;
  const isDark = theme === 'dark';

  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <body>
        <ThemeContextProvider isDarkMode={isDark}>
          <NotificationProvider>
            <Navbar />
            {children}

            {/* vercel analytics, tells visitors count */}
            <Analytics />
          </NotificationProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
