import axiosInstance from './axiosInstance'
import type { IrrigationEventDto, IrrigationEventsQueryParams } from '../types/irrigationEvent'

export async function getEvents(params: IrrigationEventsQueryParams): Promise<IrrigationEventDto[]> {
  const response = await axiosInstance.get<IrrigationEventDto[]>('/irrigation-events', { params })
  return response.data
}
