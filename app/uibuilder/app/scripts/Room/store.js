var RoomActions = require("./actions");
var Api = require('common_api');

var EventStore = Reflux.createStore({
  init: function() {
    this.listenToMany(RoomActions);
    this.eventDetails = {}
  },
  onFetchEventDetails: function() {
    var promise = Api.fetch({
      url: Api.ENDPOINTS.event_details
    })

    promise.done(function(apiResponse) {
      this.eventDetails = apiResponse.data;
      this.trigger({
        success: true,
        type: 'eventDetails'
      })
    }.bind(this));
  },
  isStaffSchedulingEvent: function() {
    return this.eventDetails.isStaffScheduling == true
  },
  isCurrentUserAdmin: function() {
    var eventDetails = this.eventDetails;
    var isAdmin = eventDetails.isMeetingManager || eventDetails.isCSM;
    return isAdmin;
  },
  getCurrentUserUuid: function() {
    return this.eventDetails.current_user.uuid;
  }
})

var RoomStore = Reflux.createStore({

  init: function() {
    this.listenToMany(RoomActions);
    this.rooms = {
      items: []
    };
    this.current_page = 1;
    this.total_pages = 0;
    this.fetching = false;
    this.per_page_meeting_count = 10;
    this.filters = {};
    this.search = '';
    this.toggleStore = {
      'tile': {
        view: 'tile-view',
        tile: 'col-md-3 col-sm-4'
      },
      'list': {
        view: 'list-view',
        tile: 'col-md-12'
      }
    };
    this.toggleState = {
      viewStyle: this.toggleStore[this.getLocalToggle()]['view'],
      tileSize: this.toggleStore[this.getLocalToggle()]['tile']
    }
  },

  getLocalToggle: function(key) {
    return commons.getItem('room-list') || 'tile';
  },

  getFilters: function() {
    return this.filters;
  },

  setFilters: function(data) {
    this.filters = data;
  },

  onFetchFilters: function() {
    var promise = Api.fetch({
      url: Api.ENDPOINTS.room_filters
    })
    promise.then(function(apiResponse) {
      this.trigger({ type: 'fetchFilters', data: apiResponse.data });
    }.bind(this));
  },

  onFetchOptions: function(params, success) {
    var data = EventStore.isCurrentUserAdmin() === true ? {
      search: params.term,
      per_page: 500
    } : {
      search: params.term,
      per_page: 500,
      user_uuids: [EventStore.getCurrentUserUuid()]
    }
    var promise = Api.fetch({
      data: data,
      url: Api.ENDPOINTS.tag_list
    })
    promise.done(function(apiResponse) {
      var returnData = apiResponse.data.tags.map(function(tag) {
        return [tag.uuid, tag.name];
      })
      success(returnData);
    }.bind(this));
  },

  generateExportUrl: function() {
    var prefix = envDetails['urlPrefix'] || "";
    var queryString = "?search=" + this.getSearchValue();
    _.map(this.getFilters(), function(values, filter_type) {
      if (values.length > 0) {
        queryString += "&" + filter_type + "[]=" + values.join("&" + filter_type + "[]=");
      }
    });

    if(envDetails.current_location_uuid){
      queryString += "&current_location_uuid="+ envDetails.current_location_uuid;
    }

    return [prefix, Api.ENDPOINTS.rooms_export, queryString].join("");
  },

  onBulkInactivateRooms: function(selectedRoomHash, selectAllFlag) {
    var data = {};

    if(selectAllFlag === true){
      data.room_uuids = [];
      data.filters = _.merge({ search: this.getSearchValue() }, this.getFilters());
    }else{
      data.room_uuids = this.getAvailableSelectedRooms(selectedRoomHash);
    }

    var promise = Api.update({
      type: "post",
      url: Api.ENDPOINTS.inactivate_rooms,
      data: data
    });
    promise.then(function(data) {
        RoomActions.notifyInactivateRooms(data);
        this.trigger({type: 'resetRoomsList'})
    }.bind(this));
    promise.fail(function(error) {
      console.log("Alert error", error);
    }.bind(this));
  },

  getAvailableSelectedRooms: function(selectedRoomHash, prop) {
    var availableSelectedRooms = [];
    if (typeof prop === 'undefined') {
      prop = 'uuid';
    }
    this.rooms.items.forEach(function(room) {
      if (selectedRoomHash[room.uuid]) {
        availableSelectedRooms.push(room[prop]);
      }
    });
    return availableSelectedRooms;
  },

  onToggleView: function(selectedView) {
    this.toggleState = {
      viewStyle: this.toggleStore[selectedView]['view'],
      tileSize: this.toggleStore[selectedView]['tile']
    }

    this.trigger({
      type: 'viewchanged',
      data: this.toggleState
    });
  },

  isFilterORSearchApplied: function() {
    var isApplied;
    isApplied = _.isEmpty(this.getFilters()) && !this.search? false : true;
    return isApplied;
  },

  getSearchValue: function() {
    return this.search;
  },
  onFetchRooms: function(page_no) {
    if (this.getFetchState() == false) {
      this.updateFetchState(true);

      var dataToSent = _.merge(_.cloneDeep(this.getFilters()), { page: page_no, per_page: this.per_page_meeting_count, search: this.getSearchValue() });
      var promise = Api.fetch({
        url: Api.ENDPOINTS.rooms_list,
        data: dataToSent
      });

      promise.done(function(data) {
        this.rooms.total_entries = data.rooms.total_entries;
        this.rooms.toggleState = this.toggleState;

        data.rooms.items.forEach(function(room) {
          room.last_updated = commons.convertToTzone(room.updated_at);
          room.types = room.activities;
          room.room_active_status = room.active ? "yes" : "no";
          room.tag_clouds.map(function(tag_cloud, index) {
            room[tag_cloud.uuid] = tag_cloud.tags;
          });
        });
        this.rooms.items = this.rooms.items.concat(data.rooms.items);

        this.setCurrentPage(this.getCurrentPage() + 1);
        this.setTotalPageCount(Math.ceil(data.rooms.total_entries / this.per_page_meeting_count));
        this.trigger({
          type: "roomlisting",
          data: this.rooms
        });
        this.updateFetchState(false);
      }.bind(this));
    }
  },
  onActivateRoom: function(uuid) {
    var promise = Api.update({
      url: Api.ENDPOINTS.activate_room.replace('{{uuid}}', uuid),
      type: 'put'
    });
    promise.done(function() {

    }.bind(this));
    promise.fail(function() {

    }.bind(this));
  },
  setCurrentPage: function(page_no) {
    this.current_page = page_no;
  },
  getCurrentPage: function() {
    return this.current_page;
  },
  setTotalPageCount: function(count) {
    this.total_pages = count;
  },
  getTotalPageCount: function() {
    return this.total_pages;
  },
  updateFetchState: function(state) {
    this.fetching = state;
  },
  getFetchState: function(state) {
    return this.fetching;
  },
  resetRooms: function() {
    this.rooms = {
      items: []
    };
    this.rooms.total_entries = 0;
  },
  onSearchRooms: function(search) {
    this.onUpdateSearch(search);
    this.setCurrentPage(1);
    this.resetRooms();
    this.onFetchRooms(1);
  },

  onUpdateFilter: function(filterData) {
    this.setFilters(filterData);
  },
  onResetFilter: function() {
    this.onUpdateFilter({});
    this.setCurrentPage(1);
    this.resetRooms();
    this.onFetchRooms(1);
  },
  onApplyFilter: function(data) {
    this.onUpdateFilter(data);
    this.setCurrentPage(1);
    this.resetRooms();
    this.onFetchRooms(1);
  },
  onUpdateSearch: function(search) {
    this.search = search
  },
  getModelFor: function(uuid) {
    return _.find(this.rooms.items, {
      uuid: uuid
    });
  },

  onUploadRoomcsv: function(data) {
    var promise = Api.update({
      url: Api.ENDPOINTS.upload_room_csv,
      data: data,
      processData: false,
      contentType: false,
    });
    promise.done(function(data) {
      if (data.success) {
        RoomActions.notifyCsvUpload();
        this.resetRooms();
        this.onFetchRooms(1);
      } else RoomActions.notifyCsvUpload(data);
    }.bind(this));

    promise.fail(function(error) {
      console.log("Upload room csv error", error);
    }.bind(this));
  },

  onSyncCisBulkDownload: function(url) {
    var promise = Api.fetch({
      url: url
    });
    promise.done(function(data) {

    }.bind(this));
  }
});

