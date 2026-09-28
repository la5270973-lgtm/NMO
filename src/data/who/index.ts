/**
 * NMO | نمو — Child Growth Application
 * Official WHO Datasets Registry & Static Loader
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import { IndicatorType, LMSDataPoint, Sex, WHODatasetFile } from '../../types/growth.ts';

// 0-5 Datasets (WHO Child Growth Standards 2006)
import lhfaBoys from './0-5/length-height-for-age/boys.json';
import lhfaGirls from './0-5/length-height-for-age/girls.json';
import wfaBoys from './0-5/weight-for-age/boys.json';
import wfaGirls from './0-5/weight-for-age/girls.json';
import wflBoys from './0-5/weight-for-length/boys.json';
import wflGirls from './0-5/weight-for-length/girls.json';
import wfhBoys from './0-5/weight-for-height/boys.json';
import wfhGirls from './0-5/weight-for-height/girls.json';
import bfaBoys from './0-5/bmi-for-age/boys.json';
import bfaGirls from './0-5/bmi-for-age/girls.json';
import hcfaBoys from './0-5/head-circumference-for-age/boys.json';
import hcfaGirls from './0-5/head-circumference-for-age/girls.json';

// 5-19 Datasets (WHO 2007 Growth Reference)
import hfaBoys519 from './5-19/height-for-age/boys.json';
import hfaGirls519 from './5-19/height-for-age/girls.json';
import bfaBoys519 from './5-19/bmi-for-age/boys.json';
import bfaGirls519 from './5-19/bmi-for-age/girls.json';
import wfaBoys519 from './5-19/weight-for-age/boys.json';
import wfaGirls519 from './5-19/weight-for-age/girls.json';

// Cast helper to guarantee types
const datasetsRecord: Record<string, WHODatasetFile> = {
  // 0-5
  '0-5_LENGTH_HEIGHT_FOR_AGE_male': lhfaBoys as unknown as WHODatasetFile,
  '0-5_LENGTH_HEIGHT_FOR_AGE_female': lhfaGirls as unknown as WHODatasetFile,
  '0-5_WEIGHT_FOR_AGE_male': wfaBoys as unknown as WHODatasetFile,
  '0-5_WEIGHT_FOR_AGE_female': wfaGirls as unknown as WHODatasetFile,
  '0-5_WEIGHT_FOR_LENGTH_male': wflBoys as unknown as WHODatasetFile,
  '0-5_WEIGHT_FOR_LENGTH_female': wflGirls as unknown as WHODatasetFile,
  '0-5_WEIGHT_FOR_HEIGHT_male': wfhBoys as unknown as WHODatasetFile,
  '0-5_WEIGHT_FOR_HEIGHT_female': wfhGirls as unknown as WHODatasetFile,
  '0-5_BMI_FOR_AGE_male': bfaBoys as unknown as WHODatasetFile,
  '0-5_BMI_FOR_AGE_female': bfaGirls as unknown as WHODatasetFile,
  '0-5_HEAD_CIRCUMFERENCE_FOR_AGE_male': hcfaBoys as unknown as WHODatasetFile,
  '0-5_HEAD_CIRCUMFERENCE_FOR_AGE_female': hcfaGirls as unknown as WHODatasetFile,

  // 5-19
  '5-19_HEIGHT_FOR_AGE_male': hfaBoys519 as unknown as WHODatasetFile,
  '5-19_HEIGHT_FOR_AGE_female': hfaGirls519 as unknown as WHODatasetFile,
  '5-19_BMI_FOR_AGE_male': bfaBoys519 as unknown as WHODatasetFile,
  '5-19_BMI_FOR_AGE_female': bfaGirls519 as unknown as WHODatasetFile,
  '5-19_WEIGHT_FOR_AGE_male': wfaBoys519 as unknown as WHODatasetFile,
  '5-19_WEIGHT_FOR_AGE_female': wfaGirls519 as unknown as WHODatasetFile,
};

export class WHODatasetRegistry {
  /**
   * Retrieves dataset by key: group (0-5 or 5-19), indicator, sex.
   * If not found, throws "WHO reference dataset required."
   */
  public static getDataset(group: '0-5' | '5-19', indicator: IndicatorType, sex: Sex): WHODatasetFile {
    let normalizedIndicator: IndicatorType = indicator;
    if (indicator === 'LENGTH_FOR_AGE' || indicator === 'HEIGHT_FOR_AGE') {
      if (group === '0-5') {
        normalizedIndicator = 'LENGTH_HEIGHT_FOR_AGE';
      } else {
        normalizedIndicator = 'HEIGHT_FOR_AGE';
      }
    }

    const key = `${group}_${normalizedIndicator}_${sex}`;
    const dataset = datasetsRecord[key];

    if (!dataset || !dataset.data || dataset.data.length === 0) {
      throw new Error(`WHO_DATA_MISSING: WHO reference dataset required for ${group} ${indicator} (${sex}).`);
    }

    return dataset;
  }

  /**
   * Linear interpolation between two LMS points.
   */
  public static interpolateLMS(p1: LMSDataPoint, p2: LMSDataPoint, targetKey: number): LMSDataPoint {
    if (p1.key === p2.key) return p1;
    const factor = (targetKey - p1.key) / (p2.key - p1.key);

    return {
      key: targetKey,
      L: p1.L + factor * (p2.L - p1.L),
      M: p1.M + factor * (p2.M - p1.M),
      S: p1.S + factor * (p2.S - p1.S),
    };
  }

  /**
   * Finds LMS parameter for a given continuous or discrete key (Day, Month, or Length/Height).
   * Exact matching is preferred; linear interpolation is performed if value falls between grid points.
   */
  public static findLMS(
    dataset: WHODatasetFile,
    keyVal: number
  ): { lms: LMSDataPoint; interpolated: boolean; keyUsed: number } {
    const data = dataset.data;
    if (!data || data.length === 0) {
      throw new Error('WHO_DATA_MISSING: Dataset contains zero data points.');
    }

    const minKey = data[0].key;
    const maxKey = data[data.length - 1].key;

    if (keyVal < minKey - 0.001 || keyVal > maxKey + 0.001) {
      throw new Error(
        `AGE_OUT_OF_RANGE: Requested value (${keyVal}) is outside official WHO dataset limits [${minKey}, ${maxKey}].`
      );
    }

    // Binary search for efficiency
    let low = 0;
    let high = data.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midKey = data[mid].key;

      if (Math.abs(midKey - keyVal) < 1e-4) {
        return { lms: data[mid], interpolated: false, keyUsed: midKey };
      } else if (midKey < keyVal) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // High and low are the bounding indices
    const idx1 = Math.max(0, high);
    const idx2 = Math.min(data.length - 1, low);

    if (idx1 === idx2) {
      return { lms: data[idx1], interpolated: false, keyUsed: data[idx1].key };
    }

    const p1 = data[idx1];
    const p2 = data[idx2];
    const interpolated = this.interpolateLMS(p1, p2, keyVal);

    return { lms: interpolated, interpolated: true, keyUsed: keyVal };
  }

  /**
   * Returns all available datasets with their metadata for audit/exploration.
   */
  public static getAllDatasets(): { key: string; metadata: WHODatasetFile['metadata']; pointCount: number }[] {
    return Object.entries(datasetsRecord).map(([key, file]) => ({
      key,
      metadata: file.metadata,
      pointCount: file.data.length,
    }));
  }
}
