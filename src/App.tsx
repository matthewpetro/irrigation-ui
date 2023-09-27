import { useState } from 'react'
import { Grid, Paper, Typography } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
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
    title: 'Zone',
    instances: [
      { id: 'North lawn', text: 'North lawn' },
      { id: 'South lawn', text: 'South lawn' },
      { id: 'Front plants', text: 'Front plants' },
      { id: 'Front trees', text: 'Front trees' },
      { id: 'Back plants', text: 'Back plants' },
      { id: 'Back trees', text: 'Back trees' },
      { id: 'Tangelo tree', text: 'Tangelo tree' },
    ],
  },
]

const AppointmentWithWarning = ({ children, data, ...restProps }: Appointments.AppointmentProps) => (
  <Appointments.Appointment data={data} {...restProps}>
    {data.warning && <WarningIcon fontSize="small" sx={{ margin: '2px' }} />}
    {children}
  </Appointments.Appointment>
)

const AppointmentTooltipWithWarning = ({
  children,
  appointmentData,
  ...restProps
}: AppointmentTooltip.ContentProps) => (
  <AppointmentTooltip.Content appointmentData={appointmentData} {...restProps}>
    {children}
    {appointmentData?.warning && (
      <Grid container paddingTop={1}>
        <Grid item xs={2} textAlign="center">
          <WarningIcon color="error" />
        </Grid>
        <Grid item xs={10}>
          <Typography variant="inherit" sx={{ fontWeight: 'bold' }}>
            {appointmentData.warning}
          </Typography>
        </Grid>
      </Grid>
    )}
  </AppointmentTooltip.Content>
)

function App() {
  const [viewCurrentDate, setViewCurrentDate] = useState<Date>(new Date())
  const [currentViewName, setCurrentViewName] = useState<string>('Week')
  const { data: irrigationEvents } = useIrrigationEvents(
    getStartDate(viewCurrentDate, currentViewName),
    getEndDate(viewCurrentDate, currentViewName)
  )

  return (
    <Paper sx={{ height: '100vh' }}>
      <Scheduler data={irrigationEvents}>
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
        <DayView startDayHour={0} endDayHour={23} />
        <WeekView startDayHour={0} endDayHour={23} />
        <Appointments appointmentComponent={AppointmentWithWarning} />
        <AppointmentTooltip showCloseButton contentComponent={AppointmentTooltipWithWarning} />
        <Resources data={resources} />
      </Scheduler>
    </Paper>
  )
}

export default App
