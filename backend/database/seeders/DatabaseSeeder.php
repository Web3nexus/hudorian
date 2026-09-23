<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Category;
use App\Models\CmsBlock;
use App\Models\Estate;
use App\Models\Event;
use App\Models\House;
use App\Models\HouseMedia;
use App\Models\JournalPost;
use App\Models\Location;
use App\Models\Member;
use App\Models\MembershipApplication;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomMedia;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users
        $admin = User::create([
            'name' => 'Alexander Vance',
            'email' => 'admin@hudorian.com',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
            'phone' => '+44 20 7946 0912',
            'city' => 'London',
            'country' => 'United Kingdom',
            'is_active' => true,
        ]);

        $demoUser = User::create([
            'name' => 'Elena Rostova',
            'email' => 'member@hudorian.com',
            'password' => Hash::make('password123'),
            'role' => 'member',
            'phone' => '+34 91 123 4567',
            'city' => 'Madrid',
            'country' => 'Spain',
            'is_active' => true,
        ]);

        $applicantUser = User::create([
            'name' => 'Julian Croft',
            'email' => 'applicant@hudorian.com',
            'password' => Hash::make('password123'),
            'role' => 'member',
            'phone' => '+1 415 555 2671',
            'city' => 'San Francisco',
            'country' => 'United States',
            'is_active' => true,
        ]);

        // 2. Membership Plans
        $planResident = MembershipPlan::create([
            'name' => 'Resident House Member',
            'slug' => 'resident-house-member',
            'description' => 'Unlimited year-round access to your local HUDORIAN House and social quarters, with preferred member stay privileges.',
            'price' => 3500000.00,
            'currency' => 'NGN',
            'billing_period' => 'annual',
            'guest_allowance' => 1,
            'house_access_type' => 'local_only',
            'stay_discount_percent' => 10.00,
            'perks' => [
                'Year-round access to your designated Home House',
                'Bring up to 1 accompanied guest per visit',
                'Priority reservation window at House restaurants',
                '10% preferred member privilege on all bedroom bookings',
                'Invitations to local member cultural programming',
            ],
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $planGlobal = MembershipPlan::create([
            'name' => 'Global House Member',
            'slug' => 'global-house-member',
            'description' => 'Unrestricted access to every HUDORIAN House, Estate, and private Club internationally across Europe, Africa, and Asia.',
            'price' => 6500000.00,
            'currency' => 'NGN',
            'billing_period' => 'annual',
            'guest_allowance' => 2,
            'house_access_type' => 'all_houses',
            'stay_discount_percent' => 15.00,
            'perks' => [
                'Unrestricted access to all HUDORIAN Houses globally',
                'Bring up to 2 accompanied guests per visit',
                'Global Concierge & House-to-House private transfers',
                '15% member privilege on all stays and wellness facilities',
                'Full access to international Member Dinners & Retreats',
                'Reciprocal access to partner country estates',
            ],
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $planFounder = MembershipPlan::create([
            'name' => 'Founder Patron',
            'slug' => 'founder-patron',
            'description' => 'An exclusive patronage tier reserved for the founding circle, offering bespoke residency benefits and lifetime stewardship.',
            'price' => 15000000.00,
            'currency' => 'NGN',
            'billing_period' => 'annual',
            'guest_allowance' => 4,
            'house_access_type' => 'all_houses',
            'stay_discount_percent' => 25.00,
            'perks' => [
                'VIP permanent access across all Houses, Estates and private Clubs',
                'Bring up to 4 guests without pre-registration',
                'Guaranteed suite availability with complimentary upgrade',
                'Direct line to Executive Concierge & House General Managers',
                'Private dining room hosting privileges without room hire fee',
                'Voting invitation on upcoming House acquisition destinations',
            ],
            'is_active' => true,
            'sort_order' => 3,
        ]);

        // 3. Member record for Elena
        $demoMember = Member::create([
            'user_id' => $demoUser->id,
            'membership_plan_id' => $planGlobal->id,
            'membership_number' => 'HUD-2026-8912',
            'status' => 'active',
            'started_at' => now()->subMonths(3),
            'expires_at' => now()->addMonths(9),
            'internal_notes' => 'Founding tier referral. Frequent guest at Ibiza & Marbella.',
        ]);

        // Application for Julian
        MembershipApplication::create([
            'user_id' => $applicantUser->id,
            'membership_plan_id' => $planGlobal->id,
            'first_name' => 'Julian',
            'last_name' => 'Croft',
            'email' => 'applicant@hudorian.com',
            'phone' => '+1 415 555 2671',
            'city' => 'San Francisco',
            'country' => 'United States',
            'profession' => 'Architect & Creative Director',
            'company' => 'Studio Croft Design',
            'bio' => 'Practicing contemporary residential architect with a passion for Mediterranean modernism and sustainable hospitality spaces.',
            'social_profile_url' => 'https://instagram.com/juliancroft',
            'interests' => ['Architecture', 'Contemporary Art', 'Natural Wine', 'Sailing'],
            'status' => 'under_review',
            'submitted_at' => now()->subDays(2),
        ]);

        // 4. Locations
        $locIbiza = Location::create(['name' => 'Ibiza', 'slug' => 'ibiza', 'country' => 'Spain', 'region' => 'Balearic Islands']);
        $locMarbella = Location::create(['name' => 'Marbella', 'slug' => 'marbella', 'country' => 'Spain', 'region' => 'Andalusia']);
        $locLagos = Location::create(['name' => 'Lagos', 'slug' => 'lagos', 'country' => 'Nigeria', 'region' => 'Victoria Island']);
        $locCapeTown = Location::create(['name' => 'Cape Town', 'slug' => 'cape-town', 'country' => 'South Africa', 'region' => 'Western Cape']);
        $locCotswolds = Location::create(['name' => 'Cotswolds', 'slug' => 'cotswolds', 'country' => 'United Kingdom', 'region' => 'Gloucestershire']);
        $locKyoto = Location::create(['name' => 'Kyoto', 'slug' => 'kyoto', 'country' => 'Japan', 'region' => 'Kansai']);

        // 5. Estates
        $estateMarbella = Estate::create([
            'location_id' => $locMarbella->id,
            'name' => 'The Andalusian Domain',
            'slug' => 'the-andalusian-domain',
            'tagline' => 'A 40-hectare private estate between the Mediterranean and the Sierra Blanca.',
            'description' => 'Encompassing three heritage fincas, private olive groves, an equestrian stable, and clay tennis courts.',
            'hero_image' => 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
            'is_active' => true,
        ]);

        // 6. Amenities
        $amenities = [
            'Infinity Pool' => ['icon' => 'waves', 'cat' => 'wellness'],
            'Subterranean Spa' => ['icon' => 'sparkles', 'cat' => 'wellness'],
            'Open-Fire Restaurant' => ['icon' => 'utensils', 'cat' => 'dining'],
            'Rooftop Cocktail Bar' => ['icon' => 'wine', 'cat' => 'dining'],
            'Private Screening Room' => ['icon' => 'film', 'cat' => 'recreation'],
            'Gym & Movement Studio' => ['icon' => 'dumbbell', 'cat' => 'wellness'],
            'Private Marina & Boating' => ['icon' => 'anchor', 'cat' => 'recreation'],
            'Clay Tennis Court' => ['icon' => 'trophy', 'cat' => 'recreation'],
            'Private Beach Club' => ['icon' => 'sun', 'cat' => 'recreation'],
            'Library & Writing Rooms' => ['icon' => 'book-open', 'cat' => 'service'],
        ];

        $amenityModels = [];
        foreach ($amenities as $name => $meta) {
            $amenityModels[$name] = Amenity::create([
                'name' => $name,
                'slug' => Str::slug($name),
                'icon' => $meta['icon'],
                'category' => $meta['cat'],
            ]);
        }

        // 7. Houses
        $housesData = [
            [
                'name' => 'HUDORIAN Ibiza',
                'slug' => 'hudorian-ibiza',
                'location_id' => $locIbiza->id,
                'estate_id' => null,
                'tagline' => 'Cliffside sanctuary overlooking the Balearic horizon.',
                'house_type' => 'retreat',
                'short_description' => 'A dramatic coastal retreat carved into the cliffs of northern Ibiza, offering secluded terraces, organic cuisine, and serene sunset soundscapes.',
                'description' => 'Perched on the untouched northern coastline of Ibiza, HUDORIAN Ibiza offers members an intimate refuge away from the island tempo. Built using native limestone and terracotta, the house features terraced gardens that cascade down to a private cove, an open-fire restaurant celebrating coastal produce, a subterranean sound sanctuary, and twenty-four curated bedroom suites.',
                'address' => 'Camí de Cala d’en Serra, 07810 Sant Joan de Labritja, Illes Balears, Spain',
                'latitude' => 39.1102,
                'longitude' => 1.5173,
                'hero_image' => 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
                'status' => 'active',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'HUDORIAN Marbella',
                'slug' => 'hudorian-marbella',
                'location_id' => $locMarbella->id,
                'estate_id' => $estateMarbella->id,
                'tagline' => 'Mediterranean elegance set within ancient olive groves.',
                'house_type' => 'estate',
                'short_description' => 'A sprawling Andalusian sanctuary combining traditional courtyard architecture, clay tennis courts, and subterranean Roman baths.',
                'description' => 'Nestled within forty hectares of heritage olive groves at the foothills of Sierra Blanca, HUDORIAN Marbella reimagines Andalusian grandeur. With tranquil fountains, shaded citrus courtyards, a clay tennis pavilion, and farm-to-table dining, members experience the warmth of southern Spain in consummate privacy.',
                'address' => 'Carretera de Istán, km 4, 29602 Marbella, Málaga, Spain',
                'latitude' => 36.5298,
                'longitude' => -4.9452,
                'hero_image' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
                'status' => 'active',
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'HUDORIAN Lagos',
                'slug' => 'hudorian-lagos',
                'location_id' => $locLagos->id,
                'estate_id' => null,
                'tagline' => 'Waterfront modernist club in Victoria Island.',
                'house_type' => 'club',
                'short_description' => 'An architectural beacon on the Lagos lagoon featuring a contemporary African gallery, rooftop terrace, and private water taxi access.',
                'description' => 'Rising over the calm waters of the Five Cowries Creek in Victoria Island, HUDORIAN Lagos is a cultural epicenter for creative visionaries, entrepreneurs, and art collectors. The club includes a world-class contemporary African art collection, an open-air rooftop bar, private screening facilities, and luxury waterfront guest rooms.',
                'address' => '14 Ozumba Mbadiwe Avenue, Victoria Island, Lagos, Nigeria',
                'latitude' => 6.4358,
                'longitude' => 3.4285,
                'hero_image' => 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80',
                'status' => 'active',
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'HUDORIAN Cape Town',
                'slug' => 'hudorian-cape-town',
                'location_id' => $locCapeTown->id,
                'estate_id' => null,
                'tagline' => 'Atlantic grandeur framed by the Twelve Apostles.',
                'house_type' => 'house',
                'short_description' => 'A dramatic cliffside manor in Camps Bay where dramatic Atlantic ocean panoramas meet refined Cape Dutch heritage.',
                'description' => 'Set against the majestic peaks of the Twelve Apostles and facing the limitless Atlantic ocean, HUDORIAN Cape Town is an architectural masterpiece. Members enjoy panoramic sea-view terraces, an extensive South African private wine cellar, heated saltwater lap pool, and bespoke mountaineering excursions.',
                'address' => 'Victoria Road, Camps Bay, Cape Town, 8005, South Africa',
                'latitude' => -33.9538,
                'longitude' => 18.3792,
                'hero_image' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
                'status' => 'active',
                'is_featured' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'HUDORIAN Cotswolds',
                'slug' => 'hudorian-cotswolds',
                'location_id' => $locCotswolds->id,
                'estate_id' => null,
                'tagline' => 'Country estate and wild landscape retreat.',
                'house_type' => 'estate',
                'short_description' => 'A 17th-century honey-stone country manor surrounded by wildflower meadows, organic kitchen gardens, and wild swimming lakes.',
                'description' => 'Spread across 250 acres of quintessential English countryside, HUDORIAN Cotswolds balances rural peace with sophisticated country club living. Featuring roaring open hearths, equestrian trails, greenhouse botanic dining, and restorative cedar hot tubs under the stars.',
                'address' => 'Near Great Tew, Chipping Norton, Oxfordshire, OX7 4AA, United Kingdom',
                'latitude' => 51.9567,
                'longitude' => -1.4329,
                'hero_image' => 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
                'status' => 'active',
                'is_featured' => false,
                'sort_order' => 5,
            ],
            [
                'name' => 'HUDORIAN Kyoto',
                'slug' => 'hudorian-kyoto',
                'location_id' => $locKyoto->id,
                'estate_id' => null,
                'tagline' => 'Timeless cedarwood sanctuary in Arashiyama.',
                'house_type' => 'retreat',
                'short_description' => 'Traditional Japanese craftsmanship meets modern minimalist luxury among bamboo forests and healing natural onsen springs.',
                'description' => 'Positioned along the pristine Oi River in Arashiyama, HUDORIAN Kyoto honors centuries of Japanese architectural mastery. Crafted using fragrant Hinoki cedar, washi paper, and natural volcanic stone, the house offers private tea ceremonies, seasonal kaiseki dining, and open-air hot spring baths.',
                'address' => 'Saga-Tenryuji, Ukyo Ward, Kyoto, 616-8385, Japan',
                'latitude' => 35.0116,
                'longitude' => 135.6778,
                'hero_image' => 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
                'status' => 'active',
                'is_featured' => false,
                'sort_order' => 6,
            ],
        ];

        foreach ($housesData as $hData) {
            $house = House::create($hData);
            // Attach 4-5 amenities
            $house->amenities()->attach([
                $amenityModels['Infinity Pool']->id,
                $amenityModels['Subterranean Spa']->id,
                $amenityModels['Open-Fire Restaurant']->id,
                $amenityModels['Rooftop Cocktail Bar']->id,
                $amenityModels['Gym & Movement Studio']->id,
            ]);

            // Add gallery media
            HouseMedia::create([
                'house_id' => $house->id,
                'media_url' => $house->hero_image,
                'caption' => 'The Main Exterior & Courtyard',
                'sort_order' => 1,
            ]);
            HouseMedia::create([
                'house_id' => $house->id,
                'media_url' => 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=80',
                'caption' => 'Member Salon & Fireplace',
                'sort_order' => 2,
            ]);
            HouseMedia::create([
                'house_id' => $house->id,
                'media_url' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80',
                'caption' => 'Sunlight Terrace & Dining',
                'sort_order' => 3,
            ]);

            // Create 2 curated rooms per house
            $room1 = Room::create([
                'house_id' => $house->id,
                'name' => $house->name . ' — Horizon Suite',
                'slug' => Str::slug($house->name . ' Horizon Suite'),
                'room_type' => 'suite',
                'description' => 'A spacious bedroom suite featuring custom walnut furnishings, king-size Belgian linen bed, and a private stone terrace with panoramic views.',
                'capacity' => 2,
                'max_adults' => 2,
                'max_children' => 0,
                'base_price_per_night' => 650.00,
                'currency' => 'EUR',
                'size_sqm' => 68,
                'hero_image' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
                'status' => 'active',
            ]);
            $room1->amenities()->attach([
                $amenityModels['Subterranean Spa']->id,
                $amenityModels['Library & Writing Rooms']->id,
            ]);

            $room2 = Room::create([
                'house_id' => $house->id,
                'name' => $house->name . ' — Private Villa Pavilion',
                'slug' => Str::slug($house->name . ' Private Villa Pavilion'),
                'room_type' => 'villa',
                'description' => 'A secluded private residence with independent plunge pool, master fireplace, outdoor marble shower, and dedicated butler service.',
                'capacity' => 4,
                'max_adults' => 4,
                'max_children' => 2,
                'base_price_per_night' => 1400.00,
                'currency' => 'EUR',
                'size_sqm' => 145,
                'hero_image' => 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
                'status' => 'active',
            ]);
            $room2->amenities()->attach([
                $amenityModels['Infinity Pool']->id,
                $amenityModels['Subterranean Spa']->id,
                $amenityModels['Private Dining']->id ?? $amenityModels['Open-Fire Restaurant']->id,
            ]);

            // Create upcoming events
            Event::create([
                'house_id' => $house->id,
                'title' => 'Solstice Gastronomic Dinner & Wine Pairing',
                'slug' => Str::slug('solstice-gastronomic-dinner-' . $house->slug),
                'event_type' => 'dinner',
                'short_description' => 'An eight-course sensory journey prepared over open wood embers, accompanied by rare biodynamic vintages.',
                'description' => 'Join our Executive Chef and invited guest vintners for an unforgettable evening under the stars. Starting with sunset aperitifs on the terrace, followed by eight intimate tasting courses honoring local land and sea produce.',
                'starts_at' => now()->addDays(rand(7, 30))->setTime(19, 30),
                'ends_at' => now()->addDays(rand(7, 30))->setTime(23, 00),
                'location_detail' => 'The Chef’s Orchard Terrace',
                'capacity' => 24,
                'booked_count' => 8,
                'price' => 180.00,
                'currency' => 'EUR',
                'is_member_only' => true,
                'hero_image' => 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
            ]);

            Event::create([
                'house_id' => $house->id,
                'title' => 'Sound Sanctuary & Somatic Breathwork',
                'slug' => Str::slug('sound-sanctuary-breathwork-' . $house->slug),
                'event_type' => 'wellness',
                'short_description' => 'A deeply restorative morning of guided acoustic sound resonance and breathwork led by master practitioners.',
                'description' => 'Immerse your senses in Tibetan singing bowls, gongs, and restorative somatic breath patterns designed to reset the nervous system.',
                'starts_at' => now()->addDays(rand(5, 20))->setTime(10, 00),
                'ends_at' => now()->addDays(rand(5, 20))->setTime(12, 00),
                'location_detail' => 'The Movement Pavilion',
                'capacity' => 16,
                'booked_count' => 6,
                'price' => 75.00,
                'currency' => 'EUR',
                'is_member_only' => true,
                'hero_image' => 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
                'status' => 'published',
            ]);
        }

        // 8. Editorial Journal Categories & Posts
        $catTravel = Category::create(['name' => 'Architecture & Spaces', 'slug' => 'architecture-spaces']);
        $catCulture = Category::create(['name' => 'Culture & Arts', 'slug' => 'culture-arts']);
        $catDining = Category::create(['name' => 'Culinary Perspectives', 'slug' => 'culinary-perspectives']);
        $catWellness = Category::create(['name' => 'Mind & Body', 'slug' => 'mind-body']);

        JournalPost::create([
            'category_id' => $catTravel->id,
            'title' => 'The Architecture of Belonging: Crafting Spaces for Human Connection',
            'slug' => 'the-architecture-of-belonging',
            'excerpt' => 'How HUDORIAN conceives spaces not as monuments of display, but as sensory sanctuaries that cultivate dialogue and tranquility.',
            'content' => "True luxury in the modern epoch is not found in excessive gilding or ostentation; it resides in proportion, silence, materiality, and the choreography of light.\n\nWhen we embarked upon the design of HUDORIAN Ibiza, our mandate to our architects was deceptively simple: create a home that feels as if it has always existed within the cliffside, shaped by the Mediterranean winds rather than imposed upon them.\n\nFrom raw limestone walls that capture the shifting sunbeams of dawn to handcrafted clay urns fired by local artisans, each texture tells a story of grounded belonging.",
            'cover_image' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
            'author_name' => 'Sir Marcus Vance',
            'reading_time_minutes' => 6,
            'is_published' => true,
            'published_at' => now()->subDays(5),
        ]);

        JournalPost::create([
            'category_id' => $catDining->id,
            'title' => 'The Art of the Ember: Rediscovering Primitive Fire in Contemporary Dining',
            'slug' => 'the-art-of-the-ember',
            'excerpt' => 'A culinary investigation into how ancient cooking techniques over olive and Holm oak wood awaken the purest terroir of our ingredients.',
            'content' => "At our kitchen in Marbella, we have removed electricity and induction stoves from our central hearth. In their place stands a four-meter masonry open fire pit fueled solely by pruned branches from our surrounding olive groves.\n\nThere is an honesty in cooking over embers that cannot be simulated. It demands instinct, timing, and profound respect for the sea bass pulled that morning from the waters off Estepona.",
            'cover_image' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80',
            'author_name' => 'Chef Helene Larsson',
            'reading_time_minutes' => 4,
            'is_published' => true,
            'published_at' => now()->subDays(12),
        ]);

        // 9. CMS Blocks (Brand Settings, Menus, Page Heroes & Story)
        CmsBlock::create([
            'key' => 'brand_settings',
            'title' => 'HUDORIAN',
            'subtitle' => 'Private Members Club',
            'body' => 'Curated spaces for extraordinary minds across the globe.',
            'media_url' => '/images/hudorian-seal.png',
            'payload' => [
                'logo_type' => 'image',
                'logo_text' => '',
                'logo_image_url' => '/images/hudorian-seal.png',
                'tagline' => 'Private Members Club & Global Constellation of Houses',
                'concierge_email' => 'concierge@hudorian.com',
                'concierge_phone' => '+234 (0) 1 800 4836',
                'office_address' => '14 Ozumba Mbadiwe Avenue, Victoria Island, Lagos, Nigeria',
                'currency_symbol' => '₦',
                'currency' => 'NGN',
            ],
        ]);

        CmsBlock::create([
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
        ]);

        CmsBlock::create([
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
                        ],
                    ],
                    [
                        'title' => 'The Gazette & Governance',
                        'links' => [
                            ['label' => 'Editorial Journal', 'href' => '/journal'],
                            ['label' => 'Boutique Collection', 'href' => '/shop'],
                            ['label' => 'Privacy Policy', 'href' => '/privacy'],
                            ['label' => 'Data Protection', 'href' => '/privacy/data'],
                        ],
                    ],
                ],
            ],
        ]);

        CmsBlock::create([
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
        ]);

        CmsBlock::create([
            'key' => 'page_houses',
            'title' => 'Global Constellation of Houses',
            'subtitle' => 'Six signature sanctuaries designed in harmony with their natural terroir and architectural heritage.',
            'body' => 'From cliffside Mediterranean compounds to quiet historic machiya sanctuaries in Kyoto, discover our private houses.',
            'media_url' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
        ]);

        CmsBlock::create([
            'key' => 'page_estates',
            'title' => 'Private Estates & Residencies',
            'subtitle' => 'Secluded multi-acre domains engineered for absolute privacy, executive retreats, and family gatherings.',
            'body' => 'Reserved for members seeking unbounded sanctuary, our estates offer private security perimeters, helicopter landing zones, and private culinary teams.',
            'media_url' => 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2000&q=85',
        ]);

        CmsBlock::create([
            'key' => 'page_stays',
            'title' => 'Suites & Private Residences',
            'subtitle' => 'Unmatched architectural craftsmanship, organic linens, and personalized 24/7 butler service.',
            'body' => 'Every suite is an acoustic sanctuary designed to restore serenity, equipped with custom natural finishes, bespoke furniture, and private outdoor soaking tubs.',
            'media_url' => 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=2000&q=85',
        ]);

        CmsBlock::create([
            'key' => 'page_experiences',
            'title' => 'Curated Gatherings & Cultural Salons',
            'subtitle' => 'Intimate dining with world chefs, acoustic evenings under the stars, contemporary art vernissages, and wellness retreats.',
            'body' => 'HUDORIAN gatherings are intentional dialogues between kindred minds, designed to spark creative connection in exceptional atmospheres.',
            'media_url' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=2000&q=85',
        ]);

        CmsBlock::create([
            'key' => 'page_membership',
            'title' => 'An Invitation to Belong',
            'subtitle' => 'A deliberate assembly of patrons, pioneers, and creative visionaries across the globe.',
            'body' => 'Membership at HUDORIAN is an invitation to explore our global constellation of Houses, Estates, and Clubs. Every member is welcomed as family, whether watching the sunrise in Kyoto or gathering for long dinners in the olive groves of Marbella.',
            'media_url' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85',
        ]);

        CmsBlock::create([
            'key' => 'page_journal',
            'title' => 'The HUDORIAN Journal',
            'subtitle' => 'Dispatches on design, architecture, gastronomy, and contemporary culture from across our houses.',
            'body' => 'Essays and reflections from our resident curators, architects, and international contributors.',
            'media_url' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=2000&q=85',
        ]);

        CmsBlock::create([
            'key' => 'page_shop',
            'title' => 'The Boutique Collection',
            'subtitle' => 'Limited editions, signature house scents, handcrafted ceramics, and bespoke travel goods.',
            'body' => 'Objects of quiet luxury, crafted by heritage artisans who share our dedication to timeless tactile beauty.',
            'media_url' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=85',
        ]);

        CmsBlock::create([
            'key' => 'security_settings',
            'title' => 'Security & Bot Protection Settings',
            'subtitle' => 'Cloudflare Turnstile, Google reCAPTCHA, and Multi-Factor Authentication',
            'body' => 'Configure enterprise bot protection and administrative 2FA verification.',
            'media_url' => '',
            'payload' => [
                'captcha_provider' => 'none',
                'cloudflare_site_key' => '',
                'cloudflare_secret_key' => '',
                'google_recaptcha_site_key' => '',
                'google_recaptcha_secret_key' => '',
                'two_factor_policy' => 'optional',
            ],
        ]);

        // Seed a sample past reservation and payment for demo member
        $ibizaRoom = Room::where('slug', 'like', '%ibiza%')->first();
        if ($ibizaRoom) {
            $reservation = Reservation::create([
                'reservation_number' => 'RES-2026-9021',
                'user_id' => $demoUser->id,
                'room_id' => $ibizaRoom->id,
                'house_id' => $ibizaRoom->house_id,
                'check_in' => now()->addDays(14)->toDateString(),
                'check_out' => now()->addDays(18)->toDateString(),
                'total_nights' => 4,
                'guests_count' => 2,
                'night_rate' => 585.00, // 10% discount from 650
                'total_amount' => 2340.00,
                'currency' => 'EUR',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'special_requests' => 'Quiet suite with balcony facing the sunset cove.',
            ]);

            Payment::create([
                'transaction_id' => 'tx_hud_res_9021a8b',
                'user_id' => $demoUser->id,
                'payable_type' => Reservation::class,
                'payable_id' => $reservation->id,
                'amount' => 2340.00,
                'currency' => 'EUR',
                'provider' => 'hudorian_pay_vault',
                'status' => 'paid',
                'payment_method' => 'card_exclusive',
                'metadata' => ['reservation_number' => 'RES-2026-9021'],
            ]);
        }
    }
}
