import BookDetail from '@/components/archive/BookDetail';

/**
 * Slugs of the seeded volumes, kept so a build still produces a complete archive
 * when the catalogue API is unreachable (an offline or first-time build).
 */
const SEEDED_SLUGS = [
  'the-discipline-of-sovereignty',
  'letters-from-the-northern-estate',
  'a-treatise-on-the-modern-estate',
  'the-cellar-book-of-ravensworth',
  'confessions-of-a-country-solicitor',
  'the-principles-of-good-governance',
  'on-the-conduct-of-large-households',
  'the-antiquarians-county',
];

function catalogueBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'http://localhost:8000/api/v1';
}

/**
 * The archive is a static export, so every title that should be reachable by its
 * own address must be enumerated at build time, as the stays pages do. Reading
 * the list from the API means a title published in SecureGate becomes publicly
 * addressable on the next deployment instead of 404ing until someone remembers
 * to edit this file.
 *
 * A failed fetch is not fatal: the build falls back to the seeded slugs so a
 * missing or slow API cannot fail the whole export.
 */
export async function generateStaticParams() {
  try {
    const response = await fetch(`${catalogueBaseUrl()}/library/books?per_page=60`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Catalogue responded ${response.status}`);
    }

    const payload = await response.json();
    const slugs = (payload?.data ?? [])
      .map((book: { slug?: string }) => book?.slug)
      .filter((slug: unknown): slug is string => typeof slug === 'string' && slug.length > 0);

    if (slugs.length > 0) {
      // A title added locally may not be in the seeded list yet, so the union
      // keeps every known address generated.
      return Array.from(new Set([...slugs, ...SEEDED_SLUGS])).map((slug) => ({ slug }));
    }
  } catch {
    // Fall through to the seeded list below.
  }

  return SEEDED_SLUGS.map((slug) => ({ slug }));
}

export default async function BookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <BookDetail slug={slug} />;
}
