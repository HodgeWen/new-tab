import { z } from 'zod'

const FolderSizeSchema = z.enum(['horizontal', 'vertical', 'square'])

const SiteItemRecordSchema = z
  .object({
    type: z.literal('site'),
    id: z.string(),
    title: z.string(),
    url: z.string(),
    icon: z.string(),
    pid: z.string().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
  })
  .passthrough()

const FolderItemRecordSchema = z
  .object({
    type: z.literal('folder'),
    id: z.string(),
    title: z.string(),
    size: FolderSizeSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
  })
  .passthrough()

const GridItemRecordSchema = z.discriminatedUnion('type', [
  SiteItemRecordSchema,
  FolderItemRecordSchema,
])

export const BackupDataSchema = z
  .object({
    gridItems: z.array(GridItemRecordSchema),
    gridOrder: z.array(z.string()).optional(),
  })
  .passthrough()
