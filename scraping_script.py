import pandas as pd
import requests

# Load the Excel file
file_path = "scrape_data.xlsx"
df = pd.read_excel(file_path)

# Ensure correct column names (adjust based on actual headers)
org_col = df.columns[0]  # First column (Org. Nr)
name_col = df.columns[1]  # Second column (Bedriftsnavn)

# Extract unique organizations
unique_orgs = df[[org_col, name_col]].drop_duplicates(subset=[org_col])

# Define the API endpoint
api_url = "http://localhost:8080/api/add_organization"

# Iterate through unique organizations and send POST requests
for _, row in unique_orgs.iterrows():
    org_number = str(row[org_col]).strip()
    org_name = str(row[name_col]).strip()  # Convert to string safely

    if not org_name or not org_number.isdigit():
        print(f"⚠️ Skipping invalid data: OrgNumber={org_number}, OrgName={org_name}")
        continue  # Skip invalid entries

    # Convert OrgNumber to integer for API
    org_number = int(org_number)

    # Prepare JSON payload
    payload = {
        "OrganizationName": org_name,
        "OrgNumber": org_number  # Now correctly formatted as an integer
    }

    try:
        response = requests.post(api_url, json=payload)
        if response.status_code == 201:
            print(f"✅ Successfully added: {org_name} ({org_number})")
        else:
            print(f"⚠️ Failed to add {org_name} ({org_number}): {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error connecting to the API: {e}")
