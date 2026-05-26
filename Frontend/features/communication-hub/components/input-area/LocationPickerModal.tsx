import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in leaflet with bundlers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerModalProps {
    isOpen: boolean;
    initialLocation: { lat: number; lng: number } | null;
    onClose: () => void;
    onConfirm: (location: { lat: number; lng: number }) => void;
}

const defaultCenter = { lat: 24.7136, lng: 46.6753 }; // Riyadh center by default

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, initialLocation, onClose, onConfirm }) => {
    const [tempLocation, setTempLocation] = useState<{ lat: number; lng: number }>(initialLocation || defaultCenter);
    const markerRef = useRef<L.Marker>(null);

    // Only update tempLocation when initialLocation changes and it's defined
    useEffect(() => {
        if (initialLocation) {
            setTempLocation(initialLocation);
        } else {
            setTempLocation(defaultCenter);
        }
    }, [initialLocation, isOpen]);

    if (!isOpen) return null;

    const MapEventHandler = () => {
        useMapEvents({
            click(e) {
                setTempLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
            }
        });
        return null;
    };

    return (
        <div className="absolute inset-0 z-[10000] flex flex-col bg-white dark:bg-[#0b141a] animate-in slide-in-from-bottom duration-400" dir="rtl">
            {/* Premium Immersive Header */}
            <div className="h-[64px] px-6 bg-[#00a884] dark:bg-[#202c33] flex items-center justify-between text-white shadow-lg z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-black/10 flex items-center justify-center transition-all active:scale-90"
                        title="إغلاق"
                    >
                        ✕
                    </button>
                    <h3 className="font-bold text-lg select-none">معاينة وإرسال الموقع</h3>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => onConfirm(tempLocation)}
                        className="px-6 py-2 rounded-full bg-white text-[#00a884] dark:bg-[#00a884] dark:text-white font-black text-sm shadow-xl hover:brightness-105 transition-all active:scale-95"
                    >
                        إرسال الموقع الحالي
                    </button>
                </div>
            </div>
            
            {/* Full-size Map Area */}
            <div className="flex-1 w-full relative bg-[#e5e5f7] z-10">
                <MapContainer 
                    center={tempLocation} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%', zIndex: 10 }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapEventHandler />
                    <Marker 
                        position={tempLocation} 
                        draggable={true}
                        ref={markerRef}
                        eventHandlers={{
                            dragend() {
                                const marker = markerRef.current;
                                if (marker != null) {
                                    const position = marker.getLatLng();
                                    setTempLocation({ lat: position.lat, lng: position.lng });
                                }
                            }
                        }}
                    />
                </MapContainer>

                {/* Info Card - WhatsApp Style Floating */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-sm px-4">
                    <div className="bg-white/95 dark:bg-[#202c33]/95 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/10 flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 text-[#00a884] font-black text-base">
                            <i className="fa fa-map-marker-alt animate-bounce"></i>
                            موقعك المختار حالياً
                        </div>
                        <div className="text-xs text-gray-500 dark:text-[#8696a0] font-mono bg-gray-100 dark:bg-black/20 px-4 py-2 rounded-full border border-gray-200 dark:border-white/5">
                            {tempLocation.lat.toFixed(6)}, {tempLocation.lng.toFixed(6)}
                        </div>
                        <p className="text-[11px] text-[#667781] dark:text-[#8696a0] text-center px-2 leading-relaxed opacity-80">
                            قم بسحب الدبوس الأزرق أو اضغط في أي مكان على الخريطة لتحديث إحداثيات الموقع بدقة تامة
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPickerModal;
