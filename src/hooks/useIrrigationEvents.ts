import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { AppointmentModel } from '@devexpress/dx-react-scheduler'
import { isWithinInterval } from 'date-fns'
// import mockEvents from '../mocks/mockEvents.json'

export interface IrrigationEventAppointmentModel extends AppointmentModel {
  deviceId: number
}

const getIrrigationEvents = async (startTimestamp: Date, endTimestamp: Date) => {
  // return Promise.resolve(mockEvents as AppointmentModel[])
  try {
    return axios
      .get<IrrigationEventAppointmentModel[]>(
        `http://192.168.42.4:8080/irrigationEvents?startTimestamp=${startTimestamp.toISOString()}&endTimestamp=${endTimestamp.toISOString()}`
      )
      .then((response) => response.data)
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
        ? 5 * 60 * 1000
        : false,
  })

export default useIrrigationEvents
