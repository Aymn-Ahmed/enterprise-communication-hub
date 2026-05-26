import React, { useEffect } from 'react';
import { FaTimes, FaDownload, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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

export interface MediaViewerData {
    type: 'image' | 'video' | 'location';
    url?: string;
    lat?: number;
    lng?: number;
    caption?: string;
    senderName?: string;
    timestamp?: string;
}

interface FullScreenMediaViewerProps {
    data: MediaViewerData | null;
    onClose: () => void;
}

const FullScreenMediaViewer: React.FC<FullScreenMediaViewerProps> = ({ data, onClose }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!data) return null;

    const handleOpenInGoogleMaps = () => {
        if (data.lat != null && data.lng != null) {
            window.open(`https://www.google.com/maps?q=${data.lat},${data.lng}`, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-300 overflow-hidden" dir="ltr">
            {/* Header Area */}
            <div className="flex items-center justify-between p-4 z-20 bg-gradient-to-b from-black/60 to-transparent absolute top-0 w-full">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
                    >
                        <FaTimes size={18} />
                    </button>
                    <div className="flex flex-col text-right" dir="rtl">
                        <span className="text-white font-bold text-sm tracking-wide">{data.senderName || 'وسائط'}</span>
                        <span className="text-white/60 text-[10px] tracking-tight">{data.timestamp || ''}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {data.url && (
                        <a 
                            href={data.url} 
                            download 
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                            title="تحميل"
                        >
                            <FaDownload size={16} />
                        </a>
                    )}
                    {data.type === 'location' && (
                        <button 
                            onClick={handleOpenInGoogleMaps}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95"
                        >
                            <FaExternalLinkAlt size={12} />
                            <span>فتح في الخرائط</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex items-center justify-center relative p-4 lg:p-10">
                {data.type === 'image' && data.url && (
                    <img 
                        src={data.url} 
                        alt="Full Preview" 
                        className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500"
                    />
                )}

                {data.type === 'video' && data.url && (
                    <div className="w-full max-w-4xl h-full flex items-center justify-center relative">
                        <video 
                            src={data.url} 
                            controls 
                            autoPlay
                            className="max-w-full max-h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg outline-none" 
                        />
                    </div>
                )}

                {data.type === 'location' && data.lat != null && data.lng != null && (
                    <div className="absolute inset-0 z-0 animate-in fade-in duration-700">
                        <MapContainer 
                            center={[data.lat, data.lng]} 
                            zoom={15} 
                            style={{ height: '100%', width: '100%' }}
                            whenReady={() => {
                                setTimeout(() => {
                                    // Map is already initialized and available via refs if needed, 
                                    // but invalidateSize often doesn't need the instance if called correctly.
                                }, 100);
                            }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[data.lat, data.lng]} icon={DefaultIcon} />
                        </MapContainer>

                        {/* Premium Floating Context Card */}
                        <div className="absolute bottom-12 right-1/2 translate-x-1/2 md:right-10 md:translate-x-0 w-[calc(100%-40px)] md:w-[400px] z-[1001] animate-in slide-in-from-bottom-10 flex flex-col gap-4" dir="rtl">
                            <div className="bg-white/90 dark:bg-[#111b21]/90 backdrop-blur-2xl p-6 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/20 dark:border-white/10 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                                
                                <div className="flex items-center gap-5 relative">
                                    <div className="w-16 h-16 rounded-[24px] bg-emerald-500 dark:bg-emerald-500/20 flex items-center justify-center text-white dark:text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/30">
                                        <FaMapMarkerAlt size={28} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xl font-black text-[#111b21] dark:text-[#e9edef] tracking-tight">موقع الدردشة</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                                                إحداثيات دقيقة
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col gap-3">
                                    <div className="flex items-center justify-between text-xs text-[#667781] dark:text-[#8696a0] font-mono bg-gray-50 dark:bg-black/20 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <span>Latitude: {data.lat.toFixed(6)}</span>
                                        <div className="w-px h-3 bg-gray-300 dark:bg-gray-700"></div>
                                        <span>Longitude: {data.lng.toFixed(6)}</span>
                                    </div>
                                    
                                    <button 
                                        onClick={handleOpenInGoogleMaps}
                                        className="w-full h-14 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-[20px] font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/30 active:scale-95 group/btn"
                                    >
                                        <i className="fa fa-directions text-white/80 group-hover/btn:rotate-12 transition-transform"></i>
                                        بدء التنقل عبر خرائط جوجل
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Caption (if any) */}
            {data.caption && (
                <div className="bg-black/40 backdrop-blur-md p-6 text-center z-20">
                    <p className="text-white text-sm max-w-2xl mx-auto leading-relaxed font-sans">{data.caption}</p>
                </div>
            )}
        </div>
    );
};

export default FullScreenMediaViewer;
