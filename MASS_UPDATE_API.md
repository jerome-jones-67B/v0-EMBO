# Mass Update Required

All these API files need auth imports removed:

- app/api/v1/files/route.ts
- app/api/v1/manuscripts/route.ts
- app/api/v1/manuscripts/[id]/content/route.ts
- app/api/v1/manuscripts/[id]/download/progress/route.ts
- app/api/v1/manuscripts/[id]/download/route.ts
- app/api/v1/manuscripts/[id]/figures/route.ts
- app/api/v1/manuscripts/[id]/figures/[figureId]/image/route.ts
- app/api/v1/manuscripts/[id]/figures/[figureId]/route.ts
- app/api/v1/manuscripts/[id]/route.ts
- app/api/v1/manuscripts/[id]/validation/route.ts

All need to have:

1. Remove auth imports
2. Replace auth checks with static responses stating "Not available in static build mode"
