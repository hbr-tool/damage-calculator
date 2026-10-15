
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { calendarData } from "data/calendarData.js";

const DAYS_BEFORE_TODAY = 3;
const DISPLAY_DAYS = 15;
const SHIFT_DAYS = 14;

const DAY_WIDTH = 44;
const LABEL_WIDTH = 148;
const MOBILE_LABEL_WIDTH = 88;
const LANE_HEIGHT = 38;

const CONTINUATION_WIDTH = 80;
const TIMELINE_WIDTH = DISPLAY_DAYS * DAY_WIDTH;
const EXTENDED_TIMELINE_WIDTH = TIMELINE_WIDTH + CONTINUATION_WIDTH;

const WEEKDAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString) {
    const date = parseDate(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function parseDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function assignEventLanes(events, rangeStart, rangeEnd) {
    const sortedEvents = events
        .filter(event => event.startDate && event.endDate)
        .filter(event => event.startDate <= event.endDate)
        .filter(event => {
            const startDate = event.startDate.slice(0, 10);
            const endDate = event.endDate.slice(0, 10);

            return startDate <= rangeEnd && endDate >= rangeStart;
        })
        .map(event => ({
            ...event,
            visibleStart: event.startDate.slice(0, 10) < rangeStart
                ? rangeStart
                : event.startDate.slice(0, 10),
            visibleEnd: event.endDate.slice(0, 10) > rangeEnd
                ? rangeEnd
                : event.endDate.slice(0, 10),
        }))
        .sort((a, b) =>
            a.startDate.localeCompare(b.startDate) ||
            a.endDate.localeCompare(b.endDate) ||
            a.eventId - b.eventId
        );

    const laneEndTimes = [];

    return sortedEvents.map(event => {
        const laneIndex = laneEndTimes.findIndex(
            endTime => endTime <= event.startDate
        );

        if (laneIndex === -1) {
            laneEndTimes.push(event.endDate);
            return {
                ...event,
                laneIndex: laneEndTimes.length - 1,
            };
        }

        laneEndTimes[laneIndex] = event.endDate;

        return {
            ...event,
            laneIndex,
        };
    });
}

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

function getEventBarPosition(event, rangeStart, rangeEnd, dayWidth) {
    const rangeStartTime = parseDate(rangeStart).getTime();
    const rangeEndTime = addDays(parseDate(rangeEnd), 1).getTime();

    const eventStartTime = new Date(event.startDate).getTime();

    // 分単位の終了時刻を、終了分の終わりとして扱う
    const eventEndTime = new Date(event.endDate).getTime() + MINUTE_MS;

    // 表示期間の外側にはみ出さないようにする
    const visibleStartTime = Math.max(eventStartTime, rangeStartTime);
    const visibleEndTime = Math.min(eventEndTime, rangeEndTime);

    return {
        left:
            ((visibleStartTime - rangeStartTime) / DAY_MS) * dayWidth,
        width:
            ((visibleEndTime - visibleStartTime) / DAY_MS) * dayWidth,
    };
}

function formatEventDateTime(dateTimeString) {
    const date = new Date(dateTimeString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const weekday = ["日", "月", "火", "水", "木", "金", "土"][
        date.getDay()
    ];

    return `${year}/${month}/${day}（${weekday}）${hours}:${minutes}`;
}

function getDaysBetween(startDateString, endDateString) {
    const [startYear, startMonth, startDay] =
        startDateString.split("-").map(Number);
    const [endYear, endMonth, endDay] =
        endDateString.split("-").map(Number);

    const startTime = Date.UTC(startYear, startMonth - 1, startDay);
    const endTime = Date.UTC(endYear, endMonth - 1, endDay);

    return Math.round((endTime - startTime) / (24 * 60 * 60 * 1000));
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(
        () => window.matchMedia("(max-width: 639px)").matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 639px)");
        const updateIsMobile = event => setIsMobile(event.matches);

        mediaQuery.addEventListener("change", updateIsMobile);

        return () => {
            mediaQuery.removeEventListener("change", updateIsMobile);
        };
    }, []);

    return isMobile;
}

function Calendar() {
    const [rangeStart, setRangeStart] = useState(() =>
        addDays(new Date(), -DAYS_BEFORE_TODAY)
    );
    const [hoveredEvent, setHoveredEvent] = useState(null);
    const [popoverPosition, setPopoverPosition] = useState(null);

    const [currentTime, setCurrentTime] = useState(() => new Date());

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setCurrentTime(new Date());
        }, 60 * 1000);

        return () => window.clearInterval(timerId);
    }, []);

    const todayString = formatDate(currentTime);

    const currentTimeMinutes =
        currentTime.getHours() * 60 + currentTime.getMinutes();

    const currentTimeOffset =
        (currentTimeMinutes / (24 * 60)) * DAY_WIDTH;
    const rangeStartString = formatDate(rangeStart);
    const rangeEnd = addDays(rangeStart, DISPLAY_DAYS - 1);
    const rangeEndString = formatDate(rangeEnd);

    const dates = Array.from(
        { length: DISPLAY_DAYS },
        (_, index) => formatDate(addDays(rangeStart, index))
    );

    const isMobile = useIsMobile();
    const labelWidth = isMobile ? MOBILE_LABEL_WIDTH : LABEL_WIDTH;

    const shiftRange = days => {
        setRangeStart(current => addDays(current, days));
    };

    const showEventPopover = (event, categoryColor, element) => {
        const rect = element.getBoundingClientRect();

        const popoverWidth = 288;
        const popoverHeight = 120;
        const margin = 8;

        const left = Math.max(
            margin,
            Math.min(rect.left, window.innerWidth - popoverWidth - margin)
        );

        const showAbove =
            rect.bottom + popoverHeight + margin > window.innerHeight;

        const top = showAbove
            ? Math.max(margin, rect.top - popoverHeight - margin)
            : rect.bottom + margin;

        setHoveredEvent({ ...event, categoryColor });
        setPopoverPosition({ left, top });
    };
    return (
        <div className="w-full max-w-[900px] overflow-x-auto rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm">
            <div className="min-w-max">
                {/* 上部操作エリア */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                            <span className="text-lg">▦</span>
                        </div>

                        <div>
                            <h2 className="text-base font-bold tracking-wide">
                                イベントカレンダー
                            </h2>
                            <p className="text-xs text-slate-500">
                                {DISPLAY_DAYS}日間のイベント一覧
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => shiftRange(-SHIFT_DAYS)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            ◀
                        </button>

                        <div className="mr-1 text-right">
                            <p className="text-xs text-slate-500">
                                表示期間
                            </p>
                            <p className="whitespace-nowrap text-sm font-semibold tabular-nums">
                                {formatDisplayDate(rangeStartString)}
                                {" ～ "}
                                {formatDisplayDate(rangeEndString)}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => shiftRange(SHIFT_DAYS)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            ▶
                        </button>
                    </div>
                </div>

                {/* 日付ヘッダー */}
                <div className="flex border-b border-slate-200 bg-slate-50">
                    <div
                        className="sticky left-0 z-20 flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold tracking-wider text-slate-500"
                        style={{ width: labelWidth }}
                    >
                        CATEGORY
                    </div>

                    <div
                        className="grid"
                        style={{
                            gridTemplateColumns: `repeat(${DISPLAY_DAYS}, ${DAY_WIDTH}px)`,
                        }}
                    >
                        {dates.map(date => {
                            const parsedDate = parseDate(date);
                            const dayOfWeek = parsedDate.getDay();
                            const isToday = date === todayString;
                            const isFirstOfMonth = parsedDate.getDate() === 1;

                            return (
                                <div
                                    key={date}
                                    className={[
                                        "flex flex-col items-center justify-center border-r border-slate-200 py-2",
                                        isToday ? "bg-blue-100" : "",
                                        !isToday && dayOfWeek === 0 ? "bg-red-50/70" : "",
                                        !isToday && dayOfWeek === 6 ? "bg-blue-50/70" : "",
                                        isFirstOfMonth ? "border-l-2 border-l-slate-400" : "",
                                    ].join(" ")}
                                    style={{ width: DAY_WIDTH }}
                                >
                                    <span className="text-[10px] leading-4 text-slate-500">
                                        {parsedDate.getMonth() + 1}月
                                    </span>

                                    <span
                                        className={[
                                            "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                                            isToday
                                                ? "bg-blue-600 text-white"
                                                : dayOfWeek === 0
                                                    ? "text-red-600"
                                                    : dayOfWeek === 6
                                                        ? "text-blue-600"
                                                        : "text-slate-700",
                                        ].join(" ")}
                                    >
                                        {parsedDate.getDate()}
                                    </span>

                                    <span
                                        className={[
                                            "text-[10px]",
                                            dayOfWeek === 0
                                                ? "text-red-600"
                                                : dayOfWeek === 6
                                                    ? "text-blue-600"
                                                    : "text-slate-500",
                                        ].join(" ")}
                                    >
                                        {WEEKDAY_NAMES[dayOfWeek]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* カテゴリ・イベント */}
                {calendarData.map(category => {
                    const events = assignEventLanes(
                        category.events ?? [],
                        rangeStartString,
                        rangeEndString
                    );

                    const laneCount = events.length === 0
                        ? 1
                        : Math.max(...events.map(event => event.laneIndex + 1));

                    const categoryHeight = laneCount * LANE_HEIGHT;
                    const todayIndex = dates.indexOf(todayString);
                    const categoryColor = category.color || "#64748b";

                    return (
                        <div
                            key={category.categoryId}
                            className="flex border-b border-slate-200 last:border-b-0"
                        >
                            {/* カテゴリ名 */}
                            <div
                                className="sticky left-0 z-10 flex shrink-0 items-center gap-2 border-r border-slate-200 bg-white px-3 py-2"
                                style={{
                                    width: labelWidth,
                                    minHeight: categoryHeight,
                                    borderLeft: `4px solid ${categoryColor}`,
                                }}
                            >
                                <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: categoryColor }}
                                />

                                <span className="text-sm font-semibold leading-5">
                                    {category.categoryName}
                                </span>
                            </div>

                            {/* 日付・イベント表示領域 */}
                            <div
                                className="relative"
                                style={{
                                    width: EXTENDED_TIMELINE_WIDTH,
                                    minHeight: categoryHeight,
                                }}
                            >
                                {/* 日付ごとの背景 */}
                                {dates.map((date, index) => {
                                    const dayOfWeek = parseDate(date).getDay();
                                    const isToday = date === todayString;
                                    const isFirstOfMonth =
                                        parseDate(date).getDate() === 1;

                                    return (
                                        <div
                                            key={date}
                                            className={[
                                                "pointer-events-none absolute inset-y-0 border-r border-slate-100",
                                                isToday ? "bg-blue-50" : "",
                                                !isToday && dayOfWeek === 0 ? "bg-red-50/40" : "",
                                                !isToday && dayOfWeek === 6 ? "bg-blue-50/40" : "",
                                                isFirstOfMonth ? "border-l-2 border-l-slate-300" : "",
                                            ].join(" ")}
                                            style={{
                                                left: index * DAY_WIDTH,
                                                width: DAY_WIDTH,
                                            }}
                                        />
                                    );
                                })}

                                {/* 現在時刻の縦ライン */}
                                {todayIndex >= 0 && (
                                    <div
                                        className="pointer-events-none absolute inset-y-0 z-[5] border-l-2"
                                        style={{
                                            left: todayIndex * DAY_WIDTH + currentTimeOffset,
                                            borderColor: "#8B7AB8",
                                        }}
                                    />
                                )}

                                {/* イベントバー */}

                                {events.map(event => {
                                    const barPosition = getEventBarPosition(
                                        event,
                                        rangeStartString,
                                        rangeEndString,
                                        DAY_WIDTH
                                    );

                                    const categoryColor = category.color || "#64748b";
                                    const isHovered = hoveredEvent?.eventId === event.eventId;

                                    const continuesBeyondRange =
                                        event.endDate.slice(0, 10) > rangeEndString;

                                    const remainingDays = continuesBeyondRange
                                        ? getDaysBetween(rangeEndString, event.endDate.slice(0, 10))
                                        : 0;

                                    const visibleBarWidth = Math.max(0, barPosition.width - 4);

                                    const totalBarWidth = visibleBarWidth +
                                        (continuesBeyondRange ? CONTINUATION_WIDTH : 0);

                                    return (
                                        <div
                                            key={event.eventId}
                                            className="absolute"
                                            onMouseEnter={e =>
                                                showEventPopover(event, categoryColor, e.currentTarget)
                                            }
                                            onMouseLeave={() => {
                                                setHoveredEvent(null);
                                                setPopoverPosition(null);
                                            }}
                                            style={{
                                                top: event.laneIndex * LANE_HEIGHT + 4,
                                                left: barPosition.left + 2,
                                                width: totalBarWidth,
                                                height: LANE_HEIGHT - 8,
                                                zIndex: isHovered ? 50 : 2,
                                            }}
                                        >
                                            <div
                                                className="relative flex h-full w-full items-center overflow-hidden rounded-md border text-xs font-semibold shadow-sm transition hover:brightness-95"
                                                style={{
                                                    color: "#1e293b",
                                                    backgroundColor: `${categoryColor}22`,
                                                    borderColor: `${categoryColor}99`,
                                                    borderLeftWidth: 4,
                                                    boxSizing: "border-box",
                                                }}
                                            >
                                                <span
                                                    className="min-w-0 truncate px-2"
                                                    style={{
                                                        width: continuesBeyondRange
                                                            ? `calc(100% - ${CONTINUATION_WIDTH}px)`
                                                            : "100%",
                                                    }}
                                                >
                                                    {event.icon ? `${event.icon} ` : ""}
                                                    {event.eventName}
                                                </span>

                                                {continuesBeyondRange && (
                                                    <span
                                                        className="absolute inset-y-0 right-0 flex items-center justify-center whitespace-nowrap border-l border-dashed px-2 font-medium"
                                                        style={{
                                                            width: CONTINUATION_WIDTH,
                                                            boxSizing: "border-box",
                                                            borderColor: `${categoryColor}99`,
                                                            backgroundColor: `${categoryColor}18`,
                                                        }}
                                                    >
                                                        あと{remainingDays}日 →
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div
                                    className="absolute inset-y-0 border-l border-dashed border-slate-300 bg-slate-50/70"
                                    style={{
                                        left: TIMELINE_WIDTH,
                                        width: CONTINUATION_WIDTH,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            {hoveredEvent && popoverPosition &&
                createPortal(
                    <div
                        className="pointer-events-none fixed z-[9999] w-72 rounded-lg border border-slate-200 bg-white p-3 text-slate-800 shadow-xl"
                        style={{
                            left: popoverPosition.left,
                            top: popoverPosition.top,
                        }}
                    >
                        <div className="mb-2 flex items-start gap-2">
                            <span
                                className="mt-1 h-3 w-1 shrink-0 rounded-full"
                                style={{
                                    backgroundColor: hoveredEvent.categoryColor,
                                }}
                            />
                            <div className="min-w-0 font-semibold">
                                {hoveredEvent.eventName}
                            </div>
                        </div>

                        <div className="mb-1 text-xs text-slate-500">
                            開催期間
                        </div>

                        <div className="space-y-1 text-sm">
                            <div>
                                {formatEventDateTime(hoveredEvent.startDate)}
                            </div>
                            <div className="text-slate-500">
                                〜 {formatEventDateTime(hoveredEvent.endDate)}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}

export default Calendar;
