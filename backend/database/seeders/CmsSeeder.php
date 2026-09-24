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
            [
                'key' => 'page_royal_houses',
                'title' => 'The Royal Houses of Uzih & Dynastic Allies',
                'subtitle' => 'Sovereign cadet lines, princely heritages, and ancient noble covenants stewarded across generations.',
                'body' => 'The cadet branches of the House of Uzih embody centuries of maritime exploration, equine stewardship, botanical preservation, and enduring dynastic alliances.',
                'media_url' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
                'payload' => [
                    'cadet_houses' => [
                        [
                            'id' => 'reda-house',
                            'name' => 'Reda House',
                            'founder' => 'Founded by Prince Reda of Uzih',
                            'role' => 'Princely Cadet House & Maritime Domain',
                            'tagline' => 'A sovereign coastal sanctuary championing oceanic stewardship, naval architecture, and seafaring exploration.',
                            'description' => 'Established under royal charter by Prince Reda, eldest royal son of the House of Uzih. Reda House stands atop majestic Mediterranean cliff lines, serving as the international headquarters for royal yachting regattas, deep-ocean ecological research, and high-level diplomatic assemblies.',
                            'hero_image' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
                            'location' => 'The Reda Coastal Citadel, Balearic Isles',
                            'motto' => 'Honor, Vision, Endurance',
                            'colors' => 'Royal Azure & Burnished Gold',
                            'privileges' => [
                                'Private Superyacht Deep-Water Moorings',
                                'Naval Architecture & Design Atelier',
                                'Oceanic Conservation Research Trust',
                                'Helipad & Sovereign Coastal Pavilion',
                            ],
                            'emblem' => 'Golden Falcon over Azure Crest',
                        ],
                        [
                            'id' => 'aria-house',
                            'name' => 'Aria House',
                            'founder' => 'Founded by Princess Aria of Uzih',
                            'role' => 'Princely Cadet House of Fine Arts & Wellness',
                            'tagline' => 'An ethereal sanctuary of classical symphony, rare botanical gardens, and restorative mind-body sanctuaries.',
                            'description' => 'Curated under the patronage of Princess Aria, this house merges centuries-old botanical knowledge with acoustic perfection. Featuring an amphitheater carved from native stone and greenhouse conservatories housing endangered Mediterranean and Asian flora.',
                            'hero_image' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
                            'location' => 'The Aria Botanical Sanctuary, Andalusia',
                            'motto' => 'Grace in Sovereignty',
                            'colors' => 'Imperial Emerald & Silk Champagne',
                            'privileges' => [
                                'Acoustic Symphony Salon & Amphitheater',
                                'Rare Medicinal Herb & Orchid Conservatories',
                                'Hydrothermal Roman Spa & Thalassotherapy',
                                'Literary & Classical Manuscript Archives',
                            ],
                            'emblem' => 'Silver Lotus over Silk Champagne',
                        ],
                        [
                            'id' => 'tarek-house',
                            'name' => 'Tarek House',
                            'founder' => 'Founded by Prince Tarek of Uzih',
                            'role' => 'Princely Cadet House & Equestrian Domain',
                            'tagline' => 'The ancestral equestrian seat dedicated to champion thoroughbred breeding, polo heritage, and highland stewardship.',
                            'description' => 'Founded by Prince Tarek, this sprawling country domain is revered worldwide for its champion bloodstock stud, Olympic-standard jumping arenas, and historic hunting lodges set among rolling forested hills.',
                            'hero_image' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80',
                            'location' => 'The Tarek Equestrian Grounds, Sierra Foothills',
                            'motto' => 'Strength Through Integrity',
                            'colors' => 'Obsidian & Platinum',
                            'privileges' => [
                                'Championship International Polo Grounds',
                                'Thoroughbred Pedigree Stud & Equestrian Arena',
                                'Private Forest Trails & Wilderness Lodges',
                                'Open-Fire Hearth Clubroom & Cellar',
                            ],
                            'emblem' => 'Black Stallion over Platinum Shield',
                        ],
                    ],
                    'dynastic_allies' => [
                        [
                            'id' => 'family-of-victors',
                            'name' => 'The Family of Victors',
                            'dynasty' => 'House of Victor',
                            'alliance_type' => 'Sovereign Treaty Alliance & Companions of Honor',
                            'tagline' => 'An illustrious noble dynasty bound to the House of Uzih through generations of mutual covenant and global enterprise.',
                            'description' => 'The Family of Victors represents one of the most storied aristocratic alliances of the realm. United with the Uzih royal dynasty by historic concordats, the Victors command venerable estates, private aviation fleet networks, and pioneering philanthropic foundations across five continents.',
                            'hero_image' => 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
                            'seat' => 'The Citadel of Victors & Grand Estate',
                            'motto' => 'Invictus in Aeternum (Victorious in Eternity)',
                            'colors' => 'Imperial Crimson & Brushed Bronze',
                            'privileges' => [
                                'Reciprocal Global Sovereign Estate Access',
                                'Shared Transcontinental Aviation Logistics',
                                'Joint International Diplomatic Salons',
                                'Dynastic Philanthropic Council Seat',
                            ],
                            'heraldry' => 'Gilded Laurel Wreath with Victorious Winged Crest',
                        ],
                    ],
                ],
            ],
            [
                'key' => 'page_royal_family',
                'title' => 'The Royal Family & Dynastic Lineage',
                'subtitle' => 'The sovereign lineage of the House of Uzih, spanning centuries of imperial stewardship, architectural patrons, and global alliances.',
                'body' => 'Anchored in heritage and elevated through generational vision, the Uzih royal dynasty remains the foundational patron of the HUDORIAN sanctuaries worldwide.',
                'media_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=2000&q=85',
                'payload' => [
                    'royal_head' => [
                        'title' => 'His Royal Majesty',
                        'name' => 'Sovereign Head of the Uzih Royal Dynasty',
                        'role' => 'Patriarch & Custodian of the Imperial Lineage',
                        'heraldry' => 'Lion Crest with Sovereign Solar Radiance',
                        'bio' => 'Guiding the House of Uzih with steadfast honor and timeless wisdom. His Majesty has spearheaded the preservation of ancestral heritage, sovereign patronages in cultural arts, and the modern international expansion of the HUDORIAN sanctuaries across global capitals.',
                        'image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
                    ],
                ],
            ],
            [
                'key' => 'page_privacy',
                'title' => 'Privacy Policy & Patron Confidentiality',
                'subtitle' => 'Legal Charter & Data Governance under the Nigeria Data Protection Act 2023 (NDPA).',
                'body' => 'HUDORIAN Club Limited is committed to unyielding discretion, cryptographic security, and transparency. This policy sets out our rigorous data governance standards under the Nigeria Data Protection Act 2023 (NDPA) and international hospitality data privacy conventions.',
                'media_url' => '/images/hudorian-seal.png',
                'payload' => [
                    'jurisdiction' => 'Federal Republic of Nigeria',
                    'regulator' => 'NDPC (Nigeria Data Protection Commission)',
                    'effective_date' => 'September 2026',
                ],
            ],
            [
                'key' => 'page_terms',
                'title' => 'Membership Terms & House Rules',
                'subtitle' => 'House Rules & Code of Fellowship across all HUDORIAN Sanctuaries.',
                'body' => 'HUDORIAN is conceived as an oasis of creative freedom, privacy, and civil discourse. To preserve the sanctuary character of our Houses and Estates, every candidate and patron agrees to abide by this House Code.',
                'media_url' => '/images/hudorian-seal.png',
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

