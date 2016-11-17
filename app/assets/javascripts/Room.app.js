require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
initI18n(enLocale['room']);
var Handler = require('./handler');

$(document).ready(function(jQuery){
    Handler.init();
    setupUiI18n();
});



}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/app/scripts/Room/app.js","/app/scripts/Room")
},{"./handler":3,"_process":10,"buffer":7}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// var Reflux = require('reflux');

var RoomActions = Reflux.createActions([
    'fetchRooms',
    'fetchMeetingTypes',
    'fetchFacilities',
    'createRoom',
    'searchRooms',
    'updateRoom',
    'updateFilter',
    'resetFilter',
    'updateSearch',
    'applyFilter',
    'uploadRoomcsv',
    'notifyCsvUpload',
    'notifyAddNewRoom',
    'toggleView',
    'fetchBriefingTypes',
    'activateRoom',
    'bulkInactivateRooms',
    "notifyInactivateRooms",
    'fetchEventDetails',
    'fetchTags',
    'fetchFilters',
    'fetchOptions',
    'updateFilter',
    'syncCisBulkDownload'
]);



module.exports = RoomActions;



}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/app/scripts/Room/actions.js","/app/scripts/Room")
},{"_process":10,"buffer":7}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Actions = require('./actions');
var Store = require('./store');
//var Handlebars = require("handlebars");
var meetingFilterCmp = require('../commons/meeting_filters');

