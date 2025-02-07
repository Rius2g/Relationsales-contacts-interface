interface OrganizationType {
    orgName: string;
    orgNumber: number;
    orgType: string;
    contacts: Contact[] | null;
}

type NewOrganization = {
    OrganizationName: string;
    OrgNumber: number;
    OrgType: string;
};

type NewContact = {
    Name: string;
    Phone: number;
    OrgNumber: number;
    Email: string | null;
    PositionName: string;
};

interface Contact {
    contactID: string;
    phone: number;
    orgNumber: number;
    name: string;
    email: string | null;
    positionName: string;
    contactedAt: Date;
}
