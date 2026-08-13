interface Props {
    generation: number;
    bestFitness: number;
    averageFitness: number;
}

export function StatPanel({ generation, bestFitness, averageFitness }: Props) {
    return (
        <div className="absolute top-8 left-8 flex gap-3 pointer-events-none">
            <StatCard label="GENERATION" value={generation} />
            <StatCard label="BEST FITNESS" value={bestFitness} />
            <StatCard label="AVERAGE" value={averageFitness.toFixed(1)} />
        </div>
    );
}

function StatCard({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="min-w-[110px] p-3 px-4 bg-[#0d1428e6] border border-[#2b395e] rounded-lg backdrop-blur-sm shadow-xl pointer-events-auto">
            <div className="text-[#8d9abb] text-xs font-semibold tracking-wider">{label}</div>
            <div className="mt-1 text-xl font-bold text-white font-mono">{value}</div>
        </div>
    );
}
