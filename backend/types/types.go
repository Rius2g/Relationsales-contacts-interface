package types 

import (
    "github.com/google/uuid"
)


type Organization struct {
    OrgNumber int `json:"orgNumber"`
    OrgName string `json:"organizationName"` 
    OrgType string `json:"orgType"`
}


type OrgWithContacts struct {
    OrgNumber int `json:"orgNumber"`
    OrgName string `json:"orgName"` 
    OrgType string `json:"orgType"`
    Contacts []Contact `json:"contacts"`
}

type Contact struct { 
    ContactID uuid.UUID `json:"contactID"`
    Name string `json:"name"` 
    Email string `json:"email"` 
    ContactedAt string `json:"contactedAt"`
    PositionName string `json:"positionName"`
    Phone int `json:"phone"`
    OrgNumber int `json:"orgNumber"`
}
    

