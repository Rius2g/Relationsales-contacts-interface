import pandas as pd
import requests
import re

# Load the Excel file
file_path = "Vainu Nummere.xlsx"
df = pd.read_excel(file_path)

# Define column names based on actual headers
ORG_NUMBER_COL = "Org. Nr Kontaktet"
ORG_NAME_COL = "Bedriftsnavn"
PHONE_COL = "Mobil BT"
CONTACT_NAME_COL = "Navn BT"
POSITION_COL = "Tittel BT"
EMAIL_COL = " Epost BT"  # Note the space before Epost in the header

# API endpoints
BASE_URL = "http://localhost:8080/api"
ORG_API_URL = f"{BASE_URL}/add_organization"
CONTACT_API_URL = f"{BASE_URL}/add_contact"

DEFAULT_POSITION = "Ukjent stilling"

def clean_org_number(org_number):
    """
    Clean organization number by removing non-digits and spaces.
    Returns None if invalid.
    """
    if pd.isna(org_number):
        return None
        
    # Convert to string and remove all non-digits
    cleaned = re.sub(r'\D', '', str(org_number))
    
    # Validate length (Norwegian org numbers are 9 digits)
    if len(cleaned) != 9:
        print(f"⚠️ Invalid organization number length: {org_number}")
        return None
        
    try:
        return int(cleaned)
    except ValueError:
        print(f"⚠️ Invalid organization number format: {org_number}")
        return None

def clean_phone_number(phone):
    """
    Clean phone numbers by removing all non-digits and common suffixes.
    Returns None if invalid.
    """
    if pd.isna(phone):
        return None
        
    phone = str(phone)[0:-2]
    
    # Remove common suffixes with variations
    suffixes = ['(1881)', '(18881)', '(881)', ' 1881', ' 18881', ' 881']
    for suffix in suffixes:
        phone = phone.replace(suffix, '')
    
    # Remove all non-digits
    phone = re.sub(r'\D', '', phone)
    
    # Validate length (Norwegian phone numbers are 8 digits)


    phone = phone[2:]
    if len(phone) != 8:
        print(f"⚠️ Invalid phone number length: {phone}")
        return None
        
    try:
        phone_int = int(phone)
        if phone_int < 10000000 or phone_int > 99999999:
            print(f"⚠️ Phone number out of valid range: {phone}")
            return None
        return phone_int
    except ValueError:
        print(f"⚠️ Invalid phone number format: {phone}")
        return None

def clean_email(email):
    """
    Clean and validate email address.
    Returns None if invalid.
    """
    if pd.isna(email):
        return None
        
    email = str(email).strip()
    
    # Basic email validation
    email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    if not email_pattern.match(email):
        print(f"⚠️ Invalid email format: {email}")
        return None
        
    return email.lower()

def process_row(row):
    """Process a single row of data"""
    # Clean and validate organization data
    org_number = clean_org_number(row[ORG_NUMBER_COL])
    org_name = str(row[ORG_NAME_COL]).strip() if pd.notna(row[ORG_NAME_COL]) else None
    
    if not org_name or not org_number:
        print(f"⚠️ Skipping invalid organization data: OrgNumber={row[ORG_NUMBER_COL]}, OrgName={org_name}")
        return False
    
    # Clean contact data
    phone = clean_phone_number(row[PHONE_COL])
    contact_name = str(row[CONTACT_NAME_COL]).strip() if pd.notna(row[CONTACT_NAME_COL]) else None
    position = str(row[POSITION_COL]).strip() if pd.notna(row[POSITION_COL]) and str(row[POSITION_COL]).strip() else DEFAULT_POSITION
    email = clean_email(row[EMAIL_COL])
    
    if not (contact_name and phone):
        print(f"⚠️ Skipping invalid contact data for org {org_number}: Name={contact_name}, Phone={phone}")
        return False
        
    try:
        # Create organization
        org_payload = {
            "OrganizationName": org_name,
            "OrgNumber": org_number
        }
        
        org_response = requests.post(ORG_API_URL, json=org_payload)
        if org_response.status_code in [200, 409]:  # 409 means org already exists
            print(f"✅ Organization processed: {org_name} ({org_number})")
            
            # Create contact
            contact_payload = {
                "Name": contact_name,
                "Phone": phone,
                "OrgNumber": org_number,
                "PositionName": position,
                "Email": email
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
    invalid_org_count = 0
    
    # Process each row
    for index, row in df.iterrows():
        total_count += 1
        
        # Pre-check organization number
        org_number = clean_org_number(row[ORG_NUMBER_COL])
        if org_number is None:
            invalid_org_count += 1
            continue
            
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
    print(f"Invalid organization numbers: {invalid_org_count}")
    print(f"Invalid phone numbers: {invalid_phone_count}")
    print(f"Contacts with default position: {default_position_count}")

if __name__ == "__main__":
    main()