var MeetingStore = Reflux.createStore({
  init: function() {
    this.listenToMany(RoomActions);
    this.meetingTypes = [];
  },
  onFetchMeetingTypes: function() {
    var promise = Api.fetch({
      url: Api.ENDPOINTS.fetch_activity_list, //meeting_types
      data: {
        exclude_consecutive_meeting_types: true,
      }
    });
    promise.done(function(data) {
      this.meetingTypes = data;
      this.trigger(this.meetingTypes)
    }.bind(this));
  },
  getUuidsForActivities: function(activityNames) {
    var activities = _.filter(this.meetingTypes, function(meetingType) {
      return activityNames.indexOf(meetingType.name) != -1
    })
    return _.pluck(activities, 'uuid');
  }
});

var BriefingCentreStore = Reflux.createStore({
  init: function() {
    this.listenToMany(RoomActions);
    this.briefingCentre = [];
  },
  onFetchBriefingTypes: function() {
    var promise = Api.fetch({
      url: Api.ENDPOINTS.briefing_centre
    });
    promise.done(function(data) {
      this.briefingCentre = data.data.briefing_centres;
      this.trigger(this.briefingCentre);
    }.bind(this));
  }
});

var FacilityStore = Reflux.createStore({
  init: function() {
    this.listenToMany(RoomActions);
    this.facilities = [];
  },
  onFetchFacilities: function() {
    var promise = Api.fetch({
      url: Api.ENDPOINTS.facilities_list
    });
    promise.done(function(data) {
      this.facilities = data;
      this.trigger(this.facilities)
    }.bind(this));
  }
});

