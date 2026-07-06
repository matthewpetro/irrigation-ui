export type IrrigationWarning =
  | 'The ON event is missing. The time shown is the OFF time.'
  | 'The OFF event is missing. The time shown is the ON time.'
  | 'The OFF event is missing and the current device state cannot be determined.'

export interface IrrigationEventDto {
  startTimestamp?: string
  endTimestamp?: string
  title: string
  deviceId: number
  currentlyOn?: boolean
  warning?: IrrigationWarning
}

export interface CalendarEventProps {
  id: string
  title: string
  start: string | Date
  end: string | Date | undefined
  allDay: boolean
  backgroundColor: string
  borderColor: string
  classNames: string[]
  extendedProps: {
    deviceId: number
    currentlyOn: boolean
    warning: IrrigationWarning | null
  }
}

export interface IrrigationEventsQueryParams {
  startTimestamp: string
  endTimestamp: string
}
