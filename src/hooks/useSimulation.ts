import { useEffect, useRef, useState, useCallback } from 'react';
import { Engine } from '../domain/Engine';
import type { EngineConfig } from '../domain/Engine';
import { CanvasRenderer } from '../infrastructure/CanvasRenderer';

export function useSimulation() {
    const engineRef = useRef<Engine | null>(null);
    const rendererRef = useRef<CanvasRenderer | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const requestRef = useRef<number>(0);

    const [isRunning, setIsRunning] = useState(false);
    const [stats, setStats] = useState({ generation: 0, bestFitness: 0, averageFitness: 0 });
    const [config, setConfig] = useState<EngineConfig>({
        populationSize: 100,
        mutationRate: 0.03,
        crossoverRate: 0.70,
        selectionPressure: 4,
        speed: 5,
        width: 0,
        height: 0
    });

    useEffect(() => {
        engineRef.current = new Engine();
        setConfig(engineRef.current.config);
    }, []);

    const updateConfig = (newConfig: Partial<EngineConfig>) => {
        if (!engineRef.current) return;
        engineRef.current.updateConfig(newConfig);
        setConfig(engineRef.current.config);
    };

    const draw = useCallback(() => {
        if (!engineRef.current || !rendererRef.current || !canvasRef.current) return;
        const state = engineRef.current.state;
        rendererRef.current.draw(state, canvasRef.current.width, canvasRef.current.height);
    }, []);

    const loop = useCallback(() => {
        if (!engineRef.current) return;

        if (isRunning) {
            engineRef.current.step();
            
            // Sync stats for React UI (throttle a bit if needed, but for now every frame is okay, or we could just sync generation and fitness)
            setStats({
                generation: engineRef.current.state.generation,
                bestFitness: engineRef.current.state.bestFitness,
                averageFitness: engineRef.current.state.averageFitness
            });
        }
        
        draw();
        requestRef.current = requestAnimationFrame(loop);
    }, [isRunning, draw]);

    useEffect(() => {
        if (engineRef.current && canvasRef.current) {
            rendererRef.current = new CanvasRenderer(canvasRef.current.getContext('2d')!);
        }
    }, [canvasRef]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, [loop]);

    const toggleRun = () => setIsRunning(!isRunning);
    
    const step = () => {
        engineRef.current?.step();
        draw();
        if (engineRef.current) {
            setStats({
                generation: engineRef.current.state.generation,
                bestFitness: engineRef.current.state.bestFitness,
                averageFitness: engineRef.current.state.averageFitness
            });
        }
    };

    const reset = () => {
        setIsRunning(false);
        engineRef.current?.initialize();
        draw();
        if (engineRef.current) {
            setStats({
                generation: engineRef.current.state.generation,
                bestFitness: engineRef.current.state.bestFitness,
                averageFitness: engineRef.current.state.averageFitness
            });
        }
    };

    return {
        canvasRef,
        stats,
        config,
        isRunning,
        updateConfig,
        toggleRun,
        step,
        reset
    };
}
