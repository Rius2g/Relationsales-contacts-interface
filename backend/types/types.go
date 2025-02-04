package types 

import (
    "github.com/google/uuid"
)


type Organization struct {
    OrgNumber int `json:"orgNumber"`
    OrgName string `json:"organizationName"` 
}


type OrgWithContacts struct {
    OrgNumber int `json:"orgNumber"`
    OrgName string `json:"orgName"` 
    Contacts []Contact `json:"contacts"`
}

type Contact struct { 
    ContactID uuid.UUID `json:"contactID"`
    Name string `json:"name"` 
    Email string `json:"email"` 
    Phone string `json:"phone"`
    PositionName string `json:"positionName"`
    ContactedAt string `json:"contactedAt"`
    OrgNumber int `json:"orgNumber"`
}
    