var RoomHandler = (function() {
  var meetingCombo = $("#meetingType");
  var facilitiesCombo = $("#facilities");
  var briefingCentreCombo = $("#location_id");
  var roomContainer = $("#rooms-list");
  var roomSearch = $("#room-search");
  var filterSearchField = $("#search-field");
  var roomCount = $(".room_count");
  var form = $("#add-room-form");
  var tagCloudFields = $('.js_tag_cloud', form)
  var addRoomModal = $("#add-room-modal");
  var addButton = $("#add-room-btn");
  var roomsList = $("#rooms-list");
  var bulkActionBar = $('.bulk-action');
  var selectedRoomHash = {};
  var selectAllFlag = false;
  var hasSelectedCards = false;
  var facilitiesFilterLocation = $("#facilities-filter");
  var meetingTypeFilterLocation = $("#type-filter");
  var filterBtn = $(".filter-dropdown .filter-btn");
  var dropdownMenu = $(".filter-dropdown .dropdown-menu");
  var panelHeader = $('.jiffle-panel-head h1');
  var allMeetingTypes = [];
  var modelEl = $(".notification-modal");
  var appliedFilterUl = $('ul#room-applied-filter');
  var filterPanelEl = $('#room-filter-panel');
  var toggleBtnUl = $(".toggle-menu-list");
  var exportBtn = $("#export-link");
  var roomActiveStatus = $("#room_active_status");
  var mmOnlyField = $('#mm_only');
  var roomCISStatus = $("#room_cis_detail");
  var cisToggleBtn = $("#cis_enabled");
  var emailContainer = $("#email_container");
  var roomEmail = $("#email");
  var modalToEscape = null;
  var filterPanel = $('#filterPanel');
  var currentTagCloudDropDown;
  var lastSyncTimeEl = addRoomModal.find('#js-last_sync_time');
  var bulkRoomDownloadEl = addRoomModal.find('#js-room_bulk_download_url');
  var selectAllBtn = $('#select_all_btn');

  var roomStoreHandlers = {
    roomlisting: handelRoomList,
    viewchanged: handelViewToggle,
    fetchFilters: setupFilters,
    resetRoomsList: resetRoomsListHandler
  };
  var ajaxPrefix = '/portal';
  var isStaffEvent = null;

  var select2Config = {
    dropdownParent: null,
    multiple: true,
    minimumInputLength: 1,
    width: '100%',
    ajax: {
      delay: 256,
      data: function(params) {
        return {
          term: (params['term']).trim(),
          tag_cloud_uuid: $(event.currentTarget).closest('.token-input-fld').find('.js_tag_cloud').prop('name')
        };
      },
      transport: function(params, success, failure) {
        Actions.fetchTags(params.data, success);
      },
      processResults: function(items) {
        var returnItems = items.map(function(item) {
          return {
            id: item.uuid,
            text: item.name
          };
        });
        return {
          results: returnItems
        };
      }
    }
  }

  var setupUI = function() {
    setTimeout(function() {
      $(".chosen-select").chosen({
        width: "100%",
        disable_search_threshold: 5
      });
    }, 100);
    validate();
    Actions.fetchRooms(1);
    Actions.fetchMeetingTypes();
    if (briefingCentreCombo.length > 0) {
      Actions.fetchBriefingTypes();
    }

    addRoomModal.modal({
      keyboard: false,
      show: false
    });
    addRoomModal.on('hide.bs.modal', function() {
      var formValidator = form.validate();
      formValidator.resetForm();
      $(".form-group", addRoomModal).removeClass("has-error");
      $("body").css("overflow", "auto");
      roomActiveStatus.addClass('hide');

      if (typeof cis_enabled != 'undefined' && cis_enabled) {
        roomCISStatus.addClass('hide');
        cisToggleBtn.prop('disabled', false);
        emailContainer.addClass('hide');
        roomEmail.val("");
        lastSyncTimeEl.addClass('hide');
        bulkRoomDownloadEl.addClass('hide');
      }
      addRoomModal.attr("data-uuid", "");
      addRoomModal.attr("data-room_active_status", "");
      mmOnlyField.prop('checked', false);
      cisToggleBtn.prop('checked', false);
    }).on('show.bs.modal', function() {
      $("body").css("overflow", "hidden");
    });

    tagCloudFields.map(function(index, field){
      $(field).select2(select2Config);
    })
  };

  function toggleCIS() {
    if (cisToggleBtn.prop('checked')) {
      emailContainer.removeClass('hide');
      cisToggleBtn.val(true);
    } else {
      emailContainer.addClass('hide');
      cisToggleBtn.val(false);
    }
  }

  function roomActiveStatusHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    var _this = this;
    if (_this.checked === false && addRoomModal.attr("data-room_active_status") === "yes") {
      modelEl.notificationModal({
        title: i18n.t("confirm_deactivate_title"),
        body: i18n.t("confirm_deactivate_message"),
        class: "red",
        type: "confirmation",
        keyboard: false,
        timeout: true,
        dismiss: scrollHandler,
        hideCloseBtn: true,
        done: function() {

        },
        cancel: function() {
          _this.checked = true;
        }
      });
    }
  }

  function bulkInactiveHandler() {
    Actions.bulkInactivateRooms(selectedRoomHash, selectAllFlag)
  }

  function activateRoom(e) {
    e.preventDefault();
    e.stopPropagation();
    var activateOverlay = $(this).closest('.activate');
    var uuid = activateOverlay.data("uuid");
    var room = Store.RoomStore.getModelFor(uuid);
    room.active = true;
    room.room_active_status = "yes";

    console.log("Activate Room with uuid: ", uuid);
    Actions.activateRoom(uuid);
    activateOverlay.addClass('hide').remove();
  }

  function scrollHandler() {
    if (addRoomModal.is(":visible")) {
      $(".modal").css("overflow", "auto");
      $("body").css("overflow", "hidden");
    } else {
      $("body").css("overflow", "auto");
    }
  }
  var facilityToDisplayMapping = {
    'Microphone': 'Mic',
    'Projector': 'Projector',
    'Coffee': 'Coffee'
  }

  var validate = function() {
    $.validator.setDefaults({
      highlight: function(element) {
        $(element).closest('.form-group').addClass('has-error');
      },
      unhighlight: function(element) {
        $(element).closest('.form-group').removeClass('has-error');
      },
      errorElement: 'span',
      errorClass: 'help-block',
      errorPlacement: function(error, element) {
        if (element.parent('.input-group').length) {
          error.insertAfter(element.parent());
        } else {
          error.insertAfter(element);
        }
      },
      onfocusout: function(element) {
        if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element))) {
          this.element(element);
        }
        if (element.name === 'email') {
          console.log("focus out");
          form.validate();
        }
      },
      focusCleanup: true,
      messages: {
        capacity: {
          required: i18n.t('is_required', {
            attr: i18n.t('capacity')
          })
        },
        name: {
          required: i18n.t('is_required', {
            attr: isStaffEvent === true ? i18n.t('location_name') : i18n.t('room_name')
          })
        },
        email: {
          required: i18n.t('is_required', {
            attr: i18n.t('email')
          }),
          email: i18n.t('invalid_email'),
          remote: i18n.t('invalid_domain')
        }
      },
      showErrors: function(errorMap, errorList) {
        for (var i = 0, elements = this.validElements(); elements[i]; i++) {
          this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, this.settings.validClass);
          $("#" + elements[i].name + "-error").hide();
        }
        for (var j = 0, errorItem; errorList[j]; j++) {
          errorItem = errorList[j];
          this.settings.highlight(errorItem.element);
          $("#" + errorItem.element.name + "-error").show();
          this.showLabel(errorItem.element, errorItem.message);
        };
      }
    })
    form.validate({
      onkeyup: false,
      capacity: {
        digits: true,
      },
      rules: {
        email: {
          required: true,
          email: true,
          remote: {
            url: ajaxPrefix + "/domains/validate",
            data: {
              type: function() {
                return userType;
              }
            },
            dataFilter: function(response) {
              var json = JSON.parse(response);
              var errorObj = {};
              var status = false;
              if (userType === "external") {
                if (json.data.domain_type === "internal") {
                  if (_.isObject(json.data.user)) {
                    errorObj = {
                      email: i18n.t('already_internal_attendee')
                    };
                  } else {
                    errorObj = {
                      email: i18n.t('alert_internal_domain')
                    };
                  }
                } else {
                  if (json.success === false) {
                    errorObj = json.errors;
                  } else {
                    if (json.data.user) {
                      errorObj = {
                        email: i18n.t('duplicate_email')
                      };
                    } else {
                      status = true;
                      $("#email-error").css("display", "none");
                    }
                  }
                }
              } else {
                if (json.success === false) {
                  errorObj = json.errors;
                } else {
                  if (json.data.domain_type === "internal") {
                    errorObj = {};
                    if (json.data.user) {
                      errorObj = {
                        email: i18n.t('duplicate_email')
                      };
                    } else {
                      status = true;
                      $("#email-error").css("display", "none");
                    }

                  } else {
                    errorObj = {
                      email: i18n.t('invalid_domain')
                    };
                  }
                }
              }
              var validator = form.validate();
              validator.showErrors(errorObj);
              validator.previousValue($("#email")[0]).originalMessage = errorObj.email || '';
              return status;
            }
          }

        }
      }
    });
  };

  function clearSelection() {
    removeSelectAll();
    selectedRoomHash = {};
    $('[name=selectableCard]').prop('checked', false);
  }

  function resetRoomsListHandler() {
    clearSelection();
    Store.RoomStore.resetRooms();
    Actions.fetchRooms(1);
  }

  function setupStoreListeners() {
    Store.MeetingStore.listen(function(meetingTypes) {
      allMeetingTypes = meetingTypes;
      updateCombo(meetingCombo, meetingTypes);
    });

    Store.BriefingCentreStore.listen(function(briefingCentre) {
      updateBCCombo(briefingCentreCombo, briefingCentre, true);

    });

    Store.RoomStore.listen(function(data) {
      var func = roomStoreHandlers[data.type];
      if (func) {
        func(data.data);
      }
    });

    Store.AddEditRoomStore.listen(function(data) {
      if (data.success === true) {
        addRoomModal.modal("hide");
        Store.RoomStore.setCurrentPage(1);
        Store.RoomStore.resetRooms();
        Actions.fetchRooms(1);
      } else {
        var error = data.error.errors;
        var validator = form.validate();
        validator.showErrors(error);
      }
    });

    Store.NotificationStore.listen(function(data) {
      $("#cover").fadeOut();
      // modalToEscape = modelEl;
      modelEl.notificationModal({
        title: data.header,
        body: data.message,
        class: data.type,
        keyboard: false,
        timeout: true,
        dismiss: scrollHandler
      });
    });

    Store.EventStore.listen(onEventDetailsFetched);
  };

  function updateToggleViewState(e) {
    var El = $(e.currentTarget);
    if (!El.hasClass("active")) {
      Actions.toggleView(El.attr("id").split("-")[0]);
    }
  };

  function handelViewToggle(data) {
    var viewStyle = data.viewStyle;
    var toggleBtn = $("#toggle-view-btn");
    var roomListContainer = roomContainer.find(".meeting-rooms-list");
    toggleBtnUl.find("a").removeClass("active");
    toggleBtnUl.find("#" + data.viewStyle).addClass("active");
    roomListContainer.removeClass().addClass("meeting-rooms-list card-container" + " " + viewStyle);
    roomListContainer.find("> div.item").removeClass("col-md-3 col-sm-4 col-md-12").addClass("item " + data.tileSize);
  };

  function onEventDetailsFetched(data) {
    if (data.success) {
      isStaffEvent = Store.EventStore.isStaffSchedulingEvent();
      setupUI();
      setupListeners();
      Actions.fetchFilters();
    }
  }

  function setupFilters(data) {
    meetingFilterCmp.setMeetingFilters(data, filterPanel);
  }

  function handelRoomList(roomData) {
    addToSelectedRoomHash(roomData.items);
    var clonedData = _.cloneDeep(roomData);
    var roomItems = clonedData.items || [];
    var isStaff = Store.EventStore.isStaffSchedulingEvent();
    var addRoomLabel = isStaff === true ? i18n.t("add_location") : i18n.t("add_room");
    var uploadRoomLabel = isStaff === true ? i18n.t("upload_locations") : i18n.t("upload_rooms");
    var addTmpl = HandlebarsTemplates['room/add_room']({
      tileSize: roomData.toggleState.tileSize,
      viewStyle: roomData.toggleState.viewStyle,
      prefix: envDetails.urlPrefix,
      addRoomLabel: addRoomLabel,
      uploadRoomLabel: uploadRoomLabel
    });
    roomContainer.html(addTmpl);

    hasSelectedCards = false;
    roomItems.forEach(function(room) {
      room.meetingTypes = room.types.map(function(type) {
        return type.name;
      }).join(", ");
      room.facilities.map(function(facility) {
        facility.name = facilityToDisplayMapping[facility.name];
      });
      room.last_updated = commons.convertToTzone(room.updated_at);

      if (_.isEmpty(room.tags) === false) {
        room.tagDisplays = room.tags.data.map(function(tag) {
          return tag.name;
        }).join(", ");
        room.tagCustomLabel = pluralize(room.tags.tag_custom_label);
      }
      if (selectedRoomHash[room.uuid]) {
        room.checked = 'checked';
        hasSelectedCards = true;
      } else {
        room.checked = '';
      }
    });
    var isStaffSchedulingEvent = Store.EventStore.isStaffSchedulingEvent();
    clonedData.isStaffSchedulingEvent = isStaffSchedulingEvent;
    var template = HandlebarsTemplates['room/item']({
      roomData: clonedData
    });

    upadateRoomCount(roomData.total_entries);
    roomContainer.find('.meeting-rooms-list').append(template);
    showHideBulkActionBar();
  };

  function addToSelectedRoomHash(list){
    if(selectAllFlag){
      _.each(list,function(room){
        selectedRoomHash[room.uuid] = true;
        hasSelectedCards = true;
      });
    }
  }

  function cardSelectionHandler() {
    var thisRoom = $(this);
    var uuid = thisRoom.data('uuid');
    removeSelectAll();
    if (thisRoom.is(':checked')) {
      selectedRoomHash[uuid] = true;
      hasSelectedCards = true;
    } else {
      delete selectedRoomHash[uuid];
      hasSelectedCards = Store.RoomStore.getAvailableSelectedRooms(selectedRoomHash).length > 0;
    }
    showHideBulkActionBar();
  }

  function showHideBulkActionBar() {
    bulkActionBar[hasSelectedCards ? 'removeClass' : 'addClass']('hide');
  }

  function uploadSubmit(event) {
    event.stopPropagation();
    event.preventDefault();
    var data = new FormData();
    var files = $(event.target).find("input").get(0).files;
    if (files.length) {
      $("#cover").show();
      $.each(files, function(key, value) {
        data.append("csv_file", value);
      });
      Actions.uploadRoomcsv(data);

      var RoomUploadWidget = $(event.target).find('input').first();
      var RoomUploadWidgetClone = RoomUploadWidget.clone(false)
      RoomUploadWidget.replaceWith(RoomUploadWidgetClone);
    }

  }

  function uploadRoom(e) {
    //triggers submit of form.
    $(".upload-csv").submit();
  }

  function upadateRoomCount(count) {
    if (Store.RoomStore.isFilterORSearchApplied()) {
      if (count == 0) {
        value = i18n.t("zero_search_results");
      } else {
        value = i18n.t("total", {
          count: count
        });
      }
    } else {
      value = i18n.t("total", {
        count: count
      });
    }

    roomCount.html(value);
  }

  var setupListeners = function() {
    roomContainer.on("click", ".add-new-room", addRoom);
    roomContainer.on("click", ".card-click", editRoom);
    roomContainer.on("click", ".activate-room", activateRoom);
    roomContainer.on('click', '.card-select', function(e) {
      e.stopPropagation();
    });
    roomContainer.on("change", ".upload-room-input", uploadRoom);
    roomContainer.on("submit", ".upload-csv", uploadSubmit);
    addButton.on('click', submitForm);
    roomSearch.on('keyup', _.debounce(searchRooms, 500));
    filterSearchField.on('keyup', _.debounce(searchFilterRooms, 500));
    toggleBtnUl.on("click", "a", updateToggleViewState);

    selectAllBtn.on("click", selectAllHandler);

    exportBtn.on("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = Store.RoomStore.generateExportUrl();
    });
    addRoomModal.on('change', '#active_status', roomActiveStatusHandler);
    if (typeof cis_enabled != 'undefined' && cis_enabled) {
      cisToggleBtn.on('change', toggleCIS);
    }


    $("#apply-filter").on('click', handleFilterClick);
    $("#reset-filter").on('click', handleResetFilterClick);
    appliedFilterUl.on('click', '.selected-item .remove', removeFilter);

    filterBtn.on('click', function(event){
      event.stopPropagation();
      dropdownMenu.toggleClass('show');
    })

    $(document).on('click', function(event){
      dropdownMenu.removeClass('show');
    })

    dropdownMenu.on('click', function(event){
      event.stopPropagation();
    })

    $(window).infiniteScroll({
      callback: fetchMoreRooms,
      offset: 0
    });

    addRoomModal.on('click', '#js-download-url', function(e){
      e.preventDefault();
      e.stopPropagation();
      modelEl.notificationModal({
        title: i18n.t('syncCisSuccessTitle'),
        body: i18n.t('syncCisSuccessMessage'),
        class: "green",
        keyboard: false,
        timeout: true,
        dismiss: scrollHandler
      });
      Actions.syncCisBulkDownload($(this).data('url'));
      setTimeout(function(){
        $('#cover').fadeOut();
      },3050);
    });
  };

  function selectAllHandler(event){
    event.stopPropagation();
    event.preventDefault();
    if(selectAllFlag === false){
      applySelectAll();
      $("input:checkbox[name=selectableCard]", "#rooms-list").each(function(index,element){
        var uuid = $(element).prop("checked",true).data('uuid');
        selectedRoomHash[uuid] = true;
        hasSelectedCards = true;
      });
    }else{
      removeSelectAll();
      $("input:checkbox[name=selectableCard]", "#rooms-list").prop("checked",false);
      selectedRoomHash = {};
      hasSelectedCards = false;
    }
    showHideBulkActionBar();
  }

  function applySelectAll(){
    selectAllFlag = true;
    selectAllBtn.html(i18n.t("clear_selection"));
  }

  function removeSelectAll(){
    selectAllFlag = false;
    selectAllBtn.html(i18n.t("select_all"));
  }

  function handleFilterClick(event) {
    event.preventDefault();
    event.stopPropagation();
    $('.filter-dropdown .dropdown-toggle').dropdown("toggle");
    $('#room_manage.in').collapse('hide');
    roomSearch.val(Store.RoomStore.getSearchValue());
    var clubbedFilterData = meetingFilterCmp.getClubbedFilterData(filterPanel);
    showSelectedFilters(clubbedFilterData.selectedFilterData);
    Actions.applyFilter(clubbedFilterData.formData);
  }

  function handleResetFilterClick(event) {
    event.preventDefault();
    event.stopPropagation();
    filterSearchField.val('');
    roomSearch.val('');
    filterPanel.find('select').each(function(i, ele) {
      $(ele).val('').trigger('change');
    })
    Actions.updateSearch('');
    Actions.resetFilter();
    showSelectedFilters({});
  }

  function showSelectedFilters(data) {
    var html = HandlebarsTemplates['report/ondemand/selected_filter']({
      filter: data
    });
    appliedFilterUl.html(html);
  }

  function removeFilter(event){
    var roomStore = Store.RoomStore;
    var currentEl = $(this);
    var filterValue = ""+ currentEl.closest('.selected-item').data('key');
    var filterKey = currentEl.closest('.filter').data('type');
    var appliedFilters = roomStore.getFilters()[filterKey];
    var selectedChosen = filterPanel.find('.select.'+ filterKey);
    appliedFilters.splice(appliedFilters.indexOf(filterValue), 1);

    selectedChosen.find('option:selected').each(function(i, element){
      var El = $(element);
      if(El.val() == filterValue){
        El.attr('selected', false);
      }
    }).trigger('change');
    currentEl.closest('.filter').remove();
    roomStore.resetRooms();
    Actions.fetchRooms(1);
  }

  var fetchMoreRooms = function() {
    if (Store.RoomStore.getCurrentPage() <= Store.RoomStore.getTotalPageCount()) {
      Actions.fetchRooms(Store.RoomStore.getCurrentPage());
    }
  };

  var addRoom = function() {

    var inputs = $("input,select,textarea", form);
    inputs.each(function(index, p) {
      var input = $(p);
      var name = input.attr("name");
      if (name) {
        if (input.is("select")) {
          input.val(null).trigger("change");
        } else {
          input.val("");
        }
      }
    });
    var allMeeting = _.find(allMeetingTypes, function(mt) {
      return mt.name === "All";
    });
    briefingCentreCombo.find("option:first-child").prop("selected", true);
    meetingCombo.val([allMeeting.uuid]);
    meetingCombo.trigger('chosen:updated');


    facilitiesCombo.val([]);
    facilitiesCombo.trigger('chosen:updated');

    addRoomModal.modal({ "show": true, "backdrop": "static" });
    addButton.html(i18n.t("add"));
    var label = isStaffEvent === true ? i18n.t("add_new_location") : i18n.t("add_new_room");
    panelHeader.html(label);
  };

  var editRoom = function() {

    var uuid = $(this).closest('.room-item-list').data('uuid');
    var model = Store.RoomStore.getModelFor(uuid);
    addRoomModal.attr("data-uuid", uuid);
    var inputs = $("input,select,textarea", form);
    var selectedOptions = [ ];
    var allOptions = [ ];
    inputs.each(function(index, p) {
      var input = $(p);
      var name = input.attr("name");
      if (name) {
        if (input.is("select") && name !== 'location_id') {
          selectedOptions = model[name] ?  model[name] : [ ];
          allOptions = input.find('option');
          input.empty();
          selectedOptions.map(function(option, index){
            var val = option.uuid;
            var text = option.name;
            input.append($("<option selected />").val(val).text(text));
          });
          allOptions.map(function(index, option) {
            option = $(option);
            var val = option.val();
            var text = option.text();
            var isSelectedOption = _.findIndex(selectedOptions, function(option) { return option.uuid == val });
            if(isSelectedOption == -1){
              input.append($("<option/>").val(val).text(text));
            }
          });
          input.trigger('change');
        } else {
          input.val(model[name])
        }
      }
    });
    $("#active_status").prop('checked', model.active);
    mmOnlyField.prop('checked', model.mm_only);

    if (typeof cis_enabled != 'undefined' && cis_enabled) {
      cisToggleBtn.prop('checked', model.cis_enabled);
      cisToggleBtn.val(model.cis_enabled);
      if (model.cis_enabled) {
        cisToggleBtn.prop('disabled', true);
        emailContainer.removeClass('hide');
        roomEmail.val(model.email);
        if(model.last_sync_time){
          lastSyncTimeEl.removeClass('hide');
          lastSyncTimeEl.find('.js-sync-time').text(model.last_sync_time);
        }
        if(model.bulk_download_url){
          bulkRoomDownloadEl.removeClass('hide');
          bulkRoomDownloadEl.find('#js-download-url').data('url', model.bulk_download_url);
        }
      }
    }

    addRoomModal.attr("data-room_active_status", model.room_active_status || "no");
    roomActiveStatus.removeClass('hide');
    if (typeof cis_enabled != 'undefined' && cis_enabled) {
      roomCISStatus.removeClass('hide');
    }
    var types = model.types.map(function(data) {
      return data.uuid
    });
    meetingCombo.val(types);
    meetingCombo.trigger('chosen:updated');

    var facilities = model.facilities.map(function(data) {
      return data.uuid
    });
    facilitiesCombo.val(facilities);
    facilitiesCombo.trigger('chosen:updated');
    addRoomModal.modal({ "show": true, "backdrop": "static" });

    // as it is in the edit flow
    // -- title & btn text should be internationalised.
    addButton.html(i18n.t("save"));
    var label = isStaffEvent === true ? i18n.t("edit_location") : i18n.t("edit_room");
    panelHeader.html(label);
  };

  var searchRooms = function() {
    // set value in filter search
    filterSearchField.val(roomSearch.val())

    Actions.searchRooms(roomSearch.val());
  };

  var searchFilterRooms = function() {
    Actions.updateSearch(filterSearchField.val());
  };

  var submitForm = function(e) {
    e.preventDefault();
    e.stopPropagation();
    validate();
    if (form.valid()) {
      var model = {tag_clouds: {}};
      var inputs = $("input,select,textarea", form);
      inputs.each(function(index, p) {
        var input = $(p);
        var name = input.attr("name");
        if(input.hasClass('js_tag_cloud')){
          model['tag_clouds'][name] = input.val();
        }else{
          if (name) {
            model[name] = input.is(':checkbox') ? input.prop('checked') : input.val();
          }
        }
      });

      var mode = addButton.html();
      if (mode == i18n.t("add")) {
        Actions.createRoom(model);
      } else {
        model.active = $("#active_status").is(':checked');

        var roomModel = Store.RoomStore.getModelFor(model['uuid']);
        if(roomModel.has_schedules && roomModel.name.trim() !== model['name'].trim()){

          modelEl.notificationModal({
            title: i18n.t("room_name_updated"),
            body: i18n.t("send_ics_body_message"),
            class: "green",
            type: "confirmation",
            hideCloseBtn: true,
            done: function() {
              Actions.updateRoom(model, true);
            },
            cancel: function() {
              Actions.updateRoom(model, false);
            }
          });
        }else{
          Actions.updateRoom(model);
        }
      }

    }
  };

  var updateCombo = function(combo, items, selectionIndex) {
    combo
      .find('option')
      .remove()
      .end();
    var options = [];
    items.forEach(function(type) {
      options.push($("<option value='" + type.uuid + "'></option>").text(type['name']));
    });
    combo.append(options);
    combo.trigger('chosen:updated');
  };

  var updateBCCombo = function(combo, items, selectionIndex) {
    combo
      .find('option')
      .remove()
      .end();
    items.forEach(function(type) {
      combo.append($("<option></option>").val(type.location_id).html(i18n.t(type['name'])));
    });
    combo.trigger('chosen:updated');
  };

  var init = function() {
    setupStoreListeners();
    Actions.fetchEventDetails();
    bulkActionBar.on('click', '#bulkInactive', bulkInactiveHandler);
    roomsList.on('change', '[name=selectableCard]', cardSelectionHandler);
  };

  return {
    init: init
  }

}());

