import dayjs from 'dayjs'
import useIrrigationEvents from './hooks/useIrrigationEvents'
import { IrrigationEventViewmodel } from './hooks/useIrrigationEvents'

const refreshIntervalMinutes = import.meta.env.VITE_REFRESH_INTERVAL_MINUTES as number

function App() {
  const irrigationEvents = useIrrigationEvents(dayjs(), dayjs())
  return (
  <div>

  </div>
  )
}

export default App
