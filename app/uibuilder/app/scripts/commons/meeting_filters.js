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