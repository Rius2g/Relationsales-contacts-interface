interface OrganizationType {
  orgName: string;
  orgNumber: number;
  contacts: Contact[] | null;
}

type NewOrganization = {
  OrganizationName: string;
  OrgNumber: number;
};

interface Contact {
  ContactID: number;
  Phone: number;
  OrgID: number;
  Name: string;
  Email: string | null;
  PositionName: string;
  ContactedAt: Date;
}
