// import server from '../server'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)
import mockEvents from '../mocks/mockEvents.json'

const refreshIntervalMinutes = import.meta.env.VITE_REFRESH_INTERVAL_MINUTES as number

export interface IrrigationEventViewmodel {
  startTimestamp: string
  endTimestamp?: string
  title: string
  deviceId: number
  warning?: string
  currentlyOn?: boolean
}

const getIrrigationEvents = async (startTimestamp: dayjs.Dayjs, endTimestamp: dayjs.Dayjs) => {
  return Promise.resolve(mockEvents as IrrigationEventViewmodel[])
  // try {
  //   return server
  //     .get<IrrigationEventViewmodel[]>('/irrigation-events', {
  //       params: {
  //         startTimestamp: startTimestamp.toISOString(),
  //         endTimestamp: endTimestamp.toISOString(),
  //       },
  //     })
  //     .then((response) => response.data)
  // } catch (error) {
  //   console.error(error)
  // }
}

const useIrrigationEvents = (startTimestamp: dayjs.Dayjs, endTimestamp: dayjs.Dayjs) =>
  useQuery({
    queryKey: ['irrigationEvents', { startTimestamp, endTimestamp }],
    queryFn: () => getIrrigationEvents(startTimestamp, endTimestamp),
    staleTime: Infinity,
    refetchInterval: () =>
      dayjs().isBetween(startTimestamp, endTimestamp, 'second', '[]')
        ? refreshIntervalMinutes * 60 * 1000
        : false,
  })

export default useIrrigationEvents
