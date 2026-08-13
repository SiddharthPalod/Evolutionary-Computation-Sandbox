# Evolutionary Computation Sandbox
A desktop app to play around with different genetic and evolutionary algorithms and see effect of variability on a simulated population

## Overview
- Engine.ts: Merely acts as the coordinator holding state.
- GenomeMutator.ts: Only knows how to cross over and mutate genes (Genetic Algorithm).
- MovementService.ts: Only knows how to apply physics and update spatial coordinates (Movement).
- useSimulation.ts: The only thing that knows how to run a frame loop.
- SimulationCanvas.tsx & UI Components: The only things that know about React, the DOM, and visual rendering.