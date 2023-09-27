import { useState } from 'react'
import { Grid, Paper, Typography } from '@mui/material'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded'
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
  CurrentTimeIndicator,
} from '@devexpress/dx-react-scheduler-material-ui'
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns'

const refreshIntervalMinutes = import.meta.env.VITE_REFRESH_INTERVAL_MINUTES as number

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

const AppointmentWithIcon = ({ children, data, ...restProps }: Appointments.AppointmentProps) => (
  <Appointments.Appointment data={data} {...restProps}>
    {data.warning && (
      <WarningRoundedIcon fontSize="small" sx={{ color: 'text.secondary', margin: '2px' }} />
    )}
    {data.currentlyOn && (
      <WaterDropRoundedIcon fontSize="small" sx={{ color: 'text.secondary', margin: '2px' }} />
    )}
    {children}
  </Appointments.Appointment>
)

const AppointmentTooltipWithIcon = ({
  children,
  appointmentData,
  ...restProps
}: AppointmentTooltip.ContentProps) => (
  <AppointmentTooltip.Content appointmentData={appointmentData} {...restProps}>
    {children}
    {appointmentData?.warning && (
      <Grid container paddingTop={1}>
        <Grid item xs={2} textAlign="center">
          <WarningRoundedIcon color="error" />
        </Grid>
        <Grid item xs={10}>
          <Typography variant="inherit" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
            {appointmentData.warning}
          </Typography>
        </Grid>
      </Grid>
    )}
    {appointmentData?.currentlyOn && (
      <Grid container paddingTop={1}>
        <Grid item xs={2} textAlign="center">
          <WaterDropRoundedIcon color="success" />
        </Grid>
        <Grid item xs={10}>
          <Typography variant="inherit" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
            Device is currently on
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
        <Appointments appointmentComponent={AppointmentWithIcon} />
        <AppointmentTooltip showCloseButton contentComponent={AppointmentTooltipWithIcon} />
        <Resources data={resources} />
        <CurrentTimeIndicator updateInterval={refreshIntervalMinutes * 60 * 1000} />
      </Scheduler>
    </Paper>
  )
}

export default App
