import { Anuphan } from 'next/font/google';
import './globals.css';
import RegisterSW from './components/RegisterSW';

const anuphan = Anuphan({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-anuphan',
  display: 'swap',
});

export const metadata = {
  title: 'หาบริการรัฐใกล้ฉัน',
  description:
    'คู่มือบริการรัฐสำหรับประชาชนทั่วไป ไรเดอร์ ฟรีแลนซ์ เจ้าของกิจการ ผู้สูงอายุ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={anuphan.variable}>
      <head>
        <link rel="manifest" href="/gov-service-locator/manifest.json" />
        <meta name="theme-color" content="#0B3954" />
        <script
          defer
          src="https://umami-host-peerapongsms-projects.vercel.app/script.js"
          data-website-id="3f09453d-0b39-443e-8845-5e65611cc58a"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
