// Note: Add the urls in sorted order
var Api = {
  ENDPOINTS: {
    get_booth_tour_details: '/booth_tour/list',
    file_upload_url: '/attachment/{type}',
    remove_uploaded_file_url: '/attachment/{uuid}',
    update_user_registration: '/company/update_user_register_configs',
    update_endorsement_config: '/configure/endorsement',
    fetch_standard_report: '/reports/standard_report',
    update_double_booking_config: '/configure/double_booking',
    show_in_meeting_external_attendee: '/configure/show_in_meeting_external_attendee',
    list_tracks:'/tracks/list',
    list_briefings_agenda:'/briefing/list_briefings{QUERY_PARAMS}#/list_agenda',
    update_user_notif_settings:'/user_setting/notification_setting',
    user_notif_settings:'/user_setting/notification_settings',
    update_custom_reports: '/user_template/update',
    disable_saved_report: '/user_template/disable/{{uuid}}',
    saved_report_details: '/user_template/details',
    accept_meeting: '/meeting_request/{uuid}/accept_meeting',
    activate_event: '/event/activate',
    activate_user: '/users/UUID/active',
    alert_details_fetch: '/alerts/meeting_meta',
    alert_fetch: '/alerts',
    custom_form_details: '/custom_form_details',
    system_configurations: '/configurations/system_configuration',
    update_configuration: '/update_configuration',
    all_meeting_types: '/meeting_types/index',
    approve_meeting: '/meeting_request/approve_meetings',
    availability_fetch: '/meeting_type/availabilities',
    availability_fetch_ebc: '/configure/initial_availabilities',
    availability_update: '/configure/update_initial_availabilities',
    block_update: '/calendar/edit_block',
    briefing_centre: '/bc',
    briefing_details: '/briefing/{briefing_uuid}',
    briefing_centre_long_day: '/bcs/get_long_day',
    calendar_availability: '/meeting_request/calendar',
    calendar_user_availability: '/calendar/users',
    cancel_meeting: '/meeting_request/{meeting_uuid}/cancel_meeting',
    create_external_request: '/external_request/create',
    company_fetch: '/company',
    meeting_notifications: '/meeting_notifications',
    decline_meeting: '/meeting_request/{uuid}/decline_meeting',
    demand_report_export: '/meeting_request/ondemand',
    dismiss_alert: '/alerts/dismiss',
    dismiss_notification: '/notifications/dismiss',
    enable_double_book_users: '/users/enable_double_booking',
    event_config: '/event/configurations',
    event_config_for_user_calendar: '/user_calendar/configurations',
    event_user_cal_path: 'user_calendar',
    event_room_cal_path: 'calendar',
    event_configurations: '/event/{event_uuid}/configurations',
    event_user_filters: '/users/filter_options',
    events_info: '/events',
    event_details: '/event_info',
    download_agenda_item_template_url: "/meeting_request/csv_template",
    upload_agenda_item_csv: '/meeting_request/import',
    external_attendees: '/users/external',
    facilities_list: '/facilities',
    fetch_activity_list: '/activities',
    fetch_active_events:'/active_events',
    fetch_booking_analytics: '/analytics/booking',
    fetch_calendar_settings: '/configure/calendar_settings',
    fetch_concierge_form: '/concierge_services/custom_forms',
    fetch_concierge_notification_settings: '/concierge_services/notification_settings',
    fetch_customers_analytics: '/analytics/customers',
    fetch_ebc_form: '/briefing_custom_form/get_fields',
    fetch_external_meeting_request: '/external_requests/list',
    fetch_form: '/custom_form/get_fields',
    fetch_form_settings: '/configure/form_settings',
    fetch_invitees_analytics: '/analytics/invitees',
    fetch_meeting_data_for_reports: '/users/meetings',
    fetch_meeting_filters: '/reports/meeting_filters',
    fetch_meeting_reports: '/meetings',
    fetch_meeting_reports_header: '/headers',
    fetch_meeting_type_durations: '/calendar/available_meeting_types',
    fetch_meeting_types: '/meeting_types/list',
    fetch_meetings_analytics: '/analytics/meetings',
    fetch_meeting_type_analytics: '/analytics/meetings_by_type',
    fetch_minimum_timeslot: '/setting/minimum_timeslot',
    fetch_notification_settings: '/configure/notification_settings',
    fetch_consecutive_meeting_notification_settings: '/configure/consecutive_meeting/notification_settings',
    fetch_consecutive_meeting_form_settings: '/configure/consecutive_meeting/form_settings',
    fetch_update_briefing_notification_settings: '/configure/briefing_notification_settings',
    fetch_roles_analytics: '/analytics/roles',
    fetch_rooms_analytics: '/analytics/rooms',
    fetch_user_details: '/users/{{uuid}}',
    fetch_users_for_reports: '/reports/users_list',
    fetch_tag_configs: "/configure/tag",
    fetch_valid_mapping_Times: "/mappings_valid_start_times",
    get_tag_clouds: "/tag_cloud",
    create_tag_clouds: "/tag_cloud",
    fetch_tag_entity: "/tags/{{uuid}}/{{entity}}",
    update_tag_configs: "/config/update_tag",
    fetch_location_configs: "/configure/location",
    update_location_configs: "/config/update_location",
    get_announcements: '/setting/announcement',
    internal_attendees: '/users/internal',
    mail_template_type_entities_get: '/mail_action/get_associated_entities',
    mail_template_type_get: '/mail_actions',
    mapped_events: '/mappable_events',
    meeting_availability: '/meeting_request/calendar',
    meeting_create: '/meeting_request/create',
    meeting_drag: '/calendar/relocate',
    meeting_fetch: '/meeting_request/{{uuid}}/show',
    meeting_get_config: '/configure/{:uuid}/meeting_type',
    meeting_get_settings: '/setting/activity',
    meeting_request_edit_path: '/meeting_request/{uuid}/edit',
    meeting_request_export: '/meeting_request/export',
    session_export: '/session/export',
    meeting_request_path: '/meeting_request/new',
    meeting_request_view_path: '/meeting_request/{uuid}/view',
    meeting_set_config: '/configure/{:uuid}/meeting_type_update',
    meeting_set_setting: '/setting/activity_update',
    meeting_types: '/meeting_types',
    meeting_type_create: '/meeting_type/create',
    meeting_type_update: '/meeting_type/{uuid}/update',
    meetings_list: '/meeting_requests',
    mapping_page: '/mapping_list',
    mapping_list: '/container_mapping/list',
    fetch_mapping_filters: '/appointment_filters',
    appointment_filter_options: '/appointment_filter_options',
    mappings_export: '/mapping_export',
    bulk_approve_mappings: '/appointments/approve',
    upload_mapping_csv: "/special_appointment/import",
    bulk_cancel_mappings: '/appointments/cancel',
    notification_fetch: '/notifications',
    non_event_configurations: '/calendar/configurations',
    register_user: '/register',
    reinvite_users: "/users/resend_invite",
    inactivate_users: "/users/bulk_inactive",
    remove_from_event: '/users/UUID/inactive',
    reschedule_meeting: '/meeting_request/reschedule',
    role_create: '/role/create',
    role_disable: '/role/{:uuid}/disable',
    role_enable: '/role/{:uuid}/enable',
    role_get_privileges: '/role/{:uuid}/get_privileges',
    role_get_all_privileges: '/all_privileges',
    role_set_privileges: '/role/{:uuid}/set_privileges',
    role_update: '/role/update',
    roles_fetch: '/roles',
    room_activities: '/activities_rooms',
    room_availability: '/calendar/rooms',
    customer_availability: '/calendar/companies',
    room_block: '/calendar/block',
    room_calendar_export: '/calendar/rooms/export',
    room_create: '/room/create',
    room_make_available: '/calendar/make_available',
    room_make_unavailable: '/calendar/make_unavailable',
    room_unblock: '/calendar/unblock',
    room_update: '/room/update',
    rooms_export: '/room/export',
    rooms_list: '/rooms/list',
    room_filters: '/room/filter_options',
    inactivate_rooms: "/rooms/inactive",
    save_form: '/custom_form/update',
    set_announcements: '/setting/announcement_update',
    standard_report_export_url: '/users/meetings.pdf?user_uuid={{uuid}}',
    time_zone_url: '/time_zone',
    timeline_data: '/calendar/timeline_data',
    tag_create_or_update: '/tags',
    tag_list: "/tags",
    tag_listing_page: "/tag/listing",
    ui_get_settings: '/setting/ui',
    ui_set_setting: '/setting/ui_update',
    update_calendar_settings: '/configure/calendar_settings/{{uuid}}/update',
    update_concierge_form: '/concierge_services/{{uuid}}/update_custom_form',
    update_concierge_notification_settings: '/concierge_services/{{uuid}}/update_notification_settings',
    update_form_settings: '/configure/form_settings/{{uuid}}/update',
    update_notification_settings: '/configure/notification_setting',
    update_mail_template: '/mail_template/update',
    update_minimum_timeslot: '/setting/minimum_timeslot_update',
    update_user_profile: '/user/{{uuid}}',
    update_external_meeting: '/config/external_meeting',
    upload_room_csv: '/room/import',
    upload_user_csv: '/user/import',
    user_block: '/calendar/block',
    user_calendar_export: '/calendar/users/export',
    user_create: '/user/create',
    user_export: '/user/export',
    user_make_available: '/calendar/make_available',
    user_make_unavailable: '/calendar/make_unavailable',
    user_unblock: '/calendar/unblock',
    user_update: '/users/{{uuid}}/update',
    users: '/users',
    users_events: '/users_events',
    update_event_access: '/update_event_access',
    users_events_filters: '/users_events_filters',
    checkin_meetings: '/checkin_list',
    update_checkin_status: '/checkin/toggle_checkin',
    integration_field_mappings: '/integration/field_mappings',
    set_user_cis_status: '/set_user_cis_status/{{id}}',
    double_booked_resources: "/meeting_request/double_booked_resources",
    mappable_users: '/fetch_mappable_users',
    mappable_requestors: '/fetch_requestors',
    can_attend_session: '/can_attend_session',
    delete_mapping: '/container_mapping/{{uuid}}/delete',
    fetch_user_topics: '/user_topics',
    reinvite_attendee_to_meeting: '/meeting_request/reinvite',
    remove_user_from_event: '/trigger/unmap',
    activate_room: '/room/{{uuid}}/active',
    fetch_remote_entities: '/fetch_remote_entities',
    fetch_topics: '/topics',
    fetch_meeting_count: '/activity_module_count',
    fetch_meeting_details: '/activity_details',
    track_activities:'/get_track_activities',
    meetings_list_filters: '/meeting_request/meeting_filters',
    checkin_list_filters: '/checkin/meeting_filters',
    get_meeting_options: '/meeting_filters/filter_options',
    get_ext_meeting_options: '/external_requests/filter_options',
    external_meetings_list_filters: '/external_requests/filters',
    get_checkin_options: '/checkin_filters/filter_options',
    get_report_options: '/reports_filters/filter_options',
    update_company_form: '/company/update_company_configs',
    event_config_import: '/configuration/import',
    event_config_export: '/configuration/export',
    fetch_user_field_mappings: '/fetch_integration_configs',
    save_user_field_mappings: '/create_or_update_integration_configuration',
    trigger_sync: '/trigger_sync',
    create_integration_user: '/integrations/create_integration_user',
    fetch_mapping_rule_types: '/fetch_integration_rules',
    event_ebc_configurations : '/event/ebc_configurations',
    cis_service: '/cis_service',
    default_meeting_location_entities: '/event/set_default_meeting_location',
    fetch_activity_settings: '/configure/activity_settings',
    fetch_briefing_workflow: '/configure/briefing_settings',
    update_activity_settings: '/configure/activity_setting',
    update_mapping_module_config: '/meeting_type/{activity_uuid}/mapping_module_configs',
    update_briefing_workflow: '/configure/briefing_settings',
    copy_calendar_settings: '/configure/copy_calendar',
    copy_meeting_settings: '/configure/copy_settings',
    copy_form_settings: '/configure/copy_form',
    copy_notification_settings: '/configure/copy_notification_templates',
    bulk_approve_meetings: '/meeting_request/approve_meetings',
    bulk_cancel_meetings: '/meeting_request/cancel_meetings',
    get_mm_list: '/users/managers',
    fetch_concierge_services: '/concierge_services',
    concierge_services_create: '/concierge_services',
    concierge_services_update: '/concierge_services/{uuid}',
    activity_details: '/activities/{uuid}',
    fetch_surveys: '/surveys',
    survey_update: '/survey_masters/{uuid}',
    survey_create: '/survey_masters',
    update_survey_form: '/survey_response/{uuid}',
    briefing_custom_forms: '/meeting_type/briefing_custom_forms',
    domain_validation: '/domains/validate',
    external_request_dates: '/event_dates',
    get_external_request: '/external_request/{uuid}/view',
    send_survey_meeting_mail: '/meeting_request/{UUID}/send_survey_mail',
    send_bulk_survey_meeting_mail: '/meeting_request/send_survey_mail/bulk_action',
    cancel_external_request: '/external_request/{uuid}/cancel',
    reject_external_request: '/external_request/{uuid}/reject',
    approve_external_request: '/external_request/{uuid}/approve',
    ext_enabled_fetch_form_settings: '/external_widget_activities',
    report_survey_activity_list: '/survey/activity_list',
    export_surveys: '/survey/{UUID}/export_surveys',
    get_external_req_details: '/external_request/{uuid}/meeting_info',
    update_external_request_form: '/update_external_widget',
    mappable_grouping_users: '/reports/all_users',
    fetch_requestor_email: '/fetch_requestor_email',
    send_requestor_email: '/meeting_request/send_email_to_requestor',
    survey_responses:'survey_responses',
    checkin_meetings_list:'/checkin_meetings',
    checkin_sessions_list: '/checkin_sessions',
    session_checkin_list: "/session_checkin_list",
    meeting_list:'/meeting_list',
    consecutive_meeting_list: '/consecutive_meetings',
    consecutive_list_page: '/consecutive_meetings/list',
    event_home:'event/home',
    event_new: 'event/new',
    checkin_meetings_list:'/checkin_meetings',
    checkin_consecutive_meetings_list: '/checkin_consecutive_meetings',
    consecutive_meetings_edit_path: '/consecutive_meetings/{uuid}/edit',
    consecutive_meetings_details: '/consecutive_meetings/{uuid}/edit_consecutive_meeting',
    consecutive_meetings_view_path: '/consecutive_meetings/{uuid}/view',
    apex_jnmeetings:'/apex/JNMeetings',
    apex_jnlistagenda:'/apex/JNBriefings',
    external_requests: '/external_requests',
    portal: '/portal',
    config_notification: '/configure/notification',
    config_notification_update: '/configure/notification_update',
    config_integration: '/configure/integration',
    config_topic: '/configure/topic',
    feature_enable_ebc : '/feature_toggle/enable_ebc',
    events: '/events',
    config_integration_update: '/configure/integration_update',
    config_topic_update: '/config/update_topic',
    manage_external_users: '/manage_external_users',
    manage_users: '/manageusers',
    domains_valid: '/domains/valid',
    demand_reports: '/reports/demand_report',
    user_csv_template: '/portal/user/csv_template',
    update_mapping_module: '/configure/mapping_module',
    update_track_config: '/configure/tracks',
    create_mapping: '/container_mapping/{activity_uuid}/create',
    create_session: '/session/create',
    fetch_mappings: '/mapping_module_count',
    fetch_mapping_details: '/mappings_details',
    companies_list: '/companies/search',
    expert_users: '/mapping/experts',
    jn_book_meeting: '/apex/JNBookMeeting',
    jn_view_book_meeting: '/apex/JNViewMeeting',
    tracks_list: '/tracks',
    list_tracks: '/tracks/list',
    edit_track: "/tracks/{uuid}/edit",
    create_or_update_track: '/tracks',
    fetch_track_topics: "/tracks/{{uuid}}/topics",
    sessions_list: '/sessions',
    create_group_nomination: '/group_nomination/create',
    fetch_user_form_rules: '/user_form_fields',
    fetch_integration_meeting_fields: '/integration_meeting_fields',
    save_profile_preferences: '/user_form_fields/update',
    fetch_portal_custom_form: '/forms',
    save_portal_custom_form: '/form/update',
    session_list: '/session_list',
    session_nominations: '/group_nominations',
    group_nomination_edit: '/nomination/{{uuid}}/edit',
    group_nomination_view: '/nomination/{{uuid}}/view',
    get_briefing_report_options: '/bc/{BCUUID}/briefing/filter_options',
    bulk_endorse_users: '/users/enable_endorse_users',
    get_briefing_filters: '/bc/{BCUUID}/briefing/filters',
    get_ondemand_users_list: '/users/ondemand_users',
    fetch_external_user_form_fields: '/fetch_sfdc_contacts_fields',
    update_config: '/config/update_config/{{config_type}}',
    get_swappable_room_list: '/swap_room/list',
    swap_room_submit: '/swap_room/swap',
    external_request_export: '/external_requests/export',
    create_consecutive_meetings: '/consecutive_meetings',
    meeting_types_of_consecutive_sub_meetings: '/consecutive_meetings/meeting_types',
    on_behalf_actions: '/meeting_request/on_behalf_actions',
    topic_upload: '/topics/import',
    customer_calendar_export: '/calendar/briefings_center/export',
    add_new_location: '/location/{event_uuid}',
    bulk_show_as_external_attendee: '/users/bulk_show_as_external_attendee'
  },

  update: function(options) {
    if(options.data && options.data.constructor === FormData){
        options.data.append('current_location_uuid', envDetails.current_location_uuid);
    }
    else {
        _.merge(options, {data:{current_location_uuid: envDetails.current_location_uuid}});
    }
    var options = _.assign({
      dataType: 'json',
      type: 'post',
      url: '/events',
      data: {event: null},
      prefix: envDetails['urlPrefix']
    }, options);

    if(!/^https?/.test(options['url'])) {
        options['url'] = options['prefix'] + options['url'];
    }
    var promise = jQuery.ajax(options);
    return promise;
  },

  fetch: function(options) {

    var options = _.assign({
      dataType: 'json',
      type: 'get',
      url: '/events',
      trimSearch: true,
      prefix: envDetails['urlPrefix'] || ""
    }, _.merge(options, {data:{current_location_uuid: envDetails.current_location_uuid}}));


    // by default trim whitespaces from beginning and end of search string

    if(options.data && (typeof options.data.search === 'string') && options.trimSearch){
      options.data.search = options.data.search.trimSpacesForSearch();
    }

    if(!/^https?/.test(options['url'])) {
        options['url'] = options['prefix'] + options['url'];
    }
    var promise = jQuery.ajax(options);
    return promise;
  }

}

module.exports = Api;
