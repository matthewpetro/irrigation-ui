import dayjs from 'dayjs'
import useIrrigationEvents, { IrrigationEventViewmodel } from './hooks/useIrrigationEvents'
import CalendarView from './components/CalendarView'

function App() {
  const { data: events = [] } = useIrrigationEvents(dayjs().startOf('day'), dayjs().endOf('day'))
  return (
  <div className="p-4">
    <CalendarView events={events as IrrigationEventViewmodel[]} initialDate={dayjs()} initialView="week" />
  </div>
  )
}

export default App
