/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Thu Jan 16 2020 11:41:50 GMT+0800 (GMT+08:00)
 * @version v0.2.3
 * @link http://dobtco.github.io/jquery-resizable-columns/
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _constants = require('./constants');

$.fn.resizableColumns = function (optionsOrMethod) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	return this.each(function () {
		var $table = $(this);

		var api = $table.data(_constants.DATA_API);
		if (!api) {
			api = new _class2['default']($table, optionsOrMethod);
			$table.data(_constants.DATA_API, api);
		} else if (typeof optionsOrMethod === 'string') {
			var _api;

			return (_api = api)[optionsOrMethod].apply(_api, args);
		}
	});
};

$.resizableColumns = _class2['default'];

},{"./class":2,"./constants":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./constants');

/**
Takes a <table /> element and makes it's columns resizable across both
mobile and desktop clients.

@class ResizableColumns
@param $table {jQuery} jQuery-wrapped <table> element to make resizable
@param options {Object} Configuration object
**/

var ResizableColumns = (function () {
  function ResizableColumns($table, options) {
    _classCallCheck(this, ResizableColumns);

    this.ns = '.rc' + this.count++;

    this.options = $.extend({}, ResizableColumns.defaults, options);

    this.$window = $(window);
    this.$ownerDocument = $($table[0].ownerDocument);
    this.$table = $table;

    this.refreshHeaders();
    this.restoreColumnWidths();
    this.syncHandleWidths();

    this.bindEvents(this.$window, 'resize', this.syncHandleWidths.bind(this));

    if (this.options.start) {
      this.bindEvents(this.$table, _constants.EVENT_RESIZE_START, this.options.start);
    }
    if (this.options.resize) {
      this.bindEvents(this.$table, _constants.EVENT_RESIZE, this.options.resize);
    }
    if (this.options.stop) {
      this.bindEvents(this.$table, _constants.EVENT_RESIZE_STOP, this.options.stop);
    }
  }

  /**
  Refreshes the headers associated with this instances <table/> element and
  generates handles for them. Also assigns percentage widths.
  	@method refreshHeaders
  **/

  _createClass(ResizableColumns, [{
    key: 'refreshHeaders',
    value: function refreshHeaders() {
      // Allow the selector to be both a regular selctor string as well as
      // a dynamic callback
      var selector = this.options.selector;
      if (typeof selector === 'function') {
        selector = selector.call(this, this.$table);
      }

      // Select all table headers
      this.$tableHeaders = this.$table.find(selector);

      // Assign percentage widths first, then create drag handles
      this.assignPercentageWidths();
      this.createHandles();
    }

    /**
    Creates dummy handle elements for all table header columns
    	@method createHandles
    **/
  }, {
    key: 'createHandles',
    value: function createHandles() {
      var _this = this;

      var ref = this.$handleContainer;
      if (ref != null) {
        ref.remove();
      }

      this.$handleContainer = $('<div class=\'' + _constants.CLASS_HANDLE_CONTAINER + '\' />');
      this.$table.before(this.$handleContainer);

      this.$tableHeaders.each(function (i, el) {
        var $current = _this.$tableHeaders.eq(i);
        var $next = _this.$tableHeaders.eq(i + 1);

        if ($next.length === 0 || $current.is(_constants.SELECTOR_UNRESIZABLE) || $next.is(_constants.SELECTOR_UNRESIZABLE)) {
          return;
        }

        var $handle = $('<div class=\'' + _constants.CLASS_HANDLE + '\' />').data(_constants.DATA_TH, $(el)).appendTo(_this.$handleContainer);
      });

      this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.' + _constants.CLASS_HANDLE, this.onPointerDown.bind(this));
    }

    /**
    Assigns a percentage width to all columns based on their current pixel width(s)
    	@method assignPercentageWidths
    **/
  }, {
    key: 'assignPercentageWidths',
    value: function assignPercentageWidths() {
      var _this2 = this;

      this.$tableHeaders.each(function (_, el) {
        var $el = $(el);
        _this2.setWidth($el[0], $el.outerWidth() / _this2.$table.width() * 100);
      });
    }

    /**
    
    @method syncHandleWidths
    **/
  }, {
    key: 'syncHandleWidths',
    value: function syncHandleWidths() {
      var _this3 = this;

      var $container = this.$handleContainer;

      $container.width(this.$table.width());

      $container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
        var $el = $(el);

        var height = _this3.options.resizeFromBody ? _this3.$table.height() : _this3.$table.find('thead').height();

        var left = $el.data(_constants.DATA_TH).outerWidth() + ($el.data(_constants.DATA_TH).offset().left - _this3.$handleContainer.offset().left);

        $el.css({ left: left, height: height });
      });
    }

    /**
    Persists the column widths in localStorage
    	@method saveColumnWidths
    **/
  }, {
    key: 'saveColumnWidths',
    value: function saveColumnWidths() {
      var _this4 = this;

      this.$tableHeaders.each(function (_, el) {
        var $el = $(el);

        if (_this4.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
          _this4.options.store.set(_this4.generateColumnId($el), _this4.parseWidth(el));
        }
      });
    }

    /**
    Retrieves and sets the column widths from localStorage
    	@method restoreColumnWidths
    **/
  }, {
    key: 'restoreColumnWidths',
    value: function restoreColumnWidths() {
      var _this5 = this;

      this.$tableHeaders.each(function (_, el) {
        var $el = $(el);

        if (_this5.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
          var width = _this5.options.store.get(_this5.generateColumnId($el));

          if (width != null) {
            _this5.setWidth(el, width);
          }
        }
      });
    }

    /**
    Pointer/mouse down handler
    	@method onPointerDown
    @param event {Object} Event object associated with the interaction
    **/
  }, {
    key: 'onPointerDown',
    value: function onPointerDown(event) {
      // Only applies to left-click dragging
      if (event.which !== 1) {
        return;
      }

      // If a previous operation is defined, we missed the last mouseup.
      // Probably gobbled up by user mousing out the window then releasing.
      // We'll simulate a pointerup here prior to it
      if (this.operation) {
        this.onPointerUp(event);
      }

      // Ignore non-resizable columns
      var $currentGrip = $(event.currentTarget);
      if ($currentGrip.is(_constants.SELECTOR_UNRESIZABLE)) {
        return;
      }

      var gripIndex = $currentGrip.index();
      var $leftColumn = this.$tableHeaders.eq(gripIndex).not(_constants.SELECTOR_UNRESIZABLE);
      var $rightColumn = this.$tableHeaders.eq(gripIndex + 1).not(_constants.SELECTOR_UNRESIZABLE);

      var leftWidth = this.parseWidth($leftColumn[0]);
      var rightWidth = this.parseWidth($rightColumn[0]);

      this.operation = {
        $leftColumn: $leftColumn, $rightColumn: $rightColumn, $currentGrip: $currentGrip,

        startX: this.getPointerX(event),

        widths: {
          left: leftWidth,
          right: rightWidth
        },
        newWidths: {
          left: leftWidth,
          right: rightWidth
        }
      };

      this.bindEvents(this.$ownerDocument, ['mousemove', 'touchmove'], this.onPointerMove.bind(this));
      this.bindEvents(this.$ownerDocument, ['mouseup', 'touchend'], this.onPointerUp.bind(this));

      this.$handleContainer.add(this.$table).addClass(_constants.CLASS_TABLE_RESIZING);

      $leftColumn.add($rightColumn).add($currentGrip).addClass(_constants.CLASS_COLUMN_RESIZING);

      this.triggerEvent(_constants.EVENT_RESIZE_START, [$leftColumn, $rightColumn, leftWidth, rightWidth], event);

      event.preventDefault();
    }

    /**
    Pointer/mouse movement handler
    	@method onPointerMove
    @param event {Object} Event object associated with the interaction
    **/
  }, {
    key: 'onPointerMove',
    value: function onPointerMove(event) {
      var op = this.operation;
      if (!this.operation) {
        return;
      }

      // Determine the delta change between start and new mouse position, as a percentage of the table width
      var difference = (this.getPointerX(event) - op.startX) / this.$table.width() * 100;
      if (difference === 0) {
        return;
      }

      var leftColumn = op.$leftColumn[0];
      var rightColumn = op.$rightColumn[0];
      var widthLeft = undefined,
          widthRight = undefined;

      if (difference > 0) {
        widthLeft = this.constrainWidth(op.widths.left + (op.widths.right - op.newWidths.right));
        widthRight = this.constrainWidth(op.widths.right - difference);
      } else if (difference < 0) {
        widthLeft = this.constrainWidth(op.widths.left + difference);
        widthRight = this.constrainWidth(op.widths.right + (op.widths.left - op.newWidths.left));
      }

      if (leftColumn) {
        this.setWidth(leftColumn, widthLeft);
      }
      if (rightColumn) {
        this.setWidth(rightColumn, widthRight);
      }

      op.newWidths.left = widthLeft;
      op.newWidths.right = widthRight;

      return this.triggerEvent(_constants.EVENT_RESIZE, [op.$leftColumn, op.$rightColumn, widthLeft, widthRight], event);
    }

    /**
    Pointer/mouse release handler
    	@method onPointerUp
    @param event {Object} Event object associated with the interaction
    **/
  }, {
    key: 'onPointerUp',
    value: function onPointerUp(event) {
      var op = this.operation;
      if (!this.operation) {
        return;
      }

      this.unbindEvents(this.$ownerDocument, ['mouseup', 'touchend', 'mousemove', 'touchmove']);

      this.$handleContainer.add(this.$table).removeClass(_constants.CLASS_TABLE_RESIZING);

      op.$leftColumn.add(op.$rightColumn).add(op.$currentGrip).removeClass(_constants.CLASS_COLUMN_RESIZING);

      this.syncHandleWidths();
      this.saveColumnWidths();

      this.operation = null;

      return this.triggerEvent(_constants.EVENT_RESIZE_STOP, [op.$leftColumn, op.$rightColumn, op.newWidths.left, op.newWidths.right], event);
    }

    /**
    Removes all event listeners, data, and added DOM elements. Takes
    the <table/> element back to how it was, and returns it
    	@method destroy
    @return {jQuery} Original jQuery-wrapped <table> element
    **/
  }, {
    key: 'destroy',
    value: function destroy() {
      var $table = this.$table;
      var $handles = this.$handleContainer.find('.' + _constants.CLASS_HANDLE);

      this.unbindEvents(this.$window.add(this.$ownerDocument).add(this.$table).add($handles));

      $handles.removeData(_constants.DATA_TH);
      $table.removeData(_constants.DATA_API);

      this.$handleContainer.remove();
      this.$handleContainer = null;
      this.$tableHeaders = null;
      this.$table = null;

      return $table;
    }

    /**
    Binds given events for this instance to the given target DOMElement
    	@private
    @method bindEvents
    @param target {jQuery} jQuery-wrapped DOMElement to bind events to
    @param events {String|Array} Event name (or array of) to bind
    @param selectorOrCallback {String|Function} Selector string or callback
    @param [callback] {Function} Callback method
    **/
  }, {
    key: 'bindEvents',
    value: function bindEvents($target, events, selectorOrCallback, callback) {
      if (typeof events === 'string') {
        events = events + this.ns;
      } else {
        events = events.join(this.ns + ' ') + this.ns;
      }

      if (arguments.length > 3) {
        $target.on(events, selectorOrCallback, callback);
      } else {
        $target.on(events, selectorOrCallback);
      }
    }

    /**
    Unbinds events specific to this instance from the given target DOMElement
    	@private
    @method unbindEvents
    @param target {jQuery} jQuery-wrapped DOMElement to unbind events from
    @param events {String|Array} Event name (or array of) to unbind
    **/
  }, {
    key: 'unbindEvents',
    value: function unbindEvents($target, events) {
      if (typeof events === 'string') {
        events = events + this.ns;
      } else if (events != null) {
        events = events.join(this.ns + ' ') + this.ns;
      } else {
        events = this.ns;
      }

      $target.off(events);
    }

    /**
    Triggers an event on the <table/> element for a given type with given
    arguments, also setting and allowing access to the originalEvent if
    given. Returns the result of the triggered event.
    	@private
    @method triggerEvent
    @param type {String} Event name
    @param args {Array} Array of arguments to pass through
    @param [originalEvent] If given, is set on the event object
    @return {Mixed} Result of the event trigger action
    **/
  }, {
    key: 'triggerEvent',
    value: function triggerEvent(type, args, originalEvent) {
      var event = $.Event(type);
      if (event.originalEvent) {
        event.originalEvent = $.extend({}, originalEvent);
      }

      return this.$table.trigger(event, [this].concat(args || []));
    }

    /**
    Calculates a unique column ID for a given column DOMElement
    	@private
    @method generateColumnId
    @param $el {jQuery} jQuery-wrapped column element
    @return {String} Column ID
    **/
  }, {
    key: 'generateColumnId',
    value: function generateColumnId($el) {
      return this.$table.data(_constants.DATA_COLUMNS_ID) + '-' + $el.data(_constants.DATA_COLUMN_ID);
    }

    /**
    Parses a given DOMElement's width into a float
    	@private
    @method parseWidth
    @param element {DOMElement} Element to get width of
    @return {Number} Element's width as a float
    **/
  }, {
    key: 'parseWidth',
    value: function parseWidth(element) {
      return element ? parseFloat(element.style.width.replace('%', '')) : 0;
    }

    /**
    Sets the percentage width of a given DOMElement
    	@private
    @method setWidth
    @param element {DOMElement} Element to set width on
    @param width {Number} Width, as a percentage, to set
    **/
  }, {
    key: 'setWidth',
    value: function setWidth(element, width) {
      width = width.toFixed(2);
      width = width > 0 ? width : 0;
      element.style.width = width + '%';
    }

    /**
    Constrains a given width to the minimum and maximum ranges defined in
    the `minWidth` and `maxWidth` configuration options, respectively.
    	@private
    @method constrainWidth
    @param width {Number} Width to constrain
    @return {Number} Constrained width
    **/
  }, {
    key: 'constrainWidth',
    value: function constrainWidth(width) {
      if (this.options.minWidth != undefined) {
        width = Math.max(this.options.minWidth, width);
      }

      if (this.options.maxWidth != undefined) {
        width = Math.min(this.options.maxWidth, width);
      }

      return width;
    }

    /**
    Given a particular Event object, retrieves the current pointer offset along
    the horizontal direction. Accounts for both regular mouse clicks as well as
    pointer-like systems (mobiles, tablets etc.)
    	@private
    @method getPointerX
    @param event {Object} Event object associated with the interaction
    @return {Number} Horizontal pointer offset
    **/
  }, {
    key: 'getPointerX',
    value: function getPointerX(event) {
      if (event.type.indexOf('touch') === 0) {
        return (event.originalEvent.touches[0] || event.originalEvent.changedTouches[0]).pageX;
      }
      return event.pageX;
    }
  }]);

  return ResizableColumns;
})();

exports['default'] = ResizableColumns;

ResizableColumns.defaults = {
  selector: function selector($table) {
    if ($table.find('thead').length) {
      return _constants.SELECTOR_TH;
    }

    // if ($table.find(SELECTOR_TD).length > 1) {
    //   return SELECTOR_TD;
    // }

    // 适配多种表格布局的情况
    // 有些表格第一列或者 thead 里面就只有一列, 但是内容里面有很多列, 就会出现无法拖动的情况
    // 这里暂不考虑出现 thead 时又出现这个场景的情况, 因为在遇到的实际业务场景中不会出现 thead 的情况
    var selector = undefined;
    var trs = $table.find('tr');
    var trIndex = [];
    for (var a = 0; a < trs.length; a += 1) {
      var tds = $(trs[a]).find('td:visible');
      trIndex.push(tds.length);
    }
    // 找出 td 最多的 tr
    var max = Math.max.apply(Math, trIndex);
    var mi = trIndex.findIndex(function (n, i) {
      return n === max;
    });
    selector = 'tr:nth-child(' + ((mi || 0) + 1) + ') > td:visible';

    return selector;
  },
  store: window.store,
  syncHandlers: true,
  resizeFromBody: true,
  maxWidth: null,
  minWidth: 0.01
};

