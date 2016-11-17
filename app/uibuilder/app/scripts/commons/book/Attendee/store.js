var AttendeeActions = require('./actions');
var Api = require('common_api');

var AttendeeStoreObj = {


  init: function() {
    this.listenToMany(AttendeeActions);
    this.attendees = {};
    this.externalAttendees = {};
    this.perPage = 15;
    this.fetching = false;
    this.fetchingExternal = false;
    this.attendee_type = 'internal';
    this.selection = {};
    this.tag_clouds = {};
    this.externalAttendeeSelection = {};
    this.editAttendeeStatusHash = { internal: {}, external: {} };
    this.handlerFuncs = {};
    this.canSelect = true;
    if (masterMeetingType.name === TRACK_AND_SESSION && mapping_module) {
      this.handlerFuncs = {
        resetAttendees: this.resetAttendeesForTrack
      };
    } else {
      this.handlerFuncs = {
        resetAttendees: this.resetAttendees
      };
    }
  },

  updateInviteeHash: function(uuid, inviteStatus) {
    var user = this.editAttendeeStatusHash['internal'][uuid] || this.editAttendeeStatusHash['external'][uuid];
    if (user) {
      user.invite_status = inviteStatus;
    }
  },

  onResetParticipantList: function(){
    this.selection = {};
    this.onEditAttendees({internal: [ ], external: [ ]});
    this.onSearchInternal(this.searchTerm);
  },

  setTagCloudFilter: function(tagCloudUuid, tags){
    this.tag_clouds[tagCloudUuid] = tags;
    this.externalAttendeeSelection = {};
  },

  setTagCloudFilterForEdit: function(tagCloudFilter){
    this.tag_clouds = tagCloudFilter;
  },

  onFetchInternal: function(nextPage, additionalParams) {
    if (this.fetching === false) {
      this.fetching = true;
      var tagClouds = _.pick(this.tag_clouds, function(tags, tagCloud){return !_.isEmpty(tags)})
      var params = _.assign({
        per_page: this.perPage,
        page: nextPage,
        search: this.searchTerm,
        activity_uuid: selectedActivityUuid,
        tag_clouds: tagClouds
      }, additionalParams);
      if (typeof selectedTopicUuuid !== 'undefined') {
        params.topic_uuid = selectedTopicUuuid;
      }

      if (mapping_module) {
        params['special_appointment'] = true;
      }

      this.fetchUsers(params, 'internal', function(result) {
        result.groupByTag = !_.isEmpty(tagClouds);
        console.log("Fetch internal attendees: ", result.items);
        this.trigger({ type: 'fetchAttendees', data: result});
        this.fetching = false;
      });
    }
  },

  fetchUsers: function(params, type, callback) {
    if (typeof meetingInfo !== 'undefined' && meetingInfo.request.mode === "edit") {
      params['meeting_request'] = meetingInfo.request.uuid;
    }
    this.setTimes(params);
    var endPoint = (type === 'external' ? Api.ENDPOINTS.external_attendees : Api.ENDPOINTS.internal_attendees);
    var promise = Api.fetch({
      url: endPoint,
      data: params
    });

    promise.then(function(apiResponse) {
      var data = apiResponse.data,
        attendeeList;
      if (type === 'external') {
        this.externalAttendees = this.prepareAttendeeHash(data.items, this.externalAttendees);
        attendeeList = this.prepareExternalAttendeeList();
      } else {
        this.attendees = this.prepareAttendeeHash(data.items, this.attendees);
        var currentUserUuid = envDetails.currentUser.uuid;
        delete this.attendees[currentUserUuid];
        attendeeList = this.prepareAttendeeList();
      }
      var result = { items: attendeeList, current_page: data.current_page, total_pages: data.total_pages, total_items: data.total_entries };
      callback.call(this, result);
    }.bind(this));
  },

  onFetchExternal: function(page, additionalParams) {
    if (this.fetchingExternal === false) {
      this.fetchingExternal = true;
      var params = _.assign({
        per_page: this.perPage,
        page: page,
        search: this.searchTerm,
        activity_uuid: selectedActivityUuid
      }, additionalParams);
      if (mapping_module) {
        params['special_appointment'] = true;
      }

      this.fetchUsers(params, 'external', function(result) {
        this.fetchingExternal = false;
        console.log("Fetch external attendees: ", result.items);
        this.trigger({ type: 'fetchExternalAttendees', data: result })
      });
    }
  },

  setTimes: function(params) {
    if (this.currentEvent) {
      var startDate = this.currentEvent.start_date;
      var endDate = this.currentEvent.end_date;
      var durationInMinutes = (endDate - startDate) / 1000 / 60;
      params['start_time'] = startDate.getHours() * 60 + startDate.getMinutes();
      params['end_time'] = params['start_time'] + durationInMinutes;
      params['event_date'] = moment(startDate).format('DD-MM-YYYY');
    }
  },

  prepareAttendeeList: function() {
    var attendeeList = _.map(this.attendees, function(attendee, uuid) {
      if (_.isEmpty(this.selection[uuid])) {
        attendee.selected = false;
      } else {
        attendee.selected = true;
      }
      return attendee;
    }.bind(this));

    _.forEach(this.selection, function(attendee, uuid) {
      if (uuid != envDetails.currentUser.uuid && _.isEmpty(this.attendees[uuid])) {
        attendeeList.push(attendee);
      }
    }.bind(this));
    return attendeeList;
  },

  prepareAttendeeHash: function(attendees, attendeeHash) {
    attendees.map(function(attendee, index) {
      attendeeHash[attendee.uuid] = attendee;
    }.bind(this));
    return attendeeHash
  },

  prepareExternalAttendeeList: function() {
    var attendeeList = _.map(this.externalAttendees, function(attendee, uuid) {
      if (_.isEmpty(this.externalAttendeeSelection[uuid])) {
        attendee.selected = false;
      } else {
        attendee.selected = true;
      }
      return attendee;
    }.bind(this));

    _.forEach(this.externalAttendeeSelection, function(attendee, uuid) {
      if (_.isEmpty(this.externalAttendees[uuid])) {
        attendeeList.push(attendee);
      }
    }.bind(this));
    return attendeeList;
  },


  onSelectInternalAttendee: function(uuid) {
    var user = this.attendees[uuid];
    if (user) {
      user.selected = true;
      this.selection[user.uuid] = user;
      this.trigger({ type: 'internalAttendeeSelected', user: user });
    }
  },

  onSelectExternalAttendee: function(uuid) {
    var user = this.externalAttendees[uuid];
    if (user) {
      user.selected = true;
      this.externalAttendeeSelection[user.uuid] = user;
      this.trigger({ type: 'externalAttendeeSelected', user: user });
    }
  },

  onUnselectInternalAttendee: function(uuid) {
    var user = this.selection[uuid];
    if (user) {
      user.selected = false;
      delete this.selection[uuid];
      this.trigger({ type: 'internalAttendeeUnselected', user: user });
    }
  },

  onUnselectExternalAttendee: function(uuid) {
    var user = this.externalAttendeeSelection[uuid];
    if (user) {
      user.selected = false;
      delete this.externalAttendeeSelection[uuid]
      this.trigger({ type: 'externalAttendeeUnselected', user: user });
    }
  },

  onResetAttendeeList: function() {
    this.selection = {};
    this.externalAttendeeSelection = {};
  },

  onEditAttendees: function(attendees) {
    var attendeeList = attendees.internal;
    if(!_.isEmpty(attendeeList)){

      attendeeList.map(function(attendee, index){
        attendee.selected = true;
        this.selection[attendee.uuid] = attendee;
      }.bind(this));
    }

    var externalAttendeeList = attendees.external;
    if(!_.isEmpty(externalAttendeeList)){

      externalAttendeeList.map(function(attendee, index){
        attendee.selected = true;
        this.externalAttendeeSelection[attendee.uuid] = attendee;
      }.bind(this));
    }
    this.trigger({ type: 'editAttendees', users: attendees });
  },

  onTabChanged: function(type) {
    var term = this.searchTerm || '';
    if (type === 'external') {
      term = this.externalSearchTerm || '';
    }
    this.trigger({ type: 'tabChanged', searchTerm: term, roles: {} });
  },

  resetInternalList: function() {
    this.attendees = {};
    this.fetching = false;
  },

  resetExternalAttendees: function() {
    this.externalAttendees = {};
    this.fetchingExternal = false;
  },

  onSearchInternal: function(searchTerm) {
    this.resetInternalList();
    this.searchTerm = searchTerm;
    this.onFetchInternal(1);
  },

  onSearchExternal: function(searchTerm) {
    this.resetExternalAttendees();
    this.searchTerm = searchTerm;
    this.onFetchExternal(1);
  },

  onEventCreated: function(event) {
    this.currentEvent = event;
    this.handlerFuncs['resetAttendees']();
  },

  onShowAttendeesList: function(attendeeType) {
    this.trigger({type: 'showAttendeesList', attendeeType: attendeeType});
  },

  resetAttendeesForTrack: function() {},

  resetAttendees: function() {
    this.resetInternalList();
    this.onFetchInternal(1);
    if (typeof selectedTopicUuuid !== 'undefined') {
      this.resetExternalAttendees();
      this.onFetchExternal(1);
    }
  },

  onTopicChange: function() {
    this.handlerFuncs['resetAttendees']();
  }
}

var AddEditAttendeeStoreObj = {

  init: function() {
    this.listenToMany(AttendeeActions);
    this.attendee_data = {};
    this.attendee_type = 'internal';
  },

  updateAttendeeData: function(data) {
    this.attendee_data = data;
  },

  updateAttendeeType: function(type) {
    this.attendee_type = type;
  },

  onCreateAttendee: function() {
    var promise = Api.update({
      url: Api.ENDPOINTS.user_create,
      data: {
        user: this.attendee_data,
        user_type: this.attendee_type,
        activity_uuid: selectedActivityUuid
      }
    });
    promise.then(function(response) {
      if (response.status === 200) {
        this.addAttendeeData(response.data, true);
      }
    }.bind(this));

    promise[promise.fail ? 'fail' : 'catch'](function(response) {
      this.trigger({ error: response.responseJSON, success: false });
    }.bind(this));
  },

  addAttendeeData: function(data, isNew) {
    // to be given
  }
};



module.exports = {
  AttendeeStoreObj: AttendeeStoreObj,
  AddEditAttendeeStoreObj: AddEditAttendeeStoreObj
}
