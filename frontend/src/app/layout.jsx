import { cookies } from 'next/headers';
import './globals.css';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import Navbar from '@/components/Navbar';
import ThemeContextProvider from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationProvider';
import Head from 'next/head';
// import logo from '../app/images/logo.png'

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
            {/* <ThemeToggleButton /> */}
            {children}
          </NotificationProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
