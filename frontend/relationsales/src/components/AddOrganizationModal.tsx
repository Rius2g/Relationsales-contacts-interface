import React, { useEffect, useRef, useState } from "react";

interface AddOrgModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (org: { OrganizationName: string; OrgNumber: number }) => void;
}

export const AddOrgModal: React.FC<AddOrgModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [orgData, setOrgData] = useState({
        OrganizationName: "",
        OrgNumber: 0,
        OrgType: "",
    });

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
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

    const overlayStyle = {
        position: "fixed" as const,
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
    };

    const modalStyle = {
        backgroundColor: "#1F2937",
        borderRadius: "12px",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
        width: "100%",
        maxWidth: "400px",
        margin: "0 16px",
        padding: "24px",
        color: "white",
    };

    const headerStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
    };

    const titleStyle = {
        fontSize: "20px",
        fontWeight: 600,
        color: "#F3F4F6",
    };

    const closeButtonStyle = {
        border: "none",
        background: "none",
        color: "#9CA3AF",
        cursor: "pointer",
    };

    const inputContainerStyle = {
        marginBottom: "20px",
    };

    const labelStyle = {
        display: "block",
        fontSize: "14px",
        fontWeight: 500,
        color: "#E5E7EB",
        marginBottom: "8px",
    };

    const inputStyle = {
        width: "100%",
        maxWidth: "320px",
        padding: "12px 16px",
        backgroundColor: "#374151",
        border: "1px solid #4B5563",
        borderRadius: "8px",
        color: "white",
        outline: "none",
        WebkitAppearance: "none",
        MozAppearance: "textfield",
        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
        },
    };

    const buttonContainerStyle = {
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        marginTop: "24px",
    };

    const cancelButtonStyle = {
        padding: "8px 16px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#E5E7EB",
        backgroundColor: "#374151",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    };

    const saveButtonStyle = {
        padding: "8px 16px",
        fontSize: "14px",
        fontWeight: 500,
        color: "white",
        backgroundColor: "#3B82F6",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    };

    if (!isOpen) return null;

    return (
        <div style={overlayStyle}>
            <div ref={modalRef} style={modalStyle}>
                <div style={headerStyle}>
                    <h2 style={titleStyle}>Legg til ny bedrift</h2>
                    <button onClick={onClose} style={closeButtonStyle}>
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

                <div>
                    <div style={inputContainerStyle}>
                        <label style={labelStyle}>Bedriftsnavn</label>
                        <input
                            type="text"
                            value={orgData.OrganizationName}
                            onChange={(e) =>
                                setOrgData({ ...orgData, OrganizationName: e.target.value })
                            }
                            style={inputStyle}
                            placeholder="Skriv bedriftsnavn"
                        />
                    </div>

                    <div style={inputContainerStyle}>
                        <label style={labelStyle}>Organisasjonsnummer</label>
                        <input
                            type="number"
                            value={orgData.OrgNumber || ""}
                            onChange={(e) =>
                                setOrgData({
                                    ...orgData,
                                    OrgNumber: parseInt(e.target.value) || 0,
                                })
                            }
                            style={{
                                ...inputStyle,
                                WebkitAppearance: "none",
                                MozAppearance: "textfield",
                            }}
                            placeholder="Skriv organisasjonsnummer"
                        />
                    </div>
                    <div style={inputContainerStyle}>
                        <label style={labelStyle}>Organisasjonstype</label>
                        <input
                            type="text"
                            value={orgData.OrgType}
                            onChange={(e) =>
                                setOrgData({ ...orgData, OrgType: e.target.value })
                            }
                            style={inputStyle}
                            placeholder="Skriv organisasjonstype"
                        />
                    </div>
                </div>
                <div style={buttonContainerStyle}>
                    <button onClick={onClose} style={cancelButtonStyle}>
                        Avbryt
                    </button>
                    <button
                        onClick={() => {
                            onSubmit(orgData);
                            setOrgData({ OrganizationName: "", OrgNumber: 0, OrgType: "" });
                        }}
                        style={saveButtonStyle}
                    >
                        Lagre
                    </button>
                </div>
            </div>
        </div>
    );
};
