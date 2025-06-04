// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import { Container, Button } from 'react-bootstrap';

export default function Home() {
  return (
    <Container className="mt-5 text-center">
      <Head>
        <title>Skill-Sharing Platform - Home</title>
        <meta name="description" content="Welcome to our skill-sharing platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="mb-4">
          Welcome to the Skill-Sharing Platform!
        </h1>
        <p className="lead mb-4">
          This is the home page. Find amazing skills or share your own.
        </p>
        {/* Remove legacyBehavior. Button component should be the direct child. */}
        <Link href="/about" passHref>
          <Button variant="primary">Go to About Page</Button>
        </Link>
      </main>
    </Container>
  );
}