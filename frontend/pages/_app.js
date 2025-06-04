import 'bootstrap/dist/css/bootstrap.min.css'; // Add this line
import '@/styles/globals.css'; // Or your path to globals.css
import Header from '../components/Header';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
}
