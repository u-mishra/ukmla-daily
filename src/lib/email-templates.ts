const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ukmladaily.co.uk';

const DISCLAIMER = 'UKMLA Daily is a revision aid and is not a substitute for official study materials, clinical guidelines, or professional medical advice. Always verify clinical information with approved sources. Questions are generated for educational purposes only.';

export function welcomeEmailHtml(email: string, preferencesToken: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="padding:28px 32px;text-align:center;border-bottom:1px solid #E8E8ED;">
      <h1 style="margin:0;font-size:18px;letter-spacing:2px;">
        <span style="color:#1D1D1F;font-weight:700;">UKMLA</span>
        <span style="color:#1A6B52;font-weight:700;"> Daily</span>
      </h1>
    </div>

    <!-- Body -->
    <div style="background:white;padding:36px 32px;border-radius:0 0 16px 16px;">
      <h2 style="color:#1D1D1F;margin:0 0 20px;font-size:22px;font-family:Georgia,'Times New Roman',serif;">Welcome aboard!</h2>
      <p style="color:#6E6E73;font-size:16px;line-height:1.7;margin:0 0 16px;">
        You're all set. Starting tomorrow, you'll receive a UKMLA-style practice question every morning at <strong style="color:#1D1D1F;">7:00 AM</strong>.
      </p>
      <p style="color:#6E6E73;font-size:16px;line-height:1.7;margin:0 0 16px;">
        Each email takes about <strong style="color:#1D1D1F;">2 minutes</strong> — read the clinical vignette, pick your answer, then tap to reveal the explanation.
      </p>
      <p style="color:#6E6E73;font-size:16px;line-height:1.7;margin:0 0 16px;">
        We currently cover <strong style="color:#1D1D1F;">ENT, Haematology, Neurology, Renal, and Infectious Diseases</strong>. You can customise which specialties you receive — just click <em>Manage your specialties</em> in any email footer.
      </p>
      <p style="color:#6E6E73;font-size:16px;line-height:1.7;margin:0 0 24px;">
        Consistency is everything. Build the habit, and you'll be amazed how much sticks.
      </p>
      <p style="color:#6E6E73;font-size:16px;line-height:1.7;margin:0;">
        Good luck with your revision!
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 0;">
      <p style="color:#86868B;font-size:11px;line-height:1.5;margin:0 0 10px;">${DISCLAIMER}</p>
      <div>
        <a href="${siteUrl}/preferences?token=${preferencesToken}" style="color:#1A6B52;font-size:12px;text-decoration:underline;">Manage your specialties</a>
        <span style="color:#D2D2D7;margin:0 8px;">·</span>
        <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#86868B;font-size:12px;text-decoration:underline;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function dailyQuestionEmailHtml(question: {
  id: string;
  specialty: string;
  difficulty: string;
  vignette: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  day_number: number;
}, subscriberEmail: string, preferencesToken?: string): string {
  const options = [
    { letter: 'A', text: question.option_a },
    { letter: 'B', text: question.option_b },
    { letter: 'C', text: question.option_c },
    { letter: 'D', text: question.option_d },
    { letter: 'E', text: question.option_e },
  ];

  const optionsHtml = options.map(opt => `
    <div style="padding:12px 16px;border:1px solid #E8E8ED;border-radius:10px;margin-bottom:8px;font-size:14px;color:#1D1D1F;background:white;">
      <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;background:#F5F5F7;border-radius:8px;font-weight:600;margin-right:12px;font-size:12px;color:#6E6E73;">${opt.letter}</span>
      ${opt.text}
    </div>
  `).join('');

  const answerUrl = `${siteUrl}/answer/${question.id}?email=${encodeURIComponent(subscriberEmail)}`;

  const preferencesLink = preferencesToken
    ? `<a href="${siteUrl}/preferences?token=${preferencesToken}" style="color:#1A6B52;font-size:12px;text-decoration:underline;">Manage your specialties</a>
        <span style="color:#D2D2D7;margin:0 8px;">·</span>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="padding:24px 32px;text-align:center;border-bottom:1px solid #E8E8ED;">
      <p style="color:#86868B;margin:0 0 4px;font-size:12px;letter-spacing:2px;font-weight:600;">
        <span style="color:#1D1D1F;">UKMLA</span> <span style="color:#1A6B52;">Daily</span>
      </p>
      <h1 style="color:#1D1D1F;margin:0;font-size:20px;font-family:Georgia,'Times New Roman',serif;font-weight:400;">
        Day ${question.day_number} — ${question.specialty}
      </h1>
    </div>

    <!-- Body -->
    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;">
      <!-- Badges -->
      <div style="margin-bottom:20px;">
        <span style="display:inline-block;padding:4px 12px;background:#E8F4F0;color:#0F6E56;border-radius:6px;font-size:12px;font-weight:600;margin-right:6px;">${question.specialty}</span>
        <span style="display:inline-block;padding:4px 12px;background:#FEF3E8;color:#9A5B1D;border-radius:6px;font-size:12px;font-weight:600;">${question.difficulty}</span>
      </div>

      <!-- Vignette -->
      <p style="color:#1D1D1F;font-size:16px;line-height:1.75;margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;">
        ${question.vignette}
      </p>

      <!-- Options -->
      ${optionsHtml}

      <!-- CTA Button -->
      <div style="text-align:center;margin-top:28px;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${answerUrl}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="21%" strokecolor="#1A6B52" fillcolor="#1A6B52">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Reveal Answer</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            <td style="background-color:#1A6B52;border-radius:10px;text-align:center;">
              <a href="${answerUrl}" style="display:inline-block;padding:14px 40px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                Reveal Answer
              </a>
            </td>
          </tr>
        </table>
        <!--<![endif]-->
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 0;">
      <p style="color:#86868B;font-size:11px;line-height:1.5;margin:0 0 10px;">${DISCLAIMER}</p>
      <div>
        ${preferencesLink}
        <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}" style="color:#86868B;font-size:12px;text-decoration:underline;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function notificationEmailHtml(count: number): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:40px;background:#F5F5F7;">
  <div style="max-width:500px;margin:0 auto;background:white;padding:32px;border-radius:16px;">
    <h2 style="color:#1D1D1F;margin:0 0 12px;font-family:Georgia,serif;">Questions Generated</h2>
    <p style="color:#6E6E73;font-size:16px;line-height:1.6;">${count} new questions are ready for review.</p>
    <p style="margin-top:20px;"><a href="${siteUrl}/admin" style="color:#1A6B52;font-weight:600;text-decoration:underline;">Review them in the admin panel</a></p>
  </div>
</body>
</html>`;
}
