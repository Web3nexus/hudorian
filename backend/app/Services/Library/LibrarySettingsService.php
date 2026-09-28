<?php

namespace App\Services\Library;

use App\Models\CmsBlock;

class LibrarySettingsService
{
    public const CMS_KEY = 'library_settings';

    /**
     * Fallback configuration for the Royal Archive.
     */
    public static function defaults(): array
    {
        return [
            'purchase_enabled' => true,
            'rental_enabled' => true,
            'default_rental_days' => 14,
            'max_rental_days' => 90,
            'rental_terms' => 'A rental confers personal reading access for the agreed term only. The title may not be reproduced, redistributed or resold. Access lapses automatically at the close of the term and may be renewed from your archive at the steward\'s discretion.',
            'purchase_terms' => 'A purchase confers perpetual personal reading access to this edition, delivered as a protected digital file. Licences are personal and non-transferable.',
        ];
    }

    public function getSettings(): array
    {
        $block = CmsBlock::where('key', self::CMS_KEY)->first();

        if (! $block || ! is_array($block->payload)) {
            return self::defaults();
        }

        return array_merge(self::defaults(), $block->payload);
    }

    /**
     * Public-facing projection consumed by the catalogue and checkout UI.
     */
    public function getPublicConfig(): array
    {
        $settings = $this->getSettings();

        return [
            'purchase_enabled' => (bool) $settings['purchase_enabled'],
            'rental_enabled' => (bool) $settings['rental_enabled'],
            'default_rental_days' => (int) $settings['default_rental_days'],
            'max_rental_days' => (int) $settings['max_rental_days'],
            'rental_terms' => $settings['rental_terms'],
            'purchase_terms' => $settings['purchase_terms'],
        ];
    }

    public function updateSettings(array $data): array
    {
        $current = $this->getSettings();
        $updated = array_merge($current, $data);

        $updated['purchase_enabled'] = filter_var($updated['purchase_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $updated['rental_enabled'] = filter_var($updated['rental_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $updated['default_rental_days'] = max(1, min(365, (int) $updated['default_rental_days']));
        $updated['max_rental_days'] = max(
            $updated['default_rental_days'],
            min(365, (int) $updated['max_rental_days'])
        );

        CmsBlock::updateOrCreate(
            ['key' => self::CMS_KEY],
            [
                'title' => 'Royal Archive Settings',
                'subtitle' => 'Purchase, Rental and Access Policy Configuration',
                'payload' => $updated,
            ]
        );

        return $updated;
    }

    public function defaultRentalDays(): int
    {
        $days = (int) ($this->getSettings()['default_rental_days'] ?? 14);

        return max(1, $days);
    }
}
