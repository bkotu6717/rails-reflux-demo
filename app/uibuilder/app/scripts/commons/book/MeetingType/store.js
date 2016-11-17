var MeetingTypeActions = require("./actions");
var AttendeeActions = require("../Attendee/actions");
var Api = require('common_api');

var MeetingStoreObj = {

  init: function() {
    this.listenToMany(MeetingTypeActions);
    this.activity = '';
    this.selectedMeetingType = {};
    this.selectedRoom = {};
    this.attendeeCount = 0;
    this.showOverlay = false;
    this.tag_clouds = {};
    this.activityDetailsForARoom = {}
    this.staffEventType = "StaffScheduling";
    this.activitySettings = {};
  },
  setActivity: function(activity) {
    this.activity = activity;
  },
  getActivity: function() {
    return this.activity;
  },

  setActivitySettings: function(activitySettings){
    this.activitySettings = activitySettings;
  },

  getActivitySettings: function(){
    return this.activitySettings;
  },

  setActivityDetailsForARoom: function(details){
    this.activityDetailsForARoom = details;
  },
  getActivityDetailsForARoom: function(datetime){
    return this.activityDetailsForARoom[datetime];
  },
  getActivityRooms: function() {
    return this.activity.rooms;
  },
  getActivitySettings: function() {
    return this.activity.settings;
  },
  showAvailableRooms: function(attendeeCount) {
    this.onAttendeeCountChanged(attendeeCount);
    this.trigger({
      isCapicityFilter: true,
      action: 'filterAvailableRooms',
      payload: {isCapicityFilter: true}
    });
  },
  setTagCloudFilter: function(tagCloudUuid, tags){
    this.tag_clouds[tagCloudUuid] = tags;
    console.log(this.tag_clouds);
  },
  setTagCloudFilterForEdit: function(tagCloudFilter){
    this.tag_clouds = tagCloudFilter;
  },
  setMeetingTimes: function(params) {
    if (this.currentEvent) {
      var duration = (this.currentEvent.end_date - this.currentEvent.start_date) / 1000 / 60;
      var start = this.currentEvent.start_date.getHours() * 60 + this.currentEvent.start_date.getMinutes();
      var end = start + duration;
      params['event_date'] = moment(this.currentEvent.start_date).format("DD-MM-YYYY");
      params['start_time'] = start;
      params['end_time'] = end;
    }
  },
  onGetAllMeetingTypes: function(isFirstLoad, isNewEvent, additionalParams) {
    var params = {
      activity_uuid: selectedActivityUuid
    };
    this.setMeetingTimes(params);
    if (meetingInfo.request.mode === "edit") {
      params['meeting_request'] = meetingInfo.request.uuid;
    }
    if (typeof location_uuid != "undefined") {
      params['location_uuid'] = location_uuid;
    }

    //Get only attendees mapped to topic if topic user management is anabled and topic_uuid is available
    if (envDetails.topicManagementEnabled && envDetails.topicRoomMappingEnabled && typeof topic_uuid != "undefined") {
      params['topic_id'] = topic_uuid;
    }

    var tagClouds  = _.pick(this.tag_clouds, function(tags, tagCloud){return !_.isEmpty(tags)})

    if (typeof selectedTopicUuuid !== 'undefined') {
      params.topic_uuid = selectedTopicUuuid;
    }

    if (mapping_module) {
      params['special_appointment'] = true;
      params['mapping_uuid'] = (additionalParams && additionalParams.uuid) ? additionalParams.uuid : null;
    }

    var currentUserId = envDetails.currentUser.uuid;
    if(envDetails.isMeetingManager() === false && envDetails.isCSM() === false && envDetails.eventType === this.staffEventType){
      params.tagged_user_uuids = [currentUserId];
    }

    var promise = Api.fetch({
      url: Api.ENDPOINTS.room_activities,
      data: _.merge(params, { tag_clouds: tagClouds})
    });
    promise.then(function(data) {
      this.setActivity(data.data.activity);
      this.setActivitySettings(data.data.activity.settings);

      var configs = data.data.booking_configs;
      data.isCapicityFilter = false;

      this.getActivity().rooms = _.filter(this.activity.rooms, function(room) {
        room.mapped_meeting_types = _.pluck(room.activities, "name");
        return configs.can_book_room && room.available;
      })

      data.first_load = isFirstLoad;
      data.isNewEvent = isNewEvent;
      data.configs = configs;
      data.groupByTag = !_.isEmpty(tagClouds);
      this.trigger({action: 'fetchedRooms', payload: data});
    }.bind(this));

    promise[promise.fail ? 'fail' : 'catch'](function(error) {
      this.trigger(error.responseJSON);
    }.bind(this));
  },

  setSelectedRoom: function(room){
    this.selectedRoom = room;
  },

  getSelectedRoom: function(){
    return this.selectedRoom;
  },

  getMeetingType: function(uuid) {
    return _.find(this.meetingTypes, function(type) {
      return type.uuid === uuid;
    });
  },
  getSpecificRoom: function(roomUuid) {
    var allRooms = this.getActivityRooms();
    return _.find(allRooms, function(room, index) {
      return room.uuid === roomUuid;
    });
  },
  onRoomChosen: function(room) {
    this.selectedRoom = room;
    this.isOffsiteSelected = false;
    this.onAttendeeCountChanged(this.attendeeCount);
    this.trigger({
      action: 'onRoomChosen',
      payload: {
        type: this.getActivity(),
        room: room,
        offsite: false
      }
    });
  },
  onEditRoom: function(room) {
    this.selectedRoom = room;
    this.isOffsiteSelected = false;
    this.trigger({
      action: 'onRoomChosen',
      payload: {
        type: this.getActivity(),
        room: room,
        offsite: false
      }
    });
  },
  onOffsiteChosen: function(offsite) {
    this.selectedRoom = offsite;
    this.isOffsiteSelected = offsite !== null;
    this.onAttendeeCountChanged(this.attendeeCount);
    this.trigger({
      action: 'onRoomChosen',
      payload: {
        type: this.getActivity(),
        room: offsite,
        offsite: true
      }
    });
  },
  onEventCreated: function(event) {
    this.currentEvent = event;

    if(event){
      this.onGetAllMeetingTypes(false, true, { uuid : event.uuid });
    }else{
      this.onGetAllMeetingTypes(false, true);
    }
  },

  onTopicChange: function() {
    this.selectedRoom = {};
    this.onGetAllMeetingTypes(false, true);
  },

  isRoomBigEnough: function(selectedRoom) {
    return (this.attendeeCount <= selectedRoom.capacity);
  },
  onAttendeeCountChanged: function(count) {
    this.attendeeCount = count;
    var canSelectMore = true;
    if (this.selectedRoom && this.selectedRoom.capacity) {
      canSelectMore = this.attendeeCount < this.selectedRoom.capacity;
    }
    AttendeeActions.canSelectAttendees(canSelectMore);
    this.trigger({action: "onAttendeeCountChanged", payload: {canSelect: canSelectMore}})
  },

  onResetRoomList: function() {
    this.activity.rooms = [];
    // AttendeeActions.canSelectAttendees(true);
    this.selectedRoom = null;
    this.onAttendeeCountChanged(this.attendeeCount);
    this.trigger({ action:'onResetRoomList', payload: {type: this.getActivity(), room: null}});
    this.trigger({ type: "onResetRoomList" });
  }
}

module.exports = {
  MeetingStoreObj: MeetingStoreObj
}
