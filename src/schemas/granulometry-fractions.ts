export const granulometryFractionQuerySchema = {
  type: 'object',
  required: ['fraction'],
  properties: {
    fraction: {
      type: 'string',
      enum: ['clay', 'silt', 'sand', 'coarse'],
      description: 'Fração granulométrica a ser analisada: clay (argila), silt (silte), sand (areia), coarse (grossa)',
    },
    biome: { type: 'string' },
    region: { type: 'string' },
    state: { type: 'string' },
    municipality: { type: 'string' },
    limit: { type: 'number', minimum: 1, maximum: 1000, default: 100 },
    offset: { type: 'number', minimum: 0, default: 0 },
  },
} as const;


