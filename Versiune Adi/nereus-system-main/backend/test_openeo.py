import openeo

try:
    print("Connecting...")
    conn = openeo.connect("https://openeo.dataspace.copernicus.eu")
    print("Authenticating...")
    conn.authenticate_oidc_client_credentials("cdse-public", "dummy_pass")
    print("Success client auth")
except Exception as e:
    print(f"Error client: {e}")

try:
    print("Authenticating resource owner...")
    conn.authenticate_oidc_resource_owner_password_credentials("dummy_user", "dummy_pass", client_id="cdse-public")
    print("Success resource owner auth")
except Exception as e:
    print(f"Error resource owner: {e}")
