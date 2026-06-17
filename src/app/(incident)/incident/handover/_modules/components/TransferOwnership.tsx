// components/modals/TransferOwnershipModal.tsx
"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button1";
import Modal from "@/components/ui/Modal";

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransferOwnershipModal({
  isOpen,
  onClose,
}: TransferOwnershipModalProps) {
  // State for Checkboxes
  const [notifyVia, setNotifyVia] = useState({
    email: true,
    slack: true,
    pagerduty: false,
  });

  const handleCheckboxChange = (method: keyof typeof notifyVia) => {
    setNotifyVia((prev) => ({ ...prev, [method]: !prev[method] }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div className="form-group">
            <label className="form-label">From Team</label>
            <select className="form-select">
              <option>London Platform Team</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">To Team</label>
            <select className="form-select">
              <option>US Platform Team</option>
              <option>Singapore Team</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div className="form-group">
            <label className="form-label">Incoming Commander</label>
            <input
              className="form-input"
              type="text"
              defaultValue="Sarah Wilson"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Transfer Time (UTC)</label>
            <input className="form-input" type="time" defaultValue="18:00" />
          </div>
        </div>

        {/* Checkbox Group */}
        <div className="form-group">
          <label className="form-label">Notify Via</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={notifyVia.email}
                onChange={() => handleCheckboxChange("email")}
              />{" "}
              Email
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={notifyVia.slack}
                onChange={() => handleCheckboxChange("slack")}
              />{" "}
              Slack
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={notifyVia.pagerduty}
                onChange={() => handleCheckboxChange("pagerduty")}
              />{" "}
              PagerDuty
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Transfer Notes</label>
          <textarea
            className="form-textarea"
            defaultValue="US team should verify deployment metrics for at least 15 minutes post rollback."
          />
        </div>
      </div>
      <div className="modal-footer">
        <Button variant="outline-dark" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Save Transfer</Button>
      </div>
    </Modal>
  );
}
