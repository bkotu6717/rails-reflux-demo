// Note: Add the urls in sorted order
var Api = {
  ENDPOINTS: {
    accept_meeting: '/meeting_request/{uuid}/accept_meeting',
    activate_event: '/event/activate',
    activate_user: '/users/UUID/active',
    alert_details_fetch: '/alerts/meeting_meta',
    alert_fetch: '/alerts',
    all_meeting_types: '/meeting_types/index',
    availability_fetch: '/meeting_type/availabilities',
    availability_update: '/configure/update_initial_availabilities',
    block_update: '/calendar/edit_block',
    briefing_centre: '/bc',
    briefing_details: '/briefing/{briefing_uuid}',
    calendar_availability: '/meeting_request/calendar',
    calendar_user_availability: '/calendar/users',
    cancel_meeting: '/meeting_request/{meeting_uuid}/cancel_meeting',
    company_fetch: '/company',
    decline_meeting: '/meeting_request/{uuid}/decline_meeting',
    demand_report_export: '/meeting_request/ondemand',
    dismiss_alert: '/alerts/dismiss',
    dismiss_notification: '/notifications/dismiss',
    event_config: '/event/configurations',
    event_configurations: '/event/{event_uuid}/configurations',
    events_info: '/events',
    external_attendees: '/users/external',
    facilities_list: '/facilities',
    fetch_activity_list: '/activities',
    fetch_active_events:'/active_events',
    fetch_booking_analytics: '/analytics/booking',
    fetch_customers_analytics: '/analytics/customers',
    fetch_form: '/custom_form/get_fields',
    fetch_invitees_analytics: '/analytics/invitees',
    fetch_meeting_data_for_reports: '/users/meetings',
    fetch_meeting_filters: '/reports/meeting_filters',
    fetch_meeting_reports: '/meetings',
    fetch_meeting_reports_header: '/headers',
    fetch_meetings_analytics: '/analytics/meetings',
    fetch_minimum_timeslot: '/setting/minimum_timeslot',
    fetch_roles_analytics: '/analytics/roles',
    fetch_rooms_analytics: '/analytics/rooms',
    fetch_user_details: '/users/{{uuid}}',
    fetch_users_for_reports: '/reports/users_list',
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
    meeting_request_path: '/meeting_request/new',
    meeting_request_view_path: '/meeting_request/{uuid}/view',
    meeting_set_config: '/configure/{:uuid}/meeting_type_update',
    meeting_set_setting: '/setting/activity_update',
    meeting_types: '/meeting_types',
    meetings_list: '/meeting_requests',
    notification_fetch: '/notifications',
    register_user: '/register',
    reinvite_users: "/users/resend_invite",
    remove_from_event: '/users/UUID/inactive',
    reschedule_meeting: '/meeting_request/reschedule',
    role_create: '/role/create',
    role_disable: '/role/{:uuid}/disable',
    role_enable: '/role/{:uuid}/enable',
    role_get_privileges: '/role/{:uuid}/get_privileges',
    role_set_privileges: '/role/{:uuid}/set_privileges',
    role_update: '/role/update',
    roles_fetch: '/roles',
    room_activities: '/activities_rooms',
    room_availability: '/calendar/rooms',
    room_block: '/calendar/block',
    room_calendar_export: '/calendar/rooms/export',
    room_create: '/room/create',
    room_make_available: '/calendar/make_available',
    room_make_unavailable: '/calendar/make_unavailable',
    room_unblock: '/calendar/unblock',
    room_update: '/room/update',
    rooms_export: '/room/export',
    rooms_list: '/rooms/list',
    save_form: '/custom_form/update',
    set_announcements: '/setting/announcement_update',
    standard_report_export_url: '/users/meetings.pdf?user_uuid={{uuid}}',
    time_zone_url: '/time_zone',
    ui_get_settings: '/setting/ui',
    ui_set_setting: '/setting/ui_update',
    update_mail_template: '/mail_template/update',
    update_minimum_timeslot: '/setting/minimum_timeslot_update',
    update_user_profile: '/user/{{uuid}}',
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
    users_events_filters: '/users_events_filters',
    checkin_meetings: '/checkin_list',
    update_checkin_status: '/checkin/toggle_checkin',
    integration_field_mappings: '/integration/field_mappings',
    set_user_cis_status: '/set_user_cis_status/{{id}}',
    double_booked_resources: "/meeting_request/double_booked_resources",
    mappable_users: '/fetch_mappable_users',
    mappable_requestors: '/fetch_requestors',
    reinvite_attendee_to_meeting: '/meeting_request/reinvite',
    activity_settings: '/configure/activity_settings',
    events: '/events',
    checkin_consecutive_meetings_list: '/checkin_consecutive_meetings',
    consecutive_meeting_list: 'consecutive_meeting_list',
  },

  update: function(options) {
    var options = _.assign({
      dataType: 'json',
      type: 'post',
      url: '/events',
      // global: true,
      prefix: envDetails['urlPrefix'],
      data: {event: null}
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
      // global: true,
      prefix: envDetails['urlPrefix'],
      url: '/events',
      trimSearch: true
    }, options);


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