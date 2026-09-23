<?php

namespace App\Services\Security;

class TotpService
{
    private const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    /**
     * Generate a secure random Base32 secret key.
     */
    public function generateSecret(int $length = 16): string
    {
        $secret = '';
        $max = strlen(self::BASE32_CHARS) - 1;
        for ($i = 0; $i < $length; $i++) {
            $secret .= self::BASE32_CHARS[random_int(0, $max)];
        }
        return $secret;
    }

    /**
     * Calculate 6-digit TOTP code for a secret at a given timestamp.
     */
    public function calculateCode(string $secret, ?int $timestamp = null): string
    {
        $timestamp = $timestamp ?? time();
        $counter = floor($timestamp / 30);

        $binaryCounter = pack('N*', 0) . pack('N*', $counter);
        $binarySecret = $this->base32Decode($secret);

        $hash = hash_hmac('sha1', $binaryCounter, $binarySecret, true);
        $offset = ord(substr($hash, -1)) & 0x0F;

        $unpacked = unpack('N', substr($hash, $offset, 4));
        $value = ($unpacked[1] & 0x7FFFFFFF) % 1000000;

        return str_pad((string) $value, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Verify a 6-digit TOTP code with time drift window.
     */
    public function verify(string $secret, string $code, int $discrepancy = 1): bool
    {
        $code = trim($code);
        if (strlen($code) !== 6 || ! ctype_digit($code)) {
            return false;
        }

        $currentTime = time();
        for ($i = -$discrepancy; $i <= $discrepancy; $i++) {
            $checkTime = $currentTime + ($i * 30);
            if (hash_equals($this->calculateCode($secret, $checkTime), $code)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate standard otpauth URI compatible with Google Authenticator, Authy, etc.
     */
    public function getOtpAuthUri(string $company, string $holder, string $secret): string
    {
        $label = rawurlencode($company) . ':' . rawurlencode($holder);
        return sprintf(
            'otpauth://totp/%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30',
            $label,
            $secret,
            rawurlencode($company)
        );
    }

    /**
     * Decode Base32 string to binary.
     */
    private function base32Decode(string $b32): string
    {
        $b32 = strtoupper(rtrim($b32, "=\x00"));
        $buffer = 0;
        $bitsLeft = 0;
        $binary = '';

        for ($i = 0; $i < strlen($b32); $i++) {
            $val = strpos(self::BASE32_CHARS, $b32[$i]);
            if ($val === false) {
                continue;
            }

            $buffer = ($buffer << 5) | $val;
            $bitsLeft += 5;

            if ($bitsLeft >= 8) {
                $bitsLeft -= 8;
                $binary .= chr(($buffer >> $bitsLeft) & 0xFF);
            }
        }

        return $binary;
    }
}
