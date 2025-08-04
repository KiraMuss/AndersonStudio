import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BookingForm.css";

const ServiceSelector = ({ selectedServices, onToggle }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [serviceData, setServiceData] = useState({});

  // Loading data from WordPress REST API
  useEffect(() => {
    axios
      .get(`${window.wpApiSettings.root}wp/v2/service?per_page=100`)
      .then((res) => {
        const grouped = {};

        res.data.forEach((item) => {
          const category = item.acf?.category || "Muut";
          if (!grouped[category]) grouped[category] = [];

          grouped[category].push({
            name: item.title.rendered,
            description: item.acf?.description || "",
            price: item.acf?.price || 0,
          });
        });

        setServiceData(grouped);
      })
      .catch((err) => {
        console.error("Virhe palveluiden hakemisessa:", err);
      });
  }, []);

  const handleCategoryToggle = (category) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  const handleServiceToggle = (serviceName) => {
    if (selectedServices.includes(serviceName)) {
      onToggle(selectedServices.filter((s) => s !== serviceName));
    } else {
      onToggle([...selectedServices, serviceName]);
    }
  };

  return (
    <div className="service-selector">
      {Object.entries(serviceData).map(([category, services]) => (
        <div key={category} className="service-category">
          <button
            type="button"
            className="category-button"
            onClick={() => handleCategoryToggle(category)}
          >
            <span>{category}</span>
            <span className="arrow">
              {expandedCategory === category ? "▾" : "▸"}
            </span>
          </button>

          {expandedCategory === category && (
            <div className="sub-services">
              {services.map((service) => (
                <label key={service.name} className="service-option">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.name)}
                    onChange={() => handleServiceToggle(service.name)}
                  />
                  <div className="service-content">
                    <div className="service-name">{service.name}</div>
                    <div className="service-description">
                      {service.description}
                    </div>
                  </div>
                  <div className="service-price">{service.price}€</div>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ServiceSelector;