module.exports = RoomHandler;


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/app/scripts/Room/handler.js","/app/scripts/Room")
},{"../commons/meeting_filters":5,"./actions":2,"./store":4,"_process":10,"buffer":7}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/app/scripts/Room/store.js","/app/scripts/Room")
},{"./actions":2,"_process":10,"buffer":7,"common_api":"common_api"}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
function setMeetingFilters(filters, filterPanel, Actions, customSearchHash) {
	var tmpl = HandlebarsTemplates['report/ondemand/filters'];
  filterPanel.html(tmpl({ filters: filters, option_cls: 'token-input-fld' }));
  filterPanel.children('.tab-pane').first().addClass('active');
  var searchHash = _.assign({
    subjects: 'meeting_with_field',
    requesters: 'requestors_field',
    internal_invitees: 'internal_attendee_field',
    external_invitees: 'external_attendee_field',
    users: 'internal_attendee_field',
    ids: 'meeting_ids_field',
    creators: 'creators_field',
    topics: 'topics_field',
    tags: 'tags',
    briefing_subjects: 'briefing_with_field',
    briefing_requesters: 'briefing_requestors_field',
    briefing_internal_invitees: 'briefing_internal_attendee_field',
    briefing_external_invitees: 'briefing_external_attendee_field',
    briefing_ids: 'briefing_ids_field',
    briefing_creators: 'briefing_creators_field'
  }, customSearchHash);

  $('select', '.filter_panel').each(function(i, selectElement) {
    selectElement = $(selectElement);
    var name = selectElement.attr('name');
    var type = selectElement.data('type');
    var selectConfig = {
      dropdownParent: null,
      multiple: true,
      width: '100%',
      placeholder: i18n.t('search_'+name)
    };
    var ajaxSelectConfig = {
      minimumInputLength: 1,
      cache: true,
      ajax: {
        delay: 256,
        data: function (params) {
          return {
              field: searchHash[name] || name,
              term: (params['term'] || '').trim()
          };
        },
        processResults: function (items) {
          if (items instanceof Array) {
              items = items.map(function(u) {
                  return { id: u[0], text: u[1] };
              });
          }
          return { results: items };
        }
      }
    };
    switch(name) {
      case 'subjects':
      case 'requesters':
      case 'internal_invitees':
      case 'external_invitees':
      case 'creators':
      case 'topics':
      case 'tags':
      case 'tag_uuids':
      case 'users':
      case 'ids': {
        var localAjaxConfig = _.assign(selectConfig, ajaxSelectConfig);
        localAjaxConfig.ajax.transport = function (params, success, failure) {
          return Actions.fetchOptions(params.data, success, failure, 'meeting');
        };

        selectElement.select2(localAjaxConfig);
        break;
      }
      case 'briefing_subjects':
      case 'briefing_requesters':
      case 'briefing_internal_invitees':
      case 'briefing_external_invitees':
      case 'briefing_creators':
      case 'briefing_ids': {
        var localAjaxConfig = _.assign(selectConfig, ajaxSelectConfig);
        localAjaxConfig.ajax.transport = function (params, success, failure) {
          return Actions.fetchOptions(params.data, success, failure, 'briefing');
        };

        selectElement.select2(localAjaxConfig);
        break;
      }
      case 'user_name': {
        var localAjaxConfig = _.assign(selectConfig, ajaxSelectConfig);
        localAjaxConfig.ajax.transport = function (params, success, failure) {
          return Actions.fetchOptions(params.data, success, failure, 'calendar');
        };

        selectElement.select2(localAjaxConfig);
        break;
      }
      case 'tag_cloud': {
        selectConfig.placeholder = i18n.t('search_by') + type;
        selectElement.select2(selectConfig);
        break;
      }
      default: {
        selectElement.select2(selectConfig);
        break;
      }
    }
  });

  setBriefingStartEndDateFilter();

  setDefaultBriefingStartEndDateFilterValue(filters);
  
  $('#ui-datepicker-div').on('click', function(e){
      e.stopPropagation();
  });
}

