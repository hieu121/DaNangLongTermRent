import { create } from "zustand";

const defaultAmenities = [
  "Wifi",
  "Máy lạnh",
  "Máy giặt",
  "Nước nóng",
  "Chỗ để xe",
  "Ban công"
];

const getSavedAmenities = () => {
  try {
    const raw = localStorage.getItem("adminAmenities");
    if (!raw) {
      return defaultAmenities;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return defaultAmenities;
    }
    const cleanAmenities = parsed.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim());
    return cleanAmenities.length ? cleanAmenities : defaultAmenities;
  } catch {
    return defaultAmenities;
  }
};

const persistAmenities = (amenities) => {
  localStorage.setItem("adminAmenities", JSON.stringify(amenities));
};

export const useAdminStore = create((set) => ({
  amenities: getSavedAmenities(),
  addAmenity: (name) =>
    set((state) => {
      const normalized = name.trim();
      if (!normalized) {
        return state;
      }
      const existed = state.amenities.some((item) => item.toLowerCase() === normalized.toLowerCase());
      if (existed) {
        return state;
      }
      const nextAmenities = [...state.amenities, normalized];
      persistAmenities(nextAmenities);
      return { amenities: nextAmenities };
    }),
  removeAmenity: (name) =>
    set((state) => {
      const filteredAmenities = state.amenities.filter((item) => item !== name);
      const nextAmenities = filteredAmenities.length ? filteredAmenities : defaultAmenities;
      persistAmenities(nextAmenities);
      return { amenities: nextAmenities };
    })
}));
