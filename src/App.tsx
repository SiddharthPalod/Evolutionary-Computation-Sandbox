import { useSimulation } from './hooks/useSimulation';
import { SimulationCanvas } from './components/SimulationCanvas';
import { StatPanel } from './components/StatPanel';
import { Sidebar } from './components/Sidebar';

function App() {
    const { 
        canvasRef, 
        stats, 
        config, 
        isRunning, 
        updateConfig, 
        toggleRun, 
        step, 
        reset 
    } = useSimulation();

    return (
        <div className="flex h-screen w-full bg-[#0b1020] overflow-hidden font-sans">
            <main className="flex-1 relative">
                <SimulationCanvas 
                    canvasRef={canvasRef} 
                    onResize={(width, height) => updateConfig({ width, height })}
                />
                <StatPanel 
                    generation={stats.generation}
                    bestFitness={stats.bestFitness}
                    averageFitness={stats.averageFitness}
                />
            </main>
            
            <Sidebar 
                config={config}
                isRunning={isRunning}
                onUpdateConfig={updateConfig}
                onToggleRun={toggleRun}
                onStep={step}
                onReset={reset}
                onRandomize={() => {
                    reset();
                }}
            />
        </div>
    );
}

export default App;
