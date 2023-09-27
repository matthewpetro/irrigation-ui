import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded'
import { Appointments } from '@devexpress/dx-react-scheduler-material-ui'

export default function AppointmentWithIcon({
  children,
  data,
  ...restProps
}: Appointments.AppointmentProps) {
  return (
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
}
