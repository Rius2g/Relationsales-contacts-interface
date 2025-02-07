import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

interface OrgTypeFilterProps {
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  availableTypes: string[];
}

export const OrgTypeFilter = ({
  selectedTypes,
  onTypeChange,
  availableTypes,
}: OrgTypeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "192px",
          padding: "8px 16px",
          color: "white",
          backgroundColor: "#374151",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4B5563")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#374151")}
      >
        <span>
          {selectedTypes.length
            ? `${selectedTypes.length} selected`
            : "Velg bransjer"}
        </span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            zIndex: 50,
            width: "192px",
            marginTop: "8px",
            backgroundColor: "#374151",
            borderRadius: "8px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          {availableTypes.map((type) => (
            <div
              key={type}
              onClick={() => toggleType(type)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                color: "white",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#4B5563")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  marginRight: "8px",
                  border: "1px solid white",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedTypes.includes(type) && (
                  <Check size={12} color="white" />
                )}
              </div>
              {type}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