function setBriefingStartEndDateFilter(){
  $('.filter_panel').find('.date').each(function(i, element) {
      setDatePicker($(element));
  });
}

function setDatePicker(ele){
  ele.datepicker({
    dateFormat: 'yy-mm-dd',
    onSelect : updateDateRange
  }).attr('placeholder', i18n.t('search_'+ ele.attr('name')));
}

function setDefaultBriefingStartEndDateFilterValue(filters){
  if (filters.briefings){
    var filterpanel = $('.filter_panel');
    _.forEach(filters.briefings,function(filter,index){
      if((filter.field_name === 'briefing_start_date' || filter.field_name === 'briefing_end_date') && filter.value[0].selected){
        filterpanel.find('.date.'+filter.class).datepicker('setDate', new Date(filter.value[0].value));
        $(".ui-datepicker-current-day").click();
      }
    });
  }
}

function updateDateRange(dateStr){
  var event = window.event;
  event && event.preventDefault && event.preventDefault();
  var el = $(this);
  var panel = $('.filter_panel');
  if(el.hasClass('end')){
    var stDate = panel.find('.date.start');
    setMinMaxDate(stDate, 'maxDate', dateStr);
  }
  else {
    var edDate = panel.find('.date.end');
    setMinMaxDate(edDate, 'minDate', dateStr);
  }
}

