<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HUDORIAN Security Clearance — Reset Keyphrase</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0b0e;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #FAF8F5;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-spacing: 0;
    }
    td {
      padding: 0;
    }
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
    .seal {
      width: 64px;
      height: 64px;
      margin-bottom: 15px;
    }
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
      margin-bottom: 25px;
      font-weight: 300;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
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
    .security-notice {
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 8px;
      padding: 16px;
      font-size: 12px;
      color: rgba(250, 248, 245, 0.55);
      margin-top: 25px;
      font-family: monospace;
      line-height: 1.5;
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
      <!-- Header -->
      <div class="header">
        <img src="https://hudorian.com/images/hudorian-seal.png" alt="HUDORIAN Royal Seal" class="seal">
        <h1 class="brand-title">HUDORIAN</h1>
        <div class="subtitle">Private Members Club & Dynastic Sanctuaries</div>
      </div>

      <!-- Main Content -->
      <div class="content">
        <div class="salutation">Greetings, {{ $userName }}</div>
        
        <p class="body-text">
          A request has been initiated to reset the clearance keyphrase associated with your HUDORIAN membership dossier (<strong>{{ $userEmail }}</strong>).
        </p>

        <p class="body-text">
          To establish your new access credentials, please use the secure cryptographic link below. This single-use link is valid for <strong>60 minutes</strong> from issuance.
        </p>

        <div class="button-container">
          <a href="{{ $resetUrl }}" class="cta-button" target="_blank">
            Establish New Keyphrase
          </a>
        </div>

        <p class="body-text" style="font-size: 12px; color: rgba(250, 248, 245, 0.5);">
          If the button above does not open directly, copy and paste this URL into your browser:<br>
          <a href="{{ $resetUrl }}" style="color: #C5A880; word-break: break-all; text-decoration: underline;">{{ $resetUrl }}</a>
        </p>

        <div class="security-notice">
          <strong>SECURITY PROTOCOL:</strong> If you did not initiate this request, no action is required. Your current keyphrase remains cryptographically secure. For urgent security inquiries, contact your dedicated House Concierge.
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 6px 0;">&copy; {{ date('Y') }} HUDORIAN Private Members Club. All rights reserved.</p>
        <p style="margin: 0;">Mayfair, London • Ibiza • Marbella • Kyoto • Cape Town</p>
      </div>
    </div>
  </div>
</body>
</html>
