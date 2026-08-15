import type { AlgorithmMode } from '../domain/Engine';

interface Props {
    algorithmMode: AlgorithmMode;
    aliveCount: number;
    averageEnergy: number;
    averageHydration: number;
    oldestAge: number;
    highestGeneration: number;
    totalBirths: number;
    totalDeaths: number;
    totalFruitsEaten: number;
}

export function StatPanel({
    algorithmMode,
    aliveCount,
    averageEnergy,
    averageHydration,
    oldestAge,
    highestGeneration,
    totalBirths,
    totalDeaths,
    totalFruitsEaten
}: Props) {
    const isExtinct = aliveCount === 0;

    return (
        <div className="absolute top-8 left-8 flex flex-wrap gap-3 pointer-events-none z-10">
            <StatCard
                label="POPULATION"
                value={aliveCount}
                highlight={isExtinct ? "text-rose-400" : (algorithmMode === 'ANT_COLONY' ? "text-purple-400" : "text-emerald-400")}
                badge={isExtinct ? "Extinct" : (algorithmMode === 'ANT_COLONY' ? "Swarm" : "Alive")}
            />
            <StatCard
                label="AVG HUNGER"
                value={`${averageEnergy.toFixed(0)}%`}
                highlight={averageEnergy < 35 ? "text-amber-400" : "text-emerald-400"}
            />
            <StatCard
                label="AVG HYDRATION"
                value={`${averageHydration.toFixed(0)}%`}
                highlight={averageHydration < 35 ? "text-amber-400" : "text-sky-400"}
            />
            <StatCard
                label="FRUITS HARVESTED"
                value={`${totalFruitsEaten} 🍎`}
                highlight="text-amber-300"
            />
            <StatCard
                label="OLDEST SURVIVOR"
                value={`${oldestAge} ticks`}
            />
            <StatCard
                label={algorithmMode === 'ANT_COLONY' ? "MAX LINEAGE" : "MAX GEN"}
                value={`Gen ${highestGeneration}`}
            />
            <StatCard
                label="BIRTHS / DEATHS"
                value={`${totalBirths} / ${totalDeaths}`}
            />
        </div>
    );
}

function StatCard({
    label,
    value,
    highlight = "text-white",
    badge
}: {
    label: string;
    value: string | number;
    highlight?: string;
    badge?: string;
}) {
    return (
        <div className="min-w-[125px] p-3 px-4 bg-[#0d1428f0] border border-[#2b395e] rounded-xl backdrop-blur-md shadow-2xl pointer-events-auto transition-all hover:border-[#38bdf8]/50">
            <div className="flex items-center justify-between gap-2">
                <div className="text-[#8d9abb] text-[10px] font-bold tracking-widest uppercase">{label}</div>
                {badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        {badge}
                    </span>
                )}
            </div>
            <div className={`mt-1.5 text-xl font-bold font-mono tracking-tight ${highlight}`}>{value}</div>
        </div>
    );
}
