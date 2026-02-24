export const toServiceCards = (quickServices = []) =>
  quickServices.slice(0, 3).map((service) => ({
    title: service.name || "Service",
    subtitle:
      service.description ||
      service.serviceType ||
      service.code ||
      "Quick service",
    image: service.image || "",
  }));
