function configureCalendarForWeekView(configurations){
  scheduler.config.check_limits = true;
  scheduler.config.collision_limit = 1;
  scheduler.config.start_on_monday = false;
  scheduler.config.now_date = new Date(1970, 1, 1);
  scheduler.config.day_date = "%D, %M %j";
  scheduler.config.limit_start = scheduler.date.add(configurations.startDate, -1, 'day');
  scheduler.config.limit_end = scheduler.date.add(configurations.endDate, 1, 'day');
  scheduler.config.limit_view  = true;
  scheduler.config.multi_day = false; // to prevent multiple day event creation.
  scheduler.config.mark_now = false;
  scheduler.config.details_on_create = configurations.details_on_create || false;
  scheduler.xy.min_event_height = configurations.min_event_height || 40;
  scheduler.config.hour_size_px=(60/ (configurations.step || 30)) * 22;
  scheduler.config.icons_select = configurations.icons_select || ['icon_delete'];;
  scheduler.config.icons_edit = configurations.icons_edit || ['icon_delete'];
  scheduler.config.time_step = configurations.time_step || 15;
  scheduler.config.event_duration = configurations.event_duration || 15;
  scheduler.config.drag_move = configurations.drag_move || false;
  scheduler.xy.nav_height = 0;
  scheduler.config.xml_date="%Y-%m-%d %H:%i";
  scheduler.config.dblclick_create = false;
  scheduler.config.edit_on_create = false;
}

function setWeekStart(startDate, endDate) {
  var weekStartIndex;
  if (scheduler.date.getISOWeek(startDate) === scheduler.date.getISOWeek(scheduler.date.add(endDate, 1, "day"))) {
    weekStartIndex = 0;
  } else {
    weekStartIndex = startDate.getDay()
  }
  scheduler.date.week_start = function(date) {
    var shift = date.getDay();
    if (weekStartIndex) {
      if (shift) {
        shift -= weekStartIndex;
      } else {
        shift = weekStartIndex;
      }
    }
    return scheduler.date.date_part(scheduler.date.add(date, -1 * shift, "day"));
  };
}

function hideNonEventDays(eventStartDate, eventEndDate) {
  scheduler.ignore_week = function(day) {
    var isEventDay = false;
    if (day >= eventStartDate && day <= eventEndDate) {
      isEventDay = true;
    }
    return (isEventDay == false);
  }
}

function setupSchedulerTemplates(options) {

  var step = 30;
  var format = scheduler.date.date_to_str("%h:%i %a");

  scheduler.templates.hour_scale = function(date) {
    var html = "";
    if (date.getHours() + date.getMinutes() / 60 < scheduler.config.last_hour - 0.5) {
      for (var i = 0; i < 60 / step; i++) {
        html += "<div style='height:21px;line-height:21px;'>" + format(date) + "</div>";
        date = scheduler.date.add(date, step, "minute");
      }
    }
    return html;
  };

  scheduler.templates.day_scale_date = scheduler.date.date_to_str(scheduler.config.day_date);

  scheduler.templates.event_class = function(start, end, ev) {
    return "";
  };

  scheduler.templates.tooltip_text = function(start, end, ev) {
    return "";
  };

  scheduler.renderEvent = options.renderEvent;

  scheduler.templates.event_text = options.event_text;

  scheduler.templates.event_header = options.event_header;
}

