import sqlite3

conn = sqlite3.connect('backend/nereus.db')
cursor = conn.cursor()

print("--- Alerts ---")
cursor.execute("SELECT id, lat, lon FROM alert WHERE lat IS NULL OR lon IS NULL")
print(cursor.fetchall())

print("--- Citizen Reports ---")
cursor.execute("SELECT id, lat, lon FROM citizenreport WHERE lat IS NULL OR lon IS NULL")
print(cursor.fetchall())

print("--- Zones ---")
cursor.execute("SELECT id, geometry_geojson FROM monitoringzone")
zones = cursor.fetchall()
for z in zones:
    print(f"Zone {z[0]}: {z[1]}")
