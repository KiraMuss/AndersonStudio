import React, { useState } from "react";
import "./BookingForm.css";

const serviceData = {
  "Kasvohoidot ja meikit": [
    {
      name: "Rentouttava kasvohoito",
      description:
        "Rentouttava ja kosteuttava kasvohoito. (Alkupuhdistuksen, kuorinnan, hieronnan, naamion, hoitovoiteen.)",
      price: 35,
    },
    {
      name: "Ultraäänipuhdistus",
      description:
        "Ultraäänipuhdistus on tehokas ja hellävarainen ihon syväpuhdistus ja kuorinta, joka samalla aktivoi ihon toimintoja.",
      price: 45,
    },
    {
      name: "Kasvohoito",
      description:
        "Alkupuhdistus, kuorinta ja yhdessä kosmetologin kanssa valittavat terapiat. Kesto max 60 min.",
      price: 40,
    },
    {
      name: "Täydellinen kasvohoito",
      description:
        "Alkupuhdistus, kuorinta ja yhdessä kosmetologin kanssa valittavat terapiat. Kesto max 90 min.",
      price: 60,
    },
    {
      name: "Juhlameikki",
      description: "Juhlameikki kuvauksia tai illanviettoa varten.",
      price: 45,
    },
    {
      name: "Päivämeikki",
      description: "Kevyt meikki päiväkäyttöön.",
      price: 30,
    },
  ],
  "Ripset/kulmat": [
    {
      name: "Ripsien värjäys",
      description: "Ripsien värjäys kestovärillä.",
      price: 10,
    },
    {
      name: "Kulmien värjäys ja muotoilu",
      description: "Kulmien muotoilu ja värjäys kestovärillä.",
      price: 15,
    },
    {
      name: "Ripsien ja kulmien värjäys ja muotoilu",
      description:
        "Ripsien ja kulmien värjäys kestovärillä sekä kulmien muotoilu.",
      price: 25,
    },
    {
      name: "Kulmien laminointi",
      description: "Kulmakarvojen laminointi, värjäys & muotoilu",
      price: 40,
    },
    {
      name: "Kulmien laminointi( organic)",
      description: `Organic Brow on täysin luonnonmukainen hoitotuote`,
      price: 35,
    },
  ],
  Hieronta: [
    {
      name: "Klassinen hieronta (30 min)",
      description:
        "Klassinen hieronta on lihaksia monipuolisesti muokkaavaa ja rentouttavaa hierontaa.",
      price: 30,
    },
    {
      name: "Klassinen hieronta (45 min)",
      description:
        "Klassinen hieronta on lihaksia monipuolisesti muokkaavaa ja rentouttavaa hierontaa.",
      price: 40,
    },
    {
      name: "Intialainen päähieronta",
      description:
        "Intialainen päähieronta. Hoito tehdään hiuspohjalle ja niskan alueelle.",
      price: 30,
    },
  ],
  Jalkahoidot: [
    {
      name: "Jalkahoito",
      description:
        "Kylpy, kovettumien poisto, kynsien leikkaus, kynsinauhojen ja ongelmakohtien hoito sekä voide. Sisältää kynsien lakkauksen.",
      price: 45,
    },
    {
      name: "Spa-jalkahoito",
      description:
        "Kylpy, kuorinta, kovettumien poisto, kynsien leikkaus, kynsinauhojen hoito, hieronta sekä voide. Sisältää kynsien lakkauksen.",
      price: 60,
    },
  ],
};

const ServiceSelector = ({ selectedServices, onToggle }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

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
