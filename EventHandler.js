var EventHandler = function(){

	var _events = {};

	return {
		/**
		 * This executes all the handlers subscribed to this event in FIFO order.
		 * @param  {String} event_name  the name of the event.
		 */
		broadcast: function(event_name){
			if(event_name in _events) {
				_handlers = _events[event_name];
				for(var i in _handlers){
					var _handler = _handlers[i];
					_handler();
				}
			}
		},
		/**
		 * This adds a listening handler to the array of callbacks that will be triggered by the broudcast of event_name.
		 * @param {String} event_name The name of the event to add the handler for.
		 * @param {function} handler    The function to be called when the event is broudcasted.
		 */
		addEventHandler: function(event_name, handler) {
			// capture reference
			if(!(event_name in _events))
				_events[event_name] = [];
			_events[event_name].push(handler);
			window.addEventListener(event_name, handler, false);
		},
		/**
		 * This removes all the listeners of event_name.
		 * @param  {String} event_name the name of the event.
		 */
		removeEventHandlers:function(event_name) {
			if(event_name in _events) {
				var handlers = _events[event_name];
				for(var i in handlers) {
					window.removeEventListener(event_name, handlers[i], false);
				}
			}
			delete _events[event_name];
		},
	};
}();