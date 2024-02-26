const secondAsMs = 1000;
const minuteAsSeconds = 60;
const minuteAsMs = secondAsMs * minuteAsSeconds;
const hourAsMinutes = 60;
const hourAsMs = minuteAsMs * hourAsMinutes;
const dayAsHours = 24;

function convertMsToHours(durationInMs: number): number {
  return Math.round((durationInMs / hourAsMs) % dayAsHours);
}

export { convertMsToHours };
