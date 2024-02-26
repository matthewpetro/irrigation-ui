import server from '../server'
import { useQuery } from '@tanstack/react-query'
import { AppointmentModel } from '@devexpress/dx-react-scheduler'
import { isWithinInterval } from 'date-fns'
// import mockEvents from '../mocks/mockEvents.json'

const refreshIntervalMinutes = import.meta.env.VITE_REFRESH_INTERVAL_MINUTES as number

interface IrrigationEventViewmodel {
  startTimestamp: string
  endTimestamp?: string
  title: string
  deviceId: number
  warning?: string
  currentlyOn?: boolean
}

const viewmodelToAppointmentModel = (event: IrrigationEventViewmodel): AppointmentModel => (
  {
    startDate: event.startTimestamp,
    endDate: event.endTimestamp,
    title: event.title,
    deviceId: event.deviceId,
    warning: event.warning,
    currentlyOn: event.currentlyOn,
  }
)

const getIrrigationEvents = async (startTimestamp: Date, endTimestamp: Date) => {
  // return Promise.resolve(mockEvents as IrrigationEventAppointmentModel[])
  try {
    return server
      .get<IrrigationEventViewmodel[]>('/irrigation-events', {
        params: {
          startTimestamp: startTimestamp.toISOString(),
          endTimestamp: endTimestamp.toISOString(),
        },
      })
      .then((response) => response.data.map(viewmodelToAppointmentModel))
  } catch (error) {
    console.error(error)
  }
}

const useIrrigationEvents = (startTimestamp: Date, endTimestamp: Date) =>
  useQuery({
    queryKey: ['irrigationEvents', { startTimestamp, endTimestamp }],
    queryFn: () => getIrrigationEvents(startTimestamp, endTimestamp),
    staleTime: Infinity,
    refetchInterval: () =>
      isWithinInterval(Date.now(), { start: startTimestamp, end: endTimestamp })
        ? refreshIntervalMinutes * 60 * 1000
        : false,
  })

export default useIrrigationEvents
