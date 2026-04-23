import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { Prisma } from '@prisma/client'
import { prisma } from './db.js'

const RootResponseSchema = z.object({
  message: z.string(),
  openapi: z.string()
}).openapi('RootResponse')

const HealthResponseSchema = z.object({
  status: z.literal('ok')
}).openapi('HealthResponse')

const ItemSchema = z.object({
  id: z.number().int().openapi({ example: 1 }),
  title: z.string().min(1).max(120).openapi({ example: 'Conference room A' }),
  description: z.string().max(500).nullable().openapi({ example: 'Main conference room on the 2nd floor' }),
  type: z.string().max(60).nullable().openapi({ example: 'Room' }),
  createdAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' }),
  updatedAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' })
}).openapi('Item')

const ItemListResponseSchema = z.object({
  items: z.array(ItemSchema)
}).openapi('ItemListResponse')

const CreateItemSchema = z.object({
  title: z.string().trim().min(1).max(120).openapi({ example: 'Conference room A' }),
  description: z.string().trim().max(500).optional().openapi({ example: 'Main conference room on the 2nd floor' }),
  type: z.string().trim().max(60).optional().openapi({ example: 'Room' })
}).openapi('CreateItem')

const UpdateItemSchema = z.object({
  title: z.string().trim().min(1).max(120).optional().openapi({ example: 'Conference room A' }),
  description: z.string().trim().max(500).nullable().optional().openapi({ example: 'Main conference room on the 2nd floor' }),
  type: z.string().trim().max(60).nullable().optional().openapi({ example: 'Room' })
}).openapi('UpdateItem')

const ItemsQuerySchema = z.object({
  search: z.string().optional().openapi({
    param: {
      name: 'search',
      in: 'query'
    },
    example: 'Conference'
  })
}).openapi('ItemsQuery')

const ItemParamsSchema = z.object({
  id: z.coerce.number().int().positive().openapi({
    param: {
      name: 'id',
      in: 'path'
    },
    example: 1
  })
}).openapi('ItemParams')

const ReservationStatusSchema = z.enum(['pending', 'confirmed', 'cancelled'])

const ReservationSchema = z.object({
  id: z.number().int().openapi({ example: 1 }),
  itemId: z.number().int().openapi({ example: 1 }),
  startAt: z.string().datetime().openapi({ example: '2024-06-01T08:00:00.000Z' }),
  endAt: z.string().datetime().openapi({ example: '2024-06-01T10:00:00.000Z' }),
  purpose: z.string().min(1).max(255).openapi({ example: 'Team meeting' }),
  notes: z.string().max(500).nullable().openapi({ example: 'Please set up projector' }),
  status: ReservationStatusSchema.openapi({ example: 'pending' }),
  createdAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' }),
  updatedAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' })
}).openapi('Reservation')

const ReservationListResponseSchema = z.object({
  reservations: z.array(ReservationSchema)
}).openapi('ReservationListResponse')

const CreateReservationSchema = z.object({
  startAt: z.string().datetime().openapi({ example: '2024-06-01T08:00:00.000Z' }),
  endAt: z.string().datetime().openapi({ example: '2024-06-01T10:00:00.000Z' }),
  purpose: z.string().trim().min(1).max(255).openapi({ example: 'Team meeting' }),
  notes: z.string().trim().max(500).optional().openapi({ example: 'Please set up projector' })
}).openapi('CreateReservation')

const UpdateReservationSchema = z.object({
  status: ReservationStatusSchema.openapi({ example: 'confirmed' })
}).openapi('UpdateReservation')

const ReservationParamsSchema = z.object({
  id: z.coerce.number().int().positive().openapi({
    param: {
      name: 'id',
      in: 'path'
    },
    example: 1
  })
}).openapi('ReservationParams')

const listReservationsRoute = createRoute({
  method: 'get',
  path: '/items/{id}/reservations',
  tags: ['Reservations'],
  request: {
    params: ItemParamsSchema
  },
  responses: {
    200: {
      description: 'List reservations for an item',
      content: {
        'application/json': {
          schema: ReservationListResponseSchema
        }
      }
    },
    404: {
      description: 'Item not found'
    }
  }
})

const createReservationRoute = createRoute({
  method: 'post',
  path: '/items/{id}/reservations',
  tags: ['Reservations'],
  request: {
    params: ItemParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: CreateReservationSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Create a reservation for an item',
      content: {
        'application/json': {
          schema: ReservationSchema
        }
      }
    },
    400: {
      description: 'Invalid date range (end must be after start)'
    },
    404: {
      description: 'Item not found'
    },
    409: {
      description: 'Reservation overlaps with an existing active reservation'
    }
  }
})

const updateReservationRoute = createRoute({
  method: 'patch',
  path: '/reservations/{id}',
  tags: ['Reservations'],
  request: {
    params: ReservationParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: UpdateReservationSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Update reservation status',
      content: {
        'application/json': {
          schema: ReservationSchema
        }
      }
    },
    404: {
      description: 'Reservation not found'
    },
    409: {
      description: 'Cannot cancel an already-cancelled reservation'
    }
  }
})

const rootRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['System'],
  responses: {
    200: {
      description: 'Basic API information',
      content: {
        'application/json': {
          schema: RootResponseSchema
        }
      }
    }
  }
})

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['System'],
  responses: {
    200: {
      description: 'Health check',
      content: {
        'application/json': {
          schema: HealthResponseSchema
        }
      }
    }
  }
})

const listItemsRoute = createRoute({
  method: 'get',
  path: '/items',
  tags: ['Items'],
  request: {
    query: ItemsQuerySchema
  },
  responses: {
    200: {
      description: 'List persisted items',
      content: {
        'application/json': {
          schema: ItemListResponseSchema
        }
      }
    }
  }
})

