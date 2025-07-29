import Navbar from './navbar';
import Footer from './footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}