function overrideLimitSpan() {
  scheduler._render_marked_timespan = function(options, area, day) {
    var blocks = []; // resulting block which will be rendered and returned
    var c = scheduler.config;
    var min_date = this._min_date;
    var max_date = this._max_date;
    var day_value = false; // if timespan for specific date should be displayed

    if (!c.display_marked_timespans)
      return blocks;

    // in case of markTimespan
    if (!day && day !== 0) {
      if (options.days < 7)
        day = options.days;
      else {
        var date_to_display = new Date(options.days);
        day_value = +date_to_display;

        // in case of markTimespan date could be not in the viewing range, need to return
        if (!(+max_date > +date_to_display && +min_date <= +date_to_display))
          return blocks;

        day = date_to_display.getDay();
      }

      // convert day default index (Sun - 0, Sat - 6) to index of hourscales (depends on week_start and config.start_on_monday)
      var min_day = min_date.getDay();
      if (min_day > day) {
        day = 7 - (min_day - day);
      } else {
        day = day - min_day;
      }
    }
    var zones = options.zones;
    var css_classes = scheduler._get_css_classes_by_config(options);

    if (scheduler._table_view && scheduler._mode == "month") {
      var areas = [];
      var days = [];


      if (!area) {
        days = (day_value) ? [day_value] : scheduler._get_dates_by_index(day);
        for (var i = 0; i < days.length; i++) {
          areas.push(this._scales[days[i]]);
        }
      } else {
        areas.push(area);
        days.push(day);
      }

      for (var i = 0; i < areas.length; i++) {
        area = areas[i];
        day = days[i];

        var sweek = Math.floor((this._correct_shift(day, 1) - min_date.valueOf()) / (60 * 60 * 1000 * 24 * this._cols.length)),
          sday = this.locate_holder_day(day, false) % this._cols.length;

        if (this._ignores[sday]) continue;

        var block_proto = scheduler._get_block_by_config(options),
          height = Math.max(area.offsetHeight - 1, 0), // 1 for bottom border
          width = Math.max(area.offsetWidth - 1, 0), // 1 for left border
          left = this._colsS[sday],
          top = this._colsS.heights[sweek] + (this._colsS.height ? (this.xy.month_scale_height + 2) : 2) - 1;

        block_proto.className = css_classes;
        block_proto.style.top = top + "px";
        block_proto.style.lineHeight = block_proto.style.height = height + "px";

        for (var k = 0; k < zones.length; k += 2) {
          var start = zones[i];
          var end = zones[i + 1];
          if (end <= start)
            return [];

          var block = block_proto.cloneNode(true);

          block.style.left = (left + Math.round((start) / (24 * 60) * width)) + "px";
          block.style.width = Math.round((end - start) / (24 * 60) * width) + "px";

          area.appendChild(block);
          blocks.push(block);
        }
      }
    } else {
      var index = day;

      if (this._ignores[this.locate_holder_day(day, false)]) return blocks;

      if (this._props && this._props[this._mode] && options.sections && options.sections[this._mode]) {
        var view = this._props[this._mode];
        index = view.order[options.sections[this._mode]];

        var inner_index = view.order[options.sections[this._mode]];
        if (!(view.days > 1)) {
          index = inner_index;
          if (view.size && (index > view.position + view.size)) {
            index = 0;
          }
        } else {
          var units_l = view.size || view.options.length;
          index = index * units_l + inner_index;
        }
      }
      area = area ? area : scheduler.locate_holder(index);

      for (var i = 0; i < zones.length; i += 2) {
        var start = Math.max(zones[i], c.first_hour * 60);
        var end = Math.min(zones[i + 1], c.last_hour * 60);
        if (end <= start) {
          if (i + 2 < zones.length)
            continue;
          else
            return [];
        }

        var block = scheduler._get_block_by_config(options);
        block.className = css_classes;

        // +1 for working with section which really takes up whole height (as % would be == 0)
        var all_hours_height = this.config.hour_size_px * 24 + 1;
        var hour_ms = 60 * 60 * 1000;
        block.style.top = (Math.round((start * 60 * 1000 - this.config.first_hour * hour_ms) * this.config.hour_size_px / hour_ms) % all_hours_height) + "px";
        var hgt = Math.max((Math.round(((end - start) * 60 * 1000) * this.config.hour_size_px / hour_ms)) % all_hours_height, 1)
          // pvrcs: For a cause, to show them up abaove the green area.
        block.style.lineHeight = Math.min(hgt, 40) + "px";
        block.style.height = hgt + "px";

        area.appendChild(block);
        blocks.push(block);
      }
    }

    return blocks;
  }.bind(scheduler);
}

module.exports = {
  setWeekStart: setWeekStart,
  hideNonEventDays: hideNonEventDays,
  setupSchedulerTemplates: setupSchedulerTemplates,
  overrideLimitSpan: overrideLimitSpan,
  configureCalendarForWeekView: configureCalendarForWeekView
};