var api_endpoints = require('./api_endpoints');
var method_endpoints = require('./method_endpoints');

// maintain no.of pending requests in queue for promise
var pendingRequests = 0;

if (typeof jiffle === 'undefined') {
  // It doesn't, so create an object with that name
  window["jiffle"] = {};
  // Get the jiffle object method
  if (typeof JNBookMeeting !== 'undefined') {
    jiffle.JNBookMeeting = JNBookMeeting;
    jiffleSFObj = 'JNBookMeeting';
  } else if (typeof JNEventMeetingList !== 'undefined') {
    jiffle.JNEventMeetingList = JNEventMeetingList;
    jiffleSFObj = 'JNEventMeetingList';
  }
}
else {
  if(jiffle.hasOwnProperty("JNEventMeetingList")){
    jiffleSFObj = 'JNEventMeetingList';
  }
  else if(jiffle.hasOwnProperty("JNBookMeeting")){
    jiffleSFObj = 'JNBookMeeting';
  }
}

$(document).ready(function() {
  $("#cover").fadeIn();
  $(window).on('load', function() {
    $("#cover").fadeIn();
  });

  $.urlParam = function(name, sourceStr) {
    var source = sourceStr || window.location.href;
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(source);
    if (results == null) { return ""; }
    else { return results[1] || 0; }
  }

  var promise = Api.fetch({
    url: Api.ENDPOINTS.get_nav_header
  });
  promise.then(function(response) {
    var html = HandlebarsTemplates['sfdc/nav-header']({
      headerLinks: response.data.links
    });
    $("#sf-jiffle-now").prepend(html);
  });
  promise.catch(function(data){
    var errors = _.flatten(_.values(data.responseJSON.errors));
    $(".notification-modal").notificationModal({
      class: 'red',
      timeout: true,
      title: "Information",
      body: errors.join(', ')
    });
  });
});

