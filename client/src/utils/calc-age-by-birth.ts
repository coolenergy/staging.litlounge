const avgYearInDays = 365.25; // taking leap years into account
const yearInMs = avgYearInDays * 24 * 60 * 60 * 1000;

function calcAgeByBirth(input: Date | string): number;
function calcAgeByBirth(input: Date | string | null): number | null;
function calcAgeByBirth(input: Date | string | undefined): number | undefined;
function calcAgeByBirth(input: Date | string | null | undefined) {
  if (input == null) {
    return input;
  }
  const date = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / yearInMs);
}

export { calcAgeByBirth };