ResizableColumns.count = 0;
module.exports = exports['default'];

},{"./constants":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var DATA_API = 'resizableColumns';
exports.DATA_API = DATA_API;
var DATA_COLUMNS_ID = 'resizable-columns-id';
exports.DATA_COLUMNS_ID = DATA_COLUMNS_ID;
var DATA_COLUMN_ID = 'resizable-column-id';
exports.DATA_COLUMN_ID = DATA_COLUMN_ID;
var DATA_TH = 'th';

exports.DATA_TH = DATA_TH;
var CLASS_TABLE_RESIZING = 'rc-table-resizing';
exports.CLASS_TABLE_RESIZING = CLASS_TABLE_RESIZING;
var CLASS_COLUMN_RESIZING = 'rc-column-resizing';
exports.CLASS_COLUMN_RESIZING = CLASS_COLUMN_RESIZING;
var CLASS_HANDLE = 'rc-handle';
exports.CLASS_HANDLE = CLASS_HANDLE;
var CLASS_HANDLE_CONTAINER = 'rc-handle-container';

exports.CLASS_HANDLE_CONTAINER = CLASS_HANDLE_CONTAINER;
var EVENT_RESIZE_START = 'column:resize:start';
exports.EVENT_RESIZE_START = EVENT_RESIZE_START;
var EVENT_RESIZE = 'column:resize';
exports.EVENT_RESIZE = EVENT_RESIZE;
var EVENT_RESIZE_STOP = 'column:resize:stop';

exports.EVENT_RESIZE_STOP = EVENT_RESIZE_STOP;
var SELECTOR_TH = 'tr:first > th:visible';
exports.SELECTOR_TH = SELECTOR_TH;
var SELECTOR_TD = 'tr:first > td:visible';
exports.SELECTOR_TD = SELECTOR_TD;
var SELECTOR_UNRESIZABLE = '[data-noresize]';
exports.SELECTOR_UNRESIZABLE = SELECTOR_UNRESIZABLE;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _adapter = require('./adapter');

var _adapter2 = _interopRequireDefault(_adapter);

exports['default'] = _class2['default'];
module.exports = exports['default'];

},{"./adapter":1,"./class":2}]},{},[4])

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0gvQixhQUFhOzs7Ozs7Ozs7OztJQVVDLGdCQUFnQjtBQUN4QixXQURRLGdCQUFnQixDQUN2QixNQUFNLEVBQUUsT0FBTyxFQUFFOzBCQURWLGdCQUFnQjs7QUFFakMsUUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixRQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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QyxDQUFDOzs7Ozs7Ozs7QUN2aEJwQixJQUFNLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQzs7QUFDcEMsSUFBTSxlQUFlLEdBQUcsc0JBQXNCLENBQUM7O0FBQy9DLElBQU0sY0FBYyxHQUFHLHFCQUFxQixDQUFDOztBQUM3QyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUM7OztBQUVyQixJQUFNLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDOztBQUNqRCxJQUFNLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDOztBQUNuRCxJQUFNLFlBQVksR0FBRyxXQUFXLENBQUM7O0FBQ2pDLElBQU0sc0JBQXNCLEdBQUcscUJBQXFCLENBQUM7OztBQUVyRCxJQUFNLGtCQUFrQixHQUFHLHFCQUFxQixDQUFDOztBQUNqRCxJQUFNLFlBQVksR0FBRyxlQUFlLENBQUM7O0FBQ3JDLElBQU0saUJBQWlCLEdBQUcsb0JBQW9CLENBQUM7OztBQUUvQyxJQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQzs7QUFDNUMsSUFBTSxXQUFXLEdBQUcsdUJBQXVCLENBQUM7O0FBQzVDLElBQU0sb0JBQW9CLG9CQUFvQixDQUFDOzs7Ozs7Ozs7Ozs7cUJDaEJ6QixTQUFTOzs7O3VCQUNsQixXQUFXIiwiZmlsZSI6ImpxdWVyeS5yZXNpemFibGVDb2x1bW5zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcbmltcG9ydCB7REFUQV9BUEl9IGZyb20gJy4vY29uc3RhbnRzJztcblxuJC5mbi5yZXNpemFibGVDb2x1bW5zID0gZnVuY3Rpb24ob3B0aW9uc09yTWV0aG9kLCAuLi5hcmdzKSB7XG5cdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0bGV0ICR0YWJsZSA9ICQodGhpcyk7XG5cblx0XHRsZXQgYXBpID0gJHRhYmxlLmRhdGEoREFUQV9BUEkpO1xuXHRcdGlmICghYXBpKSB7XG5cdFx0XHRhcGkgPSBuZXcgUmVzaXphYmxlQ29sdW1ucygkdGFibGUsIG9wdGlvbnNPck1ldGhvZCk7XG5cdFx0XHQkdGFibGUuZGF0YShEQVRBX0FQSSwgYXBpKTtcblx0XHR9XG5cblx0XHRlbHNlIGlmICh0eXBlb2Ygb3B0aW9uc09yTWV0aG9kID09PSAnc3RyaW5nJykge1xuXHRcdFx0cmV0dXJuIGFwaVtvcHRpb25zT3JNZXRob2RdKC4uLmFyZ3MpO1xuXHRcdH1cblx0fSk7XG59O1xuXG4kLnJlc2l6YWJsZUNvbHVtbnMgPSBSZXNpemFibGVDb2x1bW5zO1xuIiwiaW1wb3J0IHtcbiAgREFUQV9BUEksXG4gIERBVEFfQ09MVU1OU19JRCxcbiAgREFUQV9DT0xVTU5fSUQsXG4gIERBVEFfVEgsXG4gIENMQVNTX1RBQkxFX1JFU0laSU5HLFxuICBDTEFTU19DT0xVTU5fUkVTSVpJTkcsXG4gIENMQVNTX0hBTkRMRSxcbiAgQ0xBU1NfSEFORExFX0NPTlRBSU5FUixcbiAgRVZFTlRfUkVTSVpFX1NUQVJULFxuICBFVkVOVF9SRVNJWkUsXG4gIEVWRU5UX1JFU0laRV9TVE9QLFxuICBTRUxFQ1RPUl9USCxcbiAgU0VMRUNUT1JfVEQsXG4gIFNFTEVDVE9SX1VOUkVTSVpBQkxFXG59XG4gIGZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqXG5UYWtlcyBhIDx0YWJsZSAvPiBlbGVtZW50IGFuZCBtYWtlcyBpdCdzIGNvbHVtbnMgcmVzaXphYmxlIGFjcm9zcyBib3RoXG5tb2JpbGUgYW5kIGRlc2t0b3AgY2xpZW50cy5cblxuQGNsYXNzIFJlc2l6YWJsZUNvbHVtbnNcbkBwYXJhbSAkdGFibGUge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgPHRhYmxlPiBlbGVtZW50IHRvIG1ha2UgcmVzaXphYmxlXG5AcGFyYW0gb3B0aW9ucyB7T2JqZWN0fSBDb25maWd1cmF0aW9uIG9iamVjdFxuKiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNpemFibGVDb2x1bW5zIHtcbiAgY29uc3RydWN0b3IoJHRhYmxlLCBvcHRpb25zKSB7XG4gICAgdGhpcy5ucyA9ICcucmMnICsgdGhpcy5jb3VudCsrO1xuXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy4kd2luZG93ID0gJCh3aW5kb3cpO1xuICAgIHRoaXMuJG93bmVyRG9jdW1lbnQgPSAkKCR0YWJsZVswXS5vd25lckRvY3VtZW50KTtcbiAgICB0aGlzLiR0YWJsZSA9ICR0YWJsZTtcblxuICAgIHRoaXMucmVmcmVzaEhlYWRlcnMoKTtcbiAgICB0aGlzLnJlc3RvcmVDb2x1bW5XaWR0aHMoKTtcbiAgICB0aGlzLnN5bmNIYW5kbGVXaWR0aHMoKTtcblxuICAgIHRoaXMuYmluZEV2ZW50cyh0aGlzLiR3aW5kb3csICdyZXNpemUnLCB0aGlzLnN5bmNIYW5kbGVXaWR0aHMuYmluZCh0aGlzKSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnN0YXJ0KSB7XG4gICAgICB0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRV9TVEFSVCwgdGhpcy5vcHRpb25zLnN0YXJ0KTtcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5yZXNpemUpIHtcbiAgICAgIHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFLCB0aGlzLm9wdGlvbnMucmVzaXplKTtcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zdG9wKSB7XG4gICAgICB0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRV9TVE9QLCB0aGlzLm9wdGlvbnMuc3RvcCk7XG4gICAgfVxuICB9XG5cblx0LyoqXG5cdFJlZnJlc2hlcyB0aGUgaGVhZGVycyBhc3NvY2lhdGVkIHdpdGggdGhpcyBpbnN0YW5jZXMgPHRhYmxlLz4gZWxlbWVudCBhbmRcblx0Z2VuZXJhdGVzIGhhbmRsZXMgZm9yIHRoZW0uIEFsc28gYXNzaWducyBwZXJjZW50YWdlIHdpZHRocy5cblxuXHRAbWV0aG9kIHJlZnJlc2hIZWFkZXJzXG5cdCoqL1xuICByZWZyZXNoSGVhZGVycygpIHtcbiAgICAvLyBBbGxvdyB0aGUgc2VsZWN0b3IgdG8gYmUgYm90aCBhIHJlZ3VsYXIgc2VsY3RvciBzdHJpbmcgYXMgd2VsbCBhc1xuICAgIC8vIGEgZHluYW1pYyBjYWxsYmFja1xuICAgIGxldCBzZWxlY3RvciA9IHRoaXMub3B0aW9ucy5zZWxlY3RvcjtcbiAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLmNhbGwodGhpcywgdGhpcy4kdGFibGUpO1xuICAgIH1cblxuICAgIC8vIFNlbGVjdCBhbGwgdGFibGUgaGVhZGVyc1xuICAgIHRoaXMuJHRhYmxlSGVhZGVycyA9IHRoaXMuJHRhYmxlLmZpbmQoc2VsZWN0b3IpO1xuXG4gICAgLy8gQXNzaWduIHBlcmNlbnRhZ2Ugd2lkdGhzIGZpcnN0LCB0aGVuIGNyZWF0ZSBkcmFnIGhhbmRsZXNcbiAgICB0aGlzLmFzc2lnblBlcmNlbnRhZ2VXaWR0aHMoKTtcbiAgICB0aGlzLmNyZWF0ZUhhbmRsZXMoKTtcbiAgfVxuXG5cdC8qKlxuXHRDcmVhdGVzIGR1bW15IGhhbmRsZSBlbGVtZW50cyBmb3IgYWxsIHRhYmxlIGhlYWRlciBjb2x1bW5zXG5cblx0QG1ldGhvZCBjcmVhdGVIYW5kbGVzXG5cdCoqL1xuICBjcmVhdGVIYW5kbGVzKCkge1xuICAgIGxldCByZWYgPSB0aGlzLiRoYW5kbGVDb250YWluZXI7XG4gICAgaWYgKHJlZiAhPSBudWxsKSB7XG4gICAgICByZWYucmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgdGhpcy4kaGFuZGxlQ29udGFpbmVyID0gJChgPGRpdiBjbGFzcz0nJHtDTEFTU19IQU5ETEVfQ09OVEFJTkVSfScgLz5gKVxuICAgIHRoaXMuJHRhYmxlLmJlZm9yZSh0aGlzLiRoYW5kbGVDb250YWluZXIpO1xuXG4gICAgdGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKGksIGVsKSA9PiB7XG4gICAgICBsZXQgJGN1cnJlbnQgPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoaSk7XG4gICAgICBsZXQgJG5leHQgPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoaSArIDEpO1xuXG4gICAgICBpZiAoJG5leHQubGVuZ3RoID09PSAwIHx8ICRjdXJyZW50LmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSB8fCAkbmV4dC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsZXQgJGhhbmRsZSA9ICQoYDxkaXYgY2xhc3M9JyR7Q0xBU1NfSEFORExFfScgLz5gKVxuICAgICAgICAuZGF0YShEQVRBX1RILCAkKGVsKSlcbiAgICAgICAgLmFwcGVuZFRvKHRoaXMuJGhhbmRsZUNvbnRhaW5lcik7XG4gICAgfSk7XG5cbiAgICB0aGlzLmJpbmRFdmVudHModGhpcy4kaGFuZGxlQ29udGFpbmVyLCBbJ21vdXNlZG93bicsICd0b3VjaHN0YXJ0J10sICcuJyArIENMQVNTX0hBTkRMRSwgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpO1xuICB9XG5cblx0LyoqXG5cdEFzc2lnbnMgYSBwZXJjZW50YWdlIHdpZHRoIHRvIGFsbCBjb2x1bW5zIGJhc2VkIG9uIHRoZWlyIGN1cnJlbnQgcGl4ZWwgd2lkdGgocylcblxuXHRAbWV0aG9kIGFzc2lnblBlcmNlbnRhZ2VXaWR0aHNcblx0KiovXG4gIGFzc2lnblBlcmNlbnRhZ2VXaWR0aHMoKSB7XG4gICAgdGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XG4gICAgICBsZXQgJGVsID0gJChlbCk7XG4gICAgICB0aGlzLnNldFdpZHRoKCRlbFswXSwgJGVsLm91dGVyV2lkdGgoKSAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDApO1xuICAgIH0pO1xuICB9XG5cblx0LyoqXG5cblxuXHRAbWV0aG9kIHN5bmNIYW5kbGVXaWR0aHNcblx0KiovXG4gIHN5bmNIYW5kbGVXaWR0aHMoKSB7XG4gICAgbGV0ICRjb250YWluZXIgPSB0aGlzLiRoYW5kbGVDb250YWluZXJcblxuICAgICRjb250YWluZXIud2lkdGgodGhpcy4kdGFibGUud2lkdGgoKSk7XG5cbiAgICAkY29udGFpbmVyLmZpbmQoJy4nICsgQ0xBU1NfSEFORExFKS5lYWNoKChfLCBlbCkgPT4ge1xuICAgICAgbGV0ICRlbCA9ICQoZWwpO1xuXG4gICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJlc2l6ZUZyb21Cb2R5ID9cbiAgICAgICAgdGhpcy4kdGFibGUuaGVpZ2h0KCkgOlxuICAgICAgICB0aGlzLiR0YWJsZS5maW5kKCd0aGVhZCcpLmhlaWdodCgpO1xuXG4gICAgICBsZXQgbGVmdCA9ICRlbC5kYXRhKERBVEFfVEgpLm91dGVyV2lkdGgoKSArIChcbiAgICAgICAgJGVsLmRhdGEoREFUQV9USCkub2Zmc2V0KCkubGVmdCAtIHRoaXMuJGhhbmRsZUNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XG4gICAgICApO1xuXG4gICAgICAkZWwuY3NzKHsgbGVmdCwgaGVpZ2h0IH0pO1xuICAgIH0pO1xuICB9XG5cblx0LyoqXG5cdFBlcnNpc3RzIHRoZSBjb2x1bW4gd2lkdGhzIGluIGxvY2FsU3RvcmFnZVxuXG5cdEBtZXRob2Qgc2F2ZUNvbHVtbldpZHRoc1xuXHQqKi9cbiAgc2F2ZUNvbHVtbldpZHRocygpIHtcbiAgICB0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcbiAgICAgIGxldCAkZWwgPSAkKGVsKTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zdG9yZSAmJiAhJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMuc3RvcmUuc2V0KFxuICAgICAgICAgIHRoaXMuZ2VuZXJhdGVDb2x1bW5JZCgkZWwpLFxuICAgICAgICAgIHRoaXMucGFyc2VXaWR0aChlbClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cdC8qKlxuXHRSZXRyaWV2ZXMgYW5kIHNldHMgdGhlIGNvbHVtbiB3aWR0aHMgZnJvbSBsb2NhbFN0b3JhZ2VcblxuXHRAbWV0aG9kIHJlc3RvcmVDb2x1bW5XaWR0aHNcblx0KiovXG4gIHJlc3RvcmVDb2x1bW5XaWR0aHMoKSB7XG4gICAgdGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XG4gICAgICBsZXQgJGVsID0gJChlbCk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3RvcmUgJiYgISRlbC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5vcHRpb25zLnN0b3JlLmdldChcbiAgICAgICAgICB0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKVxuICAgICAgICApO1xuXG4gICAgICAgIGlmICh3aWR0aCAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5zZXRXaWR0aChlbCwgd2lkdGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXHQvKipcblx0UG9pbnRlci9tb3VzZSBkb3duIGhhbmRsZXJcblxuXHRAbWV0aG9kIG9uUG9pbnRlckRvd25cblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXG5cdCoqL1xuICBvblBvaW50ZXJEb3duKGV2ZW50KSB7XG4gICAgLy8gT25seSBhcHBsaWVzIHRvIGxlZnQtY2xpY2sgZHJhZ2dpbmdcbiAgICBpZiAoZXZlbnQud2hpY2ggIT09IDEpIHsgcmV0dXJuOyB9XG5cbiAgICAvLyBJZiBhIHByZXZpb3VzIG9wZXJhdGlvbiBpcyBkZWZpbmVkLCB3ZSBtaXNzZWQgdGhlIGxhc3QgbW91c2V1cC5cbiAgICAvLyBQcm9iYWJseSBnb2JibGVkIHVwIGJ5IHVzZXIgbW91c2luZyBvdXQgdGhlIHdpbmRvdyB0aGVuIHJlbGVhc2luZy5cbiAgICAvLyBXZSdsbCBzaW11bGF0ZSBhIHBvaW50ZXJ1cCBoZXJlIHByaW9yIHRvIGl0XG4gICAgaWYgKHRoaXMub3BlcmF0aW9uKSB7XG4gICAgICB0aGlzLm9uUG9pbnRlclVwKGV2ZW50KTtcbiAgICB9XG5cbiAgICAvLyBJZ25vcmUgbm9uLXJlc2l6YWJsZSBjb2x1bW5zXG4gICAgbGV0ICRjdXJyZW50R3JpcCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCk7XG4gICAgaWYgKCRjdXJyZW50R3JpcC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgZ3JpcEluZGV4ID0gJGN1cnJlbnRHcmlwLmluZGV4KCk7XG4gICAgbGV0ICRsZWZ0Q29sdW1uID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGdyaXBJbmRleCkubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKTtcbiAgICBsZXQgJHJpZ2h0Q29sdW1uID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGdyaXBJbmRleCArIDEpLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSk7XG5cbiAgICBsZXQgbGVmdFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRsZWZ0Q29sdW1uWzBdKTtcbiAgICBsZXQgcmlnaHRXaWR0aCA9IHRoaXMucGFyc2VXaWR0aCgkcmlnaHRDb2x1bW5bMF0pO1xuXG4gICAgdGhpcy5vcGVyYXRpb24gPSB7XG4gICAgICAkbGVmdENvbHVtbiwgJHJpZ2h0Q29sdW1uLCAkY3VycmVudEdyaXAsXG5cbiAgICAgIHN0YXJ0WDogdGhpcy5nZXRQb2ludGVyWChldmVudCksXG5cbiAgICAgIHdpZHRoczoge1xuICAgICAgICBsZWZ0OiBsZWZ0V2lkdGgsXG4gICAgICAgIHJpZ2h0OiByaWdodFdpZHRoXG4gICAgICB9LFxuICAgICAgbmV3V2lkdGhzOiB7XG4gICAgICAgIGxlZnQ6IGxlZnRXaWR0aCxcbiAgICAgICAgcmlnaHQ6IHJpZ2h0V2lkdGhcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZSddLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2V1cCcsICd0b3VjaGVuZCddLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy4kaGFuZGxlQ29udGFpbmVyXG4gICAgICAuYWRkKHRoaXMuJHRhYmxlKVxuICAgICAgLmFkZENsYXNzKENMQVNTX1RBQkxFX1JFU0laSU5HKTtcblxuICAgICRsZWZ0Q29sdW1uXG4gICAgICAuYWRkKCRyaWdodENvbHVtbilcbiAgICAgIC5hZGQoJGN1cnJlbnRHcmlwKVxuICAgICAgLmFkZENsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XG5cbiAgICB0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkVfU1RBUlQsIFtcbiAgICAgICRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sXG4gICAgICBsZWZ0V2lkdGgsIHJpZ2h0V2lkdGhcbiAgICBdLFxuICAgICAgZXZlbnQpO1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxuXG5cdC8qKlxuXHRQb2ludGVyL21vdXNlIG1vdmVtZW50IGhhbmRsZXJcblxuXHRAbWV0aG9kIG9uUG9pbnRlck1vdmVcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXG5cdCoqL1xuICBvblBvaW50ZXJNb3ZlKGV2ZW50KSB7XG4gICAgbGV0IG9wID0gdGhpcy5vcGVyYXRpb247XG4gICAgaWYgKCF0aGlzLm9wZXJhdGlvbikgeyByZXR1cm47IH1cblxuICAgIC8vIERldGVybWluZSB0aGUgZGVsdGEgY2hhbmdlIGJldHdlZW4gc3RhcnQgYW5kIG5ldyBtb3VzZSBwb3NpdGlvbiwgYXMgYSBwZXJjZW50YWdlIG9mIHRoZSB0YWJsZSB3aWR0aFxuICAgIGxldCBkaWZmZXJlbmNlID0gKHRoaXMuZ2V0UG9pbnRlclgoZXZlbnQpIC0gb3Auc3RhcnRYKSAvIHRoaXMuJHRhYmxlLndpZHRoKCkgKiAxMDA7XG4gICAgaWYgKGRpZmZlcmVuY2UgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbGVmdENvbHVtbiA9IG9wLiRsZWZ0Q29sdW1uWzBdO1xuICAgIGxldCByaWdodENvbHVtbiA9IG9wLiRyaWdodENvbHVtblswXTtcbiAgICBsZXQgd2lkdGhMZWZ0LCB3aWR0aFJpZ2h0O1xuXG4gICAgaWYgKGRpZmZlcmVuY2UgPiAwKSB7XG4gICAgICB3aWR0aExlZnQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLndpZHRocy5sZWZ0ICsgKG9wLndpZHRocy5yaWdodCAtIG9wLm5ld1dpZHRocy5yaWdodCkpO1xuICAgICAgd2lkdGhSaWdodCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3Aud2lkdGhzLnJpZ2h0IC0gZGlmZmVyZW5jZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGRpZmZlcmVuY2UgPCAwKSB7XG4gICAgICB3aWR0aExlZnQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLndpZHRocy5sZWZ0ICsgZGlmZmVyZW5jZSk7XG4gICAgICB3aWR0aFJpZ2h0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC53aWR0aHMucmlnaHQgKyAob3Aud2lkdGhzLmxlZnQgLSBvcC5uZXdXaWR0aHMubGVmdCkpO1xuICAgIH1cblxuICAgIGlmIChsZWZ0Q29sdW1uKSB7XG4gICAgICB0aGlzLnNldFdpZHRoKGxlZnRDb2x1bW4sIHdpZHRoTGVmdCk7XG4gICAgfVxuICAgIGlmIChyaWdodENvbHVtbikge1xuICAgICAgdGhpcy5zZXRXaWR0aChyaWdodENvbHVtbiwgd2lkdGhSaWdodCk7XG4gICAgfVxuXG4gICAgb3AubmV3V2lkdGhzLmxlZnQgPSB3aWR0aExlZnQ7XG4gICAgb3AubmV3V2lkdGhzLnJpZ2h0ID0gd2lkdGhSaWdodDtcblxuICAgIHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkUsIFtcbiAgICAgIG9wLiRsZWZ0Q29sdW1uLCBvcC4kcmlnaHRDb2x1bW4sXG4gICAgICB3aWR0aExlZnQsIHdpZHRoUmlnaHRcbiAgICBdLFxuICAgICAgZXZlbnQpO1xuICB9XG5cblx0LyoqXG5cdFBvaW50ZXIvbW91c2UgcmVsZWFzZSBoYW5kbGVyXG5cblx0QG1ldGhvZCBvblBvaW50ZXJVcFxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cblx0KiovXG4gIG9uUG9pbnRlclVwKGV2ZW50KSB7XG4gICAgbGV0IG9wID0gdGhpcy5vcGVyYXRpb247XG4gICAgaWYgKCF0aGlzLm9wZXJhdGlvbikgeyByZXR1cm47IH1cblxuICAgIHRoaXMudW5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2V1cCcsICd0b3VjaGVuZCcsICdtb3VzZW1vdmUnLCAndG91Y2htb3ZlJ10pO1xuXG4gICAgdGhpcy4kaGFuZGxlQ29udGFpbmVyXG4gICAgICAuYWRkKHRoaXMuJHRhYmxlKVxuICAgICAgLnJlbW92ZUNsYXNzKENMQVNTX1RBQkxFX1JFU0laSU5HKTtcblxuICAgIG9wLiRsZWZ0Q29sdW1uXG4gICAgICAuYWRkKG9wLiRyaWdodENvbHVtbilcbiAgICAgIC5hZGQob3AuJGN1cnJlbnRHcmlwKVxuICAgICAgLnJlbW92ZUNsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XG5cbiAgICB0aGlzLnN5bmNIYW5kbGVXaWR0aHMoKTtcbiAgICB0aGlzLnNhdmVDb2x1bW5XaWR0aHMoKTtcblxuICAgIHRoaXMub3BlcmF0aW9uID0gbnVsbDtcblxuICAgIHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkVfU1RPUCwgW1xuICAgICAgb3AuJGxlZnRDb2x1bW4sIG9wLiRyaWdodENvbHVtbixcbiAgICAgIG9wLm5ld1dpZHRocy5sZWZ0LCBvcC5uZXdXaWR0aHMucmlnaHRcbiAgICBdLFxuICAgICAgZXZlbnQpO1xuICB9XG5cblx0LyoqXG5cdFJlbW92ZXMgYWxsIGV2ZW50IGxpc3RlbmVycywgZGF0YSwgYW5kIGFkZGVkIERPTSBlbGVtZW50cy4gVGFrZXNcblx0dGhlIDx0YWJsZS8+IGVsZW1lbnQgYmFjayB0byBob3cgaXQgd2FzLCBhbmQgcmV0dXJucyBpdFxuXG5cdEBtZXRob2QgZGVzdHJveVxuXHRAcmV0dXJuIHtqUXVlcnl9IE9yaWdpbmFsIGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudFxuXHQqKi9cbiAgZGVzdHJveSgpIHtcbiAgICBsZXQgJHRhYmxlID0gdGhpcy4kdGFibGU7XG4gICAgbGV0ICRoYW5kbGVzID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyLmZpbmQoJy4nICsgQ0xBU1NfSEFORExFKTtcblxuICAgIHRoaXMudW5iaW5kRXZlbnRzKFxuICAgICAgdGhpcy4kd2luZG93XG4gICAgICAgIC5hZGQodGhpcy4kb3duZXJEb2N1bWVudClcbiAgICAgICAgLmFkZCh0aGlzLiR0YWJsZSlcbiAgICAgICAgLmFkZCgkaGFuZGxlcylcbiAgICApO1xuXG4gICAgJGhhbmRsZXMucmVtb3ZlRGF0YShEQVRBX1RIKTtcbiAgICAkdGFibGUucmVtb3ZlRGF0YShEQVRBX0FQSSk7XG5cbiAgICB0aGlzLiRoYW5kbGVDb250YWluZXIucmVtb3ZlKCk7XG4gICAgdGhpcy4kaGFuZGxlQ29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLiR0YWJsZUhlYWRlcnMgPSBudWxsO1xuICAgIHRoaXMuJHRhYmxlID0gbnVsbDtcblxuICAgIHJldHVybiAkdGFibGU7XG4gIH1cblxuXHQvKipcblx0QmluZHMgZ2l2ZW4gZXZlbnRzIGZvciB0aGlzIGluc3RhbmNlIHRvIHRoZSBnaXZlbiB0YXJnZXQgRE9NRWxlbWVudFxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgYmluZEV2ZW50c1xuXHRAcGFyYW0gdGFyZ2V0IHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgdG8gYmluZCBldmVudHMgdG9cblx0QHBhcmFtIGV2ZW50cyB7U3RyaW5nfEFycmF5fSBFdmVudCBuYW1lIChvciBhcnJheSBvZikgdG8gYmluZFxuXHRAcGFyYW0gc2VsZWN0b3JPckNhbGxiYWNrIHtTdHJpbmd8RnVuY3Rpb259IFNlbGVjdG9yIHN0cmluZyBvciBjYWxsYmFja1xuXHRAcGFyYW0gW2NhbGxiYWNrXSB7RnVuY3Rpb259IENhbGxiYWNrIG1ldGhvZFxuXHQqKi9cbiAgYmluZEV2ZW50cygkdGFyZ2V0LCBldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spIHtcbiAgICBpZiAodHlwZW9mIGV2ZW50cyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGV2ZW50cyA9IGV2ZW50cyArIHRoaXMubnM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZXZlbnRzID0gZXZlbnRzLmpvaW4odGhpcy5ucyArICcgJykgKyB0aGlzLm5zO1xuICAgIH1cblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgICAgJHRhcmdldC5vbihldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICR0YXJnZXQub24oZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG5cdC8qKlxuXHRVbmJpbmRzIGV2ZW50cyBzcGVjaWZpYyB0byB0aGlzIGluc3RhbmNlIGZyb20gdGhlIGdpdmVuIHRhcmdldCBET01FbGVtZW50XG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCB1bmJpbmRFdmVudHNcblx0QHBhcmFtIHRhcmdldCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRvIHVuYmluZCBldmVudHMgZnJvbVxuXHRAcGFyYW0gZXZlbnRzIHtTdHJpbmd8QXJyYXl9IEV2ZW50IG5hbWUgKG9yIGFycmF5IG9mKSB0byB1bmJpbmRcblx0KiovXG4gIHVuYmluZEV2ZW50cygkdGFyZ2V0LCBldmVudHMpIHtcbiAgICBpZiAodHlwZW9mIGV2ZW50cyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGV2ZW50cyA9IGV2ZW50cyArIHRoaXMubnM7XG4gICAgfVxuICAgIGVsc2UgaWYgKGV2ZW50cyAhPSBudWxsKSB7XG4gICAgICBldmVudHMgPSBldmVudHMuam9pbih0aGlzLm5zICsgJyAnKSArIHRoaXMubnM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZXZlbnRzID0gdGhpcy5ucztcbiAgICB9XG5cbiAgICAkdGFyZ2V0Lm9mZihldmVudHMpO1xuICB9XG5cblx0LyoqXG5cdFRyaWdnZXJzIGFuIGV2ZW50IG9uIHRoZSA8dGFibGUvPiBlbGVtZW50IGZvciBhIGdpdmVuIHR5cGUgd2l0aCBnaXZlblxuXHRhcmd1bWVudHMsIGFsc28gc2V0dGluZyBhbmQgYWxsb3dpbmcgYWNjZXNzIHRvIHRoZSBvcmlnaW5hbEV2ZW50IGlmXG5cdGdpdmVuLiBSZXR1cm5zIHRoZSByZXN1bHQgb2YgdGhlIHRyaWdnZXJlZCBldmVudC5cblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIHRyaWdnZXJFdmVudFxuXHRAcGFyYW0gdHlwZSB7U3RyaW5nfSBFdmVudCBuYW1lXG5cdEBwYXJhbSBhcmdzIHtBcnJheX0gQXJyYXkgb2YgYXJndW1lbnRzIHRvIHBhc3MgdGhyb3VnaFxuXHRAcGFyYW0gW29yaWdpbmFsRXZlbnRdIElmIGdpdmVuLCBpcyBzZXQgb24gdGhlIGV2ZW50IG9iamVjdFxuXHRAcmV0dXJuIHtNaXhlZH0gUmVzdWx0IG9mIHRoZSBldmVudCB0cmlnZ2VyIGFjdGlvblxuXHQqKi9cbiAgdHJpZ2dlckV2ZW50KHR5cGUsIGFyZ3MsIG9yaWdpbmFsRXZlbnQpIHtcbiAgICBsZXQgZXZlbnQgPSAkLkV2ZW50KHR5cGUpO1xuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50KSB7XG4gICAgICBldmVudC5vcmlnaW5hbEV2ZW50ID0gJC5leHRlbmQoe30sIG9yaWdpbmFsRXZlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLiR0YWJsZS50cmlnZ2VyKGV2ZW50LCBbdGhpc10uY29uY2F0KGFyZ3MgfHwgW10pKTtcbiAgfVxuXG5cdC8qKlxuXHRDYWxjdWxhdGVzIGEgdW5pcXVlIGNvbHVtbiBJRCBmb3IgYSBnaXZlbiBjb2x1bW4gRE9NRWxlbWVudFxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgZ2VuZXJhdGVDb2x1bW5JZFxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIGNvbHVtbiBlbGVtZW50XG5cdEByZXR1cm4ge1N0cmluZ30gQ29sdW1uIElEXG5cdCoqL1xuICBnZW5lcmF0ZUNvbHVtbklkKCRlbCkge1xuICAgIHJldHVybiB0aGlzLiR0YWJsZS5kYXRhKERBVEFfQ09MVU1OU19JRCkgKyAnLScgKyAkZWwuZGF0YShEQVRBX0NPTFVNTl9JRCk7XG4gIH1cblxuXHQvKipcblx0UGFyc2VzIGEgZ2l2ZW4gRE9NRWxlbWVudCdzIHdpZHRoIGludG8gYSBmbG9hdFxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgcGFyc2VXaWR0aFxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBnZXQgd2lkdGggb2Zcblx0QHJldHVybiB7TnVtYmVyfSBFbGVtZW50J3Mgd2lkdGggYXMgYSBmbG9hdFxuXHQqKi9cbiAgcGFyc2VXaWR0aChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQgPyBwYXJzZUZsb2F0KGVsZW1lbnQuc3R5bGUud2lkdGgucmVwbGFjZSgnJScsICcnKSkgOiAwO1xuICB9XG5cblx0LyoqXG5cdFNldHMgdGhlIHBlcmNlbnRhZ2Ugd2lkdGggb2YgYSBnaXZlbiBET01FbGVtZW50XG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCBzZXRXaWR0aFxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBzZXQgd2lkdGggb25cblx0QHBhcmFtIHdpZHRoIHtOdW1iZXJ9IFdpZHRoLCBhcyBhIHBlcmNlbnRhZ2UsIHRvIHNldFxuXHQqKi9cbiAgc2V0V2lkdGgoZWxlbWVudCwgd2lkdGgpIHtcbiAgICB3aWR0aCA9IHdpZHRoLnRvRml4ZWQoMik7XG4gICAgd2lkdGggPSB3aWR0aCA+IDAgPyB3aWR0aCA6IDA7XG4gICAgZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJyUnO1xuICB9XG5cblx0LyoqXG5cdENvbnN0cmFpbnMgYSBnaXZlbiB3aWR0aCB0byB0aGUgbWluaW11bSBhbmQgbWF4aW11bSByYW5nZXMgZGVmaW5lZCBpblxuXHR0aGUgYG1pbldpZHRoYCBhbmQgYG1heFdpZHRoYCBjb25maWd1cmF0aW9uIG9wdGlvbnMsIHJlc3BlY3RpdmVseS5cblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIGNvbnN0cmFpbldpZHRoXG5cdEBwYXJhbSB3aWR0aCB7TnVtYmVyfSBXaWR0aCB0byBjb25zdHJhaW5cblx0QHJldHVybiB7TnVtYmVyfSBDb25zdHJhaW5lZCB3aWR0aFxuXHQqKi9cbiAgY29uc3RyYWluV2lkdGgod2lkdGgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLm1pbldpZHRoICE9IHVuZGVmaW5lZCkge1xuICAgICAgd2lkdGggPSBNYXRoLm1heCh0aGlzLm9wdGlvbnMubWluV2lkdGgsIHdpZHRoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLm1heFdpZHRoICE9IHVuZGVmaW5lZCkge1xuICAgICAgd2lkdGggPSBNYXRoLm1pbih0aGlzLm9wdGlvbnMubWF4V2lkdGgsIHdpZHRoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd2lkdGg7XG4gIH1cblxuXHQvKipcblx0R2l2ZW4gYSBwYXJ0aWN1bGFyIEV2ZW50IG9iamVjdCwgcmV0cmlldmVzIHRoZSBjdXJyZW50IHBvaW50ZXIgb2Zmc2V0IGFsb25nXG5cdHRoZSBob3Jpem9udGFsIGRpcmVjdGlvbi4gQWNjb3VudHMgZm9yIGJvdGggcmVndWxhciBtb3VzZSBjbGlja3MgYXMgd2VsbCBhc1xuXHRwb2ludGVyLWxpa2Ugc3lzdGVtcyAobW9iaWxlcywgdGFibGV0cyBldGMuKVxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgZ2V0UG9pbnRlclhcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXG5cdEByZXR1cm4ge051bWJlcn0gSG9yaXpvbnRhbCBwb2ludGVyIG9mZnNldFxuXHQqKi9cbiAgZ2V0UG9pbnRlclgoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudHlwZS5pbmRleE9mKCd0b3VjaCcpID09PSAwKSB7XG4gICAgICByZXR1cm4gKGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXSB8fCBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdKS5wYWdlWDtcbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50LnBhZ2VYO1xuICB9XG59XG5cblJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMgPSB7XG4gIHNlbGVjdG9yOiBmdW5jdGlvbiAoJHRhYmxlKSB7XG4gICAgaWYgKCR0YWJsZS5maW5kKCd0aGVhZCcpLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFNFTEVDVE9SX1RIXG4gICAgfVxuXG4gICAgLy8gaWYgKCR0YWJsZS5maW5kKFNFTEVDVE9SX1REKS5sZW5ndGggPiAxKSB7XG4gICAgLy8gICByZXR1cm4gU0VMRUNUT1JfVEQ7XG4gICAgLy8gfVxuXG4gICAgLy8g6YCC6YWN5aSa56eN6KGo5qC85biD5bGA55qE5oOF5Ya1XG4gICAgLy8g5pyJ5Lqb6KGo5qC856ys5LiA5YiX5oiW6ICFIHRoZWFkIOmHjOmdouWwseWPquacieS4gOWIlywg5L2G5piv5YaF5a656YeM6Z2i5pyJ5b6I5aSa5YiXLCDlsLHkvJrlh7rnjrDml6Dms5Xmi5bliqjnmoTmg4XlhrVcbiAgICAvLyDov5nph4zmmoLkuI3ogIPomZHlh7rnjrAgdGhlYWQg5pe25Y+I5Ye6546w6L+Z5Liq5Zy65pmv55qE5oOF5Ya1LCDlm6DkuLrlnKjpgYfliLDnmoTlrp7pmYXkuJrliqHlnLrmma/kuK3kuI3kvJrlh7rnjrAgdGhlYWQg55qE5oOF5Ya1XG4gICAgbGV0IHNlbGVjdG9yXG4gICAgY29uc3QgdHJzID0gJHRhYmxlLmZpbmQoJ3RyJylcbiAgICBjb25zdCB0ckluZGV4ID0gW11cbiAgICBmb3IgKGxldCBhID0gMDsgYSA8IHRycy5sZW5ndGg7IGEgKz0gMSkge1xuICAgICAgY29uc3QgdGRzID0gJCh0cnNbYV0pLmZpbmQoJ3RkOnZpc2libGUnKVxuICAgICAgdHJJbmRleC5wdXNoKHRkcy5sZW5ndGgpXG4gICAgfVxuICAgIC8vIOaJvuWHuiB0ZCDmnIDlpJrnmoQgdHJcbiAgICBjb25zdCBtYXggPSBNYXRoLm1heCguLi50ckluZGV4KVxuICAgIGNvbnN0IG1pID0gdHJJbmRleC5maW5kSW5kZXgoKG4sIGkpID0+IG4gPT09IG1heClcbiAgICBzZWxlY3RvciA9IGB0cjpudGgtY2hpbGQoJHsobWkgfHwgMCkgKyAxfSkgPiB0ZDp2aXNpYmxlYFxuXG4gICAgcmV0dXJuIHNlbGVjdG9yXG4gIH0sXG4gIHN0b3JlOiB3aW5kb3cuc3RvcmUsXG4gIHN5bmNIYW5kbGVyczogdHJ1ZSxcbiAgcmVzaXplRnJvbUJvZHk6IHRydWUsXG4gIG1heFdpZHRoOiBudWxsLFxuICBtaW5XaWR0aDogMC4wMVxufTtcblxuUmVzaXphYmxlQ29sdW1ucy5jb3VudCA9IDA7XG4iLCJleHBvcnQgY29uc3QgREFUQV9BUEkgPSAncmVzaXphYmxlQ29sdW1ucyc7XG5leHBvcnQgY29uc3QgREFUQV9DT0xVTU5TX0lEID0gJ3Jlc2l6YWJsZS1jb2x1bW5zLWlkJztcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTl9JRCA9ICdyZXNpemFibGUtY29sdW1uLWlkJztcbmV4cG9ydCBjb25zdCBEQVRBX1RIID0gJ3RoJztcblxuZXhwb3J0IGNvbnN0IENMQVNTX1RBQkxFX1JFU0laSU5HID0gJ3JjLXRhYmxlLXJlc2l6aW5nJztcbmV4cG9ydCBjb25zdCBDTEFTU19DT0xVTU5fUkVTSVpJTkcgPSAncmMtY29sdW1uLXJlc2l6aW5nJztcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEUgPSAncmMtaGFuZGxlJztcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEVfQ09OVEFJTkVSID0gJ3JjLWhhbmRsZS1jb250YWluZXInO1xuXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFX1NUQVJUID0gJ2NvbHVtbjpyZXNpemU6c3RhcnQnO1xuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRSA9ICdjb2x1bW46cmVzaXplJztcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkVfU1RPUCA9ICdjb2x1bW46cmVzaXplOnN0b3AnO1xuXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVEggPSAndHI6Zmlyc3QgPiB0aDp2aXNpYmxlJztcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9URCA9ICd0cjpmaXJzdCA+IHRkOnZpc2libGUnO1xuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1VOUkVTSVpBQkxFID0gYFtkYXRhLW5vcmVzaXplXWA7XG4iLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcbmltcG9ydCBhZGFwdGVyIGZyb20gJy4vYWRhcHRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IFJlc2l6YWJsZUNvbHVtbnM7Il0sInByZUV4aXN0aW5nQ29tbWVudCI6Ii8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltNXZaR1ZmYlc5a2RXeGxjeTlpY205M2MyVnlMWEJoWTJzdlgzQnlaV3gxWkdVdWFuTWlMQ0l2VlhObGNuTXZZMkZ0Wld3dmQyOXlheTlxY1hWbGNua3RjbVZ6YVhwaFlteGxMV052YkhWdGJuTXZjM0pqTDJGa1lYQjBaWEl1YW5NaUxDSXZWWE5sY25NdlkyRnRaV3d2ZDI5eWF5OXFjWFZsY25rdGNtVnphWHBoWW14bExXTnZiSFZ0Ym5NdmMzSmpMMk5zWVhOekxtcHpJaXdpTDFWelpYSnpMMk5oYldWc0wzZHZjbXN2YW5GMVpYSjVMWEpsYzJsNllXSnNaUzFqYjJ4MWJXNXpMM055WXk5amIyNXpkR0Z1ZEhNdWFuTWlMQ0l2VlhObGNuTXZZMkZ0Wld3dmQyOXlheTlxY1hWbGNua3RjbVZ6YVhwaFlteGxMV052YkhWdGJuTXZjM0pqTDJsdVpHVjRMbXB6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQk96czdPenR4UWtOQk5rSXNVMEZCVXpzN096dDVRa0ZEWml4aFFVRmhPenRCUVVWd1F5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMR2RDUVVGblFpeEhRVUZITEZWQlFWTXNaVUZCWlN4RlFVRlhPMjFEUVVGT0xFbEJRVWs3UVVGQlNpeE5RVUZKT3pzN1FVRkRlRVFzVVVGQlR5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRmxCUVZjN1FVRkRNMElzVFVGQlNTeE5RVUZOTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE96dEJRVVZ5UWl4TlFVRkpMRWRCUVVjc1IwRkJSeXhOUVVGTkxFTkJRVU1zU1VGQlNTeHhRa0ZCVlN4RFFVRkRPMEZCUTJoRExFMUJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVTdRVUZEVkN4TlFVRkhMRWRCUVVjc2RVSkJRWEZDTEUxQlFVMHNSVUZCUlN4bFFVRmxMRU5CUVVNc1EwRkJRenRCUVVOd1JDeFRRVUZOTEVOQlFVTXNTVUZCU1N4elFrRkJWeXhIUVVGSExFTkJRVU1zUTBGQlF6dEhRVU16UWl4TlFVVkpMRWxCUVVrc1QwRkJUeXhsUVVGbExFdEJRVXNzVVVGQlVTeEZRVUZGT3pzN1FVRkROME1zVlVGQlR5eFJRVUZCTEVkQlFVY3NSVUZCUXl4bFFVRmxMRTlCUVVNc1QwRkJTU3hKUVVGSkxFTkJRVU1zUTBGQlF6dEhRVU55UXp0RlFVTkVMRU5CUVVNc1EwRkJRenREUVVOSUxFTkJRVU03TzBGQlJVWXNRMEZCUXl4RFFVRkRMR2RDUVVGblFpeHhRa0ZCYlVJc1EwRkJRenM3T3pzN096czdPenM3T3p0NVFrTklMMElzWVVGQllUczdPenM3T3pzN096czdTVUZWUXl4blFrRkJaMEk3UVVGRGVFSXNWMEZFVVN4blFrRkJaMElzUTBGRGRrSXNUVUZCVFN4RlFVRkZMRTlCUVU4c1JVRkJSVHN3UWtGRVZpeG5Ra0ZCWjBJN08wRkJSV3BETEZGQlFVa3NRMEZCUXl4RlFVRkZMRWRCUVVjc1MwRkJTeXhIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXpzN1FVRkZMMElzVVVGQlNTeERRVUZETEU5QlFVOHNSMEZCUnl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFVkJRVVVzUlVGQlJTeG5Ra0ZCWjBJc1EwRkJReXhSUVVGUkxFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdPMEZCUldoRkxGRkJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE8wRkJRM3BDTEZGQlFVa3NRMEZCUXl4alFVRmpMRWRCUVVjc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJRenRCUVVOcVJDeFJRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkhMRTFCUVUwc1EwRkJRenM3UVVGRmNrSXNVVUZCU1N4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRE8wRkJRM1JDTEZGQlFVa3NRMEZCUXl4dFFrRkJiVUlzUlVGQlJTeERRVUZETzBGQlF6TkNMRkZCUVVrc1EwRkJReXhuUWtGQlowSXNSVUZCUlN4RFFVRkRPenRCUVVWNFFpeFJRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFVkJRVVVzVVVGQlVTeEZRVUZGTEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenM3UVVGRk1VVXNVVUZCU1N4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzUlVGQlJUdEJRVU4wUWl4VlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEdsRFFVRnpRaXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMHRCUTNSRk8wRkJRMFFzVVVGQlNTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTFCUVUwc1JVRkJSVHRCUVVOMlFpeFZRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxESkNRVUZuUWl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzB0QlEycEZPMEZCUTBRc1VVRkJTU3hKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NSVUZCUlR0QlFVTnlRaXhWUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MR2REUVVGeFFpeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8wdEJRM0JGTzBkQlEwWTdPenM3T3pzN08yVkJla0pyUWl4blFrRkJaMEk3TzFkQmFVTnlRaXd3UWtGQlJ6czdPMEZCUjJZc1ZVRkJTU3hSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNN1FVRkRja01zVlVGQlNTeFBRVUZQTEZGQlFWRXNTMEZCU3l4VlFVRlZMRVZCUVVVN1FVRkRiRU1zWjBKQlFWRXNSMEZCUnl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1QwRkROME03T3p0QlFVZEVMRlZCUVVrc1EwRkJReXhoUVVGaExFZEJRVWNzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03T3p0QlFVZG9SQ3hWUVVGSkxFTkJRVU1zYzBKQlFYTkNMRVZCUVVVc1EwRkJRenRCUVVNNVFpeFZRVUZKTEVOQlFVTXNZVUZCWVN4RlFVRkZMRU5CUVVNN1MwRkRkRUk3T3pzN096czdPMWRCVDFrc2VVSkJRVWM3T3p0QlFVTmtMRlZCUVVrc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJRenRCUVVOb1F5eFZRVUZKTEVkQlFVY3NTVUZCU1N4SlFVRkpMRVZCUVVVN1FVRkRaaXhYUVVGSExFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTTdUMEZEWkRzN1FVRkZSQ3hWUVVGSkxFTkJRVU1zWjBKQlFXZENMRWRCUVVjc1EwRkJReXdyUkVGQk5rTXNRMEZCUVR0QlFVTjBSU3hWUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNRMEZCUXpzN1FVRkZNVU1zVlVGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeEZRVUZMTzBGQlEycERMRmxCUVVrc1VVRkJVU3hIUVVGSExFMUJRVXNzWVVGQllTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRCUVVONFF5eFpRVUZKTEV0QlFVc3NSMEZCUnl4TlFVRkxMR0ZCUVdFc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPenRCUVVWNlF5eFpRVUZKTEV0QlFVc3NRMEZCUXl4TlFVRk5MRXRCUVVzc1EwRkJReXhKUVVGSkxGRkJRVkVzUTBGQlF5eEZRVUZGTEdsRFFVRnpRaXhKUVVGSkxFdEJRVXNzUTBGQlF5eEZRVUZGTEdsRFFVRnpRaXhGUVVGRk8wRkJRemRHTEdsQ1FVRlBPMU5CUTFJN08wRkJSVVFzV1VGQlNTeFBRVUZQTEVkQlFVY3NRMEZCUXl4eFJFRkJiVU1zUTBGREwwTXNTVUZCU1N4eFFrRkJWU3hEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNRMEZEY0VJc1VVRkJVU3hEUVVGRExFMUJRVXNzWjBKQlFXZENMRU5CUVVNc1EwRkJRenRQUVVOd1F5eERRVUZETEVOQlFVTTdPMEZCUlVnc1ZVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFVkJRVVVzUTBGQlF5eFhRVUZYTEVWQlFVVXNXVUZCV1N4RFFVRkRMRVZCUVVVc1IwRkJSeXd3UWtGQlpTeEZRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdTMEZEZUVnN096czdPenM3TzFkQlQzRkNMR3REUVVGSE96czdRVUZEZGtJc1ZVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hGUVVGTE8wRkJRMnBETEZsQlFVa3NSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6dEJRVU5vUWl4bFFVRkxMRkZCUVZFc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSMEZCUnl4RFFVRkRMRlZCUVZVc1JVRkJSU3hIUVVGSExFOUJRVXNzVFVGQlRTeERRVUZETEV0QlFVc3NSVUZCUlN4SFFVRkhMRWRCUVVjc1EwRkJReXhEUVVGRE8wOUJRM0pGTEVOQlFVTXNRMEZCUXp0TFFVTktPenM3T3pzN096dFhRVTlsTERSQ1FVRkhPenM3UVVGRGFrSXNWVUZCU1N4VlFVRlZMRWRCUVVjc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkJPenRCUVVWMFF5eG5Ra0ZCVlN4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRMRU5CUVVNN08wRkJSWFJETEdkQ1FVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzTUVKQlFXVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVczdRVUZEYkVRc1dVRkJTU3hIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPenRCUVVWb1FpeFpRVUZKTEUxQlFVMHNSMEZCUnl4UFFVRkxMRTlCUVU4c1EwRkJReXhqUVVGakxFZEJRM1JETEU5QlFVc3NUVUZCVFN4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVOd1FpeFBRVUZMTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTTdPMEZCUlhKRExGbEJRVWtzU1VGQlNTeEhRVUZITEVkQlFVY3NRMEZCUXl4SlFVRkpMRzlDUVVGVExFTkJRVU1zVlVGQlZTeEZRVUZGTEVsQlEzWkRMRWRCUVVjc1EwRkJReXhKUVVGSkxHOUNRVUZUTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1NVRkJTU3hIUVVGSExFOUJRVXNzWjBKQlFXZENMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zU1VGQlNTeERRVUZCTEVGQlEzUkZMRU5CUVVNN08wRkJSVVlzVjBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJTaXhKUVVGSkxFVkJRVVVzVFVGQlRTeEZRVUZPTEUxQlFVMHNSVUZCUlN4RFFVRkRMRU5CUVVNN1QwRkRNMElzUTBGQlF5eERRVUZETzB0QlEwbzdPenM3T3pzN08xZEJUMlVzTkVKQlFVYzdPenRCUVVOcVFpeFZRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVczdRVUZEYWtNc1dVRkJTU3hIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPenRCUVVWb1FpeFpRVUZKTEU5QlFVc3NUMEZCVHl4RFFVRkRMRXRCUVVzc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEdsRFFVRnpRaXhGUVVGRk8wRkJRM1pFTEdsQ1FVRkxMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVU53UWl4UFFVRkxMR2RDUVVGblFpeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVTXhRaXhQUVVGTExGVkJRVlVzUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZEY0VJc1EwRkJRenRUUVVOSU8wOUJRMFlzUTBGQlF5eERRVUZETzB0QlEwbzdPenM3T3pzN08xZEJUMnRDTEN0Q1FVRkhPenM3UVVGRGNFSXNWVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RlFVRkxPMEZCUTJwRExGbEJRVWtzUjBGQlJ5eEhRVUZITEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRenM3UVVGRmFFSXNXVUZCU1N4UFFVRkxMRTlCUVU4c1EwRkJReXhMUVVGTExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4cFEwRkJjMElzUlVGQlJUdEJRVU4yUkN4alFVRkpMRXRCUVVzc1IwRkJSeXhQUVVGTExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNSMEZCUnl4RFFVTm9ReXhQUVVGTExHZENRVUZuUWl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVNelFpeERRVUZET3p0QlFVVkdMR05CUVVrc1MwRkJTeXhKUVVGSkxFbEJRVWtzUlVGQlJUdEJRVU5xUWl4dFFrRkJTeXhSUVVGUkxFTkJRVU1zUlVGQlJTeEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRPMWRCUXpGQ08xTkJRMFk3VDBGRFJpeERRVUZETEVOQlFVTTdTMEZEU2pzN096czdPenM3TzFkQlVWa3NkVUpCUVVNc1MwRkJTeXhGUVVGRk96dEJRVVZ1UWl4VlFVRkpMRXRCUVVzc1EwRkJReXhMUVVGTExFdEJRVXNzUTBGQlF5eEZRVUZGTzBGQlFVVXNaVUZCVHp0UFFVRkZPenM3T3p0QlFVdHNReXhWUVVGSkxFbEJRVWtzUTBGQlF5eFRRVUZUTEVWQlFVVTdRVUZEYkVJc1dVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0UFFVTjZRanM3TzBGQlIwUXNWVUZCU1N4WlFVRlpMRWRCUVVjc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXp0QlFVTXhReXhWUVVGSkxGbEJRVmtzUTBGQlF5eEZRVUZGTEdsRFFVRnpRaXhGUVVGRk8wRkJRM3BETEdWQlFVODdUMEZEVWpzN1FVRkZSQ3hWUVVGSkxGTkJRVk1zUjBGQlJ5eFpRVUZaTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1FVRkRja01zVlVGQlNTeFhRVUZYTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhGUVVGRkxFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNSMEZCUnl4cFEwRkJjMElzUTBGQlF6dEJRVU0zUlN4VlFVRkpMRmxCUVZrc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVWQlFVVXNRMEZCUXl4VFFVRlRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eHBRMEZCYzBJc1EwRkJRenM3UVVGRmJFWXNWVUZCU1N4VFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRCUVVOb1JDeFZRVUZKTEZWQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPenRCUVVWc1JDeFZRVUZKTEVOQlFVTXNVMEZCVXl4SFFVRkhPMEZCUTJZc2JVSkJRVmNzUlVGQldDeFhRVUZYTEVWQlFVVXNXVUZCV1N4RlFVRmFMRmxCUVZrc1JVRkJSU3haUVVGWkxFVkJRVm9zV1VGQldUczdRVUZGZGtNc1kwRkJUU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTXNTMEZCU3l4RFFVRkRPenRCUVVVdlFpeGpRVUZOTEVWQlFVVTdRVUZEVGl4alFVRkpMRVZCUVVVc1UwRkJVenRCUVVObUxHVkJRVXNzUlVGQlJTeFZRVUZWTzFOQlEyeENPMEZCUTBRc2FVSkJRVk1zUlVGQlJUdEJRVU5VTEdOQlFVa3NSVUZCUlN4VFFVRlRPMEZCUTJZc1pVRkJTeXhGUVVGRkxGVkJRVlU3VTBGRGJFSTdUMEZEUml4RFFVRkRPenRCUVVWR0xGVkJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRExGZEJRVmNzUlVGQlJTeFhRVUZYTEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMEZCUTJoSExGVkJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRExGTkJRVk1zUlVGQlJTeFZRVUZWTEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPenRCUVVVelJpeFZRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRMnhDTEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRMmhDTEZGQlFWRXNhVU5CUVhOQ0xFTkJRVU03TzBGQlJXeERMR2xDUVVGWExFTkJRMUlzUjBGQlJ5eERRVUZETEZsQlFWa3NRMEZCUXl4RFFVTnFRaXhIUVVGSExFTkJRVU1zV1VGQldTeERRVUZETEVOQlEycENMRkZCUVZFc2EwTkJRWFZDTEVOQlFVTTdPMEZCUlc1RExGVkJRVWtzUTBGQlF5eFpRVUZaTEdkRFFVRnhRaXhEUVVOd1F5eFhRVUZYTEVWQlFVVXNXVUZCV1N4RlFVTjZRaXhUUVVGVExFVkJRVVVzVlVGQlZTeERRVU4wUWl4RlFVTkRMRXRCUVVzc1EwRkJReXhEUVVGRE96dEJRVVZVTEZkQlFVc3NRMEZCUXl4alFVRmpMRVZCUVVVc1EwRkJRenRMUVVONFFqczdPenM3T3pzN08xZEJVVmtzZFVKQlFVTXNTMEZCU3l4RlFVRkZPMEZCUTI1Q0xGVkJRVWtzUlVGQlJTeEhRVUZITEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNN1FVRkRlRUlzVlVGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRVZCUVVVN1FVRkJSU3hsUVVGUE8wOUJRVVU3T3p0QlFVZG9ReXhWUVVGSkxGVkJRVlVzUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETEUxQlFVMHNRMEZCUVN4SFFVRkpMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVkQlFVY3NSMEZCUnl4RFFVRkRPMEZCUTI1R0xGVkJRVWtzVlVGQlZTeExRVUZMTEVOQlFVTXNSVUZCUlR0QlFVTndRaXhsUVVGUE8wOUJRMUk3TzBGQlJVUXNWVUZCU1N4VlFVRlZMRWRCUVVjc1JVRkJSU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0QlFVTnVReXhWUVVGSkxGZEJRVmNzUjBGQlJ5eEZRVUZGTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRM0pETEZWQlFVa3NVMEZCVXl4WlFVRkJPMVZCUVVVc1ZVRkJWU3haUVVGQkxFTkJRVU03TzBGQlJURkNMRlZCUVVrc1ZVRkJWU3hIUVVGSExFTkJRVU1zUlVGQlJUdEJRVU5zUWl4cFFrRkJVeXhIUVVGSExFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNSVUZCUlN4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFbEJRVWtzUlVGQlJTeERRVUZETEUxQlFVMHNRMEZCUXl4TFFVRkxMRWRCUVVjc1JVRkJSU3hEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEVOQlFVRXNRVUZCUXl4RFFVRkRMRU5CUVVNN1FVRkRla1lzYTBKQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1kwRkJZeXhEUVVGRExFVkJRVVVzUTBGQlF5eE5RVUZOTEVOQlFVTXNTMEZCU3l4SFFVRkhMRlZCUVZVc1EwRkJReXhEUVVGRE8wOUJRMmhGTEUxQlEwa3NTVUZCU1N4VlFVRlZMRWRCUVVjc1EwRkJReXhGUVVGRk8wRkJRM1pDTEdsQ1FVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRExHTkJRV01zUTBGQlF5eEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1IwRkJSeXhWUVVGVkxFTkJRVU1zUTBGQlF6dEJRVU0zUkN4clFrRkJWU3hIUVVGSExFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNSVUZCUlN4RFFVRkRMRTFCUVUwc1EwRkJReXhMUVVGTExFbEJRVWtzUlVGQlJTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRWRCUVVjc1JVRkJSU3hEUVVGRExGTkJRVk1zUTBGQlF5eEpRVUZKTEVOQlFVRXNRVUZCUXl4RFFVRkRMRU5CUVVNN1QwRkRNVVk3TzBGQlJVUXNWVUZCU1N4VlFVRlZMRVZCUVVVN1FVRkRaQ3haUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEZWQlFWVXNSVUZCUlN4VFFVRlRMRU5CUVVNc1EwRkJRenRQUVVOMFF6dEJRVU5FTEZWQlFVa3NWMEZCVnl4RlFVRkZPMEZCUTJZc1dVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eFhRVUZYTEVWQlFVVXNWVUZCVlN4RFFVRkRMRU5CUVVNN1QwRkRlRU03TzBGQlJVUXNVVUZCUlN4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxFZEJRVWNzVTBGQlV5eERRVUZETzBGQlF6bENMRkZCUVVVc1EwRkJReXhUUVVGVExFTkJRVU1zUzBGQlN5eEhRVUZITEZWQlFWVXNRMEZCUXpzN1FVRkZhRU1zWVVGQlR5eEpRVUZKTEVOQlFVTXNXVUZCV1N3d1FrRkJaU3hEUVVOeVF5eEZRVUZGTEVOQlFVTXNWMEZCVnl4RlFVRkZMRVZCUVVVc1EwRkJReXhaUVVGWkxFVkJReTlDTEZOQlFWTXNSVUZCUlN4VlFVRlZMRU5CUTNSQ0xFVkJRME1zUzBGQlN5eERRVUZETEVOQlFVTTdTMEZEVmpzN096czdPenM3TzFkQlVWVXNjVUpCUVVNc1MwRkJTeXhGUVVGRk8wRkJRMnBDTEZWQlFVa3NSVUZCUlN4SFFVRkhMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU03UVVGRGVFSXNWVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhUUVVGVExFVkJRVVU3UVVGQlJTeGxRVUZQTzA5QlFVVTdPMEZCUldoRExGVkJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRExGTkJRVk1zUlVGQlJTeFZRVUZWTEVWQlFVVXNWMEZCVnl4RlFVRkZMRmRCUVZjc1EwRkJReXhEUVVGRExFTkJRVU03TzBGQlJURkdMRlZCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZEYkVJc1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZEYUVJc1YwRkJWeXhwUTBGQmMwSXNRMEZCUXpzN1FVRkZja01zVVVGQlJTeERRVUZETEZkQlFWY3NRMEZEV0N4SFFVRkhMRU5CUVVNc1JVRkJSU3hEUVVGRExGbEJRVmtzUTBGQlF5eERRVU53UWl4SFFVRkhMRU5CUVVNc1JVRkJSU3hEUVVGRExGbEJRVmtzUTBGQlF5eERRVU53UWl4WFFVRlhMR3REUVVGMVFpeERRVUZET3p0QlFVVjBReXhWUVVGSkxFTkJRVU1zWjBKQlFXZENMRVZCUVVVc1EwRkJRenRCUVVONFFpeFZRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFVkJRVVVzUTBGQlF6czdRVUZGZUVJc1ZVRkJTU3hEUVVGRExGTkJRVk1zUjBGQlJ5eEpRVUZKTEVOQlFVTTdPMEZCUlhSQ0xHRkJRVThzU1VGQlNTeERRVUZETEZsQlFWa3NLMEpCUVc5Q0xFTkJRekZETEVWQlFVVXNRMEZCUXl4WFFVRlhMRVZCUVVVc1JVRkJSU3hEUVVGRExGbEJRVmtzUlVGREwwSXNSVUZCUlN4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeERRVUZETEZOQlFWTXNRMEZCUXl4TFFVRkxMRU5CUTNSRExFVkJRME1zUzBGQlN5eERRVUZETEVOQlFVTTdTMEZEVmpzN096czdPenM3T3p0WFFWTk5MRzFDUVVGSE8wRkJRMUlzVlVGQlNTeE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJRenRCUVVONlFpeFZRVUZKTEZGQlFWRXNSMEZCUnl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc01FSkJRV1VzUTBGQlF5eERRVUZET3p0QlFVVTVSQ3hWUVVGSkxFTkJRVU1zV1VGQldTeERRVU5tTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUTFRc1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNRMEZEZUVJc1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZEYUVJc1IwRkJSeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVU5xUWl4RFFVRkRPenRCUVVWR0xHTkJRVkVzUTBGQlF5eFZRVUZWTEc5Q1FVRlRMRU5CUVVNN1FVRkROMElzV1VGQlRTeERRVUZETEZWQlFWVXNjVUpCUVZVc1EwRkJRenM3UVVGRk5VSXNWVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRPMEZCUXk5Q0xGVkJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1IwRkJSeXhKUVVGSkxFTkJRVU03UVVGRE4wSXNWVUZCU1N4RFFVRkRMR0ZCUVdFc1IwRkJSeXhKUVVGSkxFTkJRVU03UVVGRE1VSXNWVUZCU1N4RFFVRkRMRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU03TzBGQlJXNUNMR0ZCUVU4c1RVRkJUU3hEUVVGRE8wdEJRMlk3T3pzN096czdPenM3T3pzN1YwRlpVeXh2UWtGQlF5eFBRVUZQTEVWQlFVVXNUVUZCVFN4RlFVRkZMR3RDUVVGclFpeEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTjRSQ3hWUVVGSkxFOUJRVThzVFVGQlRTeExRVUZMTEZGQlFWRXNSVUZCUlR0QlFVTTVRaXhqUVVGTkxFZEJRVWNzVFVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNN1QwRkRNMElzVFVGRFNUdEJRVU5JTEdOQlFVMHNSMEZCUnl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVkQlFVY3NSMEZCUnl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF6dFBRVU12UXpzN1FVRkZSQ3hWUVVGSkxGTkJRVk1zUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4RlFVRkZPMEZCUTNoQ0xHVkJRVThzUTBGQlF5eEZRVUZGTEVOQlFVTXNUVUZCVFN4RlFVRkZMR3RDUVVGclFpeEZRVUZGTEZGQlFWRXNRMEZCUXl4RFFVRkRPMDlCUTJ4RUxFMUJRMGs3UVVGRFNDeGxRVUZQTEVOQlFVTXNSVUZCUlN4RFFVRkRMRTFCUVUwc1JVRkJSU3hyUWtGQmEwSXNRMEZCUXl4RFFVRkRPMDlCUTNoRE8wdEJRMFk3T3pzN096czdPenM3TzFkQlZWY3NjMEpCUVVNc1QwRkJUeXhGUVVGRkxFMUJRVTBzUlVGQlJUdEJRVU0xUWl4VlFVRkpMRTlCUVU4c1RVRkJUU3hMUVVGTExGRkJRVkVzUlVGQlJUdEJRVU01UWl4alFVRk5MRWRCUVVjc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eEZRVUZGTEVOQlFVTTdUMEZETTBJc1RVRkRTU3hKUVVGSkxFMUJRVTBzU1VGQlNTeEpRVUZKTEVWQlFVVTdRVUZEZGtJc1kwRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1IwRkJSeXhIUVVGSExFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRPMDlCUXk5RExFMUJRMGs3UVVGRFNDeGpRVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJRenRQUVVOc1FqczdRVUZGUkN4aFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzB0QlEzSkNPenM3T3pzN096czdPenM3T3pzN1YwRmpWeXh6UWtGQlF5eEpRVUZKTEVWQlFVVXNTVUZCU1N4RlFVRkZMR0ZCUVdFc1JVRkJSVHRCUVVOMFF5eFZRVUZKTEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzBGQlF6RkNMRlZCUVVrc1MwRkJTeXhEUVVGRExHRkJRV0VzUlVGQlJUdEJRVU4yUWl4aFFVRkxMRU5CUVVNc1lVRkJZU3hIUVVGSExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNSVUZCUlN4RlFVRkZMR0ZCUVdFc1EwRkJReXhEUVVGRE8wOUJRMjVFT3p0QlFVVkVMR0ZCUVU4c1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NTVUZCU1N4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRE8wdEJRemxFT3pzN096czdPenM3T3p0WFFWVmxMREJDUVVGRExFZEJRVWNzUlVGQlJUdEJRVU53UWl4aFFVRlBMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlNTdzBRa0ZCYVVJc1IwRkJSeXhIUVVGSExFZEJRVWNzUjBGQlJ5eERRVUZETEVsQlFVa3NNa0pCUVdkQ0xFTkJRVU03UzBGRE0wVTdPenM3T3pzN096czdPMWRCVlZNc2IwSkJRVU1zVDBGQlR5eEZRVUZGTzBGQlEyeENMR0ZCUVU4c1QwRkJUeXhIUVVGSExGVkJRVlVzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zUjBGQlJ5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8wdEJRM1pGT3pzN096czdPenM3T3p0WFFWVlBMR3RDUVVGRExFOUJRVThzUlVGQlJTeExRVUZMTEVWQlFVVTdRVUZEZGtJc1YwRkJTeXhIUVVGSExFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1FVRkRla0lzVjBGQlN5eEhRVUZITEV0QlFVc3NSMEZCUnl4RFFVRkRMRWRCUVVjc1MwRkJTeXhIUVVGSExFTkJRVU1zUTBGQlF6dEJRVU01UWl4aFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUjBGQlJ5eExRVUZMTEVkQlFVY3NSMEZCUnl4RFFVRkRPMHRCUTI1RE96czdPenM3T3pzN096czdWMEZYWVN4M1FrRkJReXhMUVVGTExFVkJRVVU3UVVGRGNFSXNWVUZCU1N4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzU1VGQlNTeFRRVUZUTEVWQlFVVTdRVUZEZEVNc1lVRkJTeXhIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhSUVVGUkxFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTTdUMEZEYUVRN08wRkJSVVFzVlVGQlNTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRkZCUVZFc1NVRkJTU3hUUVVGVExFVkJRVVU3UVVGRGRFTXNZVUZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4UlFVRlJMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU03VDBGRGFFUTdPMEZCUlVRc1lVRkJUeXhMUVVGTExFTkJRVU03UzBGRFpEczdPenM3T3pzN096czdPenRYUVZsVkxIRkNRVUZETEV0QlFVc3NSVUZCUlR0QlFVTnFRaXhWUVVGSkxFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUlVGQlJUdEJRVU55UXl4bFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExHRkJRV0VzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1MwRkJTeXhEUVVGRExHRkJRV0VzUTBGQlF5eGpRVUZqTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFc1EwRkJSU3hMUVVGTExFTkJRVU03VDBGRGVFWTdRVUZEUkN4aFFVRlBMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU03UzBGRGNFSTdPenRUUVhoa2EwSXNaMEpCUVdkQ096czdjVUpCUVdoQ0xHZENRVUZuUWpzN1FVRXlaSEpETEdkQ1FVRm5RaXhEUVVGRExGRkJRVkVzUjBGQlJ6dEJRVU14UWl4VlFVRlJMRVZCUVVVc2EwSkJRVlVzVFVGQlRTeEZRVUZGTzBGQlF6RkNMRkZCUVVrc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4TlFVRk5MRVZCUVVVN1FVRkRMMElzYjBOQlFXdENPMHRCUTI1Q096czdPenM3T3pzN1FVRlRSQ3hSUVVGSkxGRkJRVkVzV1VGQlFTeERRVUZCTzBGQlExb3NVVUZCVFN4SFFVRkhMRWRCUVVjc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUVR0QlFVTTNRaXhSUVVGTkxFOUJRVThzUjBGQlJ5eEZRVUZGTEVOQlFVRTdRVUZEYkVJc1UwRkJTeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRWRCUVVjc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlR0QlFVTjBReXhWUVVGTkxFZEJRVWNzUjBGQlJ5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4RFFVRkJPMEZCUTNoRExHRkJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGQk8wdEJRM3BDT3p0QlFVVkVMRkZCUVUwc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEUxQlFVRXNRMEZCVWl4SlFVRkpMRVZCUVZFc1QwRkJUeXhEUVVGRExFTkJRVUU3UVVGRGFFTXNVVUZCVFN4RlFVRkZMRWRCUVVjc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eFZRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRPMkZCUVVzc1EwRkJReXhMUVVGTExFZEJRVWM3UzBGQlFTeERRVUZETEVOQlFVRTdRVUZEYWtRc1dVRkJVU3h6UWtGQmJVSXNRMEZCUXl4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGQkxFZEJRVWtzUTBGQlF5eERRVUZCTEcxQ1FVRm5RaXhEUVVGQk96dEJRVVY0UkN4WFFVRlBMRkZCUVZFc1EwRkJRVHRIUVVOb1FqdEJRVU5FTEU5QlFVc3NSVUZCUlN4TlFVRk5MRU5CUVVNc1MwRkJTenRCUVVOdVFpeGpRVUZaTEVWQlFVVXNTVUZCU1R0QlFVTnNRaXhuUWtGQll5eEZRVUZGTEVsQlFVazdRVUZEY0VJc1ZVRkJVU3hGUVVGRkxFbEJRVWs3UVVGRFpDeFZRVUZSTEVWQlFVVXNTVUZCU1R0RFFVTm1MRU5CUVVNN08wRkJSVVlzWjBKQlFXZENMRU5CUVVNc1MwRkJTeXhIUVVGSExFTkJRVU1zUTBGQlF6czdPenM3T3pzN08wRkRkbWhDY0VJc1NVRkJUU3hSUVVGUkxFZEJRVWNzYTBKQlFXdENMRU5CUVVNN08wRkJRM0JETEVsQlFVMHNaVUZCWlN4SFFVRkhMSE5DUVVGelFpeERRVUZET3p0QlFVTXZReXhKUVVGTkxHTkJRV01zUjBGQlJ5eHhRa0ZCY1VJc1EwRkJRenM3UVVGRE4wTXNTVUZCVFN4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRE96czdRVUZGY2tJc1NVRkJUU3h2UWtGQmIwSXNSMEZCUnl4dFFrRkJiVUlzUTBGQlF6czdRVUZEYWtRc1NVRkJUU3h4UWtGQmNVSXNSMEZCUnl4dlFrRkJiMElzUTBGQlF6czdRVUZEYmtRc1NVRkJUU3haUVVGWkxFZEJRVWNzVjBGQlZ5eERRVUZET3p0QlFVTnFReXhKUVVGTkxITkNRVUZ6UWl4SFFVRkhMSEZDUVVGeFFpeERRVUZET3pzN1FVRkZja1FzU1VGQlRTeHJRa0ZCYTBJc1IwRkJSeXh4UWtGQmNVSXNRMEZCUXpzN1FVRkRha1FzU1VGQlRTeFpRVUZaTEVkQlFVY3NaVUZCWlN4RFFVRkRPenRCUVVOeVF5eEpRVUZOTEdsQ1FVRnBRaXhIUVVGSExHOUNRVUZ2UWl4RFFVRkRPenM3UVVGRkwwTXNTVUZCVFN4WFFVRlhMRWRCUVVjc2RVSkJRWFZDTEVOQlFVTTdPMEZCUXpWRExFbEJRVTBzVjBGQlZ5eEhRVUZITEhWQ1FVRjFRaXhEUVVGRE96dEJRVU0xUXl4SlFVRk5MRzlDUVVGdlFpeHZRa0ZCYjBJc1EwRkJRenM3T3pzN096czdPenM3TzNGQ1EyaENla0lzVTBGQlV6czdPenQxUWtGRGJFSXNWMEZCVnlJc0ltWnBiR1VpT2lKblpXNWxjbUYwWldRdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lLR1oxYm1OMGFXOXVJR1VvZEN4dUxISXBlMloxYm1OMGFXOXVJSE1vYnl4MUtYdHBaaWdoYmx0dlhTbDdhV1lvSVhSYmIxMHBlM1poY2lCaFBYUjVjR1Z2WmlCeVpYRjFhWEpsUFQxY0ltWjFibU4wYVc5dVhDSW1KbkpsY1hWcGNtVTdhV1lvSVhVbUptRXBjbVYwZFhKdUlHRW9ieXdoTUNrN2FXWW9hU2x5WlhSMWNtNGdhU2h2TENFd0tUdDJZWElnWmoxdVpYY2dSWEp5YjNJb1hDSkRZVzV1YjNRZ1ptbHVaQ0J0YjJSMWJHVWdKMXdpSzI4clhDSW5YQ0lwTzNSb2NtOTNJR1l1WTI5a1pUMWNJazFQUkZWTVJWOU9UMVJmUms5VlRrUmNJaXhtZlhaaGNpQnNQVzViYjEwOWUyVjRjRzl5ZEhNNmUzMTlPM1JiYjExYk1GMHVZMkZzYkNoc0xtVjRjRzl5ZEhNc1puVnVZM1JwYjI0b1pTbDdkbUZ5SUc0OWRGdHZYVnN4WFZ0bFhUdHlaWFIxY200Z2N5aHVQMjQ2WlNsOUxHd3NiQzVsZUhCdmNuUnpMR1VzZEN4dUxISXBmWEpsZEhWeWJpQnVXMjlkTG1WNGNHOXlkSE45ZG1GeUlHazlkSGx3Wlc5bUlISmxjWFZwY21VOVBWd2lablZ1WTNScGIyNWNJaVltY21WeGRXbHlaVHRtYjNJb2RtRnlJRzg5TUR0dlBISXViR1Z1WjNSb08yOHJLeWx6S0hKYmIxMHBPM0psZEhWeWJpQnpmU2tpTENKcGJYQnZjblFnVW1WemFYcGhZbXhsUTI5c2RXMXVjeUJtY205dElDY3VMMk5zWVhOekp6dGNibWx0Y0c5eWRDQjdSRUZVUVY5QlVFbDlJR1p5YjIwZ0p5NHZZMjl1YzNSaGJuUnpKenRjYmx4dUpDNW1iaTV5WlhOcGVtRmliR1ZEYjJ4MWJXNXpJRDBnWm5WdVkzUnBiMjRvYjNCMGFXOXVjMDl5VFdWMGFHOWtMQ0F1TGk1aGNtZHpLU0I3WEc1Y2RISmxkSFZ5YmlCMGFHbHpMbVZoWTJnb1puVnVZM1JwYjI0b0tTQjdYRzVjZEZ4MGJHVjBJQ1IwWVdKc1pTQTlJQ1FvZEdocGN5azdYRzVjYmx4MFhIUnNaWFFnWVhCcElEMGdKSFJoWW14bExtUmhkR0VvUkVGVVFWOUJVRWtwTzF4dVhIUmNkR2xtSUNnaFlYQnBLU0I3WEc1Y2RGeDBYSFJoY0drZ1BTQnVaWGNnVW1WemFYcGhZbXhsUTI5c2RXMXVjeWdrZEdGaWJHVXNJRzl3ZEdsdmJuTlBjazFsZEdodlpDazdYRzVjZEZ4MFhIUWtkR0ZpYkdVdVpHRjBZU2hFUVZSQlgwRlFTU3dnWVhCcEtUdGNibHgwWEhSOVhHNWNibHgwWEhSbGJITmxJR2xtSUNoMGVYQmxiMllnYjNCMGFXOXVjMDl5VFdWMGFHOWtJRDA5UFNBbmMzUnlhVzVuSnlrZ2UxeHVYSFJjZEZ4MGNtVjBkWEp1SUdGd2FWdHZjSFJwYjI1elQzSk5aWFJvYjJSZEtDNHVMbUZ5WjNNcE8xeHVYSFJjZEgxY2JseDBmU2s3WEc1OU8xeHVYRzRrTG5KbGMybDZZV0pzWlVOdmJIVnRibk1nUFNCU1pYTnBlbUZpYkdWRGIyeDFiVzV6TzF4dUlpd2lhVzF3YjNKMElIdGNiaUFnUkVGVVFWOUJVRWtzWEc0Z0lFUkJWRUZmUTA5TVZVMU9VMTlKUkN4Y2JpQWdSRUZVUVY5RFQweFZUVTVmU1VRc1hHNGdJRVJCVkVGZlZFZ3NYRzRnSUVOTVFWTlRYMVJCUWt4RlgxSkZVMGxhU1U1SExGeHVJQ0JEVEVGVFUxOURUMHhWVFU1ZlVrVlRTVnBKVGtjc1hHNGdJRU5NUVZOVFgwaEJUa1JNUlN4Y2JpQWdRMHhCVTFOZlNFRk9SRXhGWDBOUFRsUkJTVTVGVWl4Y2JpQWdSVlpGVGxSZlVrVlRTVnBGWDFOVVFWSlVMRnh1SUNCRlZrVk9WRjlTUlZOSldrVXNYRzRnSUVWV1JVNVVYMUpGVTBsYVJWOVRWRTlRTEZ4dUlDQlRSVXhGUTFSUFVsOVVTQ3hjYmlBZ1UwVk1SVU5VVDFKZlZFUXNYRzRnSUZORlRFVkRWRTlTWDFWT1VrVlRTVnBCUWt4RlhHNTlYRzRnSUdaeWIyMGdKeTR2WTI5dWMzUmhiblJ6Snp0Y2JseHVMeW9xWEc1VVlXdGxjeUJoSUR4MFlXSnNaU0F2UGlCbGJHVnRaVzUwSUdGdVpDQnRZV3RsY3lCcGRDZHpJR052YkhWdGJuTWdjbVZ6YVhwaFlteGxJR0ZqY205emN5QmliM1JvWEc1dGIySnBiR1VnWVc1a0lHUmxjMnQwYjNBZ1kyeHBaVzUwY3k1Y2JseHVRR05zWVhOeklGSmxjMmw2WVdKc1pVTnZiSFZ0Ym5OY2JrQndZWEpoYlNBa2RHRmliR1VnZTJwUmRXVnllWDBnYWxGMVpYSjVMWGR5WVhCd1pXUWdQSFJoWW14bFBpQmxiR1Z0Wlc1MElIUnZJRzFoYTJVZ2NtVnphWHBoWW14bFhHNUFjR0Z5WVcwZ2IzQjBhVzl1Y3lCN1QySnFaV04wZlNCRGIyNW1hV2QxY21GMGFXOXVJRzlpYW1WamRGeHVLaW92WEc1bGVIQnZjblFnWkdWbVlYVnNkQ0JqYkdGemN5QlNaWE5wZW1GaWJHVkRiMngxYlc1eklIdGNiaUFnWTI5dWMzUnlkV04wYjNJb0pIUmhZbXhsTENCdmNIUnBiMjV6S1NCN1hHNGdJQ0FnZEdocGN5NXVjeUE5SUNjdWNtTW5JQ3NnZEdocGN5NWpiM1Z1ZENzck8xeHVYRzRnSUNBZ2RHaHBjeTV2Y0hScGIyNXpJRDBnSkM1bGVIUmxibVFvZTMwc0lGSmxjMmw2WVdKc1pVTnZiSFZ0Ym5NdVpHVm1ZWFZzZEhNc0lHOXdkR2x2Ym5NcE8xeHVYRzRnSUNBZ2RHaHBjeTRrZDJsdVpHOTNJRDBnSkNoM2FXNWtiM2NwTzF4dUlDQWdJSFJvYVhNdUpHOTNibVZ5Ukc5amRXMWxiblFnUFNBa0tDUjBZV0pzWlZzd1hTNXZkMjVsY2tSdlkzVnRaVzUwS1R0Y2JpQWdJQ0IwYUdsekxpUjBZV0pzWlNBOUlDUjBZV0pzWlR0Y2JseHVJQ0FnSUhSb2FYTXVjbVZtY21WemFFaGxZV1JsY25Nb0tUdGNiaUFnSUNCMGFHbHpMbkpsYzNSdmNtVkRiMngxYlc1WGFXUjBhSE1vS1R0Y2JpQWdJQ0IwYUdsekxuTjVibU5JWVc1a2JHVlhhV1IwYUhNb0tUdGNibHh1SUNBZ0lIUm9hWE11WW1sdVpFVjJaVzUwY3loMGFHbHpMaVIzYVc1a2IzY3NJQ2R5WlhOcGVtVW5MQ0IwYUdsekxuTjVibU5JWVc1a2JHVlhhV1IwYUhNdVltbHVaQ2gwYUdsektTazdYRzVjYmlBZ0lDQnBaaUFvZEdocGN5NXZjSFJwYjI1ekxuTjBZWEowS1NCN1hHNGdJQ0FnSUNCMGFHbHpMbUpwYm1SRmRtVnVkSE1vZEdocGN5NGtkR0ZpYkdVc0lFVldSVTVVWDFKRlUwbGFSVjlUVkVGU1ZDd2dkR2hwY3k1dmNIUnBiMjV6TG5OMFlYSjBLVHRjYmlBZ0lDQjlYRzRnSUNBZ2FXWWdLSFJvYVhNdWIzQjBhVzl1Y3k1eVpYTnBlbVVwSUh0Y2JpQWdJQ0FnSUhSb2FYTXVZbWx1WkVWMlpXNTBjeWgwYUdsekxpUjBZV0pzWlN3Z1JWWkZUbFJmVWtWVFNWcEZMQ0IwYUdsekxtOXdkR2x2Ym5NdWNtVnphWHBsS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdhV1lnS0hSb2FYTXViM0IwYVc5dWN5NXpkRzl3S1NCN1hHNGdJQ0FnSUNCMGFHbHpMbUpwYm1SRmRtVnVkSE1vZEdocGN5NGtkR0ZpYkdVc0lFVldSVTVVWDFKRlUwbGFSVjlUVkU5UUxDQjBhR2x6TG05d2RHbHZibk11YzNSdmNDazdYRzRnSUNBZ2ZWeHVJQ0I5WEc1Y2JseDBMeW9xWEc1Y2RGSmxabkpsYzJobGN5QjBhR1VnYUdWaFpHVnljeUJoYzNOdlkybGhkR1ZrSUhkcGRHZ2dkR2hwY3lCcGJuTjBZVzVqWlhNZ1BIUmhZbXhsTHo0Z1pXeGxiV1Z1ZENCaGJtUmNibHgwWjJWdVpYSmhkR1Z6SUdoaGJtUnNaWE1nWm05eUlIUm9aVzB1SUVGc2MyOGdZWE56YVdkdWN5QndaWEpqWlc1MFlXZGxJSGRwWkhSb2N5NWNibHh1WEhSQWJXVjBhRzlrSUhKbFpuSmxjMmhJWldGa1pYSnpYRzVjZENvcUwxeHVJQ0J5WldaeVpYTm9TR1ZoWkdWeWN5Z3BJSHRjYmlBZ0lDQXZMeUJCYkd4dmR5QjBhR1VnYzJWc1pXTjBiM0lnZEc4Z1ltVWdZbTkwYUNCaElISmxaM1ZzWVhJZ2MyVnNZM1J2Y2lCemRISnBibWNnWVhNZ2QyVnNiQ0JoYzF4dUlDQWdJQzh2SUdFZ1pIbHVZVzFwWXlCallXeHNZbUZqYTF4dUlDQWdJR3hsZENCelpXeGxZM1J2Y2lBOUlIUm9hWE11YjNCMGFXOXVjeTV6Wld4bFkzUnZjanRjYmlBZ0lDQnBaaUFvZEhsd1pXOW1JSE5sYkdWamRHOXlJRDA5UFNBblpuVnVZM1JwYjI0bktTQjdYRzRnSUNBZ0lDQnpaV3hsWTNSdmNpQTlJSE5sYkdWamRHOXlMbU5oYkd3b2RHaHBjeXdnZEdocGN5NGtkR0ZpYkdVcE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUM4dklGTmxiR1ZqZENCaGJHd2dkR0ZpYkdVZ2FHVmhaR1Z5YzF4dUlDQWdJSFJvYVhNdUpIUmhZbXhsU0dWaFpHVnljeUE5SUhSb2FYTXVKSFJoWW14bExtWnBibVFvYzJWc1pXTjBiM0lwTzF4dVhHNGdJQ0FnTHk4Z1FYTnphV2R1SUhCbGNtTmxiblJoWjJVZ2QybGtkR2h6SUdacGNuTjBMQ0IwYUdWdUlHTnlaV0YwWlNCa2NtRm5JR2hoYm1Sc1pYTmNiaUFnSUNCMGFHbHpMbUZ6YzJsbmJsQmxjbU5sYm5SaFoyVlhhV1IwYUhNb0tUdGNiaUFnSUNCMGFHbHpMbU55WldGMFpVaGhibVJzWlhNb0tUdGNiaUFnZlZ4dVhHNWNkQzhxS2x4dVhIUkRjbVZoZEdWeklHUjFiVzE1SUdoaGJtUnNaU0JsYkdWdFpXNTBjeUJtYjNJZ1lXeHNJSFJoWW14bElHaGxZV1JsY2lCamIyeDFiVzV6WEc1Y2JseDBRRzFsZEdodlpDQmpjbVZoZEdWSVlXNWtiR1Z6WEc1Y2RDb3FMMXh1SUNCamNtVmhkR1ZJWVc1a2JHVnpLQ2tnZTF4dUlDQWdJR3hsZENCeVpXWWdQU0IwYUdsekxpUm9ZVzVrYkdWRGIyNTBZV2x1WlhJN1hHNGdJQ0FnYVdZZ0tISmxaaUFoUFNCdWRXeHNLU0I3WEc0Z0lDQWdJQ0J5WldZdWNtVnRiM1psS0NrN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeUlEMGdKQ2hnUEdScGRpQmpiR0Z6Y3owbkpIdERURUZUVTE5SVFVNUVURVZmUTA5T1ZFRkpUa1ZTZlNjZ0x6NWdLVnh1SUNBZ0lIUm9hWE11SkhSaFlteGxMbUpsWm05eVpTaDBhR2x6TGlSb1lXNWtiR1ZEYjI1MFlXbHVaWElwTzF4dVhHNGdJQ0FnZEdocGN5NGtkR0ZpYkdWSVpXRmtaWEp6TG1WaFkyZ29LR2tzSUdWc0tTQTlQaUI3WEc0Z0lDQWdJQ0JzWlhRZ0pHTjFjbkpsYm5RZ1BTQjBhR2x6TGlSMFlXSnNaVWhsWVdSbGNuTXVaWEVvYVNrN1hHNGdJQ0FnSUNCc1pYUWdKRzVsZUhRZ1BTQjBhR2x6TGlSMFlXSnNaVWhsWVdSbGNuTXVaWEVvYVNBcklERXBPMXh1WEc0Z0lDQWdJQ0JwWmlBb0pHNWxlSFF1YkdWdVozUm9JRDA5UFNBd0lIeDhJQ1JqZFhKeVpXNTBMbWx6S0ZORlRFVkRWRTlTWDFWT1VrVlRTVnBCUWt4RktTQjhmQ0FrYm1WNGRDNXBjeWhUUlV4RlExUlBVbDlWVGxKRlUwbGFRVUpNUlNrcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdU8xeHVJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQnNaWFFnSkdoaGJtUnNaU0E5SUNRb1lEeGthWFlnWTJ4aGMzTTlKeVI3UTB4QlUxTmZTRUZPUkV4RmZTY2dMejVnS1Z4dUlDQWdJQ0FnSUNBdVpHRjBZU2hFUVZSQlgxUklMQ0FrS0dWc0tTbGNiaUFnSUNBZ0lDQWdMbUZ3Y0dWdVpGUnZLSFJvYVhNdUpHaGhibVJzWlVOdmJuUmhhVzVsY2lrN1hHNGdJQ0FnZlNrN1hHNWNiaUFnSUNCMGFHbHpMbUpwYm1SRmRtVnVkSE1vZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeUxDQmJKMjF2ZFhObFpHOTNiaWNzSUNkMGIzVmphSE4wWVhKMEoxMHNJQ2N1SnlBcklFTk1RVk5UWDBoQlRrUk1SU3dnZEdocGN5NXZibEJ2YVc1MFpYSkViM2R1TG1KcGJtUW9kR2hwY3lrcE8xeHVJQ0I5WEc1Y2JseDBMeW9xWEc1Y2RFRnpjMmxuYm5NZ1lTQndaWEpqWlc1MFlXZGxJSGRwWkhSb0lIUnZJR0ZzYkNCamIyeDFiVzV6SUdKaGMyVmtJRzl1SUhSb1pXbHlJR04xY25KbGJuUWdjR2w0Wld3Z2QybGtkR2dvY3lsY2JseHVYSFJBYldWMGFHOWtJR0Z6YzJsbmJsQmxjbU5sYm5SaFoyVlhhV1IwYUhOY2JseDBLaW92WEc0Z0lHRnpjMmxuYmxCbGNtTmxiblJoWjJWWGFXUjBhSE1vS1NCN1hHNGdJQ0FnZEdocGN5NGtkR0ZpYkdWSVpXRmtaWEp6TG1WaFkyZ29LRjhzSUdWc0tTQTlQaUI3WEc0Z0lDQWdJQ0JzWlhRZ0pHVnNJRDBnSkNobGJDazdYRzRnSUNBZ0lDQjBhR2x6TG5ObGRGZHBaSFJvS0NSbGJGc3dYU3dnSkdWc0xtOTFkR1Z5VjJsa2RHZ29LU0F2SUhSb2FYTXVKSFJoWW14bExuZHBaSFJvS0NrZ0tpQXhNREFwTzF4dUlDQWdJSDBwTzF4dUlDQjlYRzVjYmx4MEx5b3FYRzVjYmx4dVhIUkFiV1YwYUc5a0lITjVibU5JWVc1a2JHVlhhV1IwYUhOY2JseDBLaW92WEc0Z0lITjVibU5JWVc1a2JHVlhhV1IwYUhNb0tTQjdYRzRnSUNBZ2JHVjBJQ1JqYjI1MFlXbHVaWElnUFNCMGFHbHpMaVJvWVc1a2JHVkRiMjUwWVdsdVpYSmNibHh1SUNBZ0lDUmpiMjUwWVdsdVpYSXVkMmxrZEdnb2RHaHBjeTRrZEdGaWJHVXVkMmxrZEdnb0tTazdYRzVjYmlBZ0lDQWtZMjl1ZEdGcGJtVnlMbVpwYm1Rb0p5NG5JQ3NnUTB4QlUxTmZTRUZPUkV4RktTNWxZV05vS0NoZkxDQmxiQ2tnUFQ0Z2UxeHVJQ0FnSUNBZ2JHVjBJQ1JsYkNBOUlDUW9aV3dwTzF4dVhHNGdJQ0FnSUNCc1pYUWdhR1ZwWjJoMElEMGdkR2hwY3k1dmNIUnBiMjV6TG5KbGMybDZaVVp5YjIxQ2IyUjVJRDljYmlBZ0lDQWdJQ0FnZEdocGN5NGtkR0ZpYkdVdWFHVnBaMmgwS0NrZ09seHVJQ0FnSUNBZ0lDQjBhR2x6TGlSMFlXSnNaUzVtYVc1a0tDZDBhR1ZoWkNjcExtaGxhV2RvZENncE8xeHVYRzRnSUNBZ0lDQnNaWFFnYkdWbWRDQTlJQ1JsYkM1a1lYUmhLRVJCVkVGZlZFZ3BMbTkxZEdWeVYybGtkR2dvS1NBcklDaGNiaUFnSUNBZ0lDQWdKR1ZzTG1SaGRHRW9SRUZVUVY5VVNDa3ViMlptYzJWMEtDa3ViR1ZtZENBdElIUm9hWE11SkdoaGJtUnNaVU52Ym5SaGFXNWxjaTV2Wm1aelpYUW9LUzVzWldaMFhHNGdJQ0FnSUNBcE8xeHVYRzRnSUNBZ0lDQWtaV3d1WTNOektIc2diR1ZtZEN3Z2FHVnBaMmgwSUgwcE8xeHVJQ0FnSUgwcE8xeHVJQ0I5WEc1Y2JseDBMeW9xWEc1Y2RGQmxjbk5wYzNSeklIUm9aU0JqYjJ4MWJXNGdkMmxrZEdoeklHbHVJR3h2WTJGc1UzUnZjbUZuWlZ4dVhHNWNkRUJ0WlhSb2IyUWdjMkYyWlVOdmJIVnRibGRwWkhSb2MxeHVYSFFxS2k5Y2JpQWdjMkYyWlVOdmJIVnRibGRwWkhSb2N5Z3BJSHRjYmlBZ0lDQjBhR2x6TGlSMFlXSnNaVWhsWVdSbGNuTXVaV0ZqYUNnb1h5d2daV3dwSUQwK0lIdGNiaUFnSUNBZ0lHeGxkQ0FrWld3Z1BTQWtLR1ZzS1R0Y2JseHVJQ0FnSUNBZ2FXWWdLSFJvYVhNdWIzQjBhVzl1Y3k1emRHOXlaU0FtSmlBaEpHVnNMbWx6S0ZORlRFVkRWRTlTWDFWT1VrVlRTVnBCUWt4RktTa2dlMXh1SUNBZ0lDQWdJQ0IwYUdsekxtOXdkR2x2Ym5NdWMzUnZjbVV1YzJWMEtGeHVJQ0FnSUNBZ0lDQWdJSFJvYVhNdVoyVnVaWEpoZEdWRGIyeDFiVzVKWkNna1pXd3BMRnh1SUNBZ0lDQWdJQ0FnSUhSb2FYTXVjR0Z5YzJWWGFXUjBhQ2hsYkNsY2JpQWdJQ0FnSUNBZ0tUdGNiaUFnSUNBZ0lIMWNiaUFnSUNCOUtUdGNiaUFnZlZ4dVhHNWNkQzhxS2x4dVhIUlNaWFJ5YVdWMlpYTWdZVzVrSUhObGRITWdkR2hsSUdOdmJIVnRiaUIzYVdSMGFITWdabkp2YlNCc2IyTmhiRk4wYjNKaFoyVmNibHh1WEhSQWJXVjBhRzlrSUhKbGMzUnZjbVZEYjJ4MWJXNVhhV1IwYUhOY2JseDBLaW92WEc0Z0lISmxjM1J2Y21WRGIyeDFiVzVYYVdSMGFITW9LU0I3WEc0Z0lDQWdkR2hwY3k0a2RHRmliR1ZJWldGa1pYSnpMbVZoWTJnb0tGOHNJR1ZzS1NBOVBpQjdYRzRnSUNBZ0lDQnNaWFFnSkdWc0lEMGdKQ2hsYkNrN1hHNWNiaUFnSUNBZ0lHbG1JQ2gwYUdsekxtOXdkR2x2Ym5NdWMzUnZjbVVnSmlZZ0lTUmxiQzVwY3loVFJVeEZRMVJQVWw5VlRsSkZVMGxhUVVKTVJTa3BJSHRjYmlBZ0lDQWdJQ0FnYkdWMElIZHBaSFJvSUQwZ2RHaHBjeTV2Y0hScGIyNXpMbk4wYjNKbExtZGxkQ2hjYmlBZ0lDQWdJQ0FnSUNCMGFHbHpMbWRsYm1WeVlYUmxRMjlzZFcxdVNXUW9KR1ZzS1Z4dUlDQWdJQ0FnSUNBcE8xeHVYRzRnSUNBZ0lDQWdJR2xtSUNoM2FXUjBhQ0FoUFNCdWRXeHNLU0I3WEc0Z0lDQWdJQ0FnSUNBZ2RHaHBjeTV6WlhSWGFXUjBhQ2hsYkN3Z2QybGtkR2dwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNCOVhHNGdJQ0FnZlNrN1hHNGdJSDFjYmx4dVhIUXZLaXBjYmx4MFVHOXBiblJsY2k5dGIzVnpaU0JrYjNkdUlHaGhibVJzWlhKY2JseHVYSFJBYldWMGFHOWtJRzl1VUc5cGJuUmxja1J2ZDI1Y2JseDBRSEJoY21GdElHVjJaVzUwSUh0UFltcGxZM1I5SUVWMlpXNTBJRzlpYW1WamRDQmhjM052WTJsaGRHVmtJSGRwZEdnZ2RHaGxJR2x1ZEdWeVlXTjBhVzl1WEc1Y2RDb3FMMXh1SUNCdmJsQnZhVzUwWlhKRWIzZHVLR1YyWlc1MEtTQjdYRzRnSUNBZ0x5OGdUMjVzZVNCaGNIQnNhV1Z6SUhSdklHeGxablF0WTJ4cFkyc2daSEpoWjJkcGJtZGNiaUFnSUNCcFppQW9aWFpsYm5RdWQyaHBZMmdnSVQwOUlERXBJSHNnY21WMGRYSnVPeUI5WEc1Y2JpQWdJQ0F2THlCSlppQmhJSEJ5WlhacGIzVnpJRzl3WlhKaGRHbHZiaUJwY3lCa1pXWnBibVZrTENCM1pTQnRhWE56WldRZ2RHaGxJR3hoYzNRZ2JXOTFjMlYxY0M1Y2JpQWdJQ0F2THlCUWNtOWlZV0pzZVNCbmIySmliR1ZrSUhWd0lHSjVJSFZ6WlhJZ2JXOTFjMmx1WnlCdmRYUWdkR2hsSUhkcGJtUnZkeUIwYUdWdUlISmxiR1ZoYzJsdVp5NWNiaUFnSUNBdkx5QlhaU2RzYkNCemFXMTFiR0YwWlNCaElIQnZhVzUwWlhKMWNDQm9aWEpsSUhCeWFXOXlJSFJ2SUdsMFhHNGdJQ0FnYVdZZ0tIUm9hWE11YjNCbGNtRjBhVzl1S1NCN1hHNGdJQ0FnSUNCMGFHbHpMbTl1VUc5cGJuUmxjbFZ3S0dWMlpXNTBLVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQXZMeUJKWjI1dmNtVWdibTl1TFhKbGMybDZZV0pzWlNCamIyeDFiVzV6WEc0Z0lDQWdiR1YwSUNSamRYSnlaVzUwUjNKcGNDQTlJQ1FvWlhabGJuUXVZM1Z5Y21WdWRGUmhjbWRsZENrN1hHNGdJQ0FnYVdZZ0tDUmpkWEp5Wlc1MFIzSnBjQzVwY3loVFJVeEZRMVJQVWw5VlRsSkZVMGxhUVVKTVJTa3BJSHRjYmlBZ0lDQWdJSEpsZEhWeWJqdGNiaUFnSUNCOVhHNWNiaUFnSUNCc1pYUWdaM0pwY0VsdVpHVjRJRDBnSkdOMWNuSmxiblJIY21sd0xtbHVaR1Y0S0NrN1hHNGdJQ0FnYkdWMElDUnNaV1owUTI5c2RXMXVJRDBnZEdocGN5NGtkR0ZpYkdWSVpXRmtaWEp6TG1WeEtHZHlhWEJKYm1SbGVDa3VibTkwS0ZORlRFVkRWRTlTWDFWT1VrVlRTVnBCUWt4RktUdGNiaUFnSUNCc1pYUWdKSEpwWjJoMFEyOXNkVzF1SUQwZ2RHaHBjeTRrZEdGaWJHVklaV0ZrWlhKekxtVnhLR2R5YVhCSmJtUmxlQ0FySURFcExtNXZkQ2hUUlV4RlExUlBVbDlWVGxKRlUwbGFRVUpNUlNrN1hHNWNiaUFnSUNCc1pYUWdiR1ZtZEZkcFpIUm9JRDBnZEdocGN5NXdZWEp6WlZkcFpIUm9LQ1JzWldaMFEyOXNkVzF1V3pCZEtUdGNiaUFnSUNCc1pYUWdjbWxuYUhSWGFXUjBhQ0E5SUhSb2FYTXVjR0Z5YzJWWGFXUjBhQ2drY21sbmFIUkRiMngxYlc1Yk1GMHBPMXh1WEc0Z0lDQWdkR2hwY3k1dmNHVnlZWFJwYjI0Z1BTQjdYRzRnSUNBZ0lDQWtiR1ZtZEVOdmJIVnRiaXdnSkhKcFoyaDBRMjlzZFcxdUxDQWtZM1Z5Y21WdWRFZHlhWEFzWEc1Y2JpQWdJQ0FnSUhOMFlYSjBXRG9nZEdocGN5NW5aWFJRYjJsdWRHVnlXQ2hsZG1WdWRDa3NYRzVjYmlBZ0lDQWdJSGRwWkhSb2N6b2dlMXh1SUNBZ0lDQWdJQ0JzWldaME9pQnNaV1owVjJsa2RHZ3NYRzRnSUNBZ0lDQWdJSEpwWjJoME9pQnlhV2RvZEZkcFpIUm9YRzRnSUNBZ0lDQjlMRnh1SUNBZ0lDQWdibVYzVjJsa2RHaHpPaUI3WEc0Z0lDQWdJQ0FnSUd4bFpuUTZJR3hsWm5SWGFXUjBhQ3hjYmlBZ0lDQWdJQ0FnY21sbmFIUTZJSEpwWjJoMFYybGtkR2hjYmlBZ0lDQWdJSDFjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdkR2hwY3k1aWFXNWtSWFpsYm5SektIUm9hWE11Skc5M2JtVnlSRzlqZFcxbGJuUXNJRnNuYlc5MWMyVnRiM1psSnl3Z0ozUnZkV05vYlc5MlpTZGRMQ0IwYUdsekxtOXVVRzlwYm5SbGNrMXZkbVV1WW1sdVpDaDBhR2x6S1NrN1hHNGdJQ0FnZEdocGN5NWlhVzVrUlhabGJuUnpLSFJvYVhNdUpHOTNibVZ5Ukc5amRXMWxiblFzSUZzbmJXOTFjMlYxY0Njc0lDZDBiM1ZqYUdWdVpDZGRMQ0IwYUdsekxtOXVVRzlwYm5SbGNsVndMbUpwYm1Rb2RHaHBjeWtwTzF4dVhHNGdJQ0FnZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeVhHNGdJQ0FnSUNBdVlXUmtLSFJvYVhNdUpIUmhZbXhsS1Z4dUlDQWdJQ0FnTG1Ga1pFTnNZWE56S0VOTVFWTlRYMVJCUWt4RlgxSkZVMGxhU1U1SEtUdGNibHh1SUNBZ0lDUnNaV1owUTI5c2RXMXVYRzRnSUNBZ0lDQXVZV1JrS0NSeWFXZG9kRU52YkhWdGJpbGNiaUFnSUNBZ0lDNWhaR1FvSkdOMWNuSmxiblJIY21sd0tWeHVJQ0FnSUNBZ0xtRmtaRU5zWVhOektFTk1RVk5UWDBOUFRGVk5UbDlTUlZOSldrbE9SeWs3WEc1Y2JpQWdJQ0IwYUdsekxuUnlhV2RuWlhKRmRtVnVkQ2hGVmtWT1ZGOVNSVk5KV2tWZlUxUkJVbFFzSUZ0Y2JpQWdJQ0FnSUNSc1pXWjBRMjlzZFcxdUxDQWtjbWxuYUhSRGIyeDFiVzRzWEc0Z0lDQWdJQ0JzWldaMFYybGtkR2dzSUhKcFoyaDBWMmxrZEdoY2JpQWdJQ0JkTEZ4dUlDQWdJQ0FnWlhabGJuUXBPMXh1WEc0Z0lDQWdaWFpsYm5RdWNISmxkbVZ1ZEVSbFptRjFiSFFvS1R0Y2JpQWdmVnh1WEc1Y2RDOHFLbHh1WEhSUWIybHVkR1Z5TDIxdmRYTmxJRzF2ZG1WdFpXNTBJR2hoYm1Sc1pYSmNibHh1WEhSQWJXVjBhRzlrSUc5dVVHOXBiblJsY2sxdmRtVmNibHgwUUhCaGNtRnRJR1YyWlc1MElIdFBZbXBsWTNSOUlFVjJaVzUwSUc5aWFtVmpkQ0JoYzNOdlkybGhkR1ZrSUhkcGRHZ2dkR2hsSUdsdWRHVnlZV04wYVc5dVhHNWNkQ29xTDF4dUlDQnZibEJ2YVc1MFpYSk5iM1psS0dWMlpXNTBLU0I3WEc0Z0lDQWdiR1YwSUc5d0lEMGdkR2hwY3k1dmNHVnlZWFJwYjI0N1hHNGdJQ0FnYVdZZ0tDRjBhR2x6TG05d1pYSmhkR2x2YmlrZ2V5QnlaWFIxY200N0lIMWNibHh1SUNBZ0lDOHZJRVJsZEdWeWJXbHVaU0IwYUdVZ1pHVnNkR0VnWTJoaGJtZGxJR0psZEhkbFpXNGdjM1JoY25RZ1lXNWtJRzVsZHlCdGIzVnpaU0J3YjNOcGRHbHZiaXdnWVhNZ1lTQndaWEpqWlc1MFlXZGxJRzltSUhSb1pTQjBZV0pzWlNCM2FXUjBhRnh1SUNBZ0lHeGxkQ0JrYVdabVpYSmxibU5sSUQwZ0tIUm9hWE11WjJWMFVHOXBiblJsY2xnb1pYWmxiblFwSUMwZ2IzQXVjM1JoY25SWUtTQXZJSFJvYVhNdUpIUmhZbXhsTG5kcFpIUm9LQ2tnS2lBeE1EQTdYRzRnSUNBZ2FXWWdLR1JwWm1abGNtVnVZMlVnUFQwOUlEQXBJSHRjYmlBZ0lDQWdJSEpsZEhWeWJqdGNiaUFnSUNCOVhHNWNiaUFnSUNCc1pYUWdiR1ZtZEVOdmJIVnRiaUE5SUc5d0xpUnNaV1owUTI5c2RXMXVXekJkTzF4dUlDQWdJR3hsZENCeWFXZG9kRU52YkhWdGJpQTlJRzl3TGlSeWFXZG9kRU52YkhWdGJsc3dYVHRjYmlBZ0lDQnNaWFFnZDJsa2RHaE1aV1owTENCM2FXUjBhRkpwWjJoME8xeHVYRzRnSUNBZ2FXWWdLR1JwWm1abGNtVnVZMlVnUGlBd0tTQjdYRzRnSUNBZ0lDQjNhV1IwYUV4bFpuUWdQU0IwYUdsekxtTnZibk4wY21GcGJsZHBaSFJvS0c5d0xuZHBaSFJvY3k1c1pXWjBJQ3NnS0c5d0xuZHBaSFJvY3k1eWFXZG9kQ0F0SUc5d0xtNWxkMWRwWkhSb2N5NXlhV2RvZENrcE8xeHVJQ0FnSUNBZ2QybGtkR2hTYVdkb2RDQTlJSFJvYVhNdVkyOXVjM1J5WVdsdVYybGtkR2dvYjNBdWQybGtkR2h6TG5KcFoyaDBJQzBnWkdsbVptVnlaVzVqWlNrN1hHNGdJQ0FnZlZ4dUlDQWdJR1ZzYzJVZ2FXWWdLR1JwWm1abGNtVnVZMlVnUENBd0tTQjdYRzRnSUNBZ0lDQjNhV1IwYUV4bFpuUWdQU0IwYUdsekxtTnZibk4wY21GcGJsZHBaSFJvS0c5d0xuZHBaSFJvY3k1c1pXWjBJQ3NnWkdsbVptVnlaVzVqWlNrN1hHNGdJQ0FnSUNCM2FXUjBhRkpwWjJoMElEMGdkR2hwY3k1amIyNXpkSEpoYVc1WGFXUjBhQ2h2Y0M1M2FXUjBhSE11Y21sbmFIUWdLeUFvYjNBdWQybGtkR2h6TG14bFpuUWdMU0J2Y0M1dVpYZFhhV1IwYUhNdWJHVm1kQ2twTzF4dUlDQWdJSDFjYmx4dUlDQWdJR2xtSUNoc1pXWjBRMjlzZFcxdUtTQjdYRzRnSUNBZ0lDQjBhR2x6TG5ObGRGZHBaSFJvS0d4bFpuUkRiMngxYlc0c0lIZHBaSFJvVEdWbWRDazdYRzRnSUNBZ2ZWeHVJQ0FnSUdsbUlDaHlhV2RvZEVOdmJIVnRiaWtnZTF4dUlDQWdJQ0FnZEdocGN5NXpaWFJYYVdSMGFDaHlhV2RvZEVOdmJIVnRiaXdnZDJsa2RHaFNhV2RvZENrN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnYjNBdWJtVjNWMmxrZEdoekxteGxablFnUFNCM2FXUjBhRXhsWm5RN1hHNGdJQ0FnYjNBdWJtVjNWMmxrZEdoekxuSnBaMmgwSUQwZ2QybGtkR2hTYVdkb2REdGNibHh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpMblJ5YVdkblpYSkZkbVZ1ZENoRlZrVk9WRjlTUlZOSldrVXNJRnRjYmlBZ0lDQWdJRzl3TGlSc1pXWjBRMjlzZFcxdUxDQnZjQzRrY21sbmFIUkRiMngxYlc0c1hHNGdJQ0FnSUNCM2FXUjBhRXhsWm5Rc0lIZHBaSFJvVW1sbmFIUmNiaUFnSUNCZExGeHVJQ0FnSUNBZ1pYWmxiblFwTzF4dUlDQjlYRzVjYmx4MEx5b3FYRzVjZEZCdmFXNTBaWEl2Ylc5MWMyVWdjbVZzWldGelpTQm9ZVzVrYkdWeVhHNWNibHgwUUcxbGRHaHZaQ0J2YmxCdmFXNTBaWEpWY0Z4dVhIUkFjR0Z5WVcwZ1pYWmxiblFnZTA5aWFtVmpkSDBnUlhabGJuUWdiMkpxWldOMElHRnpjMjlqYVdGMFpXUWdkMmwwYUNCMGFHVWdhVzUwWlhKaFkzUnBiMjVjYmx4MEtpb3ZYRzRnSUc5dVVHOXBiblJsY2xWd0tHVjJaVzUwS1NCN1hHNGdJQ0FnYkdWMElHOXdJRDBnZEdocGN5NXZjR1Z5WVhScGIyNDdYRzRnSUNBZ2FXWWdLQ0YwYUdsekxtOXdaWEpoZEdsdmJpa2dleUJ5WlhSMWNtNDdJSDFjYmx4dUlDQWdJSFJvYVhNdWRXNWlhVzVrUlhabGJuUnpLSFJvYVhNdUpHOTNibVZ5Ukc5amRXMWxiblFzSUZzbmJXOTFjMlYxY0Njc0lDZDBiM1ZqYUdWdVpDY3NJQ2R0YjNWelpXMXZkbVVuTENBbmRHOTFZMmh0YjNabEoxMHBPMXh1WEc0Z0lDQWdkR2hwY3k0a2FHRnVaR3hsUTI5dWRHRnBibVZ5WEc0Z0lDQWdJQ0F1WVdSa0tIUm9hWE11SkhSaFlteGxLVnh1SUNBZ0lDQWdMbkpsYlc5MlpVTnNZWE56S0VOTVFWTlRYMVJCUWt4RlgxSkZVMGxhU1U1SEtUdGNibHh1SUNBZ0lHOXdMaVJzWldaMFEyOXNkVzF1WEc0Z0lDQWdJQ0F1WVdSa0tHOXdMaVJ5YVdkb2RFTnZiSFZ0YmlsY2JpQWdJQ0FnSUM1aFpHUW9iM0F1SkdOMWNuSmxiblJIY21sd0tWeHVJQ0FnSUNBZ0xuSmxiVzkyWlVOc1lYTnpLRU5NUVZOVFgwTlBURlZOVGw5U1JWTkpXa2xPUnlrN1hHNWNiaUFnSUNCMGFHbHpMbk41Ym1OSVlXNWtiR1ZYYVdSMGFITW9LVHRjYmlBZ0lDQjBhR2x6TG5OaGRtVkRiMngxYlc1WGFXUjBhSE1vS1R0Y2JseHVJQ0FnSUhSb2FYTXViM0JsY21GMGFXOXVJRDBnYm5Wc2JEdGNibHh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpMblJ5YVdkblpYSkZkbVZ1ZENoRlZrVk9WRjlTUlZOSldrVmZVMVJQVUN3Z1cxeHVJQ0FnSUNBZ2IzQXVKR3hsWm5SRGIyeDFiVzRzSUc5d0xpUnlhV2RvZEVOdmJIVnRiaXhjYmlBZ0lDQWdJRzl3TG01bGQxZHBaSFJvY3k1c1pXWjBMQ0J2Y0M1dVpYZFhhV1IwYUhNdWNtbG5hSFJjYmlBZ0lDQmRMRnh1SUNBZ0lDQWdaWFpsYm5RcE8xeHVJQ0I5WEc1Y2JseDBMeW9xWEc1Y2RGSmxiVzkyWlhNZ1lXeHNJR1YyWlc1MElHeHBjM1JsYm1WeWN5d2daR0YwWVN3Z1lXNWtJR0ZrWkdWa0lFUlBUU0JsYkdWdFpXNTBjeTRnVkdGclpYTmNibHgwZEdobElEeDBZV0pzWlM4K0lHVnNaVzFsYm5RZ1ltRmpheUIwYnlCb2IzY2dhWFFnZDJGekxDQmhibVFnY21WMGRYSnVjeUJwZEZ4dVhHNWNkRUJ0WlhSb2IyUWdaR1Z6ZEhKdmVWeHVYSFJBY21WMGRYSnVJSHRxVVhWbGNubDlJRTl5YVdkcGJtRnNJR3BSZFdWeWVTMTNjbUZ3Y0dWa0lEeDBZV0pzWlQ0Z1pXeGxiV1Z1ZEZ4dVhIUXFLaTljYmlBZ1pHVnpkSEp2ZVNncElIdGNiaUFnSUNCc1pYUWdKSFJoWW14bElEMGdkR2hwY3k0a2RHRmliR1U3WEc0Z0lDQWdiR1YwSUNSb1lXNWtiR1Z6SUQwZ2RHaHBjeTRrYUdGdVpHeGxRMjl1ZEdGcGJtVnlMbVpwYm1Rb0p5NG5JQ3NnUTB4QlUxTmZTRUZPUkV4RktUdGNibHh1SUNBZ0lIUm9hWE11ZFc1aWFXNWtSWFpsYm5SektGeHVJQ0FnSUNBZ2RHaHBjeTRrZDJsdVpHOTNYRzRnSUNBZ0lDQWdJQzVoWkdRb2RHaHBjeTRrYjNkdVpYSkViMk4xYldWdWRDbGNiaUFnSUNBZ0lDQWdMbUZrWkNoMGFHbHpMaVIwWVdKc1pTbGNiaUFnSUNBZ0lDQWdMbUZrWkNna2FHRnVaR3hsY3lsY2JpQWdJQ0FwTzF4dVhHNGdJQ0FnSkdoaGJtUnNaWE11Y21WdGIzWmxSR0YwWVNoRVFWUkJYMVJJS1R0Y2JpQWdJQ0FrZEdGaWJHVXVjbVZ0YjNabFJHRjBZU2hFUVZSQlgwRlFTU2s3WEc1Y2JpQWdJQ0IwYUdsekxpUm9ZVzVrYkdWRGIyNTBZV2x1WlhJdWNtVnRiM1psS0NrN1hHNGdJQ0FnZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeUlEMGdiblZzYkR0Y2JpQWdJQ0IwYUdsekxpUjBZV0pzWlVobFlXUmxjbk1nUFNCdWRXeHNPMXh1SUNBZ0lIUm9hWE11SkhSaFlteGxJRDBnYm5Wc2JEdGNibHh1SUNBZ0lISmxkSFZ5YmlBa2RHRmliR1U3WEc0Z0lIMWNibHh1WEhRdktpcGNibHgwUW1sdVpITWdaMmwyWlc0Z1pYWmxiblJ6SUdadmNpQjBhR2x6SUdsdWMzUmhibU5sSUhSdklIUm9aU0JuYVhabGJpQjBZWEpuWlhRZ1JFOU5SV3hsYldWdWRGeHVYRzVjZEVCd2NtbDJZWFJsWEc1Y2RFQnRaWFJvYjJRZ1ltbHVaRVYyWlc1MGMxeHVYSFJBY0dGeVlXMGdkR0Z5WjJWMElIdHFVWFZsY25sOUlHcFJkV1Z5ZVMxM2NtRndjR1ZrSUVSUFRVVnNaVzFsYm5RZ2RHOGdZbWx1WkNCbGRtVnVkSE1nZEc5Y2JseDBRSEJoY21GdElHVjJaVzUwY3lCN1UzUnlhVzVuZkVGeWNtRjVmU0JGZG1WdWRDQnVZVzFsSUNodmNpQmhjbkpoZVNCdlppa2dkRzhnWW1sdVpGeHVYSFJBY0dGeVlXMGdjMlZzWldOMGIzSlBja05oYkd4aVlXTnJJSHRUZEhKcGJtZDhSblZ1WTNScGIyNTlJRk5sYkdWamRHOXlJSE4wY21sdVp5QnZjaUJqWVd4c1ltRmphMXh1WEhSQWNHRnlZVzBnVzJOaGJHeGlZV05yWFNCN1JuVnVZM1JwYjI1OUlFTmhiR3hpWVdOcklHMWxkR2h2WkZ4dVhIUXFLaTljYmlBZ1ltbHVaRVYyWlc1MGN5Z2tkR0Z5WjJWMExDQmxkbVZ1ZEhNc0lITmxiR1ZqZEc5eVQzSkRZV3hzWW1GamF5d2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQnBaaUFvZEhsd1pXOW1JR1YyWlc1MGN5QTlQVDBnSjNOMGNtbHVaeWNwSUh0Y2JpQWdJQ0FnSUdWMlpXNTBjeUE5SUdWMlpXNTBjeUFySUhSb2FYTXVibk03WEc0Z0lDQWdmVnh1SUNBZ0lHVnNjMlVnZTF4dUlDQWdJQ0FnWlhabGJuUnpJRDBnWlhabGJuUnpMbXB2YVc0b2RHaHBjeTV1Y3lBcklDY2dKeWtnS3lCMGFHbHpMbTV6TzF4dUlDQWdJSDFjYmx4dUlDQWdJR2xtSUNoaGNtZDFiV1Z1ZEhNdWJHVnVaM1JvSUQ0Z015a2dlMXh1SUNBZ0lDQWdKSFJoY21kbGRDNXZiaWhsZG1WdWRITXNJSE5sYkdWamRHOXlUM0pEWVd4c1ltRmpheXdnWTJGc2JHSmhZMnNwTzF4dUlDQWdJSDFjYmlBZ0lDQmxiSE5sSUh0Y2JpQWdJQ0FnSUNSMFlYSm5aWFF1YjI0b1pYWmxiblJ6TENCelpXeGxZM1J2Y2s5eVEyRnNiR0poWTJzcE8xeHVJQ0FnSUgxY2JpQWdmVnh1WEc1Y2RDOHFLbHh1WEhSVmJtSnBibVJ6SUdWMlpXNTBjeUJ6Y0dWamFXWnBZeUIwYnlCMGFHbHpJR2x1YzNSaGJtTmxJR1p5YjIwZ2RHaGxJR2RwZG1WdUlIUmhjbWRsZENCRVQwMUZiR1Z0Wlc1MFhHNWNibHgwUUhCeWFYWmhkR1ZjYmx4MFFHMWxkR2h2WkNCMWJtSnBibVJGZG1WdWRITmNibHgwUUhCaGNtRnRJSFJoY21kbGRDQjdhbEYxWlhKNWZTQnFVWFZsY25rdGQzSmhjSEJsWkNCRVQwMUZiR1Z0Wlc1MElIUnZJSFZ1WW1sdVpDQmxkbVZ1ZEhNZ1puSnZiVnh1WEhSQWNHRnlZVzBnWlhabGJuUnpJSHRUZEhKcGJtZDhRWEp5WVhsOUlFVjJaVzUwSUc1aGJXVWdLRzl5SUdGeWNtRjVJRzltS1NCMGJ5QjFibUpwYm1SY2JseDBLaW92WEc0Z0lIVnVZbWx1WkVWMlpXNTBjeWdrZEdGeVoyVjBMQ0JsZG1WdWRITXBJSHRjYmlBZ0lDQnBaaUFvZEhsd1pXOW1JR1YyWlc1MGN5QTlQVDBnSjNOMGNtbHVaeWNwSUh0Y2JpQWdJQ0FnSUdWMlpXNTBjeUE5SUdWMlpXNTBjeUFySUhSb2FYTXVibk03WEc0Z0lDQWdmVnh1SUNBZ0lHVnNjMlVnYVdZZ0tHVjJaVzUwY3lBaFBTQnVkV3hzS1NCN1hHNGdJQ0FnSUNCbGRtVnVkSE1nUFNCbGRtVnVkSE11YW05cGJpaDBhR2x6TG01eklDc2dKeUFuS1NBcklIUm9hWE11Ym5NN1hHNGdJQ0FnZlZ4dUlDQWdJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ1pYWmxiblJ6SUQwZ2RHaHBjeTV1Y3p0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0FrZEdGeVoyVjBMbTltWmlobGRtVnVkSE1wTzF4dUlDQjlYRzVjYmx4MEx5b3FYRzVjZEZSeWFXZG5aWEp6SUdGdUlHVjJaVzUwSUc5dUlIUm9aU0E4ZEdGaWJHVXZQaUJsYkdWdFpXNTBJR1p2Y2lCaElHZHBkbVZ1SUhSNWNHVWdkMmwwYUNCbmFYWmxibHh1WEhSaGNtZDFiV1Z1ZEhNc0lHRnNjMjhnYzJWMGRHbHVaeUJoYm1RZ1lXeHNiM2RwYm1jZ1lXTmpaWE56SUhSdklIUm9aU0J2Y21sbmFXNWhiRVYyWlc1MElHbG1YRzVjZEdkcGRtVnVMaUJTWlhSMWNtNXpJSFJvWlNCeVpYTjFiSFFnYjJZZ2RHaGxJSFJ5YVdkblpYSmxaQ0JsZG1WdWRDNWNibHh1WEhSQWNISnBkbUYwWlZ4dVhIUkFiV1YwYUc5a0lIUnlhV2RuWlhKRmRtVnVkRnh1WEhSQWNHRnlZVzBnZEhsd1pTQjdVM1J5YVc1bmZTQkZkbVZ1ZENCdVlXMWxYRzVjZEVCd1lYSmhiU0JoY21keklIdEJjbkpoZVgwZ1FYSnlZWGtnYjJZZ1lYSm5kVzFsYm5SeklIUnZJSEJoYzNNZ2RHaHliM1ZuYUZ4dVhIUkFjR0Z5WVcwZ1cyOXlhV2RwYm1Gc1JYWmxiblJkSUVsbUlHZHBkbVZ1TENCcGN5QnpaWFFnYjI0Z2RHaGxJR1YyWlc1MElHOWlhbVZqZEZ4dVhIUkFjbVYwZFhKdUlIdE5hWGhsWkgwZ1VtVnpkV3gwSUc5bUlIUm9aU0JsZG1WdWRDQjBjbWxuWjJWeUlHRmpkR2x2Ymx4dVhIUXFLaTljYmlBZ2RISnBaMmRsY2tWMlpXNTBLSFI1Y0dVc0lHRnlaM01zSUc5eWFXZHBibUZzUlhabGJuUXBJSHRjYmlBZ0lDQnNaWFFnWlhabGJuUWdQU0FrTGtWMlpXNTBLSFI1Y0dVcE8xeHVJQ0FnSUdsbUlDaGxkbVZ1ZEM1dmNtbG5hVzVoYkVWMlpXNTBLU0I3WEc0Z0lDQWdJQ0JsZG1WdWRDNXZjbWxuYVc1aGJFVjJaVzUwSUQwZ0pDNWxlSFJsYm1Rb2UzMHNJRzl5YVdkcGJtRnNSWFpsYm5RcE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUhKbGRIVnliaUIwYUdsekxpUjBZV0pzWlM1MGNtbG5aMlZ5S0dWMlpXNTBMQ0JiZEdocGMxMHVZMjl1WTJGMEtHRnlaM01nZkh3Z1cxMHBLVHRjYmlBZ2ZWeHVYRzVjZEM4cUtseHVYSFJEWVd4amRXeGhkR1Z6SUdFZ2RXNXBjWFZsSUdOdmJIVnRiaUJKUkNCbWIzSWdZU0JuYVhabGJpQmpiMngxYlc0Z1JFOU5SV3hsYldWdWRGeHVYRzVjZEVCd2NtbDJZWFJsWEc1Y2RFQnRaWFJvYjJRZ1oyVnVaWEpoZEdWRGIyeDFiVzVKWkZ4dVhIUkFjR0Z5WVcwZ0pHVnNJSHRxVVhWbGNubDlJR3BSZFdWeWVTMTNjbUZ3Y0dWa0lHTnZiSFZ0YmlCbGJHVnRaVzUwWEc1Y2RFQnlaWFIxY200Z2UxTjBjbWx1WjMwZ1EyOXNkVzF1SUVsRVhHNWNkQ29xTDF4dUlDQm5aVzVsY21GMFpVTnZiSFZ0Ymtsa0tDUmxiQ2tnZTF4dUlDQWdJSEpsZEhWeWJpQjBhR2x6TGlSMFlXSnNaUzVrWVhSaEtFUkJWRUZmUTA5TVZVMU9VMTlKUkNrZ0t5QW5MU2NnS3lBa1pXd3VaR0YwWVNoRVFWUkJYME5QVEZWTlRsOUpSQ2s3WEc0Z0lIMWNibHh1WEhRdktpcGNibHgwVUdGeWMyVnpJR0VnWjJsMlpXNGdSRTlOUld4bGJXVnVkQ2R6SUhkcFpIUm9JR2x1ZEc4Z1lTQm1iRzloZEZ4dVhHNWNkRUJ3Y21sMllYUmxYRzVjZEVCdFpYUm9iMlFnY0dGeWMyVlhhV1IwYUZ4dVhIUkFjR0Z5WVcwZ1pXeGxiV1Z1ZENCN1JFOU5SV3hsYldWdWRIMGdSV3hsYldWdWRDQjBieUJuWlhRZ2QybGtkR2dnYjJaY2JseDBRSEpsZEhWeWJpQjdUblZ0WW1WeWZTQkZiR1Z0Wlc1MEozTWdkMmxrZEdnZ1lYTWdZU0JtYkc5aGRGeHVYSFFxS2k5Y2JpQWdjR0Z5YzJWWGFXUjBhQ2hsYkdWdFpXNTBLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHVnNaVzFsYm5RZ1B5QndZWEp6WlVac2IyRjBLR1ZzWlcxbGJuUXVjM1I1YkdVdWQybGtkR2d1Y21Wd2JHRmpaU2duSlNjc0lDY25LU2tnT2lBd08xeHVJQ0I5WEc1Y2JseDBMeW9xWEc1Y2RGTmxkSE1nZEdobElIQmxjbU5sYm5SaFoyVWdkMmxrZEdnZ2IyWWdZU0JuYVhabGJpQkVUMDFGYkdWdFpXNTBYRzVjYmx4MFFIQnlhWFpoZEdWY2JseDBRRzFsZEdodlpDQnpaWFJYYVdSMGFGeHVYSFJBY0dGeVlXMGdaV3hsYldWdWRDQjdSRTlOUld4bGJXVnVkSDBnUld4bGJXVnVkQ0IwYnlCelpYUWdkMmxrZEdnZ2IyNWNibHgwUUhCaGNtRnRJSGRwWkhSb0lIdE9kVzFpWlhKOUlGZHBaSFJvTENCaGN5QmhJSEJsY21ObGJuUmhaMlVzSUhSdklITmxkRnh1WEhRcUtpOWNiaUFnYzJWMFYybGtkR2dvWld4bGJXVnVkQ3dnZDJsa2RHZ3BJSHRjYmlBZ0lDQjNhV1IwYUNBOUlIZHBaSFJvTG5SdlJtbDRaV1FvTWlrN1hHNGdJQ0FnZDJsa2RHZ2dQU0IzYVdSMGFDQStJREFnUHlCM2FXUjBhQ0E2SURBN1hHNGdJQ0FnWld4bGJXVnVkQzV6ZEhsc1pTNTNhV1IwYUNBOUlIZHBaSFJvSUNzZ0p5VW5PMXh1SUNCOVhHNWNibHgwTHlvcVhHNWNkRU52Ym5OMGNtRnBibk1nWVNCbmFYWmxiaUIzYVdSMGFDQjBieUIwYUdVZ2JXbHVhVzExYlNCaGJtUWdiV0Y0YVcxMWJTQnlZVzVuWlhNZ1pHVm1hVzVsWkNCcGJseHVYSFIwYUdVZ1lHMXBibGRwWkhSb1lDQmhibVFnWUcxaGVGZHBaSFJvWUNCamIyNW1hV2QxY21GMGFXOXVJRzl3ZEdsdmJuTXNJSEpsYzNCbFkzUnBkbVZzZVM1Y2JseHVYSFJBY0hKcGRtRjBaVnh1WEhSQWJXVjBhRzlrSUdOdmJuTjBjbUZwYmxkcFpIUm9YRzVjZEVCd1lYSmhiU0IzYVdSMGFDQjdUblZ0WW1WeWZTQlhhV1IwYUNCMGJ5QmpiMjV6ZEhKaGFXNWNibHgwUUhKbGRIVnliaUI3VG5WdFltVnlmU0JEYjI1emRISmhhVzVsWkNCM2FXUjBhRnh1WEhRcUtpOWNiaUFnWTI5dWMzUnlZV2x1VjJsa2RHZ29kMmxrZEdncElIdGNiaUFnSUNCcFppQW9kR2hwY3k1dmNIUnBiMjV6TG0xcGJsZHBaSFJvSUNFOUlIVnVaR1ZtYVc1bFpDa2dlMXh1SUNBZ0lDQWdkMmxrZEdnZ1BTQk5ZWFJvTG0xaGVDaDBhR2x6TG05d2RHbHZibk11YldsdVYybGtkR2dzSUhkcFpIUm9LVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQnBaaUFvZEdocGN5NXZjSFJwYjI1ekxtMWhlRmRwWkhSb0lDRTlJSFZ1WkdWbWFXNWxaQ2tnZTF4dUlDQWdJQ0FnZDJsa2RHZ2dQU0JOWVhSb0xtMXBiaWgwYUdsekxtOXdkR2x2Ym5NdWJXRjRWMmxrZEdnc0lIZHBaSFJvS1R0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0J5WlhSMWNtNGdkMmxrZEdnN1hHNGdJSDFjYmx4dVhIUXZLaXBjYmx4MFIybDJaVzRnWVNCd1lYSjBhV04xYkdGeUlFVjJaVzUwSUc5aWFtVmpkQ3dnY21WMGNtbGxkbVZ6SUhSb1pTQmpkWEp5Wlc1MElIQnZhVzUwWlhJZ2IyWm1jMlYwSUdGc2IyNW5YRzVjZEhSb1pTQm9iM0pwZW05dWRHRnNJR1JwY21WamRHbHZiaTRnUVdOamIzVnVkSE1nWm05eUlHSnZkR2dnY21WbmRXeGhjaUJ0YjNWelpTQmpiR2xqYTNNZ1lYTWdkMlZzYkNCaGMxeHVYSFJ3YjJsdWRHVnlMV3hwYTJVZ2MzbHpkR1Z0Y3lBb2JXOWlhV3hsY3l3Z2RHRmliR1YwY3lCbGRHTXVLVnh1WEc1Y2RFQndjbWwyWVhSbFhHNWNkRUJ0WlhSb2IyUWdaMlYwVUc5cGJuUmxjbGhjYmx4MFFIQmhjbUZ0SUdWMlpXNTBJSHRQWW1wbFkzUjlJRVYyWlc1MElHOWlhbVZqZENCaGMzTnZZMmxoZEdWa0lIZHBkR2dnZEdobElHbHVkR1Z5WVdOMGFXOXVYRzVjZEVCeVpYUjFjbTRnZTA1MWJXSmxjbjBnU0c5eWFYcHZiblJoYkNCd2IybHVkR1Z5SUc5bVpuTmxkRnh1WEhRcUtpOWNiaUFnWjJWMFVHOXBiblJsY2xnb1pYWmxiblFwSUh0Y2JpQWdJQ0JwWmlBb1pYWmxiblF1ZEhsd1pTNXBibVJsZUU5bUtDZDBiM1ZqYUNjcElEMDlQU0F3S1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTRnS0dWMlpXNTBMbTl5YVdkcGJtRnNSWFpsYm5RdWRHOTFZMmhsYzFzd1hTQjhmQ0JsZG1WdWRDNXZjbWxuYVc1aGJFVjJaVzUwTG1Ob1lXNW5aV1JVYjNWamFHVnpXekJkS1M1d1lXZGxXRHRjYmlBZ0lDQjlYRzRnSUNBZ2NtVjBkWEp1SUdWMlpXNTBMbkJoWjJWWU8xeHVJQ0I5WEc1OVhHNWNibEpsYzJsNllXSnNaVU52YkhWdGJuTXVaR1ZtWVhWc2RITWdQU0I3WEc0Z0lITmxiR1ZqZEc5eU9pQm1kVzVqZEdsdmJpQW9KSFJoWW14bEtTQjdYRzRnSUNBZ2FXWWdLQ1IwWVdKc1pTNW1hVzVrS0NkMGFHVmhaQ2NwTG14bGJtZDBhQ2tnZTF4dUlDQWdJQ0FnY21WMGRYSnVJRk5GVEVWRFZFOVNYMVJJWEc0Z0lDQWdmVnh1WEc0Z0lDQWdMeThnYVdZZ0tDUjBZV0pzWlM1bWFXNWtLRk5GVEVWRFZFOVNYMVJFS1M1c1pXNW5kR2dnUGlBeEtTQjdYRzRnSUNBZ0x5OGdJQ0J5WlhSMWNtNGdVMFZNUlVOVVQxSmZWRVE3WEc0Z0lDQWdMeThnZlZ4dVhHNGdJQ0FnTHk4ZzZZQ0M2WVdONWFTYTU2ZU42S0dvNXFDODViaUQ1YkdBNTVxRTVvT0Y1WWExWEc0Z0lDQWdMeThnNXB5SjVMcWI2S0dvNXFDODU2eXM1TGlBNVlpWDVvaVc2SUNGSUhSb1pXRmtJT21Iak9tZG91V3dzZVdQcXVhY2llUzRnT1dJbHl3ZzVMMkc1cGl2NVlhRjVhNjU2WWVNNloyaTVweUo1YjZJNWFTYTVZaVhMQ0Rsc0xIa3ZKcmxoN3JuanJEbWw2RG1zNVhtaTVibGlxam5tb1RtZzRYbGhyVmNiaUFnSUNBdkx5RG92NW5waDR6bW1vTGt1STNvZ0lQb21aSGxoN3JuanJBZ2RHaGxZV1FnNXBlMjVZK0k1WWU2NTQ2dzZMK1o1TGlxNVp5NjVwbXY1NXFFNW9PRjVZYTFMQ0RsbTZEa3VMcmxuS2pwZ1lmbGlMRG5tb1RscnA3cG1ZWGt1SnJsaXFIbG5Mcm1tYS9rdUsza3VJM2t2SnJsaDdybmpyQWdkR2hsWVdRZzU1cUU1b09GNVlhMVhHNGdJQ0FnYkdWMElITmxiR1ZqZEc5eVhHNGdJQ0FnWTI5dWMzUWdkSEp6SUQwZ0pIUmhZbXhsTG1acGJtUW9KM1J5SnlsY2JpQWdJQ0JqYjI1emRDQjBja2x1WkdWNElEMGdXMTFjYmlBZ0lDQm1iM0lnS0d4bGRDQmhJRDBnTURzZ1lTQThJSFJ5Y3k1c1pXNW5kR2c3SUdFZ0t6MGdNU2tnZTF4dUlDQWdJQ0FnWTI5dWMzUWdkR1J6SUQwZ0pDaDBjbk5iWVYwcExtWnBibVFvSjNSa09uWnBjMmxpYkdVbktWeHVJQ0FnSUNBZ2RISkpibVJsZUM1d2RYTm9LSFJrY3k1c1pXNW5kR2dwWEc0Z0lDQWdmVnh1SUNBZ0lDOHZJT2FKdnVXSHVpQjBaQ0RtbklEbHBKcm5tb1FnZEhKY2JpQWdJQ0JqYjI1emRDQnRZWGdnUFNCTllYUm9MbTFoZUNndUxpNTBja2x1WkdWNEtWeHVJQ0FnSUdOdmJuTjBJRzFwSUQwZ2RISkpibVJsZUM1bWFXNWtTVzVrWlhnb0tHNHNJR2twSUQwK0lHNGdQVDA5SUcxaGVDbGNiaUFnSUNCelpXeGxZM1J2Y2lBOUlHQjBjanB1ZEdndFkyaHBiR1FvSkhzb2JXa2dmSHdnTUNrZ0t5QXhmU2tnUGlCMFpEcDJhWE5wWW14bFlGeHVYRzRnSUNBZ2NtVjBkWEp1SUhObGJHVmpkRzl5WEc0Z0lIMHNYRzRnSUhOMGIzSmxPaUIzYVc1a2IzY3VjM1J2Y21Vc1hHNGdJSE41Ym1OSVlXNWtiR1Z5Y3pvZ2RISjFaU3hjYmlBZ2NtVnphWHBsUm5KdmJVSnZaSGs2SUhSeWRXVXNYRzRnSUcxaGVGZHBaSFJvT2lCdWRXeHNMRnh1SUNCdGFXNVhhV1IwYURvZ01DNHdNVnh1ZlR0Y2JseHVVbVZ6YVhwaFlteGxRMjlzZFcxdWN5NWpiM1Z1ZENBOUlEQTdYRzRpTENKbGVIQnZjblFnWTI5dWMzUWdSRUZVUVY5QlVFa2dQU0FuY21WemFYcGhZbXhsUTI5c2RXMXVjeWM3WEc1bGVIQnZjblFnWTI5dWMzUWdSRUZVUVY5RFQweFZUVTVUWDBsRUlEMGdKM0psYzJsNllXSnNaUzFqYjJ4MWJXNXpMV2xrSnp0Y2JtVjRjRzl5ZENCamIyNXpkQ0JFUVZSQlgwTlBURlZOVGw5SlJDQTlJQ2R5WlhOcGVtRmliR1V0WTI5c2RXMXVMV2xrSnp0Y2JtVjRjRzl5ZENCamIyNXpkQ0JFUVZSQlgxUklJRDBnSjNSb0p6dGNibHh1Wlhod2IzSjBJR052Ym5OMElFTk1RVk5UWDFSQlFreEZYMUpGVTBsYVNVNUhJRDBnSjNKakxYUmhZbXhsTFhKbGMybDZhVzVuSnp0Y2JtVjRjRzl5ZENCamIyNXpkQ0JEVEVGVFUxOURUMHhWVFU1ZlVrVlRTVnBKVGtjZ1BTQW5jbU10WTI5c2RXMXVMWEpsYzJsNmFXNW5KenRjYm1WNGNHOXlkQ0JqYjI1emRDQkRURUZUVTE5SVFVNUVURVVnUFNBbmNtTXRhR0Z1Wkd4bEp6dGNibVY0Y0c5eWRDQmpiMjV6ZENCRFRFRlRVMTlJUVU1RVRFVmZRMDlPVkVGSlRrVlNJRDBnSjNKakxXaGhibVJzWlMxamIyNTBZV2x1WlhJbk8xeHVYRzVsZUhCdmNuUWdZMjl1YzNRZ1JWWkZUbFJmVWtWVFNWcEZYMU5VUVZKVUlEMGdKMk52YkhWdGJqcHlaWE5wZW1VNmMzUmhjblFuTzF4dVpYaHdiM0owSUdOdmJuTjBJRVZXUlU1VVgxSkZVMGxhUlNBOUlDZGpiMngxYlc0NmNtVnphWHBsSnp0Y2JtVjRjRzl5ZENCamIyNXpkQ0JGVmtWT1ZGOVNSVk5KV2tWZlUxUlBVQ0E5SUNkamIyeDFiVzQ2Y21WemFYcGxPbk4wYjNBbk8xeHVYRzVsZUhCdmNuUWdZMjl1YzNRZ1UwVk1SVU5VVDFKZlZFZ2dQU0FuZEhJNlptbHljM1FnUGlCMGFEcDJhWE5wWW14bEp6dGNibVY0Y0c5eWRDQmpiMjV6ZENCVFJVeEZRMVJQVWw5VVJDQTlJQ2QwY2pwbWFYSnpkQ0ErSUhSa09uWnBjMmxpYkdVbk8xeHVaWGh3YjNKMElHTnZibk4wSUZORlRFVkRWRTlTWDFWT1VrVlRTVnBCUWt4RklEMGdZRnRrWVhSaExXNXZjbVZ6YVhwbFhXQTdYRzRpTENKcGJYQnZjblFnVW1WemFYcGhZbXhsUTI5c2RXMXVjeUJtY205dElDY3VMMk5zWVhOekp6dGNibWx0Y0c5eWRDQmhaR0Z3ZEdWeUlHWnliMjBnSnk0dllXUmhjSFJsY2ljN1hHNWNibVY0Y0c5eWRDQmtaV1poZFd4MElGSmxjMmw2WVdKc1pVTnZiSFZ0Ym5NN0lsMTkifQ==
