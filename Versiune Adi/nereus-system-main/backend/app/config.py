"""Application configuration loaded from environment variables."""
from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Copernicus Data Space Ecosystem credentials
    cdse_username: str = ""
    cdse_password: str = ""

    # Set to true to skip Copernicus calls and use synthetic demo data
    nereus_offline_mode: bool = False
    demo_mode: bool = False

    @computed_field  # type: ignore[prop-decorator]
    @property
    def is_demo(self) -> bool:
        """True if EITHER nereus_offline_mode or demo_mode is set."""
        return self.nereus_offline_mode or self.demo_mode

    # Spectral index anomaly thresholds
    ndci_threshold: float = 0.05       # NDCI > 0.05 indicates actual chlorophyll excess (avoids false positives at 0.0)
    turbidity_threshold: float = 1.30  # B4/B3 > 1.30 indicates elevated turbidity
    min_anomaly_area_ha: float = 2.0   # Ignore tiny artefacts below this area

    # SQLite connection string
    database_url: str = "sqlite:///./nereus.db"

    # CORS origins — use "*" for the demo
    cors_origins: str = "*"

    # Resend email service
    resend_api_key: str = ""
    frontend_url: str = "https://nereus-system.vercel.app"


settings = Settings()
