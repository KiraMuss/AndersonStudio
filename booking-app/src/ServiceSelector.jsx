import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BookingForm.css";

const ServiceSelector = ({ selectedServices, onToggle }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [serviceData, setServiceData] = useState({});

  useEffect(() => {
    axios
      .get(`${window.wpApiSettings.root}wp/v2/service?per_page=100`)
      .then((res) => {
        const grouped = {};

        res.data.forEach((item) => {
          const group = item.acf?.group;
          const services = item.acf?.items;

          if (!group || !Array.isArray(services)) return;

          if (!grouped[group]) grouped[group] = [];

          services.forEach((service) => {
            if (!service.name) return;

            grouped[group].push({
              name: service.name,
              description: service.description || "",
              price: service.price || 0,
            });
          });
        });

        setServiceData(grouped);
      })
      .catch((err) => {
        console.error("Error loading service:", err);
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
    <div className="category-buttons-wrapper">
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
