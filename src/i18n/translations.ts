/**
 * NMO | نمو — Child Growth Application
 * Complete Arabic & English Bilingual Dictionaries
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import { Language, TranslationDictionary } from './types.ts';

export const translations: Record<Language, TranslationDictionary> = {
  ar: {
    // Brand
    brand_name: 'نمو',
    brand_tagline: 'نمو | NMO',
    brand_subtitle: 'متابعة نمو الأطفال وفق معايير منظمة الصحة العالمية',
    founder_title: 'المؤسس والمالك',
    founder_name: 'د. حسن الزيدي',
    copyright: '© 2026 NMO — جميع الحقوق محفوظة',

    // Main Navigation
    nav_home: 'الرئيسية',
    nav_my_children: 'أطفالي',
    nav_growth: 'النمو',
    nav_doctor: 'الطبيب',
    nav_message_doctor: 'مراسلة الطبيب',
    nav_settings: 'الإعدادات',

    // Main Dashboard
    welcome_greeting: 'مرحباً 👋',
    dashboard_subtitle: 'تابع نمو طفلك خطوة بخطوة',
    add_child: 'إضافة طفل',
    add_measurement: 'إضافة قياس',
    growth_chart: 'مخطط النمو',
    message_doctor: 'مراسلة الطبيب',
    view_details: 'عرض التفاصيل',
    view_growth_analysis: 'عرض تحليل النمو',
    based_on_latest_measurements: 'بناءً على آخر قياسات مسجلة',
    growth_trend_label: 'مسار النمو',
    growth_trend_stable: 'مستقر',
    growth_trend_accelerating: 'متسارع',
    growth_trend_slowing: 'متباطئ',
    awaiting_growth_analysis: 'بانتظار اكتمال تحليل النمو',
    latest_measurement: 'آخر قياس مسجل',
    no_children_yet: 'لا يوجد أطفال مسجلون بعد',
    add_first_child: 'ابدأ بإضافة طفلك الأول لمتابعة نموه',
    no_measurements_yet: 'لم يتم تسجيل قياسات بعد',

    // User vs Child Separation
    parent_label: 'ولي الأمر',
    parent_role: 'ولي الأمر',
    child_label: 'الطفل',

    // Units
    unit_system: 'نظام القياس',
    unit_metric: 'متري (Metric)',
    unit_imperial: 'إمبراطوري (Imperial)',
    unit_metric_desc: 'cm, kg, kg/m² (الافتراضي)',
    unit_imperial_desc: 'in, lb',

    // Child Profile
    child_profile: 'ملف الطفل',
    child_name: 'اسم الطفل',
    sex: 'الجنس',
    sex_male: 'ذكر',
    sex_female: 'أنثى',
    date_of_birth: 'تاريخ الميلاد',
    age: 'العمر',
    height: 'الطول',
    weight: 'الوزن',
    bmi: 'مؤشر كتلة الجسم',
    head_circumference: 'محيط الرأس',
    last_measurement: 'آخر قياس',
    select_child: 'اختيار الطفل',
    switch_child: 'تبديل الطفل',

    // Measurement Page
    measurement_date: 'تاريخ القياس',
    add_note: 'إضافة ملاحظة',
    note_placeholder: 'ملاحظات اختيارية (مثال: زيارة دورية، تطعيم)',
    save_measurement: 'حفظ القياس',
    cancel: 'إلغاء',
    position_mode: 'وضعية القياس',
    position_auto: 'تلقائي (مستلقٍ < سنتين، واقف ≥ سنتين)',
    position_recumbent: 'مستلقٍ (طول Recumbent)',
    position_standing: 'واقف (ارتفاع Standing)',
    measurement_history: 'سجل القياسات السابقة',

    // Growth Status (Strict non-diagnostic terms)
    status_reassuring_growth: 'نمو مطمئن',
    status_within_expected: 'ضمن المتوقع',
    status_needs_followup: 'يحتاج متابعة',
    status_consider_review: 'يُنصح بمراجعة الطبيب',
    status_insufficient_data: 'بيانات غير كافية',

    // Indicators
    ind_height_for_age: 'الطول بالنسبة للعمر',
    ind_weight_for_age: 'الوزن بالنسبة للعمر',
    ind_weight_for_length: 'الوزن بالنسبة للطول',
    ind_weight_for_height: 'الوزن بالنسبة للطول',
    ind_bmi_for_age: 'مؤشر كتلة الجسم بالنسبة للعمر',
    ind_head_circumference_for_age: 'محيط الرأس بالنسبة للعمر',
    z_score: 'الدرجة المعيارية Z-score',
    percentile: 'المئين',

    // Growth Chart
    growth_trajectory: 'مسار النمو',
    previous_measurements: 'القياسات السابقة',
    current_measurement: 'القياس الحالي',
    based_on_who_standards: 'وفق معايير نمو الأطفال لمنظمة الصحة العالمية (WHO)',
    chart_indicator_select: 'اختيار المؤشر',
    chart_median_line: 'الوسيط (0 SD)',
    chart_normal_range: 'المجال المتوقع (-2 إلى +2 SD)',
    chart_single_measurement_notice: 'توجد قراءة واحدة حالياً. أضف قياسات لاحقة لمتابعة مسار النمو.',
    chart_no_measurements: 'لا توجد قياسات مسجلة لهذا المؤشر بعد.',
    chart_dev_mode: 'وضع الفحص الرياضي (للمطورين)',
    chart_tooltip_age: 'العمر',
    chart_tooltip_measurement: 'القياس',
    chart_tooltip_zscore: 'Z-score',
    chart_tooltip_percentile: 'المئين',
    chart_tooltip_indicator: 'المؤشر المستخدم',
    chart_tooltip_reference: 'مرجع WHO',
    chart_curve_source: 'مصدر المنحنى',
    chart_points_count: 'نقاط المنحنى',
    // Phase 4.1 Final UX additions
    chart_title_parent: 'مخطط النمو',
    chart_subtitle_parent: 'وفق معايير نمو الأطفال لمنظمة الصحة العالمية (WHO)',
    chart_child_point: 'قياس الطفل',
    chart_median_label: 'المتوسط',
    chart_reference_range: 'المجال المرجعي ±2 SD',
    chart_single_line1: 'توجد قراءة واحدة حالياً.',
    chart_single_line2: 'أضف قياسات لاحقة لمتابعة مسار النمو.',
    ind_tab_height: 'الطول',
    ind_tab_weight: 'الوزن',
    ind_tab_wfl_wfh: 'الوزن/الطول',
    ind_tab_bmi: 'BMI',
    ind_tab_hc: 'محيط الرأس',
    ind_not_applicable_wfl_wfh: 'الوزن/الطول متاح ضمن الفئة العمرية المناسبة وفق مرجع WHO.',
    ind_not_applicable_hc: 'محيط الرأس متاح حتى سن 5 سنوات وفق مرجع WHO.',
    ind_not_applicable_wfa: 'الوزن بالنسبة للعمر متاح حتى عمر 10 سنوات وفق مرجع WHO (يُستخدم BMI للفئات الأكبر).',
    tooltip_child_name: 'اسم الطفل',

    // Doctor Messaging
    write_question: 'اكتب سؤالك للطبيب',
    send_question: 'إرسال السؤال',
    waiting_doctor_response: 'بانتظار رد الطبيب',
    doctor_replied: 'تم الرد',
    attach_image: 'إرفاق صورة',
    doctor_name_label: 'استشارة طبية مع د. حسن الزيدي',
    no_messages_yet: 'لا توجد رسائل سابقة. يمكنك توجيه سؤالك للطبيب مباشرة.',
    message_placeholder: 'اكتب استفسارك الطبي حول نمو أو تغذية طفلك...',
    consultation_disclaimer: 'الردود الطبية هي للإرشاد والتثقيف الصحي ولا تُعد بديلاً عن الفحص السريري المباشر.',

    // Educational Explanation
    edu_comparison: 'هذا المؤشر يقارن قياس طفلك بأطفال من نفس العمر والجنس وفق مرجع النمو المستخدم.',
    edu_trajectory: 'متابعة القياسات مع مرور الوقت تساعد على فهم مسار النمو بشكل أفضل.',
    edu_non_diagnostic: 'هذه النتيجة لا تعني تشخيص مرض.',

    // Disclaimer
    disclaimer_full: 'نمو هو تطبيق لمتابعة نمو الأطفال والتثقيف الصحي، ولا يغني عن الفحص الطبي أو التشخيص من قبل الطبيب.',
    disclaimer_short: 'تطبيق لمتابعة النمو والتثقيف الصحي — لا يغني عن الفحص الطبي.',

    // About
    about_nmo: 'عن نمو',
    about_description: 'منصة لمساعدة الأهل على متابعة نمو أطفالهم وفهم قياساتهم بطريقة مبسطة.',
    engine_badge: 'محرك حسابي قطعي 100% — خالٍ من الذكاء التوليدي',

    // Settings
    settings_language: 'اللغة',
    language_arabic: 'العربية',
    language_arabic_sub: 'واجهة عربية',
    language_english: 'English',
    language_english_sub: 'English interface',
    settings_units: 'نظام القياس',
    settings_who_engine: 'محرك منظمة الصحة العالمية (WHO)',
    settings_validation_suite: 'حزمة التحقق والاختبارات الطبية',

    // Phase 4: Growth Analysis Screen
    growth_analysis_title: 'تحليل نمو',
    growth_analysis_subtitle: 'متابعة قياسات النمو وفق معايير منظمة الصحة العالمية (WHO)',
    growth_status_within_expected_desc: 'قياسات النمو الحالية تقع ضمن النطاق المتوقع وفق مرجع النمو المستخدم.',
    what_numbers_mean_title: 'ماذا تعني هذه الأرقام؟',
    percentile_explanation: 'المئين يساعد على معرفة موقع قياس طفلك مقارنة بأطفال من نفس العمر والجنس ضمن مرجع النمو.',
    zscore_explanation: 'أما Z-score فيوضح مدى بُعد القياس عن متوسط مرجع النمو.',
    what_we_watch_title: 'ما الذي نتابعه؟',
    what_we_watch_1: 'نراقب تغير القياسات مع مرور الوقت.',
    what_we_watch_2: 'نقارن القياسات بمرجع النمو المناسب للعمر والجنس.',
    what_we_watch_3: 'إذا ظهرت تغيرات ملحوظة أو كانت لديك مخاوف بشأن نمو طفلك، يمكنك مناقشتها مع الطبيب.',
    trajectory_single_notice: 'توجد قراءة واحدة فقط حالياً.',
    trajectory_add_subsequent: 'أضف قياسات لاحقة لمتابعة مسار النمو عبر الوقت.',
    trajectory_multi_explanation: 'متابعة القياسات عبر الوقت تساعد على فهم مسار النمو بشكل أفضل من قراءة واحدة.',
    create_growth_report: 'إنشاء تقرير النمو',
    print_growth_report: 'طباعة التقرير',
    important_note_title: 'ملاحظة مهمة',
    important_note_text: 'هذا التحليل مخصص لمتابعة نمو الطفل بالاعتماد على مراجع النمو. لا يُستخدم وحده لتشخيص الأمراض أو استبعادها. إذا كانت لديك مخاوف بشأن نمو طفلك أو صحته، ناقشها مع الطبيب.',
    structured_summary_attached: 'ملخص النمو المنظم مرفق',
    structured_summary_remove: 'إزالة الملخص',
    report_growth_disclaimer: 'هذا التقرير مخصص لمتابعة نمو الطفل بالاعتماد على معايير منظمة الصحة العالمية (WHO). لا يُستخدم وحده لتشخيص الأمراض أو استبعادها ولا يغني عن التقييم الطبي السريري.',

    // Error Messages
    err_required_fields: 'يرجى إدخال البيانات المطلوبة.',
    err_invalid_dob: 'تاريخ الميلاد غير صحيح.',
    err_measurement_before_birth: 'تاريخ القياس لا يمكن أن يسبق تاريخ ميلاد الطفل.',
    err_future_measurement_date: 'لا يمكن تسجيل قياس بتاريخ مستقبلي.',
    err_invalid_measurement_date: 'يرجى إدخال تاريخ قياس صالح.',
    err_check_height_weight: 'يرجى التحقق من الطول والوزن.',
    err_who_data_unavailable: 'بيانات WHO غير متوفرة لهذا العمر.',
    err_unable_calculate: 'تعذر حساب مؤشر النمو.',
    err_generic: 'حدث خطأ. حاول مرة أخرى.',

    // Phase 5.1 Measurement Input UX
    measurement_method_label: 'طريقة القياس:',
    method_recumbent: 'مستلقٍ',
    method_standing: 'واقف',
    height_standing_label: 'الطول واقفاً (سم)',
    height_recumbent_label: 'الطول (سم)',
    weight_kg_label: 'الوزن (كغ)',
    head_circumference_cm_label: 'محيط الرأس (سم)',
    notes_optional_label: 'ملاحظات — اختياري',
  },

  en: {
    // Brand
    brand_name: 'NMO',
    brand_tagline: 'NMO | نمو',
    brand_subtitle: 'Child Growth Monitoring Based on WHO Growth Standards',
    founder_title: 'Founder & Owner',
    founder_name: 'Dr. Hasan Abdulzahra Al_Zaidi',
    copyright: '© 2026 NMO — All Rights Reserved',

    // Main Navigation
    nav_home: 'Home',
    nav_my_children: 'My Children',
    nav_growth: 'Growth',
    nav_doctor: 'Doctor',
    nav_message_doctor: 'Message Doctor',
    nav_settings: 'Settings',

    // Main Dashboard
    welcome_greeting: 'Welcome 👋',
    dashboard_subtitle: "Track your child's growth, step by step.",
    add_child: 'Add Child',
    add_measurement: 'Add Measurement',
    growth_chart: 'Growth Chart',
    message_doctor: 'Message Doctor',
    view_details: 'View Details',
    view_growth_analysis: 'View Growth Analysis',
    based_on_latest_measurements: 'Based on latest recorded measurements',
    growth_trend_label: 'Growth Trajectory',
    growth_trend_stable: 'Stable',
    growth_trend_accelerating: 'Accelerating',
    growth_trend_slowing: 'Slowing',
    awaiting_growth_analysis: 'Awaiting Growth Analysis',
    latest_measurement: 'Latest Recorded Measurement',
    no_children_yet: 'No children added yet',
    add_first_child: 'Start by adding your first child to track their growth',
    no_measurements_yet: 'No measurements recorded yet',

    // User vs Child Separation
    parent_label: 'Parent',
    parent_role: 'Guardian',
    child_label: 'Child',

    // Units
    unit_system: 'Unit System',
    unit_metric: 'Metric (cm, kg)',
    unit_imperial: 'Imperial (in, lb)',
    unit_metric_desc: 'cm, kg, kg/m² (Default)',
    unit_imperial_desc: 'in, lb',

    // Child Profile
    child_profile: 'Child Profile',
    child_name: 'Child Name',
    sex: 'Sex',
    sex_male: 'Male',
    sex_female: 'Female',
    date_of_birth: 'Date of Birth',
    age: 'Age',
    height: 'Height',
    weight: 'Weight',
    bmi: 'Body Mass Index',
    head_circumference: 'Head Circumference',
    last_measurement: 'Last Measurement',
    select_child: 'Select Child',
    switch_child: 'Switch Child',

    // Measurement Page
    measurement_date: 'Measurement Date',
    add_note: 'Add Note',
    note_placeholder: 'Optional notes (e.g. routine check-up, vaccination)',
    save_measurement: 'Save Measurement',
    cancel: 'Cancel',
    position_mode: 'Measurement Position',
    position_auto: 'Auto-detect (Recumbent <2y, Standing ≥2y)',
    position_recumbent: 'Recumbent (Lying down length)',
    position_standing: 'Standing (Upright height)',
    measurement_history: 'Previous Measurements History',

    // Growth Status (Strict non-diagnostic terms)
    status_reassuring_growth: 'Reassuring Growth',
    status_within_expected: 'Within Expected Range',
    status_needs_followup: 'Needs Follow-up',
    status_consider_review: 'Consider Medical Review',
    status_insufficient_data: 'Insufficient Data',

    // Indicators
    ind_height_for_age: 'Height-for-age',
    ind_weight_for_age: 'Weight-for-age',
    ind_weight_for_length: 'Weight-for-length',
    ind_weight_for_height: 'Weight-for-height',
    ind_bmi_for_age: 'BMI-for-age',
    ind_head_circumference_for_age: 'Head circumference-for-age',
    z_score: 'Z-score',
    percentile: 'Percentile',

    // Growth Chart
    growth_trajectory: 'Growth Trajectory',
    previous_measurements: 'Previous Measurements',
    current_measurement: 'Current Measurement',
    based_on_who_standards: 'Based on WHO Growth Standards',
    chart_indicator_select: 'Select Indicator',
    chart_median_line: 'Median (0 SD)',
    chart_normal_range: 'Expected Range (-2 to +2 SD)',
    chart_single_measurement_notice: 'Currently only one measurement exists. Add subsequent measurements to track growth trajectory.',
    chart_no_measurements: 'No measurements recorded for this indicator yet.',
    chart_dev_mode: 'Developer Math Audit Mode',
    chart_tooltip_age: 'Age',
    chart_tooltip_measurement: 'Measurement',
    chart_tooltip_zscore: 'Z-score',
    chart_tooltip_percentile: 'Percentile',
    chart_tooltip_indicator: 'Indicator Used',
    chart_tooltip_reference: 'WHO Reference',
    chart_curve_source: 'Curve Source',
    chart_points_count: 'Curve Points',
    // Phase 4.1 Final UX additions
    chart_title_parent: 'Growth Chart',
    chart_subtitle_parent: 'According to WHO Child Growth Standards',
    chart_child_point: "Child's measurement",
    chart_median_label: 'Median',
    chart_reference_range: 'Reference range ±2 SD',
    chart_single_line1: 'Currently only one measurement exists.',
    chart_single_line2: 'Add subsequent measurements to track growth trajectory.',
    ind_tab_height: 'Height',
    ind_tab_weight: 'Weight',
    ind_tab_wfl_wfh: 'Weight/Height',
    ind_tab_bmi: 'BMI',
    ind_tab_hc: 'Head Circumference',
    ind_not_applicable_wfl_wfh: 'Weight/Height is available for the appropriate age group according to the WHO reference.',
    ind_not_applicable_hc: 'Head circumference is available up to 5 years according to the WHO reference.',
    ind_not_applicable_wfa: 'Weight-for-age is available up to 10 years according to the WHO reference (BMI is used for older children).',
    tooltip_child_name: 'Child Name',

    // Doctor Messaging
    write_question: 'Write your question',
    send_question: 'Send Question',
    waiting_doctor_response: "Waiting for Doctor's Response",
    doctor_replied: 'Doctor Replied',
    attach_image: 'Attach Image',
    doctor_name_label: 'Consultation with Dr. Hasan Abdulzahra Al_Zaidi',
    no_messages_yet: 'No messages yet. Feel free to write your question to the doctor.',
    message_placeholder: "Write your question regarding your child's growth or nutrition...",
    consultation_disclaimer: 'Medical responses provide health guidance and education and do not replace an in-person physical clinical examination.',

    // Educational Explanation
    edu_comparison: 'This indicator compares your child\'s measurement with children of the same age and sex using the selected growth reference.',
    edu_trajectory: 'Tracking measurements over time helps us understand the child\'s growth trajectory.',
    edu_non_diagnostic: 'This result does not constitute a medical diagnosis.',

    // Disclaimer
    disclaimer_full: 'NMO is a child growth monitoring and health education application. It does not replace medical examination or diagnosis by a healthcare professional.',
    disclaimer_short: 'A growth monitoring & health education app — does not replace medical diagnosis.',

    // About
    about_nmo: 'About NMO',
    about_description: 'A platform designed to help parents monitor their children\'s growth and understand growth measurements in a simple way.',
    engine_badge: '100% Deterministic Engine — No Generative AI in Calculations',

    // Settings
    settings_language: 'Language',
    language_arabic: 'العربية',
    language_arabic_sub: 'واجهة عربية',
    language_english: 'English',
    language_english_sub: 'English interface',
    settings_units: 'Measurement System',
    settings_who_engine: 'WHO Growth Engine',
    settings_validation_suite: 'WHO Validation Suite & Medical Benchmarks',

    // Phase 4: Growth Analysis Screen
    growth_analysis_title: 'Growth Analysis for',
    growth_analysis_subtitle: 'Monitoring growth measurements in accordance with WHO Child Growth Standards',
    growth_status_within_expected_desc: 'Current growth measurements are within the expected range of the selected growth reference.',
    what_numbers_mean_title: 'What do these numbers mean?',
    percentile_explanation: 'The percentile helps identify where your child\'s measurement stands compared to children of the same age and sex in the growth reference.',
    zscore_explanation: 'While the Z-score indicates how far a measurement is from the average of the growth reference.',
    what_we_watch_title: 'What to watch',
    what_we_watch_1: 'We monitor how measurements change over time.',
    what_we_watch_2: 'We compare measurements against the appropriate growth reference for age and sex.',
    what_we_watch_3: 'If noticeable changes appear or if you have any concerns regarding your child\'s growth, you can discuss them with your doctor.',
    trajectory_single_notice: 'Only one measurement is currently recorded.',
    trajectory_add_subsequent: 'Add subsequent measurements to track growth trajectory over time.',
    trajectory_multi_explanation: 'Tracking measurements over time helps provide a clearer understanding of growth trajectory than a single reading.',
    create_growth_report: 'Generate Growth Report',
    print_growth_report: 'Print Report',
    important_note_title: 'Important Note',
    important_note_text: 'This analysis is intended for monitoring child growth based on growth references. It is not used on its own to diagnose or rule out conditions. If you have concerns about your child\'s growth or health, discuss them with your doctor.',
    structured_summary_attached: 'Structured growth summary attached',
    structured_summary_remove: 'Remove summary',
    report_growth_disclaimer: 'This report is intended for growth monitoring in accordance with WHO standards. It is not used alone to diagnose or rule out conditions and does not replace clinical medical evaluation.',

    // Error Messages
    err_required_fields: 'Please enter the required information.',
    err_invalid_dob: 'Invalid date of birth.',
    err_measurement_before_birth: "Measurement date cannot precede the child's date of birth.",
    err_future_measurement_date: 'Cannot record a measurement with a future date.',
    err_invalid_measurement_date: 'Please enter a valid measurement date.',
    err_check_height_weight: 'Please check the height and weight.',
    err_who_data_unavailable: 'WHO reference data are unavailable for this age.',
    err_unable_calculate: 'Unable to calculate the growth indicator.',
    err_generic: 'Something went wrong. Please try again.',

    // Phase 5.1 Measurement Input UX
    measurement_method_label: 'Measurement Method:',
    method_recumbent: 'Recumbent',
    method_standing: 'Standing',
    height_standing_label: 'Standing Height (cm)',
    height_recumbent_label: 'Length (cm)',
    weight_kg_label: 'Weight (kg)',
    head_circumference_cm_label: 'Head Circumference (cm)',
    notes_optional_label: 'Notes — Optional',
  },
};
