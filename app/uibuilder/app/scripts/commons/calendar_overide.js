function override() {

  scheduler._render_v_bar = function(ev, x, y, w, h, style, contentA, contentB, bottom) {
    var d = document.createElement("DIV");
    var id = ev.id;
    var cs = (bottom) ? "dhx_cal_event dhx_cal_select_menu" : "dhx_cal_event";

    var cse = scheduler.templates.event_class(ev.start_date, ev.end_date, ev);
    if (cse) cs = cs + " " + cse;

    var bg_color = (ev.color ? ("background:" + ev.color + ";") : "");
    var color = (ev.textColor ? ("color:" + ev.textColor + ";") : "");

    var html = '<div event_id="' + id + '" class="' + cs + '" style="position:absolute; top:' + y + 'px; left:' + x + 'px; width:' + (w - 18) + 'px; height:' + h + 'px;' + (style || "") + '"></div>';

    if(bottom){
      html = '<div event_id="' + id + '" class="' + cs + '" style="position:absolute; top:' + y + 'px; left:' + x + 'px; width:' + (w - 5) + 'px; height:' + h + 'px;' + (style || "") + '"></div>';
    }
    d.innerHTML = html;

    var container = d.cloneNode(true).firstChild;

    if (!bottom && scheduler.renderEvent(container, ev, w, h, contentA, contentB)) {
      return container;
    } else {
      container = d.firstChild;

      var inner_html = '<div class="dhx_event_move dhx_header" style=" width:' + (w - 20) + 'px;' + bg_color + '" >&nbsp;</div>';
      inner_html += '<div class="dhx_event_move dhx_title" style="' + bg_color + '' + color + '">' + contentA + '</div>';
      var dhx_body_html = '<div class="dhx_body" style=" width:' + (w - 14 - (this._quirks ? 4 : 14)) + 'px; height:' + (h - (this._quirks ? 20 : 30) + 1) + 'px;' + bg_color + '' + color + '">' + contentB + '</div>'; // +2 css specific, moved from render_event

      if(bottom)
        dhx_body_html = '<div class="dhx_body" style=" width:' + (w - 1 - (this._quirks ? 4 : 14)) + 'px; height:' + (h - (this._quirks ? 20 : 30) + 1) + 'px;' + bg_color + '' + color + '">' + contentB + '</div>'; // +2 css specific, moved from render_event

      inner_html += dhx_body_html;

      var footer_class = "dhx_event_resize dhx_footer";
      if (bottom)
        footer_class = "dhx_resize_denied " + footer_class;

      inner_html += '<div class="' + footer_class + '" style=" width:' + (w - 12 - 8) + 'px;' + (bottom ? ' margin-top:-1px;' : '') + '' + bg_color + '' + color + '" ></div>';

      container.innerHTML = inner_html;
    }

    return container;
  };
}

module.exports = {
  override : override
}
