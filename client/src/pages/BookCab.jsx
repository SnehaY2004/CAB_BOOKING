import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import LocationAutocomplete from "../components/LocationAutocomplete";
import DateTimePicker from "../components/DateTimePicker";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function BookCab() {
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [cabs, setCabs] = useState([]);
  const [cabsLoading, setCabsLoading] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(null);
  const [selectedCabId, setSelectedCabId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setDistanceKm(null);
    setCabs([]);
    setSelectedCabId(null);
  }, [pickup?.lat, pickup?.lon, drop?.lat, drop?.lon]);

  const handleSeeDetails = () => {
    if (!pickup?.lat || !drop?.lat) return;
    setError("");
    setDistanceLoading(true);
    const params = new URLSearchParams({
      pickupLat: pickup.lat,
      pickupLon: pickup.lon,
      dropLat: drop.lat,
      dropLon: drop.lon,
    });
    fetch(`${API_BASE}/api/locations/distance?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.distanceKm != null) setDistanceKm(data.distanceKm);
        else setError(data.message || "Could not get distance");
      })
      .catch(() =>
        setError(
          "Cannot reach server. Is the backend running? Set VITE_API_URL in client .env to your server URL (e.g. https://cab-booking-xi.vercel.app).",
        ),
      )
      .finally(() => setDistanceLoading(false));
  };

  useEffect(() => {
    if (distanceKm == null || distanceKm <= 0) {
      setCabs([]);
      return;
    }
    setCabsLoading(true);
    api("/api/cabs")
      .then(setCabs)
      .catch((err) => setError(err.message || "Failed to load cabs"))
      .finally(() => setCabsLoading(false));
  }, [distanceKm]);

  const handleBook = async () => {
    if (
      !selectedCabId ||
      !pickup?.display_name ||
      !drop?.display_name ||
      distanceKm == null ||
      !scheduledAt
    ) {
      setError("Select a cab, set date/time and ensure locations are set.");
      return;
    }
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          cabId: selectedCabId,
          pickup: pickup.display_name,
          drop: drop.display_name,
          distanceKm,
          scheduledAt: scheduledAt.toISOString(),
        }),
      });
      setSuccess("Booking confirmed!");
      setSelectedCabId(null);
      setTimeout(() => navigate("/bookings"), 1500);
    } catch (err) {
      setError(err.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full">
      {/* Left: Map / hero area – uses full desktop space */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] flex-col bg-uber-black relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-neutral-900 via-uber-black to-neutral-950" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #00C853 0%, transparent 50%), radial-gradient(circle at 80% 80%, #00C853 0%, transparent 40%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between flex-1 p-10 xl:p-14">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white tracking-tight">
              Where to?
            </h1>
            <p className="mt-2 text-neutral-400 text-lg max-w-md">
              Enter your pickup and drop to see distance and choose your ride.
            </p>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-uber-green flex items-center justify-center text-uber-black font-bold">
                ✓
              </div>
              <span className="text-sm font-medium">Instant fare</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-uber-green flex items-center justify-center text-uber-black font-bold">
                ✓
              </div>
              <span className="text-sm font-medium">Multiple cab types</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Booking panel – scrollable */}
      <div className="flex-1 min-w-0 flex flex-col bg-neutral-50 lg:bg-white lg:border-l border-neutral-200">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-6 py-8 lg:py-10">
            <h2 className="text-2xl font-bold text-neutral-900 lg:hidden mb-2">
              Book a ride
            </h2>
            <p className="text-neutral-500 mb-6 lg:mb-8">
              Pick your locations and ride type.
            </p>

            {/* Location inputs */}
            <div className="space-y-4 mb-6">
              <LocationAutocomplete
                label="Pickup"
                placeholder="Enter pickup location"
                value={pickup}
                onChange={setPickup}
              />
              <LocationAutocomplete
                label="Drop"
                placeholder="Where to?"
                value={drop}
                onChange={setDrop}
              />
            </div>

            <button
              type="button"
              onClick={handleSeeDetails}
              disabled={!pickup?.lat || !drop?.lat || distanceLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-uber-black text-white font-semibold text-base hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {distanceLoading ? "Calculating..." : "Get fare"}
            </button>

            {distanceKm != null && !distanceLoading && (
              <p className="mt-4 text-neutral-700 font-semibold">
                Distance: {distanceKm} km
              </p>
            )}

            {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
            {success && (
              <p className="mt-4 text-uber-green font-semibold text-sm">
                {success}
              </p>
            )}

            {/* Cab selection */}
            {distanceKm != null && distanceKm > 0 && (
              <>
                <h3 className="text-lg font-bold text-neutral-900 mt-8 mb-4">
                  Choose a ride
                </h3>
                {cabsLoading ? (
                  <p className="text-neutral-500">Loading rides...</p>
                ) : cabs.length === 0 ? (
                  <div className="p-4 rounded-xl bg-neutral-100 text-neutral-600 text-sm">
                    No cabs available. Run{" "}
                    <code className="bg-neutral-200 px-1 rounded">
                      npm run seed
                    </code>{" "}
                    in the server folder.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {cabs.map((cab) => {
                      const fare = Math.round(cab.pricePerKm * distanceKm);
                      const isSelected = selectedCabId === cab._id;
                      const imgUrl =
                        cab.imageUrl ||
                        "https://mobile-content.uber.com/launch-experience/top_bar_rides_3d.png";
                      return (
                        <button
                          key={cab._id}
                          type="button"
                          onClick={() => setSelectedCabId(cab._id)}
                          className={`w-full text-left rounded-xl overflow-hidden border-2 transition-all ${
                            isSelected
                              ? "border-uber-green ring-2 ring-uber-green/30 bg-green-50/50"
                              : "border-neutral-200 hover:border-neutral-300 bg-white"
                          }`}
                        >
                          <div className="h-20 sm:h-24 bg-neutral-200 relative">
                            <img
                              src={imgUrl}
                              alt={cab.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                          <div className="p-3">
                            <p
                              className="font-semibold text-neutral-900 text-sm truncate"
                              title={`${cab.type} – ${cab.name}`}
                            >
                              {cab.type} – {cab.name}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              ₹{cab.pricePerKm}/km · {cab.capacity} seats
                            </p>
                            <p className="text-base font-bold text-uber-green mt-1.5">
                              ₹{fare}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {cabs.length > 0 && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Date & time for pickup
                      </label>
                      <DateTimePicker
                        id="pickup-datetime"
                        value={scheduledAt}
                        onChange={setScheduledAt}
                        minDate={minDate}
                        placeholder="Choose date and time"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleBook}
                      disabled={!selectedCabId || !scheduledAt || submitting}
                      className="w-full py-3.5 px-4 rounded-xl bg-uber-green text-white font-semibold text-base hover:bg-uber-green-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {submitting ? "Booking..." : "Confirm booking"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
