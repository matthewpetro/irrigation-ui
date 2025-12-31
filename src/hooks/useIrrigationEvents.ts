import server from '../server'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)
// import mockEvents from '../mocks/mockEvents.json'

const refreshIntervalMinutes = Number(import.meta.env.VITE_REFRESH_INTERVAL_MINUTES) || 5

export interface IrrigationEventViewmodel {
  startTimestamp?: string
  endTimestamp?: string
  title: string
  deviceId: number
  warning?: string
  currentlyOn?: boolean
}

const getIrrigationEvents = async (startTimestamp: dayjs.Dayjs, endTimestamp: dayjs.Dayjs): Promise<IrrigationEventViewmodel[]> => {
  // return Promise.resolve(mockEvents as IrrigationEventViewmodel[])
  try {
    const result = await server
      .get<IrrigationEventViewmodel[]>('/irrigation-events', {
        params: {
          startTimestamp: startTimestamp.toISOString(),
          endTimestamp: endTimestamp.toISOString(),
        },
      })
    return result.data ?? []
  } catch (error) {
    console.error(error)
    throw error
  }
}

const useIrrigationEvents = (startTimestamp: dayjs.Dayjs, endTimestamp: dayjs.Dayjs) =>
  useQuery({
    queryKey: [
      'irrigationEvents',
      { startTimestamp: startTimestamp.toISOString(), endTimestamp: endTimestamp.toISOString() },
      startTimestamp,
      endTimestamp,
    ],
    queryFn: () => getIrrigationEvents(startTimestamp, endTimestamp),
    staleTime: Infinity,
    refetchInterval: () =>
      dayjs().isBetween(startTimestamp, endTimestamp, 'second', '[]')
        ? refreshIntervalMinutes * 60 * 1000
        : false,
  })

export default useIrrigationEvents
