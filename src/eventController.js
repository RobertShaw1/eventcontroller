/**
 * A lightweight zero dependency pub/sub utility
 *
 * @class EventController
 * @param {string} name - used to identify an EventController instance (helpful for debugging)
 * @returns {EventController} EventController instance
 *
 * @author Robert Shaw [github.com/RobertShaw1]
 */
function EventController(name) {
  this.name = name;
  this.registry = new Map();

  Object.freeze(this);
}

/**
 * Deregisters a listener
 *
 * @alias removeListener
 * @param {*} event - An event registered w/ an EventController instance
 * @param {function} listener - The listener registered to the event
 */
function unsubscribe(event, listener) {
  const invalidParams = !event || !listener || typeof listener !== 'function';
  if (invalidParams) return;

  this.registry.get(event).delete(listener);
}

/**
 * Registers a listener
 *
 * @alias addListener
 * @alias on
 * @param {*} event - An event that can be of any type
 * @param {function} listener - A function to be invoked when an event is fired
 * @returns {function} unsubscribe - A zero param instance method that will directly unsubscribe the registered event
 *
 */
function subscribe(event, listener) {
  if (!event) {
    throw Error(
      'An event must be provided to the subscribe method of EventController.'
    );
  }

  if (typeof listener !== 'function') {
    throw Error(
      `Attempted to register an invalid listener for event '${event}'. \nAll listeners should be of type 'function'.`
    );
  }

  this.registry.has(event)
    ? this.registry.get(event).add(listener)
    : this.registry.set(event, new Set([listener]));

  return () => this.unsubscribe(event, listener);
}

/**
 * Publishes an event, invoking all registered listeners
 *
 * @alias emit
 * @param {*} event - A registered event
 * @param {*} data - payload to be used with registered listeners of the published event
 */
function publish(event, data) {
  const ecName = this.name ? `'${this.name}'` : '';
  const notFoundError = Error(
    `'${event}' is not registered with the ${ecName} eventController`
  );

  this.registry.has(event)
    ? this.registry.get(event).forEach((listener) => listener(data))
    : console.error(notFoundError);
}

/**
 * Registers a one-time listener
 *
 * @param {*} event - An event that can be of any type
 * @param {function} listener - A function to be invoked when an event is fired
 *
 */
function once(event, listener) {
  if (!event) {
    throw Error(
      'An event must be provided to the once method of EventController.'
    );
  }

  if (typeof listener !== 'function') {
    throw Error(
      `Attempted to register an invalid listener for event '${event}'. \nAll listeners should be of type 'function'.`
    );
  }

  const ec = this;

  const decoratedListener = function (payload) {
    listener(payload);
    ec.unsubscribe(event, decoratedListener);
  };

  this.registry.has(event)
    ? this.registry.get(event).add(decoratedListener)
    : this.registry.set(event, new Set([decoratedListener]));
}

EventController.prototype = Object.create(null);
EventController.prototype.unsubscribe = unsubscribe;
EventController.prototype.removeListener = unsubscribe;
EventController.prototype.subscribe = subscribe;
EventController.prototype.addListener = subscribe;
EventController.prototype.on = subscribe;
EventController.prototype.once = once;
EventController.prototype.publish = publish;
EventController.prototype.emit = publish;

Object.freeze(EventController);

export default EventController;
