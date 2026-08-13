import { useEffect } from 'react';
import type { RefObject } from 'react';

interface Props {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    onResize: (width: number, height: number) => void;
}

export function SimulationCanvas({ canvasRef, onResize }: Props) {
    useEffect(() => {
        const resize = () => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.parentElement?.getBoundingClientRect();
            if (rect) {
                // Handle high DPI displays
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = rect.width * dpr;
                canvasRef.current.height = rect.height * dpr;
                
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                }
                
                onResize(rect.width, rect.height);
            }
        };

        window.addEventListener('resize', resize);
        resize(); // Initial sizing

        return () => window.removeEventListener('resize', resize);
    }, [canvasRef, onResize]);

    return (
        <div className="relative w-full h-full p-4">
            <canvas 
                ref={canvasRef} 
                className="block w-full h-full bg-[radial-gradient(circle_at_center,_#182341,_#080c18)] border border-[#293556] rounded-xl shadow-lg"
            />
        </div>
    );
}
