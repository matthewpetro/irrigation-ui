import server from './server'
import { formatISO } from 'date-fns'
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
  startTimestamp: Date,
  endTimestamp: Date
): Promise<IrrigationEventViewmodel[]> => {
  // return Promise.resolve(mockEvents as IrrigationEventViewmodel[])
  try {
    const result = await server.get<IrrigationEventViewmodel[]>('/irrigation-events', {
      params: {
        startTimestamp: formatISO(startTimestamp),
        endTimestamp: formatISO(endTimestamp),
      },
    })
    return result.data ?? []
  } catch (error) {
    console.error(error)
    throw error
  }
}
