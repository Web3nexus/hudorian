<?php

namespace Database\Seeders;

use App\Models\CmsBlock;
use Illuminate\Database\Seeder;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        $blocks = [
            [
                'key' => 'brand_settings',
                'title' => 'HUDORIAN',
                'subtitle' => 'Private Members Club',
                'body' => 'Curated spaces for extraordinary minds across the globe.',
                'media_url' => '/images/hudorian-seal.png',
                'payload' => [
                    'logo_type' => 'image',
                    'logo_text' => 'HUDORIAN',
                    'logo_image_url' => '/images/hudorian-seal.png',
                    'tagline' => 'Private Members Club & Global Constellation of Houses',
                    'concierge_email' => 'concierge@hudorian.com',
                    'concierge_phone' => '+234 (0) 1 888 4836',
                    'office_address' => 'HUDORIAN House, 42 Marina, Victoria Island, Lagos, Nigeria',
                    'currency_symbol' => '₦',
                ],
            ],
            [
                'key' => 'navigation_header',
                'title' => 'Header Navigation Menus',
                'payload' => [
                    'items' => [
                        ['label' => 'Houses', 'href' => '/houses', 'order' => 1, 'is_active' => true],
                        ['label' => 'Estates', 'href' => '/estates', 'order' => 2, 'is_active' => true],
                        ['label' => 'Stays', 'href' => '/stays', 'order' => 3, 'is_active' => true],
                        ['label' => 'Experiences', 'href' => '/experiences', 'order' => 4, 'is_active' => true],
                        ['label' => 'Membership', 'href' => '/membership', 'order' => 5, 'is_active' => true],
                        ['label' => 'Journal', 'href' => '/journal', 'order' => 6, 'is_active' => true],
                        ['label' => 'Boutique', 'href' => '/shop', 'order' => 7, 'is_active' => true],
                    ],
                ],
            ],
            [
                'key' => 'navigation_footer',
                'title' => 'Footer Navigation Menus & Copyright',
                'payload' => [
                    'copyright' => '© 2026 HUDORIAN Private Members Club. All rights reserved.',
                    'tagline' => 'An invitation-only assembly of extraordinary spaces and discerning patrons.',
                    'sections' => [
                        [
                            'title' => 'Houses & Sanctuaries',
                            'links' => [
                                ['label' => 'Global Houses', 'href' => '/houses'],
                                ['label' => 'Private Estates', 'href' => '/estates'],
                                ['label' => 'Suites & Stays', 'href' => '/stays'],
                                ['label' => 'Curated Gatherings', 'href' => '/experiences'],
                            ],
                        ],
                        [
                            'title' => 'Membership',
                            'links' => [
                                ['label' => 'Tiers & Privileges', 'href' => '/membership'],
                                ['label' => 'Apply for Membership', 'href' => '/membership/apply'],
                                ['label' => 'Member Portal', 'href' => '/member'],
                                ['label' => 'Private Concierge', 'href' => '/membership#concierge'],
                            ],
                        ],
                        [
                            'title' => 'The Gazette',
                            'links' => [
                                ['label' => 'Editorial Journal', 'href' => '/journal'],
                                ['label' => 'Boutique Collection', 'href' => '/shop'],
                                ['label' => 'Salon Calendar', 'href' => '/experiences'],
                            ],
                        ],
                        [
                            'title' => 'Legal & Privacy',
                            'links' => [
                                ['label' => 'Privacy Policy', 'href' => '/privacy'],
                                ['label' => 'Data Privacy & Protection', 'href' => '/privacy/data'],
                                ['label' => 'House Code & Terms', 'href' => '/terms'],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'key' => 'page_home',
                'title' => 'A private world of extraordinary places.',
                'subtitle' => 'Exclusive houses, estates and clubs in the world’s most inspiring destinations. For members only.',
                'body' => 'HUDORIAN unites global creators, thinkers, and collectors within an intimate constellation of sanctuaries curated for conversation, restorative stays, and bespoke culture.',
                'media_url' => 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2400&q=85',
                'payload' => [
                    'cta_text' => 'Explore Membership',
                    'cta_link' => '/membership',
                    'manifesto_quote' => 'Luxury in its purest essence: space, stillness, and kindred minds.',
                ],
            ],
            [
                'key' => 'page_houses',
                'title' => 'Global Constellation of Houses',
                'subtitle' => 'Six signature sanctuaries designed in harmony with their natural terroir and architectural heritage.',
                'body' => 'From cliffside Mediterranean compounds to quiet historic machiya sanctuaries in Kyoto, discover our private houses.',
                'media_url' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
            ],
            [
                'key' => 'page_estates',
                'title' => 'Private Estates & Residencies',
                'subtitle' => 'Secluded multi-acre domains engineered for absolute privacy, executive retreats, and family gatherings.',
                'body' => 'Reserved for members seeking unbounded sanctuary, our estates offer private security perimeters, helicopter landing zones, and private culinary teams.',
                'media_url' => 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2000&q=85',
            ],
            [
                'key' => 'page_stays',
                'title' => 'Suites & Private Residences',
                'subtitle' => 'Unmatched architectural craftsmanship, organic linens, and personalized 24/7 butler service.',
                'body' => 'Every suite is an acoustic sanctuary designed to restore serenity, equipped with custom natural finishes, bespoke furniture, and private outdoor soaking tubs.',
                'media_url' => 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=2000&q=85',
            ],
            [
                'key' => 'page_experiences',
                'title' => 'Curated Gatherings & Cultural Salons',
                'subtitle' => 'Intimate dining with world chefs, acoustic evenings under the stars, contemporary art vernissages, and wellness retreats.',
                'body' => 'HUDORIAN gatherings are intentional dialogues between kindred minds, designed to spark creative connection in exceptional atmospheres.',
                'media_url' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=2000&q=85',
            ],
            [
                'key' => 'page_membership',
                'title' => 'An Invitation to Belong',
                'subtitle' => 'A deliberate assembly of patrons, pioneers, and creative visionaries across the globe.',
                'body' => 'Membership at HUDORIAN is an invitation to explore our global constellation of Houses, Estates, and Clubs. Every member is welcomed as family, whether watching the sunrise in Kyoto or gathering for long dinners in the olive groves of Marbella.',
                'media_url' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85',
            ],
            [
                'key' => 'page_journal',
                'title' => 'The HUDORIAN Journal',
                'subtitle' => 'Dispatches on design, architecture, gastronomy, and contemporary culture from across our houses.',
                'body' => 'Essays and reflections from our resident curators, architects, and international contributors.',
                'media_url' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=2000&q=85',
            ],
            [
                'key' => 'page_shop',
                'title' => 'The Boutique Collection',
                'subtitle' => 'Limited editions, signature house scents, handcrafted ceramics, and bespoke travel goods.',
                'body' => 'Objects of quiet luxury, crafted by heritage artisans who share our dedication to timeless tactile beauty.',
                'media_url' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=85',
            ],
        ];

        foreach ($blocks as $block) {
            CmsBlock::updateOrCreate(
                ['key' => $block['key']],
                $block
            );
        }
    }
}

