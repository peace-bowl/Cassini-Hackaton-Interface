import openeo
try:
    conn = openeo.connect('https://openeo.dataspace.copernicus.eu')
    conn.authenticate_oidc_resource_owner_password_credentials('taianadr@gmail.com', '2004Galben20!', client_id='cdse-public')
    print('Success')
except Exception as e:
    print(f'Error: {e}')
