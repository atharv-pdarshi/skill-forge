// pages/about.js
import Head from 'next/head';
import Link from 'next/link';
import { Container, Button } from 'react-bootstrap';

export default function AboutPage() {
  return (
    <Container className="mt-5 text-center">
      <Head>
        <title>About Us - Skill-Sharing Platform</title>
        <meta name="description" content="Learn more about our platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="mb-4">
          About Our Platform
        </h1>
        <p className="lead mb-4">
          We aim to connect people who want to learn with those who want to share skills.
        </p>
        {/* Remove legacyBehavior. Button component should be the direct child. */}
        <Link href="/" passHref>
          <Button variant="secondary">Go back to Home Page</Button>
        </Link>
      </main>
    </Container>
  );
}