var TagStore = Reflux.createStore({
  init: function() {
    this.listenToMany(RoomActions);
  },
  onFetchTags: function(params, successCallBack) {
    var data = {
      search: params.term,
      tag_cloud_uuid: params.tag_cloud_uuid,
      per_page: 500
    };
    if (EventStore.isCurrentUserAdmin() === false) {
      data.user_uuids = [EventStore.getCurrentUserUuid()];
    }
    var promise = Api.fetch({
      url: Api.ENDPOINTS.tag_list,
      data: data
    });
    promise.done(function(apiResponse) {
      successCallBack(apiResponse.data.tags);
    }.bind(this))
  }
});

var AddEditRoomStore = Reflux.createStore({
  init: function() {
    this.listenToMany(RoomActions);
  },
  onCreateRoom: function(room) {
    console.log(room);
    var activities = room.activities;
    var facilities = room.facilities;
    var tagClouds = room.tag_clouds;

    delete room.activities;
    delete room.facilities;
    delete room.tag_clouds;

    var data = {
      room: room
    };
    data.facilities = _.isEmpty(facilities) === true ? [] : facilities;
    data.activities = _.isEmpty(activities) === true ? [] : activities;
    data.tag_clouds = _.isEmpty(tagClouds) === true ? [] : tagClouds;
    room.capacity = _.isEmpty(room.capacity) === true ? 0 : room.capacity;

    var promise = Api.update({
      url: Api.ENDPOINTS.room_create,
      data: data
    });

    promise.done(function(data) {
      if (data.success == true) {
        var title = i18n.t(data.locale_key, {
          currentuser: envDetails.currentUser.first_name
        });
        RoomActions.notifyAddNewRoom(data);
        this.trigger(data);
      }
    }.bind(this));

    promise.fail(function(apiResponse) {
      RoomActions.notifyAddNewRoom(apiResponse.responseJSON);
    }.bind(this));
  },
  onUpdateRoom: function(room, send_ics) {
    var activities = room.activities;
    var facilities = room.facilities;
    var uuid = room.uuid;
    var tagClouds = room.tag_clouds;

    delete room.uuid;
    delete room.activities;
    delete room.facilities;
    delete room.tag_clouds;

    var data = {
      room: room,
      room_uuid: uuid
    };

    if(send_ics)
      data['send_ics'] = send_ics;

    data.facilities = _.isEmpty(facilities) === true ? [] : facilities;
    data.activities = _.isEmpty(activities) === true ? [] : activities;
    data.tag_clouds = _.isEmpty(tagClouds) === true ? [] : tagClouds;
    room.capacity = _.isEmpty(room.capacity) === true ? 0 : room.capacity;

    var promise = Api.update({
      url: Api.ENDPOINTS.room_update,
      data: data
    });
    promise.done(function(data) {
      if (data.success == true) {
        var title = i18n.t('create_room_success_title', {
          currentuser: envDetails.currentUser.first_name
        });
        RoomActions.notifyAddNewRoom(data, send_ics);
        this.trigger(data);
      }
    }.bind(this));
    promise.fail(function(apiResponse) {
      RoomActions.notifyAddNewRoom(apiResponse.responseJSON);
    })
  }
});

