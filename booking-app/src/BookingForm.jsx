import React, { useState, useEffect } from "react";
import axios from "axios";
import ConfirmModal from "./ConfirmModal";
import ServiceSelector from "./ServiceSelector";
import "./BookingForm.css";

const today = new Date().toISOString().split("T")[0];

// Generate 30-minute time slots from 08:00 to 20:15
const generateTimeSlots = () => {
  const slots = [];
  const start = 8 * 60;
  const end = 20 * 60 + 15;
  for (let minutes = start; minutes + 30 <= end; minutes += 30) {
    const h1 = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m1 = String(minutes % 60).padStart(2, "0");
    const h2 = String(Math.floor((minutes + 30) / 60)).padStart(2, "0");
    const m2 = String((minutes + 30) % 60).padStart(2, "0");
    slots.push(`${h1}:${m1} - ${h2}:${m2}`);
  }
  return slots;
};

const workingHours = generateTimeSlots();

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
    workingHours.map((t) => ({ time: t, isBooked: false }))
  );
  const [showModal, setShowModal] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

  // Validate phone number format
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

  // Validate name format
  const validateName = (name) =>
    name.length >= 3 && /^[\p{L}\p{N} ]+$/u.test(name);

  // Check if selected date/time is in the past
  const isPast = (dateStr, slot) => {
    const [start] = slot.split(" - ");
    const [h, m] = start.split(":").map(Number);
    const [Y, M, D] = dateStr.split("-").map(Number);
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Helsinki" })
    );
    return new Date(Y, M - 1, D, h, m) < now;
  };

  // Fetch booked time slots only when a service is selected AND a date is chosen
  useEffect(() => {
    // Guard: do not fetch if no services selected or date not set
    if (form.services.length === 0 || !form.date) {
      // Reset availability to default when services cleared
      setAvailableTimes(
        workingHours.map((t) => ({ time: t, isBooked: false }))
      );
      return;
    }
    axios
      .get(`/wp-json/booking/v1/booked`, { params: { date: form.date } })
      .then((res) => {
        const bookedTimes = res.data || [];
        setAvailableTimes(
          workingHours.map((t) => ({
            time: t,
            isBooked: bookedTimes.includes(t),
          }))
        );
      })
      .catch((err) => {
        console.error("Error fetching booked slots:", err);
      });
  }, [form.services, form.date]);

  // Update form state on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Reset time when date changes
      time: name === "date" ? "" : prev.time,
    }));
  };

  // Handle time selection
  const handleTimeSelect = (slot) => {
    if (slot.isBooked || isPast(form.date, slot.time)) return; // safety guard
    setForm((prev) => ({ ...prev, time: slot.time }));
  };

  // Update selected services; when services change, reset date/time to force re-selection
  const handleServicesToggle = (selected) => {
    setForm((prev) => ({
      ...prev,
      services: selected,
      date: selected.length === 0 ? today : prev.date,
      time: "",
    }));
    // Also clear errors related to general requirement once user selects services
    setErrors((prev) => ({ ...prev, general: undefined }));
  };

  // Form validation
  const validateForm = () => {
    const errs = {};
    if (!validateName(form.name))
      errs.name = "Nimen oltava vähintään 3 merkkiä";
    if (!validatePhone(form.phone)) errs.phone = "Virheellinen puhelinnumero";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Virheellinen sähköposti";

    // Require at least one service
    if (form.services.length === 0) {
      errs.general = "Valitse vähintään yksi palvelu";
    }

    // Only require date/time if a service is selected
    if (form.services.length > 0) {
      if (!form.date) errs.general = "Valitse päivämäärä";
      if (!form.time) errs.general = "Valitse kellonaika";
      if (form.time && isPast(form.date, form.time))
        errs.time = "Valittu aika on mennyt";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit booking
  const handleSubmit = () => {
    // Last-second guard: prevent booking if selected slot is taken
    const isSlotTaken = availableTimes.some(
      (slot) => slot.time === form.time && slot.isBooked
    );
    if (isSlotTaken) {
      alert("Tämä aika on jo varattu. Valitse toinen aika.");
      return;
    }

    axios
      .post("/wp-json/booking/v1/submit", form)
      .then((res) => {
        if (res.data?.success) {
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
        } else {
          alert("Varaus epäonnistui. Yritä uudelleen.");
        }
      })
      .catch(() => alert("Varaus epäonnistui. Yritä uudelleen."));
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

          <div className="form-group-service">
            <label>Valitse palvelut *</label>
            <ServiceSelector
              selectedServices={form.services}
              onToggle={handleServicesToggle}
            />
            {/* Hint before services are selected */}
            {form.services.length === 0 && (
              <p className="booking-hint">
                Valitse ensin palvelu nähdäksesi päivämäärät ja ajat.
              </p>
            )}
            {errors.general && (
              <p className="booking-error">{errors.general}</p>
            )}
          </div>

          {/* Date appears only after a service is selected */}
          {form.services.length > 0 && (
            <div className="form-group form-group-date">
              <label htmlFor="date">Valitse päivämäärä</label>
              <div className="date-wrapper">
                <input
                  id="date"
                  name="date"
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Time grid appears only after both a service and a date are chosen */}
          {form.services.length > 0 && form.date && (
            <>
              <div className="time-grid">
                {availableTimes.map((slot, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`time-slot ${
                      slot.isBooked || isPast(form.date, slot.time)
                        ? "booked"
                        : ""
                    } ${form.time === slot.time ? "selected" : ""}`}
                    disabled={slot.isBooked || isPast(form.date, slot.time)}
                    onClick={() => handleTimeSelect(slot)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
              {errors.time && <p className="booking-error">{errors.time}</p>}
            </>
          )}

          <button className="booking-button" type="submit">
            Vahvista varaus
          </button>
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
