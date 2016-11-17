// var i18n = require('i18next-client');

var defaults = {
    custom_form: {
        textfield: {
            widget: "textfield",
            label:i18n.t("unnamed"),
            type:"textfield",
            field_name: "{{prefix}}{{_id}}",
            required: false,
            placeholder: i18n.t("unnamed"),
            helpText: "",
            values: '',
            ShowInMeetingDetail: true,
            ShowInMeetingRequest: false,
            ShowInStandardReport: true,
            canSelectOthers: false,
            canDelete: true,
            rules: [],
            hidden: false,
            disabled: false,
            integration_field: {
                uuid: "",
                type: ""
            },
            query_by: {}
        },
        numberfield: {
            widget: "numberfield",
            label:i18n.t("unnamed"),
            type:"numberfield",
            field_name: "{{prefix}}{{_id}}",
            required: false,
            placeholder: i18n.t("unnamed"),
            helpText: "",
            values: '',
            ShowInMeetingDetail: true,
            ShowInMeetingRequest: false,
            ShowInStandardReport: true,
            canSelectOthers: false,
            canDelete: true,
            rules: [],
            hidden: false,
            disabled: false,
            integration_field: {
                uuid: "",
                type: ""
            },
            query_by: {},
            postInstantiate: function(cloned) {
                setTimeout(function() {
                    $("[name='"+ cloned.field_name +"']").on('keypress', function(e) {
                        return window.commons.isNumberValid(e, this);
                    });
                }, 20);
            },
        },
        emailfield: {
            widget: "emailfield",
            label:i18n.t("unnamed"),
            type:"emailfield",
            field_name: "{{prefix}}{{_id}}",
            required: false,
            placeholder: i18n.t("unnamed"),
            helpText: "",
            values: '',
            ShowInMeetingDetail: true,
            ShowInMeetingRequest: false,
            ShowInStandardReport: true,
            canSelectOthers: false,
            canDelete: true,
            rules: [],
            hidden: false,
            disabled: false,
            integration_field: {
                uuid: "",
                type: ""
            },
            query_by: {}
        },
        datefield: {
            widget: "textfield",
            label:i18n.t("unnamed"),
            type:"datefield",
            ShowInMeetingDetail: true,
            ShowInMeetingRequest: false,
            ShowInStandardReport: true,
            field_name: "{{prefix}}{{_id}}",
            required: false,
            placeholder: i18n.t("choose_date"),
            helpText: "",
            canSelectOthers: false,
            values:"",
            canDelete: true,
            hidden: false,
            disabled: false,
            integration_field: {
                uuid: "",
                type: ""
            },
            query_by: {},
            postInstantiate: function(cloned) {
                setTimeout(function(){
                    if($('#sf-jiffle-now').length){
                        $("[name='"+cloned.field_name+"']").datepicker({'container': $('#sf-jiffle-now')});
                    }
                    else {
                        $("[name='"+cloned.field_name+"']").datepicker({autoclose: true});
                    }
                },20);
            },
            rules: []
        },
        timefield: {
            widget: "textfield",
            label:i18n.t("unnamed"),
            type:"timefield",
            ShowInMeetingDetail: true,
            ShowInMeetingRequest: false,
            ShowInStandardReport: true,
            field_name: "{{prefix}}{{_id}}",
            required: false,
            placeholder: i18n.t("choose_time"),
            helpText: "",
            canSelectOthers: false,
            values:"",
            canDelete: true,
            hidden: false,
            disabled: false,
            integration_field: {
                uuid: "",
                type: ""
            },
            query_by: {},
            postInstantiate: function(cloned) {
                setTimeout(function(){
                    $("[name='"+cloned.field_name+"']").timepicker();
                },20);
            },
            rules: []
        },
        checkbox: {
            widget: "checkbox",
            label:i18n.t("enter_valid_text"),
            field_name: "{{prefix}}{{_id}}",
            ShowInMeetingDetail: true,
            ShowInMeetingRequest: false,
            ShowInStandardReport: true,
            required: false,
            placeholder: i18n.t("unnamed"),
            canDelete: true,
            type: 'checkbox',
            rules: [],
            canSelectOthers: false,
            hidden: false,
            disabled: false,
            integration_field: {
                uuid: "",
                type: ""
            },
            query_by: {}
        },
        textarea: {
            widget: "textarea",
            label:i18n.t("unnamed"),
            field_name: "{{prefix}}{{_id}}",
            ShowInMeetingDetail: true,
            ShowInMeetingRequest: false,
            ShowInStandardReport: true,
            required: false,
            placeholder: i18n.t("unnamed"),
            helpText: "",
            canDelete: true,
            canSelectOthers: false,
            type: 'textarea',
            values: "",
            rules: [],
            hidden: false,
            disabled: false,
            integration_field: {
                uuid: "",
                type: ""
            },
            query_by: {}
        },
        header: {
            widget: "header",
            label:i18n.t("enter_header_name"),
            field_name: "{{prefix}}{{_id}}",
            ShowInMeetingDetail: true,
            ShowInMeetingRequest: false,
            ShowInStandardReport: false,
            required: false,
            placeholder: i18n.t("enter_header_name"),
            helpText: "",
            canDelete: true,
            canSelectOthers: false,
            type: 'header',
            values: "",
            rules: [],
            hidden: false,
            disabled: false,
            integration_field: {
                uuid: "",
                type: ""
            },
            query_by: {}
        },
        page_break: {
            widget: "page_break",
            label:i18n.t("enter_section_name"),
            field_name: "{{prefix}}{{_id}}",
            ShowInMeetingDetail: true,
            ShowInMeetingRequest: false,
            ShowInStandardReport: false,
            required: false,
            placeholder: i18n.t("unnamed"),
            helpText: "",
            canDelete: true,
            canSelectOthers: false,
            type: 'page_break',
            values: "",
            rules: [],
            hidden: false,
            disabled: false,
            integration_field: {
                uuid: "",
                type: ""
            },
            query_by: {}
        },
        dropdown: {
            widget: "dropdown",
            label:i18n.t("unnamed"),
            field_name: "{{prefix}}{{_id}}",
            ShowInMeetingDetail: true,
            ShowInMeetingRequest: false,
            ShowInStandardReport: true,
            required: false,
            pleaseSelect: true,
            values : [],
            canSelectOthers: false,
            helpText: "",
            canDelete: true,
            type: 'dropdown',
            rules: [],
            hidden: false,
            disabled: false,
            entity: "",
            postInstantiate: function(cloned) {
                setTimeout(function() {
                    var element = $("[name='"+cloned.field_name+"']")
                    element.select2({
                        width: "100%",
                        allowClear: !cloned.disabled,
                        // dropdownParent: element.closest(".modal"),
                        placeholder: cloned.pleaseSelect ? i18n.t('please_select'): '',
                        multiple: false,
                        tags: cloned.canSelectOthers ? []: undefined,
                        createTag: function (params) {
                            var term = $.trim(params.term);
                            if (term === '') {
                                return null;
                            }
                            return { id: term, text: term, title: term };
                        }
                    }).closest("[data-id='"+cloned.field_name+"']").find("input.select2-search__field").attr("placeholder", cloned.pleaseSelect ? i18n.t('please_select'): '');
                },20);
            },
            afterChange: function(cloned) {
                setTimeout(function(){
                    $("[name='"+cloned.field_name+"']").trigger("change");
                },20);
            },
            integration_field: {
                uuid: "",
                type: ""
            },
            query_by: {},
        },
        multiselect_dropdown: {
            widget: "multiselect_dropdown",
            label:i18n.t("unnamed"),
            field_name: "{{prefix}}{{_id}}",
            placeholder: i18n.t("please_select"),
            ShowInMeetingDetail: true,
            ShowInMeetingRequest: false,
            ShowInStandardReport: true,
            required: false,
            canSelectOthers: false,
            helpText: "",
            pleaseSelect: true,
            values: [],
            canDelete: true,
            type: 'multiselect_dropdown',
            hidden: false,
            disabled: false,
            integration_field: {
                uuid: "",
                type: ""
            },
            query_by: {},
            postInstantiate: function(cloned) {
                setTimeout(function(){
                    var element = $("[name='"+cloned.field_name+"']")
                    element.select2({
                        width: "100%",
                        multiple: true,
                        // dropdownParent: element.closest(".modal"),
                        placeholder: cloned.pleaseSelect ? i18n.t('please_select'): '',
                        tags: cloned.canSelectOthers ? []: undefined,
                        createTag: function (params) {
                            var term = $.trim(params.term);
                            if (term === '') {
                                return null;
                            }
                            return { id: term, text: term, title: term };
                        }
                    }).closest("[data-id='"+cloned.field_name+"']").find("input.select2-search__field").attr("placeholder", cloned.pleaseSelect ? i18n.t('please_select'): '');
                },20);
            },
            afterChange: function(cloned) {
                setTimeout(function() {
                    $("[name='"+cloned.field_name+"']").trigger("change");
                }, 20);
            },
            rules: []
        },
        rule: {
            type: "html_element",
            source: "",
            operator: "is",
            value: "",
            action: "show"
        }
    },
    external_request_form: {

    }
}



module.exports = defaults;
