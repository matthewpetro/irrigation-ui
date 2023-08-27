import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { Container } from '@mui/material'

const DeviceState = {
  ON: 'on',
  OFF: 'off',
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
type DeviceState = (typeof DeviceState)[keyof typeof DeviceState]

type IrrigationEvent = {
  timestamp: string
  deviceName: string
  deviceId: number
  state: DeviceState
}

const getIrrigationEvents = async () =>
  axios.get<IrrigationEvent[]>(
    'http://192.168.42.4:8080/irrigationEvents?startTimestamp=2023-08-23T00:00:00.000-07:00&endTimestamp=2023-08-27T23:00:00.000-07:00'
  ).then((response) => response.data)

function App() {
  const query = useQuery({ queryKey: ['irrigationEvents'], queryFn: getIrrigationEvents})

  return (
    <Container>
      <ul>
        {query.data?.map((event) => (
          <li key={event.timestamp}>{JSON.stringify(event)}</li> 
        ))}
      </ul>
    </Container>
  )
}

export default App