function setMinMaxDate(elem, minMaxDate, dateStr){
  elem.datepicker('option', minMaxDate, new Date(dateStr));
}

function getClubbedFilterData(filterPanel) {
  var formData = {};
  var selectedFilterData = {};
  var storableFilterData = {};
  filterPanel.find('.select').each(function(index, element){
    var input = $(element),
      value = input.val() || [],
      name = input.attr('name'),
      filterValue = [],
      storableFilterValues = [];
      type = input.data('type')

    input.find("option:selected").each(function(i, option) {
      var option = $(option);
      filterValue.push({ key: option.val(), name: option.text() });
      storableFilterValues.push({ value: option.val(), display_label: option.text() });
    });

    if(value !== null && value !== ""){
      if(!formData[name]){
        formData[name] = value;
        selectedFilterData[name] = { values: filterValue, display_name: type}
        storableFilterData[name] = storableFilterValues;
      }else{
        formData[name].push(value);
        selectedFilterData[name].values.push(filterValue);
        storableFilterData[name].push(storableFilterValues);
        formData[name] = _.flatten(formData[name]);
        selectedFilterData[name].values = _.flatten(selectedFilterData[name].values);
        storableFilterData[name] = _.flatten(storableFilterData[name]);
      }
    }
  });

  filterPanel.find('.date').each(function(index, element){
    var input = $(element),
      value = input.val(),
      name = input.attr('name'),
      filterValue = [],
      storableFilterValues = [];
      type = input.data('type')

    if (value !== ""){
      filterValue.push({key: [value], name: value});
      storableFilterValues.push({ value: [value], display_label: value });
    }

    formData[name] = value !== "" ? [value] : [];
    selectedFilterData[name] = { values: filterValue, display_name: type}
    storableFilterData[name] = storableFilterValues;

  });
  
  return {formData: formData, selectedFilterData: selectedFilterData, storableFilterData: storableFilterData};
}
module.exports = {
  setMeetingFilters: setMeetingFilters,
  getClubbedFilterData: getClubbedFilterData,
  setDatePicker: setDatePicker,
  setMinMaxDate: setMinMaxDate
};


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/app/scripts/commons/meeting_filters.js","/app/scripts/commons")
},{"_process":10,"buffer":7}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/base64-js/lib/b64.js","/node_modules/base64-js/lib")
},{"_process":10,"buffer":7}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    this.length = 0
    this.parent = undefined
  }

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
} else {
  // pre-set for values that may exist in the future
  Buffer.prototype.length = undefined
  Buffer.prototype.parent = undefined
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/buffer/index.js","/node_modules/buffer")
},{"_process":10,"base64-js":6,"buffer":7,"ieee754":9,"isarray":8}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/buffer/node_modules/isarray/index.js","/node_modules/buffer/node_modules/isarray")
},{"_process":10,"buffer":7}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/ieee754/index.js","/node_modules/ieee754")
},{"_process":10,"buffer":7}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/process/browser.js","/node_modules/process")
},{"_process":10,"buffer":7}],"common_api":[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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



}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/app/scripts/commons/jiffle/api.js","/app/scripts/commons/jiffle")
},{"_process":10,"buffer":7}]},{},[1]);
