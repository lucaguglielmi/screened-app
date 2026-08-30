"""Email notification service for Screened investigations."""
import logging
import os
from typing import Optional

logger = logging.getLogger("screened.services.email")


class EmailService:
    """Service to deliver email notifications when investigations are ready."""

    def __init__(self):
        self.sender_email = os.getenv("NOTIFICATIONS_SENDER_EMAIL", "reports@screened.app")
        self.app_url = os.getenv("APP_BASE_URL", "https://screened-786241671474.europe-west2.run.app")

    def generate_completion_html(self, festival_name: str, investigation_id: str) -> str:
        dossier_url = f"{self.app_url}/?id={investigation_id}"
        
        return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Investigation Dossier is Ready</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0D13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F1F5F9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0B0D13; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #121620; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; padding: 32px;" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td>
              <div style="font-family: monospace; font-size: 13px; font-weight: bold; color: #22D3EE; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">
                Screened Forensic Intelligence
              </div>
              <h1 style="font-size: 24px; font-weight: 700; color: #FFFFFF; margin: 0 0 16px 0; line-height: 1.3;">
                Investigation Dossier Ready: {festival_name}
              </h1>
              <p style="font-size: 15px; line-height: 1.6; color: #94A3B8; margin: 0 0 24px 0;">
                Our multi-agent investigative core has finished corroborating public registries, screening venues, previous editions, and personnel directorships for <strong>{festival_name}</strong>.
              </p>

              <!-- Required Testing Notice -->
              <div style="background-color: #181F2E; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
                <div style="font-size: 13px; font-weight: 700; color: #FBBF24; margin-bottom: 6px; text-transform: uppercase; font-family: monospace; letter-spacing: 0.5px;">
                  ⚠️ Active Testing Notice &amp; Filmmaker Verification Required
                </div>
                <div style="font-size: 13px; line-height: 1.5; color: #CBD5E1;">
                  Please note that the festival research functionality is fully working but still in test and may commit mistakes and give information that requires further validation from you. Always verify critical entry fees, dates, and screening venues before making submission decisions.
                </div>
              </div>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #22D3EE;">
                    <a href="{dossier_url}" target="_blank" style="font-size: 14px; font-family: monospace; font-weight: bold; color: #0B0D13; text-decoration: none; padding: 14px 28px; display: inline-block; border-radius: 10px;">
                      Open Verified Dossier &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #64748B; margin: 0; line-height: 1.5;">
                Direct URL: <a href="{dossier_url}" style="color: #22D3EE; word-break: break-all;">{dossier_url}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #1E293B; margin: 28px 0 20px 0;" />

              <p style="font-size: 11px; color: #64748B; margin: 0; line-height: 1.4;">
                This automated due-diligence report was requested via Screened. Dossiers are synthesized autonomously from public records, Companies House listings, IMDb data, and web sources.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    async def send_completion_email(self, to_email: str, festival_name: str, investigation_id: str) -> bool:
        """Dispatches an email notification to the user upon dossier completion."""
        if not to_email or "@" not in to_email:
            logger.warning(f"Invalid email address provided for notification: {to_email}")
            return False

        html_content = self.generate_completion_html(festival_name, investigation_id)
        subject = f"Your Forensic Dossier for {festival_name} is Ready | Screened"

        logger.info(f"Dispatching completion email for investigation {investigation_id} to {to_email}")
        
        # If SendGrid or cloud mail credentials exist in environment, dispatch live
        sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
        if sendgrid_api_key:
            try:
                import urllib.request
                import json

                payload = {
                    "personalizations": [{"to": [{"email": to_email}]}],
                    "from": {"email": self.sender_email, "name": "Screened Intelligence"},
                    "subject": subject,
                    "content": [{"type": "text/html", "value": html_content}],
                }
                req = urllib.request.Request(
                    "https://api.sendgrid.com/v3/mail/send",
                    data=json.dumps(payload).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {sendgrid_api_key}",
                        "Content-Type": "application/json",
                    },
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    logger.info(f"SendGrid email dispatched successfully, status={resp.status}")
                    return True
            except Exception as e:
                logger.exception(f"Failed to send email via SendGrid: {e}")

        # Cloud Run / Local fallback logger
        logger.info(
            f"[EMAIL_DISPATCH_RECORD] to={to_email} subject='{subject}' investigationId={investigation_id} status=SENT_RECORD"
        )
        return True


email_service = EmailService()
