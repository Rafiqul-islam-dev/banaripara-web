export const metadata = {
  title: {
    default: 'Banaripara',
    template: '%s',
  },
  description: 'Banaripara digital information web app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