const createItemRoute = createRoute({
  method: 'post',
  path: '/items',
  tags: ['Items'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: CreateItemSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Create a persisted item',
      content: {
        'application/json': {
          schema: ItemSchema
        }
      }
    }
  }
})

const deleteItemRoute = createRoute({
  method: 'delete',
  path: '/items/{id}',
  tags: ['Items'],
  request: {
    params: ItemParamsSchema
  },
  responses: {
    204: {
      description: 'Remove a persisted item'
    }
  }
})

const updateItemRoute = createRoute({
  method: 'patch',
  path: '/items/{id}',
  tags: ['Items'],
  request: {
    params: ItemParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: UpdateItemSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Update a persisted item',
      content: {
        'application/json': {
          schema: ItemSchema
        }
      }
    },
    404: {
      description: 'Item not found'
    }
  }
})

const toItemResponse = (item: { id: number; title: string; description: string | null; type: string | null; createdAt: Date; updatedAt: Date }) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  type: item.type,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString()
})

const toReservationResponse = (r: { id: number; itemId: number; startAt: Date; endAt: Date; purpose: string; notes: string | null; status: string; createdAt: Date; updatedAt: Date }) => ({
  id: r.id,
  itemId: r.itemId,
  startAt: r.startAt.toISOString(),
  endAt: r.endAt.toISOString(),
  purpose: r.purpose,
  notes: r.notes,
  status: r.status as 'pending' | 'confirmed' | 'cancelled',
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString()
})

const defaultCorsOrigins = ['http://localhost:4173', 'http://localhost:5173']
const configuredCorsOrigins = process.env.CORS_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const openApiDocumentConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Cyfor Workshop API',
    version: '1.0.0',
    description: 'Workshop starter API built with Hono, Prisma, and SQLite.'
  }
}

export const app = new OpenAPIHono()

app.use('*', cors({
  origin: configuredCorsOrigins?.length ? configuredCorsOrigins : defaultCorsOrigins
}))

app.doc('/openapi.json', openApiDocumentConfig)

app.openapi(rootRoute, (c) => {
  return c.json({
    message: 'Cyfor workshop API',
    openapi: '/openapi.json'
  }, 200)
})

app.openapi(healthRoute, (c) => {
  return c.json({
    status: 'ok'
  }, 200)
})

app.openapi(listItemsRoute, async (c) => {
  const { search } = c.req.valid('query')
  const items = await prisma.item.findMany({
    where: search ? { title: { contains: search } } : undefined,
    orderBy: {
      createdAt: 'desc'
    }
  })

  return c.json({
    items: items.map(toItemResponse)
  }, 200)
})

app.openapi(createItemRoute, async (c) => {
  const { title, description, type } = c.req.valid('json')
  const item = await prisma.item.create({
    data: {
      title,
      description,
      type
    }
  })

  return c.json(toItemResponse(item), 201)
})

app.openapi(deleteItemRoute, async (c) => {
  const { id } = c.req.valid('param')

  await prisma.item.deleteMany({
    where: {
      id
    }
  })

  return c.body(null, 204)
})

app.openapi(updateItemRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')

  try {
    const item = await prisma.item.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.type !== undefined && { type: body.type })
      }
    })

    return c.json(toItemResponse(item), 200)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return c.json({ error: 'Item not found' }, 404)
    }
    throw e
  }
})

app.openapi(listReservationsRoute, async (c) => {
  const { id } = c.req.valid('param')

  const item = await prisma.item.findUnique({ where: { id } })
  if (!item) {
    return c.json({ error: 'Item not found' }, 404)
  }

  const reservations = await prisma.reservation.findMany({
    where: { itemId: id },
    orderBy: { startAt: 'asc' }
  })

  return c.json({ reservations: reservations.map(toReservationResponse) }, 200)
})

app.openapi(createReservationRoute, async (c) => {
  const { id } = c.req.valid('param')
  const { startAt, endAt, purpose, notes } = c.req.valid('json')

  const start = new Date(startAt)
  const end = new Date(endAt)

  if (end <= start) {
    return c.json({ error: 'End date/time must be after start date/time' }, 400)
  }

  const item = await prisma.item.findUnique({ where: { id } })
  if (!item) {
    return c.json({ error: 'Item not found' }, 404)
  }

  const overlap = await prisma.reservation.findFirst({
    where: {
      itemId: id,
      status: { in: ['pending', 'confirmed'] },
      startAt: { lt: end },
      endAt: { gt: start }
    }
  })

  if (overlap) {
    return c.json({ error: 'Reservation overlaps with an existing active reservation' }, 409)
  }

  const reservation = await prisma.reservation.create({
    data: {
      itemId: id,
      startAt: start,
      endAt: end,
      purpose,
      notes: notes ?? null,
      status: 'pending'
    }
  })

  return c.json(toReservationResponse(reservation), 201)
})

app.openapi(updateReservationRoute, async (c) => {
  const { id } = c.req.valid('param')
  const { status } = c.req.valid('json')

  try {
    const existing = await prisma.reservation.findUnique({ where: { id } })
    if (!existing) {
      return c.json({ error: 'Reservation not found' }, 404)
    }

    if (existing.status === 'cancelled' && status === 'cancelled') {
      return c.json({ error: 'Reservation is already cancelled' }, 409)
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status }
    })

    return c.json(toReservationResponse(reservation), 200)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return c.json({ error: 'Reservation not found' }, 404)
    }
    throw e
  }
})

export type AppType = typeof app
