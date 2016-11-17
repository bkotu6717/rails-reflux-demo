var Actions = require("./actions");
var AttendeeActions = require('../Attendee/actions');
var Api = require('common_api');
var CalendarActions = require('../Calendar/actions');

var MeetingInMakingStoreObj = {

  init: function() {
    this.offsiteLabel = i18n.t('offsite');
    this.model = {
      room: {
        uuid: ''
      },
      external: [],
      internal: [],
      event: null,
      attendingMeetingStatus: null,
      account: {
        is_changed: true,
        acc: {
          id: '',
          name: ''
        },
        oppty: {
          id: '',
          name: ''
        }
      },
      tag_clouds: {}
    };
    this.activityModel = {
      room_uuid: '',
      activity: {}
    }
    this.listenToMany(Actions);
  },

  onGetQuickMeetingConfig: function() {
    Api.fetch({
      url: Api.ENDPOINTS.system_configurations
    }).then(function(apiResponse) {
      this.trigger({
        action: 'onGetQuickMeetingConfig',
        payload: apiResponse.data
      })
    }.bind(this));
  },

  getSelectedUsers: function(){
    return this.model.internal;
  },

  setTagCloudFilter: function(tagCloudUuid, tags){
    this.model.tag_clouds[tagCloudUuid] = tags;
  },

  setTagCloudFilterForEdit: function(tagCloudFilter){
    this.model.tag_clouds = tagCloudFilter;
  },

  onFetchRequestors: function(params, success, failure) {
    params.data.activity_uuid = selectedActivityUuid;
    var promise = Api.fetch({
      url: Api.ENDPOINTS.mappable_requestors,
      data: params.data
    });
    promise.done(success);
    promise[promise.fail ? 'fail' : 'catch'](failure);
    return promise;
  },

  onSetOffsiteLabel: function(offsiteLabel) {
    this.offsiteLabel = offsiteLabel;
  },

  onMeetingTypeChanged: function(data) {
    if(data.payload){
      if(data.action == "onRoomChosen"){
        this.model['room'] = data.payload.room || {};
        this.activityModel['room_uuid'] = this.model['room'].uuid;
        scheduler.callEvent('onDragEnd');
        CalendarActions.updateCalendar(this.model);
        this.trigger(data);
      }
    }
  },

  onMeetingAction: function(url, actionType, successHandler, failureHandler) {

    var promiseObj = {
      url: url
    }

    if (actionType == 'put') {
      promiseObj.type = 'PUT'
    }

    var promise = Api.update(promiseObj);

    promise.then(function(apiResponse) {
      this.trigger({
        action: successHandler,
        payload: apiResponse
      });
    }.bind(this));

    promise[promise.fail ? 'fail' : 'catch'](function(apiResponse) {
      var response = apiResponse.responseJSON;
      if (typeof jiffle !== 'undefined') {
        response = apiResponse;
      }
      this.trigger({
        action: failureHandler,
        payload: response.errors
      });
    }.bind(this));
  },

  onBehalfOfMeetingAction: function(url, userUuid, type, successHandler, failureHandler) {
    var promiseObj = {
      url: url
    };
    promiseObj.type = type;
    promiseObj.data = {
      user_uuid: userUuid
    }

    var promise = Api.update(promiseObj);

    promise.done(function(apiResponse) {
      apiResponse.onBehalfOf = userUuid;
      this.trigger({
        action: successHandler,
        payload: apiResponse
      });
    }.bind(this))
  },

  onUpdateAreYouAttending: function(value) {
    this.model.attendingMeetingStatus = value;
    this.trigger({
      action: 'onYouAreAttending',
      payload: value
    });
  },
  attendeeStoreSelection: function(payload) {
    var type = payload.type;
    var user = payload.user;

    var uuid;
    if (type === 'internalAttendeeSelected') {
      if (user) {
        uuid = user.uuid;
        var userExists = _.find(this.model['internal'], function(u) {
          return u.uuid === uuid;
        });
        if (!userExists) {
          this.model['internal'].push(user);
        }
        this.model['internal'] = _.uniq(this.model['internal'], function(attendee) {
          return attendee.uuid;
        });
      }
    } else if (type === 'internalAttendeeUnselected') {
      uuid = user && user.uuid;
      var internal = this.model['internal'];
      internal = _.remove(internal, function(u) {
        return u.uuid === uuid;
      });
    } else if (type === 'editAttendees') {
      this.model['internal'] = payload.users.internal.slice();
      this.model['external'] = payload.users.external.slice();
      if (payload.hasCurrUser) {
        this.model.attendingMeetingStatus = "yes";
      }
    }

    CalendarActions.updateCalendar(this.model);
    this.trigger({
      action: 'onAttendeeSelected',
      payload: {
        internalAttendee: this.model['internal'],
        externalAttendee: this.model['external'],
        validInternalAttendees: this.getNonDeclinedAttendees('internal'),
        validExternalAttendees: this.getNonDeclinedAttendees('external')
      }
    });
  },
  onEventCreated: function(event) {
    this.model['event'] = event;
    this.trigger({
      action: 'onEventCreated',
      payload: {
        event: this.model.event
      }
    });
  },


  isAttendeeRequired: function(type, relaxType) {
    var activity = MeetingTypeStore.MeetingStore.getActivity();
    return activity && activity.settings && (activity.settings[type] === "yes") && !this.canRelaxForMMs(activity.settings[relaxType]);
  },
  canRelaxForMMs: function(config) {
    return (envDetails.isCSM() || envDetails.isMeetingManager()) && (config === 'yes');
  },

  onAccountOpptySelected: function(option) {
    var type = option.type;
    var data = option.data;
    if (type === 'account') {
      this.model.account.is_changed = true;
      this.model.account.acc.id = data.id;
      this.model.account.acc.name = data.name;
    } else if (type === 'opportunity') {
      this.model.account.is_changed = true;
      this.model.account.oppty.id = data.id;
      this.model.account.oppty.name = data.name;
    }
  },

  isValidActivity: function(){
    var validationMsg = '';
    var title = '';
    var error = false;
    if(_.isEmpty(this.activityModel.room_uuid)){
      validationMsg = i18n.t("select_location_to_continue");
      title = i18n.t("select_room_to_continue_title");
      error = true;
    }else if(_.isEmpty(this.activityModel.activity)){
      validationMsg = i18n.t("select_timeslot_to_continue");
      title = i18n.t("select_timeslot_to_continue_title");
      error = true;
    }
    return { error: error, message: validationMsg, title: title };
  },

  isValidMeeting: function() {
    var validationMsg;
    var isMinimumInternalAttendeeRequired = this.isAttendeeRequired('internal_attendee_presence', 'relax_internal_attendee_presence_for_mm');
    var isMinimumExternalAttendeeRequired = this.isAttendeeRequired('external_attendee_presence', 'relax_external_attendee_presence_for_mm');
    if (this.model.attendingMeetingStatus === null) {
      validationMsg = i18n.t("select_if_attending_to_continue");
      return {
        error: true,
        message: validationMsg,
        title: i18n.t("select_if_attending_to_continue_title")
      };
    } else if (this.model.event === null) {
      validationMsg = i18n.t("select_timeslot_to_continue");
      return {
        error: true,
        message: validationMsg,
        title: i18n.t("select_timeslot_to_continue_title")
      };
    } else if ((this.model.room.uuid === '' || this.model.room.uuid === undefined) ^ (this.model.room.address !== undefined)) {
      validationMsg = i18n.t("select_room_to_continue");
      return {
        error: true,
        message: validationMsg,
        title: i18n.t("select_room_to_continue_title")
      };
    } else if (isMinimumInternalAttendeeRequired && this.getNonDeclinedAttendees('internal').length === 0) {
      validationMsg = i18n.t("select_min_internal_attendee_to_continue", {
        company_name: envDetails.companyName
      });
      return {
        error: true,
        message: validationMsg,
        title: i18n.t('meeting_notify_failure_title')
      };
    } else if (isMinimumExternalAttendeeRequired && this.getNonDeclinedAttendees('external').length === 0) {
      validationMsg = i18n.t("select_min_external_attendee_to_continue");
      return {
        error: true,
        message: validationMsg,
        title: i18n.t('meeting_notify_failure_title')
      };
    } else if ((typeof jiffle !== 'undefined') && this.model.account.acc.id === "") {
      validationMsg = i18n.t('sfdc_account_not_selected');
      return {
        error: false,
        confirmation: true,
        title: i18n.t('meeting_notify_failure_title'),
        message: validationMsg
      }
    }
    return {
      error: false
    };
  },
  getNonDeclinedAttendees: function(type) {
    return _.filter(this.model[type], function(user) {
      return (user && user.invite_status !== "declined");
    }) || [];
  },
  getAttendeeCount: function() {
    var internalCount = this.getNonDeclinedAttendees('internal').length;
    var externalCount = this.getNonDeclinedAttendees('external').length;
    return internalCount + externalCount;
  },
  canShowMeetingInMaking: function() {
    var model = this.model;
    return (model.event !== null || ((typeof model.room.uuid !== 'undefined') ^ (typeof model.room.address !== 'undefined')) || model.internal.length !== 0 || model.external.length !== 0);
  },
  onShowHideRequestorsDropdown: function(showRequestorsDropdown) {
    this.trigger({
      action: 'showHideRequestorsDropdown',
      payload: (showRequestorsDropdown ? 'yes' : 'no')
    });
  },
  onCreateMeeting: function(formData, requestor, isQuickBooked) {
    var users = this.model.internal.map(function(user) {
      return user.uuid
    });
    users = users.concat(this.model.external.map(function(user) {
      return user.uuid
    }));
    var format = "YYYY-MM-DD HH:mm A";
    var meetingWith = formData.meeting_with;
    delete formData["meeting_with"]
    var meetingRequest = {
      activity_uuid: this.model.meetingType.uuid,
      meeting_with: meetingWith,
      start_time: moment(this.model.event.start_date).format(format),
      end_time: moment(this.model.event.end_date).format(format),
      users: users,
      custom_fields: formData,
      requestor: requestor,
      quick_meeting: isQuickBooked
    }

    if (this.model.room.address !== undefined) {
      meetingRequest['offsite_location_name'] = this.model.room.name;
      meetingRequest['offsite_location_address'] = this.model.room.address;
    } else {
      meetingRequest['room_uuid'] = this.model.room.uuid;
    }

    if (typeof jiffle !== 'undefined') {
      meetingRequest['account_id'] = this.model.account.acc.id;
      meetingRequest['opportunity_id'] = this.model.account.oppty.id;
    }

    var payload = {
      meeting_request: meetingRequest
    };

    if (typeof briefing_uuid != "undefined") {
      payload['briefing_uuid'] = briefing_uuid;
    }

    if (typeof topic_uuid != "undefined") {
      payload['topic_uuid'] = topic_uuid;
    }

    if (typeof bam_uuid != "undefined") {
      payload['bam_uuid'] = bam_uuid;
    }

    var promise = Api.update({
      url: Api.ENDPOINTS.meeting_create,
      global: true,
      data: payload
    });

    promise.then(function(data) {
      this.trigger({
        action: 'onEventSaved',
        payload: data
      });
    }.bind(this));

    promise[promise.fail ? 'fail' : 'catch'](function(data) {
      var response = data.responseJSON;
      if (typeof jiffle !== 'undefined') {
        response = data;
      }
      this.trigger({
        action: 'onEventSaveFailed',
        payload: response
      });
    }.bind(this));
  },
  filterDeclined: function(users) {
    return _.partition(users, function(user) {
      if (user.invite_status && user.invite_status === "declined")
        return false;
      return true;
    })
  },
  onCheckDoubleBookedStatus: function(callbackFn) {
    var users = this.model.internal.map(function(user) {
      return user.uuid
    });
    users = users.concat(this.model.external.map(function(user) {
      return user.uuid
    }));
    var format = "YYYY-MM-DD HH:mm a";
    var params = {
      start_time: moment(this.model.event.start_date).format(format),
      end_time: moment(this.model.event.end_date).format(format),
      users: users,
      meeting_uuid: meetingInfo.request.uuid || ''
    };
    var promise = Api.update({
      url: Api.ENDPOINTS.double_booked_resources,
      global: false,
      data: params
    });
    promise.then(function(data) {
      data = data || {};
      data.callbackFn = callbackFn;
      this.trigger({
        action: 'onCheckDoubleBookedStatusSuccess',
        payload: data
      });
    }.bind(this));
    promise[promise.fail ? 'fail' : 'catch'](function(error) {
      error = error || {};
      error.callbackFn = callbackFn;
      this.trigger({
        action: 'onCheckDoubleBookedStatusFailed',
        payload: error
      });
    }.bind(this));
  },
  onRescheduleMeeting: function(formData, requestor) {
    var internalUsers = this.filterDeclined(this.model.internal);
    var externalUsers = this.filterDeclined(this.model.external);
    var users = _.pluck(internalUsers[0], 'uuid');
    users = users.concat(_.pluck(externalUsers[0], 'uuid'));
    var declinedUsers = _.pluck(internalUsers[1], 'uuid');
    declinedUsers = declinedUsers.concat(_.pluck(externalUsers[1], 'uuid'));
    var format = "YYYY-MM-DD HH:mm A";
    var meetingWith = formData.meeting_with;
    delete formData["meeting_with"]

    var meetingRequest = {
      activity_uuid: this.model.meetingType.uuid,
      meeting_with: meetingWith,
      start_time: moment(this.model.event.start_date).format(format),
      end_time: moment(this.model.event.end_date).format(format),
      users: users,
      declined_attendees: declinedUsers,
      custom_fields: formData,
      requestor: requestor,
      meeting_uuid: meetingInfo.request.uuid
    }

    if (this.model.room.address !== undefined) {
      meetingRequest['offsite_location_name'] = this.model.room.name;
      meetingRequest['offsite_location_address'] = this.model.room.address;
    } else {
      meetingRequest['room_uuid'] = this.model.room.uuid;
    }

    var payload = {
      meeting_request: meetingRequest,
      meeting_uuid: meetingInfo.request.uuid
    };

    if (typeof briefing_uuid != "undefined") {
      payload['briefing_uuid'] = briefing_uuid;
    }

    if (typeof topic_uuid != "undefined") {
      payload['topic_uuid'] = topic_uuid;
    }

    var promise = Api.update({
      url: Api.ENDPOINTS.reschedule_meeting,
      global: true,
      data: payload
    });
    promise.then(function(data) {
      this.trigger({
        action: 'onEventRescheduled',
        payload: data
      });
    }.bind(this));
    promise[promise.fail ? 'fail' : 'catch'](function(error) {
      this.trigger({
        action: 'onEventSaveFailed',
        payload: error
      });
    }.bind(this));
  },
  getInternalAttendees: function() {
    return this.model.internal;
  },
  getExternalAttendees: function() {
    return this.model.external;
  }
}

module.exports = {
  MeetingInMakingStoreObj: MeetingInMakingStoreObj
}