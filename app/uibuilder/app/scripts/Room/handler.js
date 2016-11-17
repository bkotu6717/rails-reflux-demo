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