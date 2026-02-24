import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getHotelsForListing } from "../services/api/hotels";
import { getOrganizations } from "../services/api/organizations";
import { useAuth } from "./AuthContext";

type HotelValue = {
  organizations: any[];
  hotels: any[];
  organizationId: string | null;
  hotelId: string | null;
  setOrganizationId: (id?: string | null) => void;
  setHotelId: (id?: string | null) => void;
  loadingOrgs: boolean;
  loadingHotels: boolean;
  refreshHotels: () => Promise<void>;
  isAdmin: boolean;
  isOwner: boolean;
  isManager: boolean;
  isSuperAdmin: boolean;
  canCreateOrganization: boolean;
  showOrganizationPicker: boolean;
};

const HotelContext = createContext<HotelValue | null>(null);

const toId = (value: unknown) => (value ? String(value) : "");
const pickOrgId = (item: any) => toId(item?.organizationId || item?._id);
const pickHotelId = (item: any) => toId(item?.hotelId || item?._id);
const arrayFrom = (...candidates: any[]) => candidates.find((item) => Array.isArray(item)) || [];

const extractOrganizations = (payload: any) =>
  arrayFrom(
    payload?.data?.data?.organizations,
    payload?.data?.organizations,
    payload?.organizations,
    payload?.data,
    payload,
  );

const extractHotels = (payload: any) =>
  arrayFrom(
    payload?.data?.data?.hotels,
    payload?.data?.hotels,
    payload?.hotels,
    payload?.data,
    payload,
  );

export function HotelProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [organizationId, setOrganizationIdState] = useState<string | null>(null);
  const [hotelId, setHotelIdState] = useState<string | null>(null);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const hotelsCacheRef = useRef<Record<string, any[]>>({});
  const role = String(user?.role || "").toLowerCase();
  const userOrganizationId = toId(user?.organizationId) || null;
  const userHotelId = toId(user?.hotelId) || null;

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoadingOrgs(true);

    getOrganizations(token)
      .then((response) => {
        if (!active) return;
        const list = extractOrganizations(response);
        setOrganizations(list);
        if (organizationId) return;
        const preferred = userOrganizationId && list.find((item: any) => pickOrgId(item) === userOrganizationId);
        setOrganizationIdState(preferred ? pickOrgId(preferred) : pickOrgId(list[0]) || userOrganizationId || null);
      })
      .catch(() => active && setOrganizations([]))
      .finally(() => active && setLoadingOrgs(false));

    return () => {
      active = false;
    };
  }, [token, userOrganizationId, organizationId]);

  useEffect(() => {
    if (!token) return;
    let active = true;

    const scopedOrganizationId = organizationId || userOrganizationId || null;
    const cacheKey = scopedOrganizationId || "all";
    const cached = hotelsCacheRef.current[cacheKey];
    const applyHotels = (list: any[]) => {
      if (!active) return;
      setHotels(list);
      const selected = hotelId || userHotelId;
      const hasSelected = selected && list.some((item: any) => pickHotelId(item) === selected);
      if (!hasSelected) setHotelIdState(pickHotelId(list[0]) || userHotelId || null);
    };

    if (Array.isArray(cached) && cached.length) {
      applyHotels(cached);
      return () => {
        active = false;
      };
    }

    setLoadingHotels(true);
    getHotelsForListing(token, scopedOrganizationId, { page: 1, limit: 20 })
      .then((response) => {
        const list = extractHotels(response);
        hotelsCacheRef.current[cacheKey] = list;
        applyHotels(list);
      })
      .catch(() => {
        if (!active) return;
        setHotels([]);
        setHotelIdState(null);
      })
      .finally(() => active && setLoadingHotels(false));

    return () => {
      active = false;
    };
  }, [token, organizationId, userOrganizationId, userHotelId]);

  const refreshHotels = useCallback(async () => {
    if (!token) return;
    const scopedOrganizationId = organizationId || userOrganizationId || null;
    const cacheKey = scopedOrganizationId || "all";
    setLoadingHotels(true);
    try {
      const response = await getHotelsForListing(token, scopedOrganizationId, { page: 1, limit: 20 });
      const list = extractHotels(response);
      hotelsCacheRef.current[cacheKey] = list;
      setHotels(list);
      const selected = hotelId || userHotelId;
      const hasSelected = selected && list.some((item: any) => pickHotelId(item) === selected);
      if (!hasSelected) setHotelIdState(pickHotelId(list[0]) || userHotelId || null);
    } catch {
      setHotels([]);
      setHotelIdState(null);
    } finally {
      setLoadingHotels(false);
    }
  }, [token, organizationId, userOrganizationId, hotelId, userHotelId]);

  const isSuperAdmin = role.includes("super");
  const isAdmin = role.includes("admin") || isSuperAdmin;
  const isOwner = role.includes("owner");
  const isManager = role.includes("manager");

  const value = useMemo(
    () => ({
      organizations,
      hotels,
      organizationId,
      hotelId,
      setOrganizationId: (id?: string | null) => {
        setOrganizationIdState(id ? String(id) : null);
        setHotelIdState(null);
      },
      setHotelId: (id?: string | null) => setHotelIdState(id ? String(id) : null),
      loadingOrgs,
      loadingHotels,
      refreshHotels,
      isAdmin,
      isOwner,
      isManager,
      isSuperAdmin,
      canCreateOrganization: isAdmin || isSuperAdmin,
      showOrganizationPicker: !isManager,
    }),
    [organizations, hotels, organizationId, hotelId, loadingOrgs, loadingHotels, refreshHotels, isAdmin, isOwner, isManager, isSuperAdmin],
  );

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
}

export const useHotel = () => {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error("useHotel must be used within HotelProvider");
  return ctx;
};
