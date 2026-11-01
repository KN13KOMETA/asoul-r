// Types for weather-js module

export interface IWjsLocation {
  name: string;
  lat: string;
  long: string;
  timezone: string;
  alert: string;
  degreetype: string;
  imagerelativeurl: string;
}

export interface IWjsCurrent {
  temperature: string;
  skycode: string;
  skytext: string;
  date: string;
  observationtime: string;
  observationpoint: string;
  feelslike: string;
  humidity: string;
  winddisplay: string;
  day: string;
  shortday: string;
  windspeed: string;
  imageUrl: string;
}

export interface IWjsForecast {
  low: string;
  high: string;
  skycodeday: string;
  skytextday: string;
  date: string;
  day: string;
  shortday: string;
  precip: string;
}

export interface IWjsOption {
  search: string;
  lang?: string;
  degreeType?: string;
  timeout?: number;
}

export interface IWjsResult {
  location: IWjsLocation;
  current: IWjsCurrent;
  forecast: IWjsForecast[];
}

export interface IWjsModule {
  find: (
    option: IWjsOption,
    callback: (error: Error | null, result: IWjsResult[]) => void,
  ) => void;
}
