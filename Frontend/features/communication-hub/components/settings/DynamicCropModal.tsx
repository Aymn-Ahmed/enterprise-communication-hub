import React, { useState, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { FaTimes, FaCheck, FaPlus, FaMinus, FaSearchPlus, FaCropAlt } from 'react-icons/fa';

interface DynamicCropModalProps {
    imageSrc: string;
    cropType: 'circle' | 'rect';
    aspectRatio?: number; // width / height
    onConfirm: (croppedImageBlob: Blob) => void;
    onCancel: () => void;
    title?: string;
}

const DynamicCropModal: React.FC<DynamicCropModalProps> = ({
    imageSrc,
    cropType,
    aspectRatio = 1,
    onConfirm,
    onCancel,
    title = "تعديل الصورة"
}) => {
    const [scale, setScale] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    // Position of the image
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Dimensions for the crop area based on type
    let CROP_WIDTH = 300;
    let CROP_HEIGHT = 300;

    if (cropType === 'rect') {
        CROP_WIDTH = 340;
        CROP_HEIGHT = 340 / (aspectRatio || 2.5); // Default to a wide cover ratio if 1
        if (aspectRatio === 1) { // If it's a square rect
            CROP_WIDTH = 300;
            CROP_HEIGHT = 300;
        }
    }

    const handleConfirm = async () => {
        if (!imageRef.current) return;
        setIsProcessing(true);

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set natural output size (High Quality)
            canvas.width = CROP_WIDTH * 2;
            canvas.height = CROP_HEIGHT * 2;

            const img = imageRef.current;

            // Current visual dimensions of the image on screen
            const displayWidth = img.clientWidth * scale;
            const displayHeight = img.clientHeight * scale;

            // Ratios to map visual pixels to natural ones
            const ratioX = img.naturalWidth / img.clientWidth;
            const ratioY = img.naturalHeight / img.clientHeight;

            // Calculate ratios for the crop part
            const cropLeftInDisplay = (displayWidth / 2) - x.get() - (CROP_WIDTH / 2);
            const cropTopInDisplay = (displayHeight / 2) - y.get() - (CROP_HEIGHT / 2);

            const sourceX = cropLeftInDisplay * (ratioX / scale);
            const sourceY = cropTopInDisplay * (ratioY / scale);
            const sourceWidth = CROP_WIDTH * (ratioX / scale);
            const sourceHeight = CROP_HEIGHT * (ratioY / scale);

            // Draw onto canvas
            ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, canvas.width, canvas.height
            );

            canvas.toBlob((blob) => {
                if (blob) onConfirm(blob);
                setIsProcessing(false);
            }, 'image/jpeg', 0.9);

        } catch (error) {
            console.error('Crop extraction failed:', error);
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#090e11]/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1f2c33] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300" dir="rtl">

                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <FaCropAlt className="text-blue-500" />
                        <h3 className="text-[15px] font-bold text-[#111b21] dark:text-[#e9edef]">{title}</h3>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a3942] rounded-full transition-colors text-gray-500 dark:text-[#aebac1]">
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Main Preview Area */}
                <div
                    className="relative h-[480px] bg-[#0b141a] flex items-center justify-center overflow-hidden touch-none"
                    ref={containerRef}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.img
                            ref={imageRef}
                            src={imageSrc}
                            style={{ x, y, scale }}
                            drag
                            dragConstraints={false}
                            dragElastic={0.05}
                            className="max-w-none cursor-move"
                            alt="Crop target"
                            onLoad={() => {
                                x.set(0);
                                y.set(0);
                            }}
                        />
                    </div>

                    {/* Mask Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" />

                        <div
                            className={`relative border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] ${cropType === 'circle' ? 'rounded-full' : 'rounded-none'}`}
                            style={{ width: CROP_WIDTH, height: CROP_HEIGHT }}
                        >
                            {/* Visual corners for rect */}
                            {cropType === 'rect' && (
                                <>
                                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500" />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-500" />
                                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-500" />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500" />
                                </>
                            )}
                            {/* Visual guide for circle */}
                            {cropType === 'circle' && (
                                <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-white dark:bg-[#1f2c33] space-y-6">
                    <div className="flex items-center gap-6 px-4">
                        <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="text-gray-400 hover:text-blue-500">
                            <FaMinus size={14} />
                        </button>
                        <input
                            type="range"
                            min="0.2"
                            max="5"
                            step="0.01"
                            value={scale}
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-gray-200 dark:bg-[#2a3942] rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <button onClick={() => setScale(s => Math.min(5, s + 0.1))} className="text-gray-400 hover:text-blue-500">
                            <FaPlus size={14} />
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={onCancel} className="flex-1 py-3 px-6 rounded-xl text-gray-500 font-bold text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                            إلغاء
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isProcessing}
                            className="flex-1 py-3 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FaCheck />
                                    <span>تأكيد وحفظ</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicCropModal;
