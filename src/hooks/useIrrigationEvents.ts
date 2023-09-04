import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { AppointmentModel } from '@devexpress/dx-react-scheduler'
// import mockEvents from '../mocks/mockEvents.json'

const getIrrigationEvents = async (startTimestamp: Date, endTimestamp: Date) =>
  axios
    .get<AppointmentModel[]>(
      `http://192.168.42.4:8080/irrigationEvents?startTimestamp=${startTimestamp.toISOString()}&endTimestamp=${endTimestamp.toISOString()}`
    )
    .then((response) => response.data)
  // return Promise.resolve(mockEvents as AppointmentModel[])


const useIrrigationEvents = (startTimestamp: Date, endTimestamp: Date) =>
  useQuery({
    queryKey: ['irrigationEvents', startTimestamp, endTimestamp],
    queryFn: () => getIrrigationEvents(startTimestamp, endTimestamp),
    staleTime: Infinity,
  })

export default useIrrigationEvents