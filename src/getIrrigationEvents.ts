import server from './server'
// import mockEvents from '../mocks/mockEvents.json'

export interface IrrigationEventViewmodel {
  startTimestamp?: string
  endTimestamp?: string
  title: string
  deviceId: number
  warning?: string
  currentlyOn?: boolean
}

export default async (
  startTimestamp: Temporal.Instant,
  endTimestamp: Temporal.Instant
): Promise<IrrigationEventViewmodel[]> => {
  // return Promise.resolve(mockEvents as IrrigationEventViewmodel[])
  try {
    const result = await server.get<IrrigationEventViewmodel[]>('/irrigation-events', {
      params: {
        startTimestamp: startTimestamp.toString(),
        endTimestamp: endTimestamp.toString(),
      },
    })
    return result.data ?? []
  } catch (error) {
    console.error(error)
    throw error
  }
}
