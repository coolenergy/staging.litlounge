import moment from 'moment';

export function formatDate(date: Date, format = 'DD/MM/YYYY HH:mm:ss') {
  return moment(date).format(format);
}

export function getDiffToNow(date) {
  return moment(date).fromNow(true);
}

export function formatTime(seconds: number, format: string) {
  const h = Math.floor(seconds / 3600);
  const hours = h < 10 ? `0${h}` : h;
  var remaining1 = seconds % 3600;
  const m = Math.floor(remaining1 / 60);
  const minutes = m < 10 ? `0${m}` : m;
  const remaining2 = remaining1 % 60;
  const remainingSecs = remaining2 < 10 ? `0${remaining2}` : remaining2;
  if(format === 'HH:mm') {
    return `${hours}:${minutes}`;
  }
  return `${hours}:${minutes}:${remainingSecs}`;
}

export function convertMiliSecsToSecs(miliSeconds: number) {
  const seconds = Math.floor(miliSeconds / 1000);
  const h = Math.floor(seconds / 3600);
  const hours = h < 10 ? `0${h}` : h;
  var remaining1 = seconds % 3600;
  const m = Math.floor(remaining1 / 60);
  const minutes = m < 10 ? `0${m}` : m;
  const remaining2 = remaining1 % 60;
  const remainingSecs = remaining2 < 10 ? `0${remaining2}` : remaining2;
  return `${hours}:${minutes}:${remainingSecs}`;
}