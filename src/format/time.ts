// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export enum SplitTimeTop {
  Days = 4,
  Hours = 3,
  Minutes = 2,
  Seconds = 1,
  Milliseconds = 0,
}

interface SplitTimeFields {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export type SplitTime =
  | ({
      top: SplitTimeTop.Days;
    } & SplitTimeFields)
  | ({
      top: SplitTimeTop.Hours;
    } & Omit<SplitTimeFields, "days">)
  | ({
      top: SplitTimeTop.Minutes;
    } & Omit<SplitTimeFields, "days" | "hours">)
  | ({ top: SplitTimeTop.Seconds } & Omit<
      SplitTimeFields,
      "days" | "hours" | "minutes"
    >)
  | ({ top: SplitTimeTop.Milliseconds } & Omit<
      SplitTimeFields,
      "days" | "hours" | "minutes" | "seconds"
    >);

// TODO: validate time
export const getSplitTime = (t: number, top: SplitTimeTop): SplitTime => {
  let milliseconds = t;

  if (top >= SplitTimeTop.Seconds) {
    let seconds = Math.floor(milliseconds / 1000);
    milliseconds = milliseconds % 1000;

    if (top >= SplitTimeTop.Minutes) {
      let minutes = Math.floor(seconds / 60);
      seconds = seconds % 60;

      if (top >= SplitTimeTop.Hours) {
        let hours = Math.floor(minutes / 60);
        minutes = minutes % 60;

        if (top >= SplitTimeTop.Days) {
          const days = Math.floor(hours / 24);
          hours = hours % 24;

          return {
            top: SplitTimeTop.Days,
            milliseconds,
            seconds,
            minutes,
            hours,
            days,
          };
        }

        return {
          top: SplitTimeTop.Hours,
          milliseconds,
          seconds,
          minutes,
          hours,
        };
      }

      return { top: SplitTimeTop.Minutes, milliseconds, seconds, minutes };
    }

    return { top: SplitTimeTop.Seconds, milliseconds, seconds };
  }

  return { top: SplitTimeTop.Milliseconds, milliseconds };
};
