import { useState } from 'react'
import { Paper } from '@mui/material'
import useIrrigationEvents from './hooks/useIrrigationEvents'
import { Resource, ViewState } from '@devexpress/dx-react-scheduler'
import {
  Scheduler,
  TodayButton,
  Toolbar,
  DateNavigator,
  DayView,
  WeekView,
  Appointments,
  ViewSwitcher,
  AppointmentTooltip,
  Resources,
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

const resources: Resource[] = [
  {
    fieldName: 'deviceId',
    title: 'Lawn',
    instances: [
      { id: 768, text: 'North lawn' },
      { id: 767, text: 'South lawn' },
    ],
  },
  {
    fieldName: 'deviceId',
    title: 'Front yard',
    instances: [
      { id: 676, text: 'Front plants' },
      { id: 675, text: 'Front trees' },
    ],
  },
  {
    fieldName: 'deviceId',
    title: 'Back yard',
    instances: [
      { id: 769, text: 'Back plants' },
      { id: 677, text: 'Back trees' },
    ],
  },
]

function App() {
  const [viewCurrentDate, setViewCurrentDate] = useState<Date>(new Date())
  const [currentViewName, setCurrentViewName] = useState<string>('Day')
  const { data: irrigationEvents } = useIrrigationEvents(
    getStartDate(viewCurrentDate, currentViewName),
    getEndDate(viewCurrentDate, currentViewName)
  )

  return (
    <Paper>
      <Scheduler height={800} data={irrigationEvents}>
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
        <AppointmentTooltip showCloseButton />
        <Resources data={resources} />
      </Scheduler>
    </Paper>
  )
}

export default App
