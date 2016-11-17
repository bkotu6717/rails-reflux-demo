// In SFDC every call that we are making form the parameters
// and the callback once the promise finishes that will manipulate the response
// Note: callback will always take response as argument and return the same.

var method_endpoints = {
  users_events: {
    params: function(options) {
      var reqParams = {
        accountId: $.urlParam('accid'),
        opportunityId: $.urlParam('oppid')
      };
      return reqParams;
    },
    callback: function(response) {
      _.forEach(response.data.events, function(event){
        event.event_url = unescape(event.event_url);
        event.action.url = unescape(event.action.url);
      });

      if(response.data.ebc_events && response.data.ebc_events.length){
        _.forEach(response.data.ebc_events, function(event){

          event.event_url = unescape(event.event_url);

          if(event.locations && event.locations.length){
            _.forEach(event.locations, function(location){
              location.action.url = unescape(location.action.url);
            });
          }
        });
      }

      return response;
    },
    sfdcMethod: 'getEventList'
  },

  add_user_to_event: {
    params: function(options) {
      var reqParams = {
        accountId: $.urlParam('accid'),
        opportunityId: $.urlParam('oppid'),
        queryStr: JSON.stringify({api_params: options.data})
      };
      return reqParams;
    },
    callback: function(response) {
      _.forEach(response.data.events, function(events){
        var event = _.first(events);
        event.event_url = unescape(event.event_url);
        event.action.url = unescape(event.action.url);
        
        if(event.locations && event.locations.length){
          _.forEach(event.locations, function(location){
            location.action.url = unescape(location.action.url);
          });
        }
      });
      
      return response;
    },
    sfdcMethod: 'addYourself'
  },

  get_nav_header: {
    params: function(options) {
      var reqParams = {
        eventName: $.urlParam('eventName'),
        accountId: $.urlParam('accid'),
        opportunityId: $.urlParam('oppid')
      };
      return reqParams;
    },
    callback: function(response) {
      _.forEach(response.data.links, function(link) {
        link.url = unescape(link.url);
      });
      return response;
    },
    sfdcMethod: 'getMenuList'
  },

  fetch_account: {
    params: function(options) {
      var reqParams = {
        accountId: options.data.id,
        opportunityId: options.data.opportunityID || "",
        accountName: escapeWildChars(options.data.name)
      };
      return reqParams;
    },
    callback: function(response) {
      return formatString(response);
    },
    sfdcMethod: 'searchAccOpty'
  },

  fetch_opportunity: {
    params: function(options) {
      var reqParams = {
        opportunityId: options.data.id,
        accountId: options.data.accountID,
        opportunityName: escapeWildChars(options.data.name)
      };
      return reqParams;
    },
    callback: function(response) {
      return formatString(response);
    },
    sfdcMethod: 'getOptyList'
  },

  fetch_meeting_info: {
    params: meetingInfoParams,
    sfdcMethod: 'callJNMethod'
  },

  fetch_edit_meeting_info: {
    params: meetingInfoParams,
    sfdcMethod: 'callJNMethod'
  },

  fetch_view_meeting_info: {
    params: meetingInfoParams,
    sfdcMethod: 'callJNMethod'
  },

  external_attendees: {
    params: function(options) {
      var optionData = options['data'];
      if (meetingInfo.request.mode !== 'edit') {
        accountID = $.urlParam('accid');
      }

      if (optionData.account_id) {
        accountID = optionData.account_id;
      }

      var reqParams = {
        accountId: accountID || '',
        listSize: optionData.per_page,
        pgNo: optionData.page
      };

      if (optionData.search) {
        reqParams.queryStr = escapeWildChars(optionData.search);
      } else {
        reqParams.queryStr = optionData.search || '';
      }
      return reqParams;
    },
    callback: function(response) {
      if (meetingInfo.account_id !== accountID) {
        meetingInfo.externalAttendees = {};
        meetingInfo.account_id = accountID;
      }
      var response = (typeof response == "string") ? JSON.parse(_.unescape(response)) : JSON.parse(_.unescape(JSON.stringify(response)));
      _.forEach(response.data.items, function(item, index) {
        if (!meetingInfo.externalAttendees[item.email]) {
          item['uuid'] = "dummy_" + Math.random().toString(36).substring(2);
          item['statuses'] = {
            verified: false,
            active: true,
            approved: null,
            sso_enabled: false
          };
          meetingInfo.externalAttendees[item.email] = _.cloneDeep(item); //_.cloneDeep(item);
        } else {
          response.data.items[index] = _.cloneDeep(meetingInfo.externalAttendees[item.email]);
        }
      });
      return response;
    },
    sfdcMethod: 'getExtAtt'
  },

  calendar_availability: {
    params: function(options) {
      var reqParams = {
        eventName: $.urlParam('eventName'),
        queryStr: $.param({
          api_params: options.data
        })
      }
      return reqParams;
    },
    sfdcMethod: 'getCalendar'
  },

  fetch_sf_custom_fields: {
    sfdcMethod: 'parseCustFields',
    params: function(request) {
      var reqParams = {
        queryStr: JSON.stringify(request.data)
      };
      return reqParams;
    }
  },

  fetch_external_user_form_fields: {
    sfdcMethod: 'getConVals',
    params: function(request) {
      var reqParams = {
        queryStr: JSON.stringify(request.data)
      };
      return reqParams;
    }
  },

  meetings_list: {
    sfdcMethod: 'getMeetingListdb'
  },

  meeting_create: {
    params: postMeetingParams,
    sfdcMethod: 'createMeeting'
  },

  reschedule_meeting: {
    params: postMeetingParams,
    sfdcMethod: 'createMeeting'
  },

  user_create: {
    sfdcMethod: 'createAttendee'
  }
}

var accountID;

function formatString(str) {
  if ((typeof str == "string")) {
    str = JSON.parse(_.unescape(unescape(str)).replace(/\+/g, " "));
  } else {
    str = JSON.parse(_.unescape(unescape(JSON.stringify(str))).replace(/\+/g, " "));
  }
  return str;
};

function escapeWildChars(str) {
  return escape((str || "").replace(/['"!%^_\[\]]/g, "\\$&"));
};

function callJNMethodParams(url, options) {
  var queryStr = "";
  var eventName = url.includes('/domains/validate') ? "" : $.urlParam('eventName');
  if (options !== undefined && !$.isEmptyObject(options)) {
    queryStr = $.param({
      api_params: options
    });
  }
  var reqParams = {
    eventName: eventName,
    url: url,
    queryStr: queryStr
  };
  return reqParams;
}

function postMeetingParams(options) {
  var meetingRequest = options.data.meeting_request;
  var reqParams = {
    eventName: $.urlParam('eventName'),
    accountId: meetingRequest.account_id || '',
    opportunityId: meetingRequest.opportunity_id || '',
    queryStr: JSON.stringify({
      api_params: options.data
    })
  };
  return reqParams;
}

function meetingInfoParams(options) {
  var url = options.url.replace("{UUID}", $.urlParam('meeting'));
  return callJNMethodParams(url, options.data);
}

module.exports = method_endpoints;