var Api = {
  ENDPOINTS: api_endpoints,
  update: function(options) {
    //Merge current_location_uuid with options.data
    if(options.data && options.data.constructor === FormData){
        options.data.append('current_location_uuid', envDetails.current_location_uuid);
    } 
    else {
        _.merge(options, {data:{current_location_uuid: envDetails.current_location_uuid}});
    }
    var promise = new Promise(function(resolve, reject) {
      pendingRequests++;
      if (/^https?/.test(options['url'])) {
        if(options['sfdc_method']){
          Api.parseUrlMethod(options, resolve, reject);
        }
        else {
          $("#cover").fadeIn();
          Api.makeJNCall('doJNPost', options['url'], resolve, reject);
        }
      } else {
        Api.parseUrlMethod(options, resolve, reject);
      }
    });

    promise.then(function(apiResponse, config) {
      pendingRequests--;
      if (!pendingRequests) {
        $("#cover").fadeOut();
      }
    }.bind(this));

    promise[promise.fail ? 'fail' : 'catch'](function(apiResponse) {
      pendingRequests--;
      if (!pendingRequests) {
        $("#cover").fadeOut();
      }
    }.bind(this));

    return promise;
  },

  fetch: function(options) {
    //Merge current_location_uuid with options.data
    _.merge(options, {data:{current_location_uuid: envDetails.current_location_uuid}});
    // create a promise and and increase the no.of pending requests
    // to handle the cover fadeIn, fadeOut
    var promise = new Promise(function(resolve, reject) {
      pendingRequests++;
      $("#cover").fadeIn();
      if (options.url && options.url.includes('/domains/validate')) {
        options.url = '/portal/domains/validate';
      }
      if (options.url && (options.url == '/user_form_fields' || options.url == '/forms')) {
        options.url = '/portal'+ options.url;
      }
      Api.parseUrlMethod(options, resolve, reject);
    });

    // once the promise resolved check the no.of pending requests
    // if all the promises are resolved then hide the cover
    promise.then(function(apiResponse) {
      pendingRequests--;
      if (pendingRequests === 0) {
        window.setTimeout(function() {
          if (pendingRequests === 0)
            $("#cover").fadeOut();
        }, 500);
      }
    }.bind(this));

    promise[promise.fail ? 'fail' : 'catch'](function(apiResponse) {
      pendingRequests--;
      if (pendingRequests === 0) {
        $("#cover").fadeOut();
      }
    }.bind(this));
    return promise;
  },

  // based on the option url select params that are to be passed
  // sfdc method to be inovoked
  // and callback if there are any after call success
  // Note:: callback will always accept response and requtrn response,
  // it's ideally preferred to do manipulations on the response.
  parseUrlMethod: function(options, resolve, reject) {
    var query = "";
    if(!$.isEmptyObject(options.data)){
      if((options.url === "SFDC") || (options.url === "/fetch_sfdc_contacts_fields")){
        query = options.data;
      } 
      else{
        query = $.param({api_params:options.data});
      }
      if(options.url === "/user/create"){
        query = JSON.stringify({api_params:options.data});
      }
    }
    var commonParams = {
      queryStr: query,
      url: options.url,
      eventName: (options.url.includes('/portal') ? "" : $.urlParam('eventName'))
    };
    var endpointKey = (_.invert(Api.ENDPOINTS))[options['url']] || options.sfdc_method;
    var method_endpoint = method_endpoints[endpointKey] || {};
    var methodName = method_endpoint.sfdcMethod || 'callJNMethod';
    var currentParam = (method_endpoint.params) ? method_endpoint.params(options): {};
    var params = _.assign(commonParams, currentParam);
    var callbackMethod = method_endpoint.callback;
    Api.makeJNCall(methodName, params, resolve, reject, callbackMethod);
  },

  makeJNCall: function(method, params, resolve, reject, callback) {
    jiffle[jiffleSFObj][method](params, function(result, event) {
      var errorResponse = { responseJSON: {} };
      var response = (typeof result == "string") ? JSON.parse(_.unescape(result)) : result;
      if (event.statusCode === 200) {
        if (typeof callback !== 'undefined') {
          response = callback(response);
        }
        if (response.status || response.success){
          if (response.status === 200 || response.success){
            resolve(response);
          }
          else {
            errorResponse.responseJSON = response;
            reject(errorResponse);
          }
        }
        else {
          resolve(response);
        }
      } else {
        errorResponse.responseJSON = response;
        reject(response);
      }
    });
  },

  sfdcHandler: {
    meetingInit: function(callback) {
      var promise = Api.fetch({
        url: Api.ENDPOINTS.event_env_details
      });
      promise.then(function(response) {
        window.envDetails = {};
        envDetails.event = response.data.event;
        envDetails.currentMeetingUuid = response.data.new_meeting_uuid;
        //pvrcs: Will be changed to read form the response once attachments feature is supported by SFDC
        envDetails.canShowAttachmentsField = false;//response.data.can_show_attachments_field;
        envDetails.currentUser = response.data.current_user;
        envDetails.isCSM = function() {
          return response.data.isCSM;
        };
        envDetails.isMeetingManager = function() {
          return response.data.isMeetingManager;
        };
        envDetails.isEBCEvent = function() {
          return response.data.isEBCEvent;
        };
        envDetails.isJuniorMM = function() {
          return response.data.isJuniorMM;
        };
        envDetails.isActivityManager = function(){
          return response.data.isActivityManager; 
        };

        // Global variable setting as it's using in all the places as global variable.
        window.isEBCEvent = response.data.isEBCEvent;
        window.show_overlay = response.data.show_overlay;
        window.activties_attributes = response.data.activities_attributes;
        window.event_home_page = false;
        if (typeof callback === 'function') {
          callback();
        }
      });
    },

    bookMeetingInit: function(callback) {
      mode = 'new';
      meetingInfo = {
        account_id: "",
        requestors: [],
        externalAttendees: {},
        selectedRequestor: "",
        domain_validate_url: "",
        request: { mode: "new", meeting_with: "", custom_fields: {}, showCancel: false }
      };
      envDetails = {
        companyName: "",
        currentManagedUser: "",
        currentUser: { first_name: "", last_name: "" }
      };

      var url = Api.ENDPOINTS.fetch_meeting_info;

      if ($.urlParam('mode') === 'edit') {
        mode = 'edit';
        url = Api.ENDPOINTS.fetch_edit_meeting_info;
      } else if ($.urlParam('mode') === 'view') {
        mode = 'view';
        url = Api.ENDPOINTS.fetch_view_meeting_info;
      }
      var promise = Api.fetch({
        url: url,
        data: {
          activity_uuid: $.urlParam('activity_uuid')
        }
      });

      promise.then(function(response) {
        var data = response;
        if (data.hasOwnProperty('data')) {
          data = data.data;
        }
        meetingInfo.requestors = data.requestors;
        meetingInfo.selected_requestor = data.selected_requestor;
        meetingInfo.domainValidateUrl = data.domain_validate_url;
        meetingInfo.request = $.extend(meetingInfo.request, data.meeting);
        meetingInfo.request.topic_management = response.data.topic;
        window.actions_on_behalf = data.actions_on_behalf;
        window.isEBCEvent = response.data.isEBCEvent || false;
        window.isOngoingSales = response.data.isOngoingSales || false;
        window.selectedActivityUuid = $.urlParam('activity_uuid') || response.data.selectedActivityUuid;
        envDetails.currentMeetingUuid = response.data.new_meeting_uuid;
        //pvrcs: Will be changed to read form the response once attachments feature is supported by SFDC
        envDetails.canShowAttachmentsField = false;//response.data.can_show_attachments_field;
        if (mode === 'edit') {
          meetingInfo.request.mode = data.mode;
          meetingInfo.request.showCancel = data.show_cancel_meeting;
          meetingInfo.request.end_time = moment(meetingInfo.request.end_time).utc().format('DD-MM-YYYY HH:mm');
          meetingInfo.request.start_time = moment(meetingInfo.request.start_time).utc().format('DD-MM-YYYY HH:mm');
          envDetails.currentMeetingUuid = meetingInfo.request.uuid;
        } else if (mode === 'view') {
          meetingInfo.request.mode = 'view';
          envDetails.currentMeetingUuid = meetingInfo.request.uuid;
        }

        envDetails.currentManagedUser = data.current_managed_user;
        envDetails.currentUser = data.current_user;
        envDetails.companyName = data.event.company_display_name;
        envDetails.event = data.event;

        envDetails.isExecutiveAdmin = function() {
          return data.isExecutiveAdmin;
        };
        envDetails.isMeetingManager = function() {
          return data.isMeetingManager;
        };
        envDetails.isQueueManager = function() {
          return data.isQueueManager;
        };
        envDetails.isCSM = function() {
          return data.isCSM;
        };
        envDetails.isJuniorMM = function() {
          return data.isJuniorMM;
        };
        
        rails_to_html = {
          activity_name: response.data.selectedActivityName || "",
          topic_config: { topic_management_enabled: data.topic_management_enabled || false },
        };
        briefing_uuid = data.briefing_uuid || undefined;
        mappingEnabled = data.mappingEnabled || false;
        envDetails.syncContactsToSfdc = data.syncContactsToSfdc || false;
        envDetails.topicManagementEnabled = data.topic_management_enabled || false;
        envDetails.topicRoomMappingEnabled = data.topic_room_mapping_enabled || false;
        envDetails.topicUserMappingEnabled = data.topic_user_mapping_enabled || false;
        envDetails.topicActivitiesMappingEnabled = data.topic_activities_mapping_enabled || false;
        envDetails.allowUserToAddNewExternalAttendee = data.allowUserToAddNewExternalAttendee || false;
        envDetails.allowRequestorToAddInternalAttendee = data.allowRequestorToAddInternalAttendee || false;
        envDetails.canUserChangeSelfAttendance = data.can_user_change_self_attendance || false;

        callback();
      });
    },

    EventInit: function(callback) {
      var promise = Api.fetch({
        url: Api.ENDPOINTS.user_info
      });
      promise.then(function(response) {
        window.envDetails = {};
        window.isEBCEvent = response.data.isEBCEvent || false;
        envDetails.currentUser = response.data.current_user;
        envDetails.isCSM = function() {
          return response.data.isCSM;
        };
        envDetails.isMeetingManager = function() {
          return response.data.isMeetingManager;
        };
        if (typeof callback === 'function') {
          callback();
        }
      });
      promise.catch(function(data){
        var errors = _.flatten(_.values(data.responseJSON.errors));
        $(".notification-modal").notificationModal({
          class: 'red',
          timeout: true,
          title: "Information",
          body: errors.join(', ')
        });
      });
    }
  },
};

module.exports = Api;
