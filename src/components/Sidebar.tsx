import type { EngineConfig, AlgorithmMode } from "../domain/Engine";
import { ControlSlider } from "./ControlSlider";

interface Props {
    config: EngineConfig;
    algorithmMode: AlgorithmMode;
    isRunning: boolean;
    onSwitchAlgorithmMode: (mode: AlgorithmMode) => void;
    onUpdateConfig: (config: Partial<EngineConfig>) => void;
    onToggleRun: () => void;
    onStep: () => void;
    onReset: () => void;
    onClearPheromones: () => void;
    onSpawnFood: () => void;
    onSeedOrganisms: () => void;
}

export function Sidebar({
    config,
    algorithmMode,
    isRunning,
    onSwitchAlgorithmMode,
    onUpdateConfig,
    onToggleRun,
    onStep,
    onReset,
    onClearPheromones,
    onSpawnFood,
    onSeedOrganisms
}: Props) {
    return (
        <aside className="w-[340px] h-full p-6 bg-[#0f172a] border-l border-[#1e293b] flex flex-col overflow-y-auto shadow-2xl z-20 select-none">
            {/* Header & Mode Switcher */}
            <div className="mb-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-2xl">{algorithmMode === 'ANT_COLONY' ? '🐜' : '🦠'}</span>
                    <h1 className="text-xl font-bold tracking-tight text-white">Ecosystem Engine</h1>
                </div>

                {/* Algorithm Toggle Tabs */}
                <div className="grid grid-cols-2 p-1 bg-[#1e293b] rounded-xl border border-[#334155]">
                    <button
                        onClick={() => onSwitchAlgorithmMode('GENETIC')}
                        className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            algorithmMode === 'GENETIC'
                                ? 'bg-[#0284c7] text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <span>🦠</span> Evolving Species
                    </button>
                    <button
                        onClick={() => onSwitchAlgorithmMode('ANT_COLONY')}
                        className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            algorithmMode === 'ANT_COLONY'
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <span>🐜</span> Scent Swarm
                    </button>
                </div>

                <p className="text-[#94a3b8] text-xs leading-relaxed mt-3">
                    {algorithmMode === 'ANT_COLONY'
                        ? 'Cooperative Swarm: When an organism discovers a food cluster, it emits glowing beacon pheromones to summon nearby peers to feast together!'
                        : 'Selfish Evolution: Organisms have no collective signaling. Each survives by evolving better individual steering genes across generations.'}
                </p>
            </div>

            {/* Ecosystem Controls */}
            <div className="flex-1 space-y-4">
                <ControlSlider
                    label="Hunger Drain Rate"
                    value={`${(config.hungerDrain * 100).toFixed(0)}/sec`}
                    min={0.05}
                    max={0.50}
                    step={0.01}
                    currentValue={config.hungerDrain}
                    onChange={(val) => onUpdateConfig({ hungerDrain: val })}
                />

                <ControlSlider
                    label="Thirst Drain Rate"
                    value={`${(config.thirstDrain * 100).toFixed(0)}/sec`}
                    min={0.05}
                    max={0.50}
                    step={0.01}
                    currentValue={config.thirstDrain}
                    onChange={(val) => onUpdateConfig({ thirstDrain: val })}
                />

                <ControlSlider
                    label="Fruit Nutrition"
                    value={`+${config.foodNutrition} HP`}
                    min={10}
                    max={80}
                    step={5}
                    currentValue={config.foodNutrition}
                    onChange={(val) => onUpdateConfig({ foodNutrition: val })}
                />

                {algorithmMode === 'ANT_COLONY' ? (
                    <>
                        <ControlSlider
                            label="Pheromone Signal Strength"
                            value={`${(config.pheromoneDepositRate * 100).toFixed(0)}%`}
                            min={0.3}
                            max={1.5}
                            step={0.05}
                            currentValue={config.pheromoneDepositRate}
                            onChange={(val) => onUpdateConfig({ pheromoneDepositRate: val })}
                        />

                        <ControlSlider
                            label="Pheromone Evaporation"
                            value={`${(config.pheromoneEvaporation * 1000).toFixed(0)}‰`}
                            min={0.002}
                            max={0.03}
                            step={0.002}
                            currentValue={config.pheromoneEvaporation}
                            onChange={(val) => onUpdateConfig({ pheromoneEvaporation: val })}
                        />

                        <ControlSlider
                            label="Swarm Antenna Sensor Range"
                            value={`${config.sensorDistance}px`}
                            min={15}
                            max={60}
                            step={2}
                            currentValue={config.sensorDistance}
                            onChange={(val) => onUpdateConfig({ sensorDistance: val })}
                        />
                    </>
                ) : (
                    <ControlSlider
                        label="Genome Mutation Rate"
                        value={`${(config.mutationRate * 100).toFixed(0)}%`}
                        min={0.01}
                        max={0.30}
                        step={0.01}
                        currentValue={config.mutationRate}
                        onChange={(val) => onUpdateConfig({ mutationRate: val })}
                    />
                )}

                <ControlSlider
                    label="Simulation Speed"
                    value={`${config.speed}x`}
                    min={1}
                    max={10}
                    step={1}
                    currentValue={config.speed}
                    onChange={(val) => onUpdateConfig({ speed: val })}
                />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 mt-5 pt-4 border-t border-[#1e293b]">
                <button
                    onClick={onToggleRun}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold transition-all duration-200 ease-in-out border text-sm shadow-lg ${
                        isRunning
                            ? "bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30"
                            : "bg-[#0284c7] text-white border-[#38bdf8] hover:bg-[#0369a1] shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                    }`}
                >
                    {isRunning ? "⏸ Pause Ecosystem" : "▶ Run Ecosystem"}
                </button>

                <div className="grid grid-cols-2 gap-2">
                    <button onClick={onStep} className="btn-secondary">Step 1 Tick</button>
                    <button onClick={onReset} className="btn-secondary">Reset World</button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                        onClick={onSpawnFood}
                        className="py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                        <span>🍎</span> +Fruit Cluster
                    </button>
                    {algorithmMode === 'ANT_COLONY' ? (
                        <button
                            onClick={onClearPheromones}
                            className="py-2 px-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                            <span>💨</span> Clear Trails
                        </button>
                    ) : (
                        <button
                            onClick={onSeedOrganisms}
                            className="py-2 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                            <span>🦠</span> +15 Organisms
                        </button>
                    )}
                </div>
            </div>

            {/* Visual Legend */}
            <div className="mt-5 pt-3.5 border-t border-[#1e293b] text-xs text-[#94a3b8] space-y-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-5 h-2 rounded bg-emerald-400"></div>
                    <span>Energy Bar (Upper)</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-5 h-2 rounded bg-sky-400"></div>
                    <span>Hydration Bar (Lower)</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#0284c7] border border-[#38bdf8]"></span>
                    <span>Infinite Water Oasis Pond</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]"></span>
                    <span>Clustered Fruit Berries</span>
                </div>
                {algorithmMode === 'ANT_COLONY' && (
                    <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
                        <span>Food Discovery Pheromone Beacon</span>
                    </div>
                )}
            </div>
        </aside>
    );
}
