import React, { useState, useEffect } from "react";
// import axios from "axios";
import ConfirmModal from "./ConfirmModal";
import ServiceSelector from "./ServiceSelector";
import "./BookingForm.css";

const today = new Date().toISOString().split("T")[0];

const workingSlots = [
  // генерируем от 08:00 до 20:15 каждый час
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
];

function BookingForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: today,
    time: "",
    services: [],
  });
  const [errors, setErrors] = useState({});
  const [availableTimes, setAvailableTimes] = useState(
    workingSlots.map((t) => ({ time: t, isBooked: false }))
  );
  const [showModal, setShowModal] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    const valid =
      cleaned.length >= 8 &&
      cleaned.length <= 15 &&
      !/^(\d)\1+$/.test(cleaned) &&
      /^[\d+\-\s()]+$/.test(phone);
    const test = [
      "123456789",
      "000000000",
      "111111111",
      "123123123",
      "987654321",
    ];
    return valid && !test.includes(cleaned);
  };
  const validateName = (name) =>
    name.length >= 3 && /^[\p{L}\p{N} ]+$/u.test(name);
  const isPast = (dateStr, slot) => {
    const [start] = slot.split(" - ");
    const [h, m] = start.split(":").map(Number);
    const [Y, M, D] = dateStr.split("-").map(Number);
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Helsinki" })
    );
    return new Date(Y, M - 1, D, h, m) < now;
  };

  useEffect(() => {
    // здесь можно запросить занятие слотов через WP REST API
    // fetch(`/wp-json/booking/v1/booked?date=${form.date}`)...
  }, [form.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      time: name === "date" ? "" : prev.time,
    }));
  };
  const handleTimeSelect = (slot) => {
    if (!slot.isBooked && !isPast(form.date, slot.time))
      setForm((prev) => ({ ...prev, time: slot.time }));
  };
  const handleServicesToggle = (selected) =>
    setForm((prev) => ({ ...prev, services: selected }));

  const validateForm = () => {
    const errs = {};
    if (!validateName(form.name)) errs.name = "Nimen oltava 3 merkkiä";
    if (!validatePhone(form.phone)) errs.phone = "Virhe puhelinnumero";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Virheellinen sähköposti";
    if (
      !form.date ||
      !form.time ||
      !form.name ||
      !form.phone ||
      form.services.length === 0
    )
      errs.general = "Täytä kaikki pakolliset kentät";
    if (form.time && isPast(form.date, form.time))
      errs.time = "Valittu aika on mennyt";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    axios
      .post("/wp-json/booking/v1/submit", form)
      .then((res) => {
        if (res.data.success) {
          setShowThanks(true);
          setShowModal(false);
          setForm({
            name: "",
            phone: "",
            email: "",
            date: today,
            time: "",
            services: [],
          });
          setTimeout(() => setShowThanks(false), 3000);
        }
      })
      .catch(console.error);
  };

  return (
    <>
      <h2 className="form-title">Varauslomake</h2>
      <div className="booking-form-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (validateForm()) setShowModal(true);
          }}
        >
          <div className="form-group">
            <label htmlFor="etunimi">Nimi *</label>
            <input
              name="name"
              type="text"
              placeholder="Nimi"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className="booking-error">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="puhelin">Puhelinnumero *</label>
            <input
              name="phone"
              type="text"
              placeholder="Puhelinnumero"
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && <p className="booking-error">{errors.phone}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="sahkoposti">Sähköposti *</label>
            <input
              name="email"
              type="email"
              placeholder="Sähköposti"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p className="booking-error">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label>Valitse palvelut *</label>
            <ServiceSelector
              selectedServices={form.services}
              onToggle={handleServicesToggle}
            />
            {errors.general && (
              <p className="booking-error">{errors.general}</p>
            )}
          </div>

          <div className="form-group">
            <input
              name="date"
              type="date"
              min={today}
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div className="time-grid">
            {availableTimes.map((slot, i) => (
              <button
                key={i}
                type="button"
                className={`time-slot ${slot.isBooked ? "booked" : ""} ${
                  form.time === slot.time ? "selected" : ""
                }`}
                disabled={slot.isBooked || isPast(form.date, slot.time)}
                onClick={() => handleTimeSelect(slot)}
              >
                {slot.time}
              </button>
            ))}
          </div>
          {errors.time && <p className="booking-error">{errors.time}</p>}

          <button className="booking-button" type="submit">
            Vahvista varaus
          </button>
          {errors.general && <p className="booking-error">{errors.general}</p>}
        </form>

        {showModal && (
          <ConfirmModal
            form={{
              name: form.name,
              phone: form.phone,
              email: form.email,
              date: form.date,
              time: form.time,
              service: form.services.join(", "),
            }}
            onConfirm={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        )}
        {showThanks && (
          <div className="toast-success">Kiitos! Aika on varattu.</div>
        )}
      </div>
    </>
  );
}

export default BookingForm;
