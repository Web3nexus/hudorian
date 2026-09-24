<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to HUDORIAN — Private Members Club</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0b0e;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #FAF8F5;
      -webkit-font-smoothing: antialiased;
    }
    table { border-spacing: 0; }
    td { padding: 0; }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #121217;
      border: 1px solid rgba(184, 151, 108, 0.25);
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      padding: 40px 30px 25px 30px;
      text-align: center;
      background: radial-gradient(circle at 50% 0%, rgba(184, 151, 108, 0.15) 0%, transparent 70%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .seal { width: 64px; height: 64px; margin-bottom: 15px; }
    .brand-title {
      font-family: Georgia, serif;
      font-size: 24px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #FAF8F5;
      margin: 0;
      font-weight: 400;
    }
    .subtitle {
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #C5A880;
      margin-top: 6px;
      font-family: monospace;
    }
    .content {
      padding: 35px 35px 30px 35px;
      line-height: 1.65;
    }
    .salutation {
      font-family: Georgia, serif;
      font-size: 20px;
      color: #FAF8F5;
      margin-bottom: 18px;
    }
    .body-text {
      font-size: 14px;
      color: rgba(250, 248, 245, 0.75);
      margin-bottom: 20px;
      font-weight: 300;
    }
    .dossier-card {
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(184, 151, 108, 0.3);
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .card-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #C5A880 0%, #A3855E 100%);
      color: #0B0B0E !important;
      text-decoration: none;
      font-size: 12px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      font-weight: 600;
      border-radius: 30px;
      box-shadow: 0 4px 15px rgba(184, 151, 108, 0.2);
    }
    .footer {
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11px;
      color: rgba(250, 248, 245, 0.4);
      background-color: #0E0E12;
    }
  </style>
</head>
<body>
  <div style="padding: 40px 15px;">
    <div class="container">
      <div class="header">
        <img src="https://hudorian.com/images/hudorian-seal.png" alt="HUDORIAN Royal Seal" class="seal">
        <h1 class="brand-title">HUDORIAN</h1>
        <div class="subtitle">Private Members Club & Dynastic Sanctuaries</div>
      </div>

      <div class="content">
        <div class="salutation">Welcome, {{ $userName }}</div>
        
        <p class="body-text">
          It is our distinct privilege to confirm your election into the fellowship of HUDORIAN. You now hold access to our global constellation of Houses, country Estates, private suites, and curated cultural gatherings.
        </p>

        <div class="dossier-card">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: rgba(250,248,245,0.5); font-size: 12px; padding: 6px 0; font-family: monospace;">MEMBERSHIP NUMBER:</td>
              <td style="color: #C5A880; font-size: 12px; padding: 6px 0; text-align: right; font-family: monospace; font-weight: bold;">{{ $membershipNumber }}</td>
            </tr>
            <tr>
              <td style="color: rgba(250,248,245,0.5); font-size: 12px; padding: 6px 0; font-family: monospace;">PATRONAGE TIER:</td>
              <td style="color: #FAF8F5; font-size: 12px; padding: 6px 0; text-align: right; font-weight: 500;">{{ $planName }}</td>
            </tr>
            <tr>
              <td style="color: rgba(250,248,245,0.5); font-size: 12px; padding: 6px 0; font-family: monospace;">STATUS:</td>
              <td style="color: #34D399; font-size: 12px; padding: 6px 0; text-align: right; font-family: monospace; text-transform: uppercase;">Active Patron</td>
            </tr>
          </table>
        </div>

        <div class="button-container">
          <a href="{{ $portalUrl }}" class="cta-button" target="_blank">
            Access Member Portal
          </a>
        </div>

        <p class="body-text" style="font-size: 13px;">
          Your digital access pass and concierge chat are now available within the Member Portal.
        </p>
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px 0;">&copy; {{ date('Y') }} HUDORIAN Private Members Club. All rights reserved.</p>
        <p style="margin: 0;">Mayfair, London • Ibiza • Marbella • Kyoto • Cape Town</p>
      </div>
    </div>
  </div>
</body>
</html>

