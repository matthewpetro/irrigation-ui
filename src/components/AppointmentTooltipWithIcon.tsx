import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded'
import { AppointmentTooltip } from '@devexpress/dx-react-scheduler-material-ui'
import { Grid, Typography } from '@mui/material'

export default function AppointmentTooltipWithIcon({
  children,
  appointmentData,
  ...restProps
}: AppointmentTooltip.ContentProps) {
  return (
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
}
