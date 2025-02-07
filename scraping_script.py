import pandas as pd
import requests
import re

# Load the Excel file
file_path = "scrape_data.xlsx"
df = pd.read_excel(file_path)

# Define column names based on actual headers
ORG_NUMBER_COL = "Org. Nr Kontaktet"
ORG_NAME_COL = "Bedriftsnavn"
PHONE_COL = "Mobil BT"
CONTACT_NAME_COL = "Navn BT"
POSITION_COL = "Tittel BT"

# API endpoints
BASE_URL = "http://localhost:8080/api"
ORG_API_URL = f"{BASE_URL}/add_organization"
CONTACT_API_URL = f"{BASE_URL}/add_contact"

DEFAULT_POSITION = "Ukjent stilling"

def clean_phone_number(phone):
    """
    Clean phone numbers by removing all non-digits and common suffixes.
    Returns None if the result is invalid.
    """
    if pd.isna(phone):
        return None
        
    phone = str(phone)
    
    # Remove common suffixes with variations
    suffixes = ['(1881)', '(18881)', '(881)', ' 1881', ' 18881', ' 881']
    for suffix in suffixes:
        phone = phone.replace(suffix, '')
    
    # Remove all non-digits (spaces, parentheses, etc.)
    phone = re.sub(r'\D', '', phone)
    
    # Validate length (Norwegian phone numbers are 8 digits)
    if len(phone) != 8:
        print(f"⚠️ Invalid phone number length: {phone}")
        return None
        
    # Convert to integer format for validation
    try:
        phone_int = int(phone)
        if phone_int < 10000000 or phone_int > 99999999:  # Valid Norwegian number range
            print(f"⚠️ Phone number out of valid range: {phone}")
            return None
        return phone_int
    except ValueError:
        print(f"⚠️ Invalid phone number format: {phone}")
        return None

def process_row(row):
    """Process a single row of data"""
    # Clean and validate organization data
    org_number = str(row[ORG_NUMBER_COL]).strip()
    org_name = str(row[ORG_NAME_COL]).strip()
    
    if not org_name or not org_number.isdigit():
        print(f"⚠️ Skipping invalid organization data: OrgNumber={org_number}, OrgName={org_name}")
        return False
    
    org_number = int(org_number)
    
    # Clean contact data
    phone = clean_phone_number(row[PHONE_COL])
    contact_name = str(row[CONTACT_NAME_COL]).strip() if pd.notna(row[CONTACT_NAME_COL]) else None
    position = str(row[POSITION_COL]).strip() if pd.notna(row[POSITION_COL]) and str(row[POSITION_COL]).strip() else DEFAULT_POSITION
    
    if not (contact_name and phone):
        print(f"⚠️ Skipping invalid contact data for org {org_number}: Name={contact_name}, Phone={phone}")
        return False
        
    try:
        # First try to create the organization
        org_payload = {
            "OrganizationName": org_name,
            "OrgNumber": org_number
        }
        
        org_response = requests.post(ORG_API_URL, json=org_payload)
        if org_response.status_code in [200, 409]:  # 409 means org already exists, which is fine
            print(f"✅ Organization processed: {org_name} ({org_number})")
            
            # Now create the contact
            contact_payload = {
                "Name": contact_name,
                "Phone": phone,  # Now it's already an integer from clean_phone_number
                "OrgNumber": org_number,
                "PositionName": position,
                "Email": None
            }
            
            contact_response = requests.post(CONTACT_API_URL, json=contact_payload)
            if contact_response.status_code == 200:
                position_status = " (default position)" if position == DEFAULT_POSITION else ""
                print(f"✅ Contact added: {contact_name} for {org_name}{position_status}")
                return True
            else:
                print(f"⚠️ Failed to add contact {contact_name}: {contact_response.text}")
                return False
        else:
            print(f"⚠️ Failed to process organization {org_name}: {org_response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ API Error: {e}")
        return False

def main():
    success_count = 0
    total_count = 0
    default_position_count = 0
    invalid_phone_count = 0
    
    # Process each row
    for index, row in df.iterrows():
        total_count += 1
        
        # Pre-check phone number
        phone = clean_phone_number(row[PHONE_COL])
        if phone is None:
            invalid_phone_count += 1
            continue
            
        if process_row(row):
            success_count += 1
            if pd.isna(row[POSITION_COL]) or not str(row[POSITION_COL]).strip():
                default_position_count += 1
            
        # Print progress every 100 rows
        if total_count % 100 == 0:
            print(f"Progress: {total_count}/{len(df)} rows processed ({success_count} successful)")
    
    # Print final statistics
    print(f"\nProcessing complete!")
    print(f"Total rows: {total_count}")
    print(f"Successful: {success_count}")
    print(f"Failed: {total_count - success_count}")
    print(f"Invalid phone numbers: {invalid_phone_count}")
    print(f"Contacts with default position: {default_position_count}")

if __name__ == "__main__":
    main()
