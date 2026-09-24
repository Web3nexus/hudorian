<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Candidacy Dossier Received — HUDORIAN</title>
  <style>
    body {
      margin: 0; padding: 0; background-color: #0b0b0e;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #FAF8F5; -webkit-font-smoothing: antialiased;
    }
    table { border-spacing: 0; }
    td { padding: 0; }
    .container {
      width: 100%; max-width: 600px; margin: 0 auto; background-color: #121217;
      border: 1px solid rgba(184, 151, 108, 0.25); border-radius: 12px; overflow: hidden;
    }
    .header {
      padding: 40px 30px 25px 30px; text-align: center;
      background: radial-gradient(circle at 50% 0%, rgba(184, 151, 108, 0.15) 0%, transparent 70%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .seal { width: 64px; height: 64px; margin-bottom: 15px; }
    .brand-title {
      font-family: Georgia, serif; font-size: 24px; letter-spacing: 0.3em;
      text-transform: uppercase; color: #FAF8F5; margin: 0; font-weight: 400;
    }
    .subtitle {
      font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
      color: #C5A880; margin-top: 6px; font-family: monospace;
    }
    .content { padding: 35px 35px 30px 35px; line-height: 1.65; }
    .salutation { font-family: Georgia, serif; font-size: 20px; color: #FAF8F5; margin-bottom: 18px; }
    .body-text { font-size: 14px; color: rgba(250, 248, 245, 0.75); margin-bottom: 20px; font-weight: 300; }
    .dossier-card {
      background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(184, 151, 108, 0.25);
      border-radius: 8px; padding: 20px; margin: 25px 0;
    }
    .footer {
      padding: 25px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11px; color: rgba(250, 248, 245, 0.4); background-color: #0E0E12;
    }
  </style>
</head>
<body>
  <div style="padding: 40px 15px;">
    <div class="container">
      <div class="header">
        <img src="https://hudorian.com/images/hudorian-seal.png" alt="HUDORIAN Royal Seal" class="seal">
        <h1 class="brand-title">HUDORIAN</h1>
        <div class="subtitle">Admissions Committee & Membership Secretariat</div>
      </div>

      <div class="content">
        <div class="salutation">Dear {{ $applicantName }},</div>
        
        <p class="body-text">
          We have received your dossier for candidacy consideration to HUDORIAN Private Members Club for the <strong>{{ $planName }}</strong> patronage tier.
        </p>

        <p class="body-text">
          In keeping with our founding charter, candidate dossiers undergo confidential deliberation by the admissions committee to preserve our intimate fellowship of creators, patrons, and collectors.
        </p>

        <div class="dossier-card">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: rgba(250,248,245,0.5); font-size: 12px; padding: 6px 0; font-family: monospace;">CANDIDATE:</td>
              <td style="color: #FAF8F5; font-size: 12px; padding: 6px 0; text-align: right; font-weight: 500;">{{ $applicantName }}</td>
            </tr>
            <tr>
              <td style="color: rgba(250,248,245,0.5); font-size: 12px; padding: 6px 0; font-family: monospace;">REQUESTED TIER:</td>
              <td style="color: #C5A880; font-size: 12px; padding: 6px 0; text-align: right; font-weight: 500;">{{ $planName }}</td>
            </tr>
            <tr>
              <td style="color: rgba(250,248,245,0.5); font-size: 12px; padding: 6px 0; font-family: monospace;">REVIEW TIMELINE:</td>
              <td style="color: #FAF8F5; font-size: 12px; padding: 6px 0; text-align: right; font-family: monospace;">3–5 Business Days</td>
            </tr>
          </table>
        </div>

        <p class="body-text">
          Should the committee require additional biographical context or references, our Membership Secretariat will contact you directly.
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
