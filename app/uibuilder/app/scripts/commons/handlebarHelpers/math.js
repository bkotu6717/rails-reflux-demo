module.exports = (function() {
    Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
        lvalue = +(lvalue) || 0;
        rvalue = +(rvalue) || 0;
        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
    });

    Handlebars.registerHelper('compare_text', function(item, value, opts) {
        if (item === value) {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    });

    Handlebars.registerHelper("date_format", function(dateStr, options) {
        return moment(new Date(dateStr.replace(/-/g, '/'))).format('ddd DD, MMM YYYY');
    });

    Handlebars.registerHelper("time", function(dateStr, options) {
        return moment(new Date(dateStr.replace(/-/g, '/'))).tz(envDetails.time_zone).format("hh:mm A")
    });

    Handlebars.registerHelper("time_format", function(dateStr, options) {
        var dateFunction = scheduler.date.str_to_date("%Y-%m-%d %h:%i %A");
        return moment(dateFunction(dateStr)).format("hh:mm A");
    });

    Handlebars.registerHelper('ifObject', function(item, opts) {
        if (typeof item === "object") {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    });

    Handlebars.registerHelper('check_multiselects', function(widget, opts) {
        if (widget == "multiselect_dropdown") {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    });
})();
