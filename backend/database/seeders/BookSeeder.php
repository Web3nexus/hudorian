<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BookCollection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $collections = [
            ['name' => 'The Sovereign Collection', 'slug' => 'sovereign-collection', 'description' => 'Works of enduring governance, dynasty and statecraft, gathered from the private press.', 'sort_order' => 1],
            ['name' => 'Estate & Landscape', 'slug' => 'estate-and-landscape', 'description' => 'On country houses, gardens and the architecture of landed life.', 'sort_order' => 2],
            ['name' => 'The Ledger & The Table', 'slug' => 'ledger-and-table', 'description' => 'Hospitality, cellar books and the ceremony of the table.', 'sort_order' => 3],
            ['name' => 'Letters & Confessions', 'slug' => 'letters-and-confessions', 'description' => 'Private correspondence and diaries, annotated by the archivists.', 'sort_order' => 4],
        ];

        foreach ($collections as $data) {
            BookCollection::updateOrCreate(['slug' => $data['slug']], $data);
        }

        $collectionIds = BookCollection::pluck('id', 'slug');

        $books = [
            [
                'title' => 'The Discipline of Sovereignty',
                'author' => 'Aldous Verity, 4th Marquess of Ravensworth',
                'isbn' => '978-1-4028-9462-1',
                'format' => 'pdf',
                'page_count' => 412,
                'published_year' => '1931',
                'collection' => 'sovereign-collection',
                'short_description' => 'A founder\'s manual on ruling without apparent effort.',
                'description' => "Written in the winter of 1929 and withheld from publication for four decades, The Discipline of Sovereignty is a private handbook on the art of command. Verity treats governance as a craft of restraint: the deliberate reduction of one's own visibility, the management of inherited obligation, and the cultivation of a household that can govern in one's absence.\n\nThis edition reproduces the author's annotated working copy, including the interleaved marginalia that reveal how his own principles failed him.",
                'purchase_price' => 145.00,
                'rental_price' => 18.00,
                'rental_days' => 21,
                'is_featured' => true,
            ],
            [
                'title' => 'Letters from the Northern Estate',
                'author' => 'Hon. Cecilia Fane',
                'isbn' => '978-0-306-40615-8',
                'format' => 'epub',
                'page_count' => 288,
                'published_year' => '1948',
                'collection' => 'letters-and-confessions',
                'short_description' => 'Thirty years of letters home from a life spent elsewhere.',
                'description' => "Cecilia Fane left Ravensworth at nineteen and wrote to her mother every Sunday for the next thirty-one years. The correspondence traces a life of quiet rebellion against the conventions that made it possible: a marriage negotiated for its consequences, a house kept largely empty, and a daughter in Australia who knew her only through ink.\n\nThe letters arrive unedited, arranged in the order they were received.",
                'purchase_price' => 96.00,
                'rental_price' => 12.00,
                'rental_days' => null,
                'is_featured' => true,
            ],
            [
                'title' => 'A Treatise on the Modern Estate',
                'author' => 'Sir Peregrine Holbrook, Bart.',
                'isbn' => '978-1-250-19872-4',
                'format' => 'pdf',
                'page_count' => 356,
                'published_year' => '1907',
                'collection' => 'estate-and-landscape',
                'short_description' => 'Architecture, landscape and the duties of a landed proprietor.',
                'description' => "Holbrook's magnum opus surveys the country estate as both a practical and moral project. He dissects the architecture of the Georgian house, the theory of the informal garden, and the obligations a proprietor owes to tenant and parish alike.\n\nThe 1907 first edition, with its forty plates of elevations and planting plans, reproduced here in full.",
                'purchase_price' => 120.00,
                'rental_price' => 15.00,
                'rental_days' => 14,
                'is_featured' => false,
            ],
            [
                'title' => 'The Cellar Book of Ravensworth',
                'author' => 'Compiled by Mrs. Ada Whitcombe',
                'isbn' => '978-0-14-044319-2',
                'format' => 'epub',
                'page_count' => 224,
                'published_year' => '1962',
                'collection' => 'ledger-and-table',
                'short_description' => 'Recipes, vintages and household economy from a great house.',
                'description' => "For thirty-one years Mrs. Whitcombe ran the Ravensworth kitchen and cellar, and kept this record of what was cooked, what was drunk, and what it all cost. The recipes are precise and unfussy; the accounts are startling. A single season of preserves, the annual claret order, the cost of a single case of claret in the year it was scarce.\n\nA portrait of household economy told through its ledgers.",
                'purchase_price' => 78.00,
                'rental_price' => 9.50,
                'rental_days' => 10,
                'is_featured' => false,
            ],
            [
                'title' => 'Confessions of a Country Solicitor',
                'author' => 'Ambrose Kell',
                'isbn' => '978-0-19-284611-0',
                'format' => 'pdf',
                'page_count' => 198,
                'published_year' => '1975',
                'collection' => 'letters-and-confessions',
                'short_description' => 'Fifty years of wills, feuds and quiet betrayals.',
                'description' => "Kell practised in the county for half a century and kept a diary he never intended to publish. It is an unflattering record, and that is its value: the petty inheritances, the ruined families, the signature on the document that was never quite what it seemed.\n\nHe instructed that it be published only once every party named was beyond caring.",
                'purchase_price' => 64.00,
                'rental_price' => 8.00,
                'rental_days' => 7,
                'is_featured' => false,
            ],
            [
                'title' => 'The Principles of Good Governance',
                'author' => 'Anonymous, attributed to the Chancery of 1712',
                'isbn' => '978-1-61-614499-0',
                'format' => 'pdf',
                'page_count' => 96,
                'published_year' => '1712',
                'collection' => 'sovereign-collection',
                'short_description' => 'A working manual for office-holders, kept anonymous at the author\'s request.',
                'description' => "A short, severe handbook for those administering a great house's affairs, circulating among the Chancery clerks from at least 1712. The author remains unnamed across every surviving copy.\n\nIts central instruction — that the office exists to serve the estate and never the reverse — is quoted in the Ravenworth papers as the origin of the family's later constitution.",
                'purchase_price' => 210.00,
                'rental_price' => 24.00,
                'rental_days' => 30,
                'is_featured' => true,
            ],
            [
                'title' => 'On the Conduct of Large Households',
                'author' => 'Lady Ottoline Harcourt',
                'isbn' => '978-0-309-10455-3',
                'format' => 'epub',
                'page_count' => 264,
                'published_year' => '1939',
                'collection' => 'ledger-and-table',
                'short_description' => 'Managing a household of forty staff without appearing to.',
                'description' => "Harcourt ran a household of some forty staff and wrote this as a corrective to her own account books, which had been kept at considerable expense and considerable confusion. On staffing, on the etiquette of the back stairs, on the proper relationship between the family and those who ran the house.\n\nUnpublished in her lifetime at the insistence of her daughters.",
                'purchase_price' => 88.00,
                'rental_price' => 11.00,
                'rental_days' => 14,
                'is_featured' => false,
            ],
            [
                'title' => 'The Antiquarian\'s County',
                'author' => 'Dr. Marcus Ashworth',
                'isbn' => '978-0-521-86440-3',
                'format' => 'pdf',
                'page_count' => 512,
                'published_year' => '1954',
                'collection' => 'estate-and-landscape',
                'short_description' => 'A parish-by-parish survey of the county\'s great houses.',
                'description' => "Ashworth surveyed every significant house in the county over a decade, recording the fabric, the collections, the condition and the residents. Several estates appear here for the last time before demolition.\n\nThe plates are the treasure: measured drawings, floor plans, and photographs of interiors as they stood in the 1940s.",
                'purchase_price' => 165.00,
                'rental_price' => 20.00,
                'rental_days' => 21,
                'is_featured' => false,
            ],
        ];

        foreach ($books as $data) {
            $slug = Str::slug($data['title']);
            $collection = $data['collection'];
            unset($data['collection']);

            Book::updateOrCreate(
                ['slug' => $slug],
                array_merge($data, [
                    'collection_id' => $collectionIds[$collection] ?? null,
                    'currency' => 'EUR',
                    'language' => 'en',
                    'allow_purchase' => true,
                    'allow_rental' => true,
                    'status' => 'published',
                ])
            );
        }
    }
}
