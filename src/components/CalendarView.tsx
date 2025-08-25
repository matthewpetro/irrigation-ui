import React, { useMemo, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { IrrigationEventViewmodel } from '../hooks/useIrrigationEvents'

type ViewMode = 'day' | 'week'

export interface CalendarViewProps {
	events: IrrigationEventViewmodel[]
	initialDate?: Dayjs
	initialView?: ViewMode
	// Optional callbacks
	onViewChange?: (view: ViewMode) => void
	onDateChange?: (date: Dayjs) => void
}

// Constants
const HOURS_PER_DAY = 24
const HOUR_ROW_PX = 48 // height of one hour row
const GRID_HEIGHT = HOURS_PER_DAY * HOUR_ROW_PX // 1152px
const TIME_AXIS_WIDTH = 64

interface LaidOutEvent {
	id: string
	title: string
	start: Dayjs
	end: Dayjs
	warning?: string
	deviceId: number
	currentlyOn?: boolean
	// layout
	topPct: number
	heightPct: number
	colIndex: number
	colCount: number
}

// Returns true if two intervals overlap (inclusive of boundaries)
function overlaps(aStart: Dayjs, aEnd: Dayjs, bStart: Dayjs, bEnd: Dayjs) {
	return aStart.isBefore(bEnd) && bStart.isBefore(aEnd)
}

// Clip an event to a single day's bounds and convert to minutes since day start
function clipAndToMinutes(eventStart: Dayjs, eventEnd: Dayjs, day: Dayjs) {
	const dayStart = day.startOf('day')
	const dayEnd = day.endOf('day')
	const start = eventStart.isAfter(dayStart) ? eventStart : dayStart
	const end = eventEnd.isBefore(dayEnd) ? eventEnd : dayEnd
	if (!start.isBefore(end)) return null
	const minutesFromStart = start.diff(dayStart, 'minute')
	const minutesEnd = end.diff(dayStart, 'minute')
	return { startMin: minutesFromStart, endMin: minutesEnd }
}

// Given a set of events for one day (already clipped to that day), assign columns to handle overlaps
function layoutDayEvents(day: Dayjs, events: IrrigationEventViewmodel[]): LaidOutEvent[] {
	// Normalize and clip to day
	const normalized = events
		.map((event, index) => {
			const start = dayjs(event.startTimestamp)
			const end = event.endTimestamp ? dayjs(event.endTimestamp) : event.currentlyOn ? dayjs() : dayjs(event.startTimestamp).add(30, 'minute')
			const clipped = clipAndToMinutes(start, end, day)
			if (!clipped) return null
			return {
				key: `${index}-${event.startTimestamp}`,
				title: event.title,
				start,
				end,
				deviceId: event.deviceId,
				warning: event.warning,
				currentlyOn: event.currentlyOn,
				startMin: clipped.startMin,
				endMin: clipped.endMin,
			}
		})
		.filter(Boolean) as Array<{
			key: string
			title: string
			start: Dayjs
			end: Dayjs
			deviceId: number
			warning?: string
			currentlyOn?: boolean
			startMin: number
			endMin: number
		}>

	if (normalized.length === 0) return []

	// Sort by start, then by end
	normalized.sort((a, b) => (a.startMin - b.startMin) || (a.endMin - b.endMin))

	// Build conflict groups: a new group starts when current event does not overlap the group max end
	const groups: typeof normalized[] = []
	let current: typeof normalized = []
	let currentMaxEnd = -1
	for (const event of normalized) {
		if (current.length === 0) {
			current.push(event)
			currentMaxEnd = event.endMin
		} else if (event.startMin < currentMaxEnd) {
			current.push(event)
			if (event.endMin > currentMaxEnd) currentMaxEnd = event.endMin
		} else {
			groups.push(current)
			current = [event]
			currentMaxEnd = event.endMin
		}
	}
	if (current.length) groups.push(current)

	const laidOut: LaidOutEvent[] = []

	for (const group of groups) {
		// Assign columns greedily within the group
		type Col = { endMin: number }
		const cols: Col[] = []
		const assigned: { colIndex: number; item: (typeof group)[number] }[] = []

		for (const item of group) {
			let idx = cols.findIndex(c => c.endMin <= item.startMin)
			if (idx === -1) {
				cols.push({ endMin: item.endMin })
				idx = cols.length - 1
			} else {
				cols[idx].endMin = item.endMin
			}
			assigned.push({ colIndex: idx, item })
		}

		const colCount = cols.length
		for (const { colIndex, item } of assigned) {
			const totalMinutes = 24 * 60
			const topPct = (item.startMin / totalMinutes) * 100
			const heightPct = ((item.endMin - item.startMin) / totalMinutes) * 100
			laidOut.push({
				id: item.key,
				title: item.title,
				start: item.start,
				end: item.end,
				deviceId: item.deviceId,
				warning: item.warning,
				currentlyOn: item.currentlyOn,
				topPct,
				heightPct,
				colIndex,
				colCount,
			})
		}
	}

	return laidOut
}

function getVisibleDays(currentDate: Dayjs, view: ViewMode) {
	if (view === 'day') return [currentDate.startOf('day')]
	const start = currentDate.startOf('week')
	return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'))
}

const Toolbar: React.FC<{
	date: Dayjs
	view: ViewMode
	setDate: (d: Dayjs) => void
	setView: (v: ViewMode) => void
}> = ({ date, view, setDate, setView }) => {
	const title = useMemo(() => {
		const start = date.startOf(view === 'week' ? 'week' : 'day')
		const end = view === 'week' ? start.add(6, 'day') : start
		if (view === 'week') {
			const sameMonth = start.month() === end.month()
			if (sameMonth) return `${start.format('MMMM YYYY')}`
			return `${start.format('MMM YYYY')} – ${end.format('MMM YYYY')}`
		}
		return start.format('MMMM D, YYYY')
	}, [date, view])

	return (
		<div className="flex items-center justify-between gap-2 py-2">
			<div className="flex items-center gap-2">
				<button className="px-3 py-1 rounded border bg-white hover:bg-gray-50" onClick={() => setDate(dayjs())}>Today</button>
				<button className="px-3 py-1 rounded border bg-white hover:bg-gray-50" onClick={() => setDate(date.subtract(1, view === 'week' ? 'week' : 'day'))}>{'<'}</button>
				<button className="px-3 py-1 rounded border bg-white hover:bg-gray-50" onClick={() => setDate(date.add(1, view === 'week' ? 'week' : 'day'))}>{'>'}</button>
			</div>
			<div className="text-lg font-semibold">{title}</div>
			<div className="flex items-center gap-2">
				<button
					className={`px-3 py-1 rounded border ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
					onClick={() => setView('day')}
				>Day</button>
				<button
					className={`px-3 py-1 rounded border ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
					onClick={() => setView('week')}
				>Week</button>
			</div>
		</div>
	)
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, initialDate, initialView = 'week', onViewChange, onDateChange }) => {
	const [view, setViewState] = useState<ViewMode>(initialView)
	const [currentDate, setCurrentDate] = useState<Dayjs>(initialDate ?? dayjs())

	const setView = (v: ViewMode) => { setViewState(v); onViewChange?.(v) }
	const setDate = (d: Dayjs) => { setCurrentDate(d); onDateChange?.(d) }

	const days = useMemo(() => getVisibleDays(currentDate, view), [currentDate, view])

	const dayHeaders = (
		<div className="grid" style={{ gridTemplateColumns: ` ${TIME_AXIS_WIDTH}px repeat(${days.length}, minmax(0, 1fr))` }}>
			<div className="h-12" />
			{days.map((d) => (
				<div key={d.toString()} className="h-12 border-b border-l flex items-center justify-center bg-gray-50 sticky top-0 z-10">
					<div className="text-center">
						<div className="text-xs uppercase tracking-wide text-gray-500">{d.format('ddd')}</div>
						<div className="text-sm font-semibold">{d.format('MMM D')}</div>
					</div>
				</div>
			))}
		</div>
	)

	return (
		<div className="w-full">
			<Toolbar date={currentDate} view={view} setDate={setDate} setView={setView} />

			{dayHeaders}

			{/* Time grid */}
			<div className="grid" style={{ gridTemplateColumns: ` ${TIME_AXIS_WIDTH}px repeat(${days.length}, minmax(0, 1fr))` }}>
				{/* Time axis */}
				<div className="relative" style={{ height: GRID_HEIGHT }}>
					{Array.from({ length: HOURS_PER_DAY }, (_, h) => (
						<div key={h} className="absolute left-0 right-0" style={{ top: h * HOUR_ROW_PX, height: HOUR_ROW_PX }}>
							<div className="h-px w-full bg-gray-200 translate-y-[-0.5px]" />
							<div className="absolute -top-2 right-2 text-[10px] text-gray-500">{dayjs().hour(h).minute(0).format('ha')}</div>
						</div>
					))}
				</div>

				{/* Day columns */}
				{days.map((day) => {
					const dayEvents = events.filter(e => {
						const s = dayjs(e.startTimestamp)
						const eEnd = e.endTimestamp ? dayjs(e.endTimestamp) : dayjs(e.startTimestamp).add(30, 'minute')
						return overlaps(s, eEnd, day.startOf('day'), day.endOf('day'))
					})

					const laidOut = layoutDayEvents(day, dayEvents)

					return (
						<div key={day.toString()} className="relative border-l" style={{ height: GRID_HEIGHT }}>
							{/* Hour lines */}
							{Array.from({ length: HOURS_PER_DAY }, (_, h) => (
								<div key={h} className="absolute left-0 right-0" style={{ top: h * HOUR_ROW_PX, height: HOUR_ROW_PX }}>
									<div className="h-px w-full bg-gray-200 translate-y-[-0.5px]" />
								</div>
							))}

							{/* Events */}
							{laidOut.map(ev => {
								const widthPct = 100 / ev.colCount
								const leftPct = ev.colIndex * widthPct
								return (
									<div
										key={ev.id}
										className="absolute rounded border bg-blue-50 border-blue-300 overflow-hidden shadow-sm"
										style={{
											top: `${ev.topPct}%`,
											height: `${ev.heightPct}%`,
											left: `${leftPct}%`,
											width: `calc(${widthPct}% - 4px)`, // small gap between columns
										}}
										title={`${ev.title} (${ev.start.format('HH:mm')} - ${ev.end.format('HH:mm')})`}
									>
										<div className="px-2 py-1">
											<div className="text-[11px] font-semibold text-blue-900 truncate">{ev.title}</div>
											<div className="text-[10px] text-blue-800">
												{ev.start.format('HH:mm')} – {ev.end.format('HH:mm')}
											</div>
											{ev.warning && <div className="text-[10px] text-red-600 truncate">{ev.warning}</div>}
										</div>
									</div>
								)
							})}
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default CalendarView

