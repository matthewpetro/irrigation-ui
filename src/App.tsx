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
    fieldName: 'title',
    title: 'Lawn',
    instances: [
      { id: 'North lawn', text: 'North lawn' },
      { id: 'South lawn', text: 'South lawn' },
    ],
  },
  {
    fieldName: 'title',
    title: 'Front yard',
    instances: [
      { id: 'Front plants', text: 'Front plants' },
      { id: 'Front trees', text: 'Front trees' },
    ],
  },
  {
    fieldName: 'title',
    title: 'Back yard',
    instances: [
      { id: 'Back plants', text: 'Back plants' },
      { id: 'Back trees', text: 'Back trees' },
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
