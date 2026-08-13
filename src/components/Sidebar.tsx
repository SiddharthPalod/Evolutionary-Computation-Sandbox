import type { EngineConfig } from "../domain/Engine";
import { ControlSlider } from "./ControlSlider";

interface Props {
    config: EngineConfig;
    isRunning: boolean;
    onUpdateConfig: (config: Partial<EngineConfig>) => void;
    onToggleRun: () => void;
    onStep: () => void;
    onReset: () => void;
    onRandomize: () => void;
}

export function Sidebar({ config, isRunning, onUpdateConfig, onToggleRun, onStep, onReset, onRandomize }: Props) {
    return (
        <aside className="w-[320px] h-full p-6 bg-[#11182b] border-l border-[#293556] flex flex-col overflow-y-auto shadow-2xl z-10">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="text-xl">🧬</span> Evolution Lab
            </h1>
            
            <p className="text-[#8d9abb] text-sm leading-relaxed mb-8">
                Organisms evolve movement strategies. They search for food, and the organisms that collect the most food reproduce.
            </p>

            <div className="flex-1 space-y-6">
                <ControlSlider
                    label="Population"
                    value={config.populationSize}
                    min={20}
                    max={300}
                    currentValue={config.populationSize}
                    onChange={(val) => onUpdateConfig({ populationSize: val })}
                />
                
                <ControlSlider
                    label="Mutation Rate"
                    value={`${(config.mutationRate * 100).toFixed(0)}%`}
                    min={0}
                    max={20}
                    currentValue={config.mutationRate * 100}
                    onChange={(val) => onUpdateConfig({ mutationRate: val / 100 })}
                />

                <ControlSlider
                    label="Crossover Rate"
                    value={`${(config.crossoverRate * 100).toFixed(0)}%`}
                    min={0}
                    max={100}
                    currentValue={config.crossoverRate * 100}
                    onChange={(val) => onUpdateConfig({ crossoverRate: val / 100 })}
                />

                <ControlSlider
                    label="Selection Pressure"
                    value={config.selectionPressure}
                    min={1}
                    max={10}
                    currentValue={config.selectionPressure}
                    onChange={(val) => onUpdateConfig({ selectionPressure: val })}
                />

                <ControlSlider
                    label="Simulation Speed"
                    value={`${config.speed}x`}
                    min={1}
                    max={20}
                    currentValue={config.speed}
                    onChange={(val) => onUpdateConfig({ speed: val })}
                />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                    onClick={onToggleRun}
                    className="col-span-2 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ease-in-out bg-[#1c7fa3] text-white hover:bg-[#2398c2] border border-[#39b9e5] shadow-[0_0_15px_rgba(28,127,163,0.3)] hover:shadow-[0_0_20px_rgba(57,185,229,0.5)]"
                >
                    {isRunning ? "⏸ Pause" : "▶ Run"}
                </button>
                <button onClick={onStep} className="btn-secondary">Step</button>
                <button onClick={onReset} className="btn-secondary">Reset</button>
                <button onClick={onRandomize} className="col-span-2 btn-secondary">Randomize</button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#293556] text-sm text-[#8d9abb] space-y-3">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-[#65d9ff] shadow-[0_0_8px_#65d9ff]"></span>
                    Organism
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-[#ffd166] shadow-[0_0_8px_#ffd166]"></span>
                    Food
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-[#55efc4] shadow-[0_0_8px_#55efc4]"></span>
                    Best organism
                </div>
            </div>
        </aside>
    );
}
