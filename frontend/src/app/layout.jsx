import { cookies } from 'next/headers';
import './globals.css';
import ThemeContextProvider from './ThemeContext';
import ThemeToggleButton from '@/components/ThemeToggleButton';

export const metadata = {
  title: 'Mind Map',
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies(); // ✅ await required
  const theme = cookieStore.get('theme')?.value;
  const isDark = theme === 'dark';

  return (
    <html lang="en">
      <body>
        <ThemeContextProvider isDarkMode={isDark}>
          <ThemeToggleButton />
          {children}
        </ThemeContextProvider>
      </body>
    </html>
  );
}
