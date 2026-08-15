import { useSimulation } from './hooks/useSimulation';
import { SimulationCanvas } from './components/SimulationCanvas';
import { StatPanel } from './components/StatPanel';
import { Sidebar } from './components/Sidebar';

function App() {
    const {
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
    } = useSimulation();

    return (
        <div className="flex h-screen w-full bg-[#090d1a] overflow-hidden font-sans">
            <main className="flex-1 relative">
                <SimulationCanvas
                    canvasRef={canvasRef}
                    onResize={(width, height) => updateConfig({ width, height })}
                />
                <StatPanel
                    algorithmMode={algorithmMode}
                    aliveCount={stats.aliveCount}
                    averageEnergy={stats.averageEnergy}
                    averageHydration={stats.averageHydration}
                    oldestAge={stats.oldestAge}
                    highestGeneration={stats.highestGeneration}
                    totalBirths={stats.totalBirths}
                    totalDeaths={stats.totalDeaths}
                    totalFruitsEaten={stats.totalFruitsEaten}
                />
            </main>

            <Sidebar
                config={config}
                algorithmMode={algorithmMode}
                isRunning={isRunning}
                onSwitchAlgorithmMode={switchAlgorithmMode}
                onUpdateConfig={updateConfig}
                onToggleRun={toggleRun}
                onStep={step}
                onReset={reset}
                onClearPheromones={clearPheromones}
                onSpawnFood={() => spawnFoodCluster(18)}
                onSeedOrganisms={() => seedOrganisms(15)}
            />
        </div>
    );
}

export default App;
