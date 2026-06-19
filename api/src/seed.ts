import type { PrismaClient } from '@prisma/client'

type SeedReservation = {
  startAt: Date
  endAt: Date
  purpose: string
  notes?: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

type SeedItem = {
  title: string
  description?: string
  type?: string
  reservations?: SeedReservation[]
}

const at = (dayOffset: number, hour: number, minute = 0): Date => {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d
}

export const seedItems: SeedItem[] = [
  {
    title: 'Møterom Bjørvika',
    description: 'Stort møterom i 4. etasje med projektor og videokonferanse. Plass til 14 personer.',
    type: 'Room',
    reservations: [
      {
        startAt: at(-7, 9),
        endAt: at(-7, 11),
        purpose: 'Avdelingsmøte',
        notes: 'Avholdt forrige uke.',
        status: 'confirmed'
      },
      {
        startAt: at(0, 13),
        endAt: at(0, 15),
        purpose: 'Workshop API-design',
        status: 'confirmed'
      },
      {
        startAt: at(3, 10),
        endAt: at(3, 12),
        purpose: 'Intervjuer',
        notes: 'Trenger projektor og tavle.',
        status: 'pending'
      },
      {
        startAt: at(5, 8),
        endAt: at(5, 9, 30),
        purpose: 'Avlyst standup',
        status: 'cancelled'
      }
    ]
  },
  {
    title: 'Møterom Akershus',
    description: 'Lite møterom for inntil 6 personer. Egner seg til samtaler og korte møter.',
    type: 'Room',
    reservations: [
      {
        startAt: at(1, 11),
        endAt: at(1, 12),
        purpose: 'En-til-en',
        status: 'pending'
      },
      {
        startAt: at(2, 14),
        endAt: at(2, 16),
        purpose: 'Retrospektiv',
        notes: 'Husk gule lapper.',
        status: 'confirmed'
      }
    ]
  },
  {
    title: 'Projektor Epson EB-2250U',
    description: 'Bærbar projektor med HDMI og USB-C. Oppbevares i skap ved resepsjonen.',
    type: 'Equipment',
    reservations: [
      {
        startAt: at(4, 9),
        endAt: at(4, 17),
        purpose: 'Kundepresentasjon',
        status: 'confirmed'
      },
      {
        startAt: at(-3, 9),
        endAt: at(-3, 12),
        purpose: 'Demo (utgått)',
        notes: 'Ble ikke hentet.',
        status: 'cancelled'
      }
    ]
  },
  {
    title: 'Drone DJI Mavic 3',
    description: 'Inspeksjonsdrone med 4K-kamera. Krever gyldig dronesertifikat.',
    type: 'Equipment',
    reservations: [
      {
        startAt: at(6, 8),
        endAt: at(6, 14),
        purpose: 'Inspeksjon av tak',
        notes: 'Sjekk værmelding på forhånd.',
        status: 'pending'
      }
    ]
  },
  {
    title: 'Whiteboard mobil',
    type: 'Equipment'
  },
  {
    title: 'Tjenestebil Volvo XC60',
    description: '5-seter, diesel. Registreringsnummer EK 12345. Nøkkel hentes i resepsjonen.',
    type: 'Vehicle',
    reservations: [
      {
        startAt: at(8, 0),
        endAt: at(10, 23, 59),
        purpose: 'Tjenestereise Bergen',
        notes: 'Flerdagstur, fyll diesel før retur.',
        status: 'confirmed'
      },
      {
        startAt: at(14, 7, 30),
        endAt: at(14, 16),
        purpose: 'Befaring',
        status: 'pending'
      }
    ]
  },
  {
    title: 'Lastebil Scania R450',
    description: 'For transport av tyngre materiell. Krever førerkort klasse C.',
    type: 'Vehicle'
  },
  {
    title: 'Arbeidsstasjon A-12',
    description: 'Hev/senk-pult ved vindu med to skjermer og dokkingstasjon.',
    type: 'Desk',
    reservations: [
      {
        startAt: at(0, 8),
        endAt: at(0, 16),
        purpose: 'Hjemmekontor-erstatning',
        status: 'confirmed'
      },
      {
        startAt: at(7, 8),
        endAt: at(7, 16),
        purpose: 'Gjestearbeidsplass',
        notes: 'Konsulent på besøk.',
        status: 'pending'
      }
    ]
  },
  {
    title: 'Hot-desk Sone B',
    type: 'Desk',
    reservations: [
      {
        startAt: at(9, 8),
        endAt: at(9, 12),
        purpose: 'Avlyst booking',
        status: 'cancelled'
      }
    ]
  },
  {
    title: 'Feltradio PRC-152',
    description: 'Taktisk håndholdt radio. Kun til bruk under øvelse.',
    type: 'Other',
    reservations: [
      {
        startAt: at(12, 6),
        endAt: at(13, 18),
        purpose: 'Vinterøvelse',
        notes: 'Lever inn fulladet batteri.',
        status: 'pending'
      }
    ]
  },
  {
    title: 'Konferansetelefon Polycom',
    description: 'Deles mellom møterommene. Settes tilbake etter bruk.'
  }
]

export const resetDatabase = async (prisma: PrismaClient): Promise<{ items: number; reservations: number }> => {
  const reservations = await prisma.reservation.deleteMany()
  const items = await prisma.item.deleteMany()
  return { items: items.count, reservations: reservations.count }
}

export const seedDatabase = async (prisma: PrismaClient): Promise<{ items: number; reservations: number }> => {
  await resetDatabase(prisma)

  let itemCount = 0
  let reservationCount = 0

  for (const item of seedItems) {
    const { reservations = [], ...itemData } = item
    await prisma.item.create({
      data: {
        ...itemData,
        reservations: reservations.length
          ? {
              create: reservations.map((r) => ({
                startAt: r.startAt,
                endAt: r.endAt,
                purpose: r.purpose,
                notes: r.notes ?? null,
                status: r.status
              }))
            }
          : undefined
      }
    })
    itemCount += 1
    reservationCount += reservations.length
  }

  return { items: itemCount, reservations: reservationCount }
}
