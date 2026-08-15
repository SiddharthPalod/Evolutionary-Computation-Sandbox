import { useEffect, useRef, useState, useCallback } from 'react';
import { Engine } from '../domain/Engine';
import type { EngineConfig, AlgorithmMode } from '../domain/Engine';
import { CanvasRenderer } from '../infrastructure/CanvasRenderer';

export function useSimulation() {
    const engineRef = useRef<Engine | null>(null);
    const rendererRef = useRef<CanvasRenderer | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const requestRef = useRef<number>(0);

    const [isRunning, setIsRunning] = useState(true);
    const [algorithmMode, setAlgorithmMode] = useState<AlgorithmMode>('GENETIC');
    const [stats, setStats] = useState({
        algorithmMode: 'GENETIC' as AlgorithmMode,
        aliveCount: 0,
        oldestAge: 0,
        highestGeneration: 1,
        totalBirths: 0,
        totalDeaths: 0,
        averageEnergy: 100,
        averageHydration: 100,
        fruitCount: 0,
        totalFruitsEaten: 0
    });

    const [config, setConfig] = useState<EngineConfig>({
        algorithmMode: 'GENETIC',
        initialPopulation: 25,
        maxFood: 80,
        foodSpawnRate: 0.08,
        foodNutrition: 45,
        hungerDrain: 0.12,
        thirstDrain: 0.14,
        mutationRate: 0.08,
        speed: 2,
        width: 800,
        height: 600,
        pheromoneEvaporation: 0.010,
        pheromoneDepositRate: 0.95,
        sensorDistance: 42,
        sensorAngle: 0.50
    });

    useEffect(() => {
        engineRef.current = new Engine();
        setConfig(engineRef.current.config);
        setAlgorithmMode(engineRef.current.config.algorithmMode);
    }, []);

    const updateConfig = (newConfig: Partial<EngineConfig>) => {
        if (!engineRef.current) return;
        engineRef.current.updateConfig(newConfig);
        setConfig(engineRef.current.config);
        if (newConfig.algorithmMode) {
            setAlgorithmMode(newConfig.algorithmMode);
        }
    };

    const switchAlgorithmMode = (mode: AlgorithmMode) => {
        if (!engineRef.current) return;
        engineRef.current.setAlgorithmMode(mode);
        setAlgorithmMode(mode);
        setConfig(engineRef.current.config);
        syncStats();
        draw();
    };

    const draw = useCallback(() => {
        if (!engineRef.current || !rendererRef.current || !canvasRef.current) return;
        const state = engineRef.current.state;
        rendererRef.current.draw(state, canvasRef.current.width, canvasRef.current.height);
    }, []);

    const syncStats = useCallback(() => {
        if (!engineRef.current) return;
        const s = engineRef.current.state;
        setStats({
            algorithmMode: s.algorithmMode,
            aliveCount: s.aliveCount,
            oldestAge: s.oldestAge,
            highestGeneration: s.highestGeneration,
            totalBirths: s.totalBirths,
            totalDeaths: s.totalDeaths,
            averageEnergy: s.averageEnergy,
            averageHydration: s.averageHydration,
            fruitCount: s.foods.length,
            totalFruitsEaten: s.totalFruitsEaten
        });
    }, []);

    const loop = useCallback(() => {
        if (!engineRef.current) return;

        if (isRunning) {
            engineRef.current.step();
            syncStats();
        }

        draw();
        requestRef.current = requestAnimationFrame(loop);
    }, [isRunning, draw, syncStats]);

    useEffect(() => {
        if (canvasRef.current) {
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
        syncStats();
        draw();
    };

    const reset = () => {
        engineRef.current?.initialize();
        syncStats();
        draw();
    };

    const clearPheromones = () => {
        engineRef.current?.clearPheromones();
        draw();
    };

    const spawnFoodCluster = (count: number = 18) => {
        engineRef.current?.spawnFoodCluster(count);
        syncStats();
        draw();
    };

    const seedOrganisms = (count: number = 15) => {
        engineRef.current?.seedOrganisms(count);
        syncStats();
        draw();
    };

    return {
        canvasRef,
        stats,
        config,
        algorithmMode,
        isRunning,
        updateConfig,
        switchAlgorithmMode,
        toggleRun,
        step,
        reset,
        clearPheromones,
        spawnFoodCluster,
        seedOrganisms
    };
}
