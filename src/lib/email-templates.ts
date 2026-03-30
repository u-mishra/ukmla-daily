const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ukmladaily.co.uk';

const DISCLAIMER = 'UKMLA Daily is a revision aid and is not a substitute for official study materials, clinical guidelines, or professional medical advice. Always verify clinical information with approved sources. Questions are generated for educational purposes only.';

export function welcomeEmailHtml(email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
      <h1 style="color:white;margin:0;font-size:24px;letter-spacing:2px;">🩺 UKMLA DAILY</h1>
    </div>
    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;">
      <h2 style="color:#1f2937;margin:0 0 16px;">Welcome aboard!</h2>
      <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 16px;">
        You're all set. Starting tomorrow, you'll receive a UKMLA-style practice question every morning at <strong>7:00 AM</strong>.
      </p>
      <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Each email takes about <strong>2 minutes</strong> — read the clinical vignette, pick your answer, then tap to reveal the explanation.
      </p>
      <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 24px;">
        Consistency is everything. Build the habit, and you'll be amazed how much sticks.
      </p>
      <p style="color:#4b5563;font-size:16px;line-height:1.6;">
        Good luck with your revision! 💪
      </p>
    </div>
    <div style="text-align:center;padding:24px 0;">
      <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:0 0 8px;">${DISCLAIMER}</p>
      <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#9ca3af;font-size:12px;">Unsubscribe</a>
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
}, subscriberEmail: string): string {
  const options = [
    { letter: 'A', text: question.option_a },
    { letter: 'B', text: question.option_b },
    { letter: 'C', text: question.option_c },
    { letter: 'D', text: question.option_d },
    { letter: 'E', text: question.option_e },
  ];

  const optionsHtml = options.map(opt => `
    <div style="padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;font-size:15px;color:#374151;">
      <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;background:#f3f4f6;border-radius:6px;font-weight:600;margin-right:10px;font-size:13px;">${opt.letter}</span>
      ${opt.text}
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:24px 32px;border-radius:16px 16px 0 0;text-align:center;">
      <p style="color:rgba(255,255,255,0.7);margin:0 0 4px;font-size:13px;letter-spacing:2px;">UKMLA DAILY</p>
      <h1 style="color:white;margin:0;font-size:22px;">🩺 Day ${question.day_number} — ${question.specialty}</h1>
    </div>
    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;">
      <div style="margin-bottom:20px;">
        <span style="display:inline-block;padding:4px 10px;background:#EDE9FE;color:#7C3AED;border-radius:6px;font-size:12px;font-weight:600;margin-right:6px;">${question.specialty}</span>
        <span style="display:inline-block;padding:4px 10px;background:#FFF7ED;color:#EA580C;border-radius:6px;font-size:12px;font-weight:600;">${question.difficulty}</span>
      </div>
      <p style="color:#1f2937;font-size:16px;line-height:1.7;margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;">
        ${question.vignette}
      </p>
      ${optionsHtml}
      <div style="text-align:center;margin-top:28px;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${siteUrl}/answer/${question.id}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="21%" strokecolor="#4F46E5" fillcolor="#4F46E5">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Reveal Answer →</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            <td style="background-color:#4F46E5;border-radius:10px;text-align:center;">
              <a href="${siteUrl}/answer/${question.id}" style="display:inline-block;padding:14px 40px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                Reveal Answer →
              </a>
            </td>
          </tr>
        </table>
        <!--<![endif]-->
      </div>
    </div>
    <div style="text-align:center;padding:24px 0;">
      <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:0 0 8px;">${DISCLAIMER}</p>
      <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}" style="color:#9ca3af;font-size:12px;">Unsubscribe</a>
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
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:40px;">
  <h2>📋 UKMLA Daily — Questions Generated</h2>
  <p>${count} new questions are ready for review.</p>
  <p><a href="${siteUrl}/admin">Review them in the admin panel →</a></p>
</body>
</html>`;
}