var NotificationStore = Reflux.createStore({
  listenables: RoomActions,
  init: function() {},

  onNotifyCsvUpload: function(data) {
    var type, message, header;
    var isStaffEvent = EventStore.isStaffSchedulingEvent();
    if (data === undefined) {
      type = 'green';
      message = isStaffEvent === true ? i18n.t("locations_addtion_success") : i18n.t("rooms_addition_success");
      header = i18n.t("room_csv_upload_success_header");
    } else {
      type = 'red';
      message = this.constructErrorMessage(data.errors);
      header = i18n.t("room_csv_upload_failure_header");
    }

    this.trigger({
      header: header,
      message: message,
      type: type
    });
  },

  constructErrorMessage: function(errors) {

    if (typeof errors == "string") {
      return errors;
    }

    var errorMessage = "";
    _.each(errors, function(error, key) {
      errorMessage = errorMessage + key + " " + error + "</br>";
    });

    return $('<span>' + errorMessage + '</span>');
  },

  onNotifyAddNewRoom: function(data, isICSSent) {
    var header, message, type;

    if (data.success == true) {
      header = i18n.t("add_room_notification_success_header");
      message = data.message;
      type = 'green';

      if(typeof isICSSent !== 'undefined' && isICSSent === false){
        message += " " + i18n.t("ics_not_sent_acknowledgement");
      }
    } else {
      header = i18n.t("add_room_notification_failure_header");
      message = this.constructErrorMessage(data.errors);
      type = 'red';
    }
    this.trigger({
      header: header,
      message: message,
      type: type
    });
  },

  onNotifyInactivateRooms: function(data) {

    var message = data.message;
    if(data.errors.length > 0){
      message += "<br/> Following were not updated : <br/>";
      var failureMsgs = [];
      _.forEach(data.errors, function(failureMessage){
        failureMsgs.push(failureMessage);
      })
       message += failureMsgs.join("<br/>");
    }

    this.trigger({
      header: ((data.errors.length == 0 ) ? i18n.t('room_inactivated_header', { first_name: envDetails.currentUser.first_name }) : i18n.t('room_inactivated_failure_header')),
      type: (data.success ? 'green' : 'red'),
      message: message
    });
  }
});


module.exports = {
  RoomStore: RoomStore,
  MeetingStore: MeetingStore,
  FacilityStore: FacilityStore,
  AddEditRoomStore: AddEditRoomStore,
  NotificationStore: NotificationStore,
  BriefingCentreStore: BriefingCentreStore,
  EventStore: EventStore
}