import React, { useState } from "react";
import "./BookingForm.css";

// Service groups with sub-services
const serviceGroups = {
  "Kasvohoidot ja meikit": [
    "Juhlameikki",
    "Päivämeikki",
    "Ultraäänipuhdistus",
    "Kasvohoito",
    "Täydellinen kasvohoito",
    "Rentouttava kasvohoito",
  ],
  "Ripset/kulmat": [
    "Ripsien värjäys",
    "Kulmien värjäys ja muotoilu",
    "Ripsien ja kulmien värjäys ja muotoilu",
    "Kulmien laminointi",
    "Kulmien laminointi( organic)",
  ],
  Hieronta: [
    "Klassinen hieronta (30 min)",
    "Klassinen hieronta (45 min)",
    "Intialainen päähieronta",
  ],
  Jalkahoidot: ["Jalkahoito", "Spa-jalkahoito"],
};

// Time range validation: 08:00 – 20:15
const isTimeUnavailable = (dateObj) => {
  if (!(dateObj instanceof Date)) return true;
  const hour = dateObj.getHours();
  const minute = dateObj.getMinutes();
  if (hour < 8) return true;
  if (hour > 20 || (hour === 20 && minute > 15)) return true;
  return false;
};

const BookingForm = () => {
  const [formData, setFormData] = useState({
    etunimi: "",
    sukunimi: "",
    sahkoposti: "",
    puhelin: "",
    palveluRyhmä: "",
    palvelu: "",
    aika: "",
    lisatiedot: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset palvelu when changing palveluRyhmä
    if (name === "palveluRyhmä") {
      setFormData((prev) => ({ ...prev, [name]: value, palvelu: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.etunimi.trim()) errs.etunimi = "Täytä etunimi";
    if (!formData.sukunimi.trim()) errs.sukunimi = "Täytä sukunimi";
    if (!formData.sahkoposti.includes("@"))
      errs.sahkoposti = "Virheellinen sähköposti";
    if (!/^(?:\+358|0)\d{7,14}$/.test(formData.puhelin))
      errs.puhelin = "Virheellinen puhelinnumero";
    if (!formData.palveluRyhmä) errs.palveluRyhmä = "Valitse palveluryhmä";
    if (!formData.palvelu) errs.palvelu = "Valitse palvelu";
    if (!formData.aika) {
      errs.aika = "Valitse päivä ja aika";
    } else {
      const dt = new Date(formData.aika);
      if (isNaN(dt)) {
        errs.aika = "Virheellinen päivämäärä";
      } else if (isTimeUnavailable(dt)) {
        errs.aika = "Aukioloajat: 08:00 – 20:15";
      }
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    console.log("Form data:", formData);
    setSubmitMessage("🧪 (DEMO) Varauksen tiedot tulostettu konsoliin.");

    // Сброс формы
    setFormData({
      etunimi: "",
      sukunimi: "",
      sahkoposti: "",
      puhelin: "",
      palveluRyhmä: "",
      palvelu: "",
      aika: "",
      lisatiedot: "",
    });
  };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     const errs = validate();
  //     setErrors(errs);
  //     if (Object.keys(errs).length) return;

  //     setIsSubmitting(true);
  //     setSubmitMessage("");
  //     const backendUrl = "https://anderson-studio.org/api/booking";

  //     try {
  //       await axios.post(backendUrl, formData);
  //       setSubmitMessage("Kiitos! Varauksesi on lähetetty onnistuneesti.");
  //       setFormData({
  //         etunimi: "",
  //         sukunimi: "",
  //         sahkoposti: "",
  //         puhelin: "",
  //         palveluRyhmä: "",
  //         palvelu: "",
  //         aika: "",
  //         lisatiedot: "",
  //       });
  //     } catch (error) {
  //       console.error(error);
  //       setSubmitMessage("Tapahtui virhe. Yritä uudelleen.");
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   };

  return (
    <div className="booking-form-container">
      <form onSubmit={handleSubmit}>
        <h2>Varauslomake</h2>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="etunimi">Etunimi *</label>
            <input
              id="etunimi"
              name="etunimi"
              value={formData.etunimi}
              onChange={handleChange}
              required
            />
            {errors.etunimi && <span className="error">{errors.etunimi}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="sukunimi">Sukunimi *</label>
            <input
              id="sukunimi"
              name="sukunimi"
              value={formData.sukunimi}
              onChange={handleChange}
              required
            />
            {errors.sukunimi && (
              <span className="error">{errors.sukunimi}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="sahkoposti">Sähköposti *</label>
          <input
            type="email"
            id="sahkoposti"
            name="sahkoposti"
            value={formData.sahkoposti}
            onChange={handleChange}
            required
          />
          {errors.sahkoposti && (
            <span className="error">{errors.sahkoposti}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="puhelin">Puhelinnumero *</label>
          <input
            type="tel"
            id="puhelin"
            name="puhelin"
            value={formData.puhelin}
            onChange={handleChange}
            required
          />
          {errors.puhelin && <span className="error">{errors.puhelin}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="palveluRyhmä">Palveluryhmä *</label>
          <select
            id="palveluRyhmä"
            name="palveluRyhmä"
            value={formData.palveluRyhmä}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              -- Valitse ryhmä --
            </option>
            {Object.keys(serviceGroups).map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          {errors.palveluRyhmä && (
            <span className="error">{errors.palveluRyhmä}</span>
          )}
        </div>

        {formData.palveluRyhmä && (
          <div className="form-group">
            <label htmlFor="palvelu">Palvelu *</label>
            <select
              id="palvelu"
              name="palvelu"
              value={formData.palvelu}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                -- Valitse palvelu --
              </option>
              {serviceGroups[formData.palveluRyhmä].map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            {errors.palvelu && <span className="error">{errors.palvelu}</span>}
          </div>
        )}

        <div className="form-group">
          <label>Päivämäärä ja aika *</label>
          <input
            type="datetime-local"
            name="aika"
            value={formData.aika}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
          <small>Aukioloajat: 08:00 – 20:15</small>
          {errors.aika && <span className="error">{errors.aika}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lisatiedot">Lisätiedot</label>
          <textarea
            id="lisatiedot"
            name="lisatiedot"
            value={formData.lisatiedot}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? "Lähetetään..." : "Lähetä varaus"}
        </button>

        {submitMessage && (
          <p
            className={`submit-message ${
              submitMessage.includes("virhe") ? "error" : "success"
            }`}
          >
            {submitMessage}
          </p>
        )}
      </form>
    </div>
  );
};

export default BookingForm;
