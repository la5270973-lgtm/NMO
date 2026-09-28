/**
 * NMO | نمو — Child Growth Application
 * AgeCalculator Engine (Deterministic)
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import { AgeCalculationResult } from '../types/growth.ts';

export class AgeCalculatorError extends Error {
  constructor(public code: 'INVALID_DATE' | 'INVALID_MEASUREMENT_DATE', message: string) {
    super(message);
    this.name = 'AgeCalculatorError';
  }
}

export class AgeCalculator {
  /**
   * Parses and normalizes input to UTC year, month (0-indexed), date (1-indexed).
   */
  private static parseDateUTC(input: string | Date): { year: number; month: number; day: number; timestamp: number } {
    let dateObj: Date;
    if (typeof input === 'string') {
      const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const y = parseInt(match[1], 10);
        const m = parseInt(match[2], 10) - 1;
        const d = parseInt(match[3], 10);
        dateObj = new Date(Date.UTC(y, m, d));
      } else {
        dateObj = new Date(input);
      }
    } else {
      dateObj = new Date(input.getTime());
    }

    if (isNaN(dateObj.getTime())) {
      throw new AgeCalculatorError('INVALID_DATE', `Invalid date format provided: ${String(input)}`);
    }

    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth();
    const day = dateObj.getUTCDate();
    const timestamp = Date.UTC(year, month, day);

    return { year, month, day, timestamp };
  }

  /**
   * Checks if a year is a leap year according to the Gregorian calendar rules.
   */
  public static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Returns the exact number of days in a given month of a given year (1-indexed month: 1=Jan, 2=Feb, etc.)
   */
  public static getDaysInMonth(year: number, monthIndex: number): number {
    return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  }

  /**
   * Calculates exact chronological age between Date of Birth and Measurement Date.
   */
  public static calculate(
    dateOfBirth: string | Date,
    measurementDate: string | Date = new Date()
  ): AgeCalculationResult {
    const birth = this.parseDateUTC(dateOfBirth);
    const measure = this.parseDateUTC(measurementDate);

    // Reject measurement dates before birth
    if (measure.timestamp < birth.timestamp) {
      throw new AgeCalculatorError(
        'INVALID_MEASUREMENT_DATE',
        `Measurement date (${new Date(measure.timestamp).toISOString().slice(0, 10)}) cannot precede date of birth (${new Date(birth.timestamp).toISOString().slice(0, 10)}).`
      );
    }

    // Exact difference in integer days
    const diffMs = measure.timestamp - birth.timestamp;
    const ageInDays = Math.round(diffMs / 86400000);

    // Calculate calendar breakdown: completed years, completed months, remaining days
    let years = measure.year - birth.year;
    let months = measure.month - birth.month;
    let days = measure.day - birth.day;

    if (days < 0) {
      months -= 1;
      // Get number of days in the month preceding the measurement month
      const prevMonthDays = this.getDaysInMonth(measure.year, measure.month - 1);
      days += prevMonthDays;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const completedYears = years;
    const completedMonths = months;
    const remainingDays = days;
    const totalCompletedMonths = completedYears * 12 + completedMonths;

    // Fractional month based on days in the current measurement month cycle
    const currentMonthDays = this.getDaysInMonth(measure.year, measure.month);
    const ageInMonths = Number((totalCompletedMonths + (remainingDays / currentMonthDays)).toFixed(4));
    const ageInYears = Number((ageInDays / 365.2425).toFixed(4));

    // Child born in leap year
    const isLeapYearChild = this.isLeapYear(birth.year);

    // Human-readable formatted string
    let formattedAge = '';
    if (completedYears > 0) {
      formattedAge += `${completedYears} y `;
    }
    if (completedMonths > 0 || completedYears > 0) {
      formattedAge += `${completedMonths} m `;
    }
    formattedAge += `${remainingDays} d (${ageInDays} days total)`;

    return {
      ageInDays,
      ageInMonths,
      ageInYears,
      completedYears,
      completedMonths,
      remainingDays,
      totalCompletedMonths,
      formattedAge: formattedAge.trim(),
      isLeapYearChild,
      birthDateISO: new Date(birth.timestamp).toISOString().slice(0, 10),
      measurementDateISO: new Date(measure.timestamp).toISOString().slice(0, 10),
    };
  }
}
