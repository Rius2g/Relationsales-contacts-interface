import React, { useEffect, useRef, useState } from "react";

interface addContactModalProps {
  isOpen: boolean;
  Organizations: OrganizationType[];
  onClose: () => void;
  onSubmit: (contact: {
    Name: string;
    Phone: number;
    OrgNumber: number;
    Email: string | null;
    PositionName: string;
  }) => void;
}

export const AddContactModal: React.FC<addContactModalProps> = ({
  isOpen,
  Organizations,
  onClose,
  onSubmit,
}) => {
  const [contactData, setContactData] = useState({
    Name: "",
    Phone: 0,
    OrgNumber: 0,
    Email: null as string | null,
    PositionName: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredOrganizations = Organizations.filter((org) =>
    org.orgName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const styles: Record<string, CSSProperties> = {
    overlay: {
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    },
    modal: {
      backgroundColor: "#0F172A",
      borderRadius: "16px",
      width: "100%",
      maxWidth: "560px",
      padding: "32px",
      color: "white",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "32px",
    },
    title: {
      fontSize: "24px",
      fontWeight: 500,
      color: "#FFFFFF",
    },
    closeButton: {
      border: "none",
      background: "none",
      color: "#9CA3AF",
      cursor: "pointer",
      padding: "8px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    inputContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "16px",
      fontWeight: 500,
      color: "#FFFFFF",
      textAlign: "center",
      marginBottom: "4px",
    },
    input: {
      width: "90%",
      padding: "12px 16px",
      backgroundColor: "#1E293B",
      border: "1px solid #334155",
      borderRadius: "12px",
      color: "white",
      outline: "none",
      fontSize: "16px",
    },
    dropdownContainer: {
      position: "relative",
      width: "100%",
    },
    dropdownList: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      maxHeight: "200px",
      overflowY: "auto",
      backgroundColor: "#1E293B",
      border: "1px solid #334155",
      borderRadius: "12px",
      marginTop: "8px",
      zIndex: 51,
    },
    dropdownItem: {
      padding: "12px 16px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "32px",
    },
    cancelButton: {
      padding: "12px 24px",
      fontSize: "16px",
      fontWeight: 500,
      color: "#FFFFFF",
      backgroundColor: "#334155",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
    },
    saveButton: {
      padding: "12px 24px",
      fontSize: "16px",
      fontWeight: 500,
      color: "white",
      backgroundColor: "#3B82F6",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
    },
    sectionTitle: {
      fontSize: "16px",
      fontWeight: 500,
      color: "#FFFFFF",
      textAlign: "center",
      marginBottom: "16px",
    },
  };

  return isOpen ? (
    <div style={styles.overlay}>
      <div ref={modalRef} style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Legg til ny kontakt</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div style={styles.form}>
          <div>
            <h3 style={styles.sectionTitle}>Velg organisasjon</h3>
            <div style={styles.inputContainer} ref={dropdownRef}>
              <div style={styles.dropdownContainer}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onClick={() => setIsDropdownOpen(true)}
                  placeholder="Søk etter organisasjon"
                  style={styles.input}
                />
                {isDropdownOpen && (
                  <div style={styles.dropdownList}>
                    {Organizations.filter((org) =>
                      org.orgName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                    ).map((org) => (
                      <div
                        key={org.orgNumber}
                        style={{
                          ...styles.dropdownItem,
                          backgroundColor:
                            org.orgName === selectedOrg
                              ? "#334155"
                              : "transparent",
                        }}
                        onClick={() => {
                          setSelectedOrg(org.orgName);
                          setSearchTerm(org.orgName);
                          setContactData({
                            ...contactData,
                            OrgNumber: org.orgNumber,
                          });
                          setIsDropdownOpen(false);
                        }}
                      >
                        {org.orgName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.label}>Navn</label>
            <input
              type="text"
              value={contactData.Name}
              onChange={(e) =>
                setContactData({ ...contactData, Name: e.target.value })
              }
              style={styles.input}
              placeholder="Skriv inn navn"
            />

            <h3 style={styles.sectionTitle}>Kontakt stillingstittel</h3>
            <input
              type="text"
              value={contactData.PositionName}
              onChange={(e) =>
                setContactData({ ...contactData, PositionName: e.target.value })
              }
              style={styles.input}
              placeholder="Skriv inn stillingstittel"
            />
          </div>

          <div style={styles.inputContainer}>
            <h3 style={styles.sectionTitle}>Telefonnummer</h3>
            <input
              type="number"
              value={contactData.Phone || ""}
              onChange={(e) =>
                setContactData({
                  ...contactData,
                  Phone: parseInt(e.target.value) || 0,
                })
              }
              style={styles.input}
              placeholder="Skriv inn telefonnummer"
            />
          </div>

          <div style={styles.inputContainer}>
            <h3 style={styles.sectionTitle}>E-post</h3>
            <input
              type="email"
              value={contactData.Email || ""}
              onChange={(e) =>
                setContactData({
                  ...contactData,
                  Email: e.target.value || null,
                })
              }
              style={styles.input}
              placeholder="Skriv inn epost"
            />
          </div>

          <div style={styles.buttonContainer}>
            <button onClick={onClose} style={styles.cancelButton}>
              Avbryt
            </button>
            <button
              onClick={() => {
                if (!contactData.OrgNumber) {
                  alert("Vennligst velg en organisasjon");
                  return;
                }
                onSubmit(contactData);
                setContactData({
                  Name: "",
                  OrgNumber: 0,
                  Phone: 0,
                  Email: null,
                  PositionName: "",
                });
                setSearchTerm("");
                setSelectedOrg("");
                onClose();
              }}
              style={styles.saveButton}
            >
              Lagre
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
