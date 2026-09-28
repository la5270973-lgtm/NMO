/**
 * NMO | نمو — Child Growth Application
 * ZScoreEngine (Deterministic WHO LMS & Restricted SD Engine)
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import { IndicatorType } from '../types/growth.ts';

export interface LMSParameters {
  L: number; // Box-Cox power transformation parameter (skewness)
  M: number; // Median parameter
  S: number; // Coefficient of variation parameter
}

export interface ZScoreCalculationOutput {
  zScoreRaw: number;
  zScore: number; // Official WHO adjusted Z-score
  zScoreDisplayed: string;
  percentileRaw: number;
  percentile: number;
  percentileDisplayed: string;
  extremeAdjustmentApplied: boolean;
  methodologyNotes: string;
}

export class ZScoreEngine {
  /**
   * Calculates raw LMS Z-score using official WHO formula:
   * If L != 0: Z = (((measurement / M)^L) - 1) / (L * S)
   * If L == 0: Z = ln(measurement / M) / S
   */
  public static calculateRawLMS(measurement: number, lms: LMSParameters): number {
    const { L, M, S } = lms;

    if (measurement <= 0 || M <= 0 || S <= 0) {
      throw new Error(`INVALID_MEASUREMENT: Invalid measurement (${measurement}) or median (${M}) / CV (${S}).`);
    }

    if (Math.abs(L) < 1e-7) {
      return Math.log(measurement / M) / S;
    } else {
      return (Math.pow(measurement / M, L) - 1.0) / (L * S);
    }
  }

  /**
   * Applies WHO Anthro restricted standard deviation adjustment for extreme values.
   * 
   * WHO Child Growth Standards Methodology:
   * For indicators with skewed distributions (Weight-for-age, Weight-for-length/height, BMI-for-age),
   * applying pure LMS beyond +/- 3 SD can produce distortions due to extreme power scaling.
   * WHO applies a linear distance scaling beyond +/- 3 SD using the standard deviation distance
   * between SD2 and SD3.
   * 
   * When raw Z > 3:
   *   SD3pos = M * (1 + L * S * 3)^(1/L)
   *   SD2pos = M * (1 + L * S * 2)^(1/L)
   *   SD23pos = SD3pos - SD2pos
   *   Z_adj = 3 + (measurement - SD3pos) / SD23pos
   * 
   * When raw Z < -3:
   *   SD3neg = M * (1 + L * S * (-3))^(1/L)
   *   SD2neg = M * (1 + L * S * (-2))^(1/L)
   *   SD23neg = SD2neg - SD3neg
   *   Z_adj = -3 + (measurement - SD3neg) / SD23neg
   */
  public static calculateWHOZScore(
    measurement: number,
    lms: LMSParameters,
    indicator: IndicatorType
  ): { zScore: number; zScoreRaw: number; extremeAdjustmentApplied: boolean; notes: string } {
    const zScoreRaw = this.calculateRawLMS(measurement, lms);

    // Normally distributed indicators (L = 1) do not require skewness correction:
    const isNormalIndicator =
      indicator === 'LENGTH_FOR_AGE' ||
      indicator === 'HEIGHT_FOR_AGE' ||
      indicator === 'LENGTH_HEIGHT_FOR_AGE' ||
      indicator === 'HEAD_CIRCUMFERENCE_FOR_AGE';

    if (isNormalIndicator || Math.abs(zScoreRaw) <= 3.0) {
      return {
        zScore: zScoreRaw,
        zScoreRaw,
        extremeAdjustmentApplied: false,
        notes: isNormalIndicator
          ? 'Standard Gaussian distribution (L=1.0); pure LMS applied.'
          : 'Standard LMS Z-score within official [-3, +3] SD range.',
      };
    }

    const { L, M, S } = lms;

    if (zScoreRaw > 3.0) {
      const sd3pos = M * Math.pow(1.0 + L * S * 3.0, 1.0 / L);
      const sd2pos = M * Math.pow(1.0 + L * S * 2.0, 1.0 / L);
      const sd23pos = sd3pos - sd2pos;
      const zAdjusted = 3.0 + (measurement - sd3pos) / sd23pos;

      return {
        zScore: zAdjusted,
        zScoreRaw,
        extremeAdjustmentApplied: true,
        notes: `Raw Z-score (${zScoreRaw.toFixed(2)}) exceeded +3 SD. Official WHO Anthro restricted SD adjustment applied.`,
      };
    } else {
      // zScoreRaw < -3.0
      const sd3neg = M * Math.pow(1.0 + L * S * (-3.0), 1.0 / L);
      const sd2neg = M * Math.pow(1.0 + L * S * (-2.0), 1.0 / L);
      const sd23neg = sd2neg - sd3neg;
      const zAdjusted = -3.0 + (measurement - sd3neg) / sd23neg;

      return {
        zScore: zAdjusted,
        zScoreRaw,
        extremeAdjustmentApplied: true,
        notes: `Raw Z-score (${zScoreRaw.toFixed(2)}) fell below -3 SD. Official WHO Anthro restricted SD adjustment applied.`,
      };
    }
  }

  /**
   * High-precision Error Function (erf) approximation (Abramowitz & Stegun formula 7.1.26).
   * Absolute error < 1.5 * 10^-7 across entire real line.
   */
  public static erf(x: number): number {
    const sign = x >= 0 ? 1 : -1;
    const absX = Math.abs(x);

    // Constants
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX);

    return sign * y;
  }

  /**
   * Converts Z-score to standard normal cumulative probability Phi(Z).
   * Range: 0 to 1.
   */
  public static standardNormalCDF(z: number): number {
    return 0.5 * (1.0 + this.erf(z / Math.SQRT2));
  }

  /**
   * Converts Z-score to percentile (0 to 100) and formats safely.
   */
  public static zScoreToPercentile(zScore: number): { percentileRaw: number; percentile: number; percentileDisplayed: string } {
    const cdf = this.standardNormalCDF(zScore);
    const percentileRaw = cdf * 100.0;
    const percentile = Number(percentileRaw.toFixed(2));

    let percentileDisplayed: string;
    if (percentileRaw < 0.1) {
      percentileDisplayed = '<0.1st';
    } else if (percentileRaw > 99.9) {
      percentileDisplayed = '>99.9th';
    } else {
      const rounded = Number(percentileRaw.toFixed(1));
      const lastDigit = Math.floor(rounded) % 10;
      const lastTwo = Math.floor(rounded) % 100;
      let suffix = 'th';
      if (lastTwo < 11 || lastTwo > 13) {
        if (lastDigit === 1) suffix = 'st';
        else if (lastDigit === 2) suffix = 'nd';
        else if (lastDigit === 3) suffix = 'rd';
      }
      percentileDisplayed = `${rounded}${suffix}`;
    }

    return { percentileRaw, percentile, percentileDisplayed };
  }

  /**
   * Full execution pipeline for a measurement given LMS parameters.
   */
  public static calculate(
    measurement: number,
    lms: LMSParameters,
    indicator: IndicatorType
  ): ZScoreCalculationOutput {
    const { zScore, zScoreRaw, extremeAdjustmentApplied, notes } = this.calculateWHOZScore(measurement, lms, indicator);
    const { percentileRaw, percentile, percentileDisplayed } = this.zScoreToPercentile(zScore);

    return {
      zScoreRaw: Number(zScoreRaw.toFixed(4)),
      zScore: Number(zScore.toFixed(4)),
      zScoreDisplayed: (zScore >= 0 ? '+' : '') + zScore.toFixed(2),
      percentileRaw: Number(percentileRaw.toFixed(4)),
      percentile,
      percentileDisplayed,
      extremeAdjustmentApplied,
      methodologyNotes: notes,
    };
  }
}
