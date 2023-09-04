import { useState } from 'react'
import { Paper } from '@mui/material'
import useIrrigationEvents from './hooks/useIrrigationEvents'
import { ViewState } from '@devexpress/dx-react-scheduler'
import {
  Scheduler,
  TodayButton,
  Toolbar,
  DateNavigator,
  DayView,
  WeekView,
  Appointments,
  ViewSwitcher,
} from '@devexpress/dx-react-scheduler-material-ui'
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns'

const getStartDate = (date: Date, viewName: string): Date => {
  switch (viewName) {
    case 'Day':
      return startOfDay(date)
    case 'Week':
      return startOfWeek(date)
    default:
      return date
  }
}

const getEndDate = (date: Date, viewName: string): Date => {
  switch (viewName) {
    case 'Day':
      return endOfDay(date)
    case 'Week':
      return endOfWeek(date)
    default:
      return date
  }
}

function App() {
  const [viewCurrentDate, setViewCurrentDate] = useState<Date>(new Date())
  const [currentViewName, setCurrentViewName] = useState<string>('Day')
  const { data } = useIrrigationEvents(
    getStartDate(viewCurrentDate, currentViewName),
    getEndDate(viewCurrentDate, currentViewName)
  )

  return (
    <Paper>
      <Scheduler height={800} data={data}>
        <ViewState
          currentDate={viewCurrentDate}
          onCurrentDateChange={setViewCurrentDate}
          currentViewName={currentViewName}
          onCurrentViewNameChange={setCurrentViewName}
        />
        <Toolbar />
        <DateNavigator />
        <TodayButton />
        <ViewSwitcher />
        <DayView startDayHour={4} endDayHour={19} />
        <WeekView startDayHour={4} endDayHour={19} />
        <Appointments />
      </Scheduler>
    </Paper>
  )
}

export default App
