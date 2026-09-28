/**
 * NMO | نمو — Child Growth Application
 * Localization Types & Interfaces
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface TranslationDictionary {
  // Brand
  brand_name: string;
  brand_tagline: string;
  brand_subtitle: string;
  founder_title: string;
  founder_name: string;
  copyright: string;

  // Navigation
  nav_home: string;
  nav_my_children: string;
  nav_growth: string;
  nav_doctor: string; // Short 1-word label for mobile bottom nav
  nav_message_doctor: string; // Full title for messaging screen
  nav_settings: string;

  // Main Dashboard
  welcome_greeting: string;
  dashboard_subtitle: string;
  add_child: string;
  add_measurement: string;
  growth_chart: string;
  message_doctor: string;
  view_details: string;
  view_growth_analysis: string; // "عرض تحليل النمو"
  based_on_latest_measurements: string; // "بناءً على آخر قياسات مسجلة"
  growth_trend_label: string; // "مسار النمو"
  growth_trend_stable: string; // "مستقر"
  growth_trend_accelerating: string;
  growth_trend_slowing: string;
  awaiting_growth_analysis: string; // "بانتظار اكتمال تحليل النمو"
  latest_measurement: string;
  no_children_yet: string;
  add_first_child: string;
  no_measurements_yet: string;

  // User vs Child Separation
  parent_label: string; // "ولي الأمر"
  parent_role: string;
  child_label: string; // "الطفل"

  // Units
  unit_system: string; // "نظام القياس"
  unit_metric: string; // "متري (Metric)"
  unit_imperial: string; // "إمبراطوري (Imperial)"
  unit_metric_desc: string;
  unit_imperial_desc: string;

  // Child Profile
  child_profile: string;
  child_name: string;
  sex: string;
  sex_male: string;
  sex_female: string;
  date_of_birth: string;
  age: string;
  height: string;
  weight: string;
  bmi: string;
  head_circumference: string;
  last_measurement: string;
  select_child: string;
  switch_child: string;

  // Measurement Page
  measurement_date: string;
  add_note: string;
  note_placeholder: string;
  save_measurement: string;
  cancel: string;
  position_mode: string;
  position_auto: string;
  position_recumbent: string;
  position_standing: string;
  measurement_history: string;

  // Growth Status (Strict Non-Diagnostic)
  status_reassuring_growth: string;
  status_within_expected: string;
  status_needs_followup: string;
  status_consider_review: string;
  status_insufficient_data: string;

  // Indicators
  ind_height_for_age: string;
  ind_weight_for_age: string;
  ind_weight_for_length: string;
  ind_weight_for_height: string;
  ind_bmi_for_age: string;
  ind_head_circumference_for_age: string;
  z_score: string;
  percentile: string;

  // Growth Chart
  growth_trajectory: string;
  previous_measurements: string;
  current_measurement: string;
  based_on_who_standards: string;
  chart_indicator_select: string;
  chart_median_line: string;
  chart_normal_range: string;
  chart_single_measurement_notice: string;
  chart_no_measurements: string;
  chart_dev_mode: string;
  chart_tooltip_age: string;
  chart_tooltip_measurement: string;
  chart_tooltip_zscore: string;
  chart_tooltip_percentile: string;
  chart_tooltip_indicator: string;
  chart_tooltip_reference: string;
  chart_curve_source: string;
  chart_points_count: string;
  // Phase 4.1 Final UX additions
  chart_title_parent: string;
  chart_subtitle_parent: string;
  chart_child_point: string;
  chart_median_label: string;
  chart_reference_range: string;
  chart_single_line1: string;
  chart_single_line2: string;
  ind_tab_height: string;
  ind_tab_weight: string;
  ind_tab_wfl_wfh: string;
  ind_tab_bmi: string;
  ind_tab_hc: string;
  ind_not_applicable_wfl_wfh: string;
  ind_not_applicable_hc: string;
  ind_not_applicable_wfa: string;
  tooltip_child_name: string;

  // Doctor Messaging
  write_question: string;
  send_question: string;
  waiting_doctor_response: string;
  doctor_replied: string;
  attach_image: string;
  doctor_name_label: string;
  no_messages_yet: string;
  message_placeholder: string;
  consultation_disclaimer: string;

  // Educational Explanation
  edu_comparison: string;
  edu_trajectory: string;
  edu_non_diagnostic: string;

  // Disclaimer
  disclaimer_full: string;
  disclaimer_short: string;

  // About
  about_nmo: string;
  about_description: string;
  engine_badge: string;

  // Settings
  settings_language: string;
  language_arabic: string;
  language_arabic_sub: string;
  language_english: string;
  language_english_sub: string;
  settings_units: string;
  settings_who_engine: string;
  settings_validation_suite: string;

  // Phase 4: Growth Analysis Screen
  growth_analysis_title: string;
  growth_analysis_subtitle: string;
  growth_status_within_expected_desc: string;
  what_numbers_mean_title: string;
  percentile_explanation: string;
  zscore_explanation: string;
  what_we_watch_title: string;
  what_we_watch_1: string;
  what_we_watch_2: string;
  what_we_watch_3: string;
  trajectory_single_notice: string;
  trajectory_add_subsequent: string;
  trajectory_multi_explanation: string;
  create_growth_report: string;
  print_growth_report: string;
  important_note_title: string;
  important_note_text: string;
  structured_summary_attached: string;
  structured_summary_remove: string;
  report_growth_disclaimer: string;

  // Error Messages
  err_required_fields: string;
  err_invalid_dob: string;
  err_measurement_before_birth: string;
  err_future_measurement_date: string;
  err_invalid_measurement_date: string;
  err_check_height_weight: string;
  err_who_data_unavailable: string;
  err_unable_calculate: string;
  err_generic: string;

  // Phase 5.1 Measurement Input UX
  measurement_method_label: string;
  method_recumbent: string;
  method_standing: string;
  height_standing_label: string;
  height_recumbent_label: string;
  weight_kg_label: string;
  head_circumference_cm_label: string;
  notes_optional_label: string;
}
