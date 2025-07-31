import React from "react";
import "./BookingForm.css";

const ConfirmModal = ({ form, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Vahvista varauksesi</h3>
        <ul className="modal-summary">
          <li>
            <strong>Nimi:</strong> {form.name}
          </li>
          <li>
            <strong>Puhelin:</strong> {form.phone}
          </li>
          <li>
            <strong>Sähköposti:</strong> {form.email || "—"}
          </li>
          <li>
            <strong>Päivämäärä:</strong> {form.date}
          </li>
          <li>
            <strong>Aika:</strong> {form.time}
          </li>
          <li>
            <strong>Palvelut:</strong> {form.service}
          </li>
        </ul>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel}>
            Peruuta
          </button>
          <button className="modal-confirm" onClick={onConfirm}>
            Vahvista
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
