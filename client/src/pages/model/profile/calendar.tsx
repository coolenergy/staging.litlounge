import { clsx } from "clsx";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import { ModelSchedule, ModelScheduleDay } from "~/utils/api";
import PageContext from "../page-context";

type WeekDayKey = keyof ModelSchedule;

const weekDayKeys: WeekDayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const weekDays: Record<WeekDayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
} as const;

function isScheduleDaySetup({ start, end, closed }: ModelScheduleDay) {
  return start && end && !closed;
}

function isScheduleSetUp(schedule: ModelSchedule | undefined): schedule is ModelSchedule {
  if (schedule == null) {
    return false;
  }
  for (const weekDayKey of weekDayKeys) {
    const scheduleDay = schedule[weekDayKey];
    if (isScheduleDaySetup(scheduleDay)) {
      return true;
    }
  }
  return false;
}

const className = {
  cell: "px-2 py-1",
};

function Calendar() {
  const page = useContextOrThrow(PageContext);
  const schedule = page.model?.schedule;
  return (
    <div className={clsx("flex grow flex-col", "use-no-scrollbar overflow-scroll")}>
      <div className={clsx("hidden xl:flex", "h-8 items-center")}>
        <span className="font-bold">Calendar</span>
      </div>
      <div className="m-6 xl:m-0 xl:mt-2">
        {!isScheduleSetUp(schedule) ? (
          <div className="flex items-center justify-center">
            Ask the streamer to setup their calendar!
          </div>
        ) : (
          <div
            className={clsx(
              "flex gap-2 font-medium",
              "rounded-10 border-2 border-my-purple xl:border-none"
            )}
          >
            <div
              className={clsx("grow rounded-10 py-1 pl-2 pr-4", "bg-transparent xl:bg-my-purple")}
            >
              {weekDayKeys.map((weekDayKey) => {
                if (!isScheduleDaySetup(schedule[weekDayKey])) {
                  return null;
                }
                return (
                  <div
                    key={weekDayKey}
                    className={clsx(className.cell, "uppercase text-my-purple xl:text-white")}
                  >
                    <>
                      <span className="hidden xl:inline">{weekDayKey}</span>
                      <span className="inline xl:hidden">{weekDays[weekDayKey]}</span>
                    </>
                  </div>
                );
              })}
            </div>
            <div className={clsx("grow rounded-10 py-1 pl-1 pr-2", "bg-transparent xl:bg-my-dark")}>
              {weekDayKeys.map((weekDayKey) => {
                const scheduleDay = schedule[weekDayKey];
                if (!isScheduleDaySetup(schedule[weekDayKey])) {
                  return null;
                }
                return (
                  <div key={weekDayKey} className={className.cell}>
                    {(() => {
                      const { start, end } = scheduleDay;
                      return `${start} - ${end}`;
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;
