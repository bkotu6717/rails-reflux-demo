var CalendarActions = require("./actions");
var Api = require('common_api');

var CalendarEventStoreObj = {

  init: function() {
    this.listenToMany(CalendarActions);
  },
  onEventInfo: function() {
    var promise = Api.fetch({
      url: Api.ENDPOINTS.events_info
    });
    promise.then(function(data) {
      if (typeof meetingInfo !== 'undefined' && meetingInfo.request) {
        data.meetingRequest = meetingInfo.request
      }
      this.trigger({
        success: true,
        data: data
      });
    }.bind(this));

    promise[promise.fail ? 'fail' : 'catch'](function(error) {
      this.trigger({
        success: false,
        data: error.responseJSON
      });
    }.bind(this))
  }
}

var CalendarAvailabilityStoreObj = {
  init: function() {
    this.listenTo(CalendarActions.updateCalendar, this.onUpdateCalendar);
    this.listenTo(CalendarActions.mappingsFetched, this.onMappingsFetched);
    this.availabilities = {};
  },
  onMappingsFetched: function(data) {
    this.trigger({type: "mappings", data: data});
  },
  onUpdateCalendar: function(model) {
    var external_users = [];
    var roomUUID = _.result(model.room, 'uuid', '');
    this.isOffsiteSelected = !!model.room.address;
    var users = _.pluck(model.internal, 'uuid');
    if (typeof jiffle !== 'undefined') {
      if (model.external.length >= 1) {
        _.forEach(model.external, function(external) {
          external_users.push({
            title: external.title || "-",
            uuid: external.uuid,
            first_name: external.first_name,
            last_name: external.last_name,
            email: external.email,
            contact_no: external.contact_no || "-",
            company_name: external.company_name
          });
        });
      }
    } else {
      users = users.concat(_.pluck(model.external, 'uuid'));
    }
    if (users.length >= 0 || roomUUID) {
      var payload = {
        resources: {
          rooms: [roomUUID],
          users: users,
          external_users: external_users
        }
      }
      if (typeof meetingInfo !== 'undefined' && meetingInfo.request) {
        payload['meeting_uuid'] = meetingInfo.request.uuid;
      }

      if (typeof briefing_uuid != "undefined") {
        payload['briefing_uuid'] = briefing_uuid;
      }
      if(mapping_module){
        payload.special_appointment = true;
        payload.mapping_uuid = model.mapping_uuid;
      }
      payload.book_meeting = true;
      payload.offsite_selected = "no";
      payload.activity_uuid = selectedActivityUuid;
      var promise = Api.update({
        url: Api.ENDPOINTS.calendar_availability,
        data: payload
      });
      promise.then(function(data) {
        this.availabilities = data;
        this.trigger({type: "update", model: model, data: data});
      }.bind(this));

      promise[promise.fail ? 'fail' : 'catch'](function(error) {
        console.log("Error", error)
        this.trigger(error.responseJSON);
      }.bind(this));
    } else {
      Actions.initialAvailability();
    }
  }
}

var CalendarInitialAvailabilityStoreObj = {
  init: function() {
    this.listenTo(CalendarActions.initialAvailability, this.onInitialAvailability);
    this.initialAvailabilities = {};
    this.isOffsiteEnabled = false;
  },

  onInitialAvailability: function(isOffsiteEnabled) {
    var params = {
      activity_uuid: selectedActivityUuid
    };

    if (typeof briefing_uuid != "undefined") {
      params['briefing_uuid'] = briefing_uuid;
    }
    params['book_meeting'] = true;
    if (isOffsiteEnabled) {
      this.isOffsiteEnabled = true;
    }

    if(mapping_module){
      params['special_appointment'] = true;
    }

    var availabilityFetchUrl = Api.ENDPOINTS.availability_fetch;
    if (isEBCEvent) {
      availabilityFetchUrl = Api.ENDPOINTS.availability_fetch_ebc;
    }

    var promise = Api.fetch({
      url: availabilityFetchUrl,
      data: params
    });
    promise.then(function(data) {
      this.initialAvailabilities = data;
      this.trigger(data);
    }.bind(this));
    promise[promise.fail ? 'fail' : 'catch'](function(error) {
      this.trigger(error.responseJSON);
    }.bind(this));
  },
  getInitialAvailability: function() {
    var availabilityData = this.initialAvailabilities.data;
    if (availabilityData.combined_availabilities) {
      this.isOffsiteEnabled = true;
      return availabilityData.combined_availabilities;
    } else {
      this.isOffsiteEnabled = false;
      return this.initialAvailabilities.data.room_initial_availabilities;
    }
  }
}


module.exports = {
  CalendarEventStoreObj: CalendarEventStoreObj,
  CalendarAvailabilityStoreObj: CalendarAvailabilityStoreObj,
  CalendarInitialAvailabilityStoreObj: CalendarInitialAvailabilityStoreObj
}