"""Email notification service using Resend."""
from __future__ import annotations

import logging
from math import atan2, cos, radians, sin, sqrt

from app.config import settings

logger = logging.getLogger(__name__)

FROM_EMAIL = "Nereus System <onboarding@resend.dev>"


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two points in km."""
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def build_alert_html(alert: dict, subscriber_name: str, unsubscribe_token: str) -> str:
    frontend_url = settings.frontend_url
    ml_line = ""
    if alert.get("ml_confidence"):
        ml_line = f"<p style='margin: 4px 0;'><strong>ML Confidence:</strong> {alert['ml_confidence']}%</p>"

    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; color: #ffffff; padding: 24px; border-radius: 8px;">
        <h1 style="color: #22d3ee; margin-bottom: 4px;">🌊 The Nereus System</h1>
        <p style="color: #94a3b8; margin-top: 0;">Water Pollution Early Warning</p>

        <div style="background: #1e293b; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <h2 style="color: #ef4444; margin: 0 0 8px 0;">⚠️ Pollution Alert Detected</h2>
            <p style="margin: 4px 0;"><strong>Type:</strong> {alert.get('pollution_type', 'Unknown').replace('_', ' ').title()}</p>
            <p style="margin: 4px 0;"><strong>Severity:</strong> {alert.get('severity', 'Unknown').upper()}</p>
            <p style="margin: 4px 0;"><strong>Location:</strong> {alert.get('lat', 0):.4f}°N, {alert.get('lon', 0):.4f}°E</p>
            <p style="margin: 4px 0;"><strong>Affected area:</strong> {alert.get('area_ha', 0):.1f} hectares</p>
            {ml_line}
        </div>

        <p style="color: #94a3b8;">Hi {subscriber_name}, this alert was detected within 50 km of your home location using Copernicus Sentinel-2 and Isolation Forest ML.</p>

        <div style="margin: 24px 0;">
            <a href="{frontend_url}/dashboard" style="background: #22d3ee; color: #0a1628; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">View on Map →</a>
        </div>

        <p style="color: #475569; font-size: 12px;">
            If authorities have not been notified:<br>
            • ANAR (Apele Române): 0800 800 600 (free)<br>
            • Garda de Mediu: 021 207 11 01<br>
            • Emergency: 112
        </p>

        <hr style="border-color: #1e293b; margin: 24px 0;">
        <p style="color: #475569; font-size: 11px;">
            <a href="{frontend_url}/unsubscribe/{unsubscribe_token}" style="color: #22d3ee;">Unsubscribe</a>
        </p>
    </div>
    """


def send_alert_email(
    subscriber_email: str,
    subscriber_name: str,
    alert: dict,
    unsubscribe_token: str,
) -> bool:
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not set — skipping email send")
        return False
    try:
        import resend
        resend.api_key = settings.resend_api_key
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": subscriber_email,
            "subject": f"⚠️ Water Pollution Alert — {alert.get('pollution_type', 'unknown').replace('_', ' ').title()} Detected",
            "html": build_alert_html(alert, subscriber_name, unsubscribe_token),
        })
        logger.info("Alert email sent to %s", subscriber_email)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", subscriber_email, e)
        return False


def notify_subscribers_near_alert(alert: dict, session) -> int:
    """Notify all active subscribers within their alert_radius_km of the alert location."""
    from app.models import Subscriber
    from sqlmodel import select

    stmt = select(Subscriber).where(Subscriber.active == True)  # noqa: E712
    subscribers = session.exec(stmt).all()
    sent = 0
    for sub in subscribers:
        distance = haversine_km(alert["lat"], alert["lon"], sub.home_lat, sub.home_lon)
        if distance <= sub.alert_radius_km:
            success = send_alert_email(
                subscriber_email=sub.email,
                subscriber_name=sub.name or sub.email,
                alert=alert,
                unsubscribe_token=sub.unsubscribe_token,
            )
            if success:
                sent += 1
    return sent
