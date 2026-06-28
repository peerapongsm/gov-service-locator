import './globals.css';

export const metadata = {
  title: 'Gov Service Locator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <script
          defer
          src="https://umami-host-peerapongsms-projects.vercel.app/script.js"
          data-website-id="3f09453d-0b39-443e-8845-5e65611cc58a"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
