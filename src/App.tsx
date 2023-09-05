import { useMemo, useState } from 'react'
import { Paper } from '@mui/material'
import useIrrigationEvents from './hooks/useIrrigationEvents'
import {
  Resource,
  ViewState,
  GroupingState,
  IntegratedGrouping,
} from '@devexpress/dx-react-scheduler'
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
  GroupingPanel,
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
    fieldName: 'group',
    title: 'Group',
    instances: [
      { id: 'Lawn', text: 'Lawn' },
      { id: 'Front yard', text: 'Front yard' },
      { id: 'Back yard', text: 'Back yard' },
      { id: 'New trees', text: 'New trees' },
    ],
  },
]

const idToGroupMap: {[key: number]: string }= {
  767: 'Lawn',
  768: 'Lawn',
  676: 'Front yard',
  677: 'Back yard',
  769: 'Back yard',
  675: 'New trees',
  813: 'New trees',
}

function App() {
  const [viewCurrentDate, setViewCurrentDate] = useState<Date>(new Date())
  const [currentViewName, setCurrentViewName] = useState<string>('Day')
  const { data: irrigationEvents } = useIrrigationEvents(
    getStartDate(viewCurrentDate, currentViewName),
    getEndDate(viewCurrentDate, currentViewName)
  )
  const irrigationEventsWithResources = useMemo(
    () =>
      irrigationEvents?.map((event) => ({
        ...event,
        group: idToGroupMap[event.deviceId] ?? '',
      })),
    [irrigationEvents]
  )

  return (
    <Paper>
      <Scheduler height={800} data={irrigationEventsWithResources}>
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
        <GroupingState groupByDate={() => true} grouping={[{ resourceName: 'group' }]} />
        <DayView startDayHour={4} endDayHour={19} />
        <WeekView startDayHour={4} endDayHour={19} />
        <Appointments />
        <AppointmentTooltip showCloseButton />
        <Resources data={resources} />
        <IntegratedGrouping />
        <GroupingPanel />
      </Scheduler>
    </Paper>
  )
}

export default App
