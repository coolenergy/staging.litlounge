export class Event {
  channel: string;

  eventName?: string;

  data: any;

  priority?: number;

  constructor(data: Event) {
    Object.assign(this, data);
  }
}
