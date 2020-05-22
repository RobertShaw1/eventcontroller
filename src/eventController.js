function EventController(name) {
  this.name = name;
  this.registry = new Map();

  Object.freeze(this);
}

EventController.prototype = Object.create(null);

EventController.prototype.unsubscribe = function (event, listener) {
  const invalidParams = !event || !listener || typeof listener !== 'function';
  if (invalidParams) return;

  this.registry.get(event).delete(listener);
};

EventController.prototype.subscribe = function (event, listener) {
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
};

EventController.prototype.once = function (event, listener) {
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
};

EventController.prototype.publish = function (event, data) {
  const ecName = this.name ? `'${this.name}'` : '';
  const notFoundError = Error(
    `'${event}' is not registered with the ${ecName} eventController`
  );

  this.registry.has(event)
    ? this.registry.get(event).forEach((listener) => listener(data))
    : console.error(notFoundError);
};

EventController.prototype.addListener = EventController.subscribe;
EventController.prototype.on = EventController.subscribe;
EventController.prototype.removeListener = EventController.unsubscribe;
EventController.prototype.emit = EventController.publish;

Object.freeze(EventController);

export default EventController;
