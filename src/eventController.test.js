import EventController from './eventController';

let ec1;
let ec2;
let event;
let listenerA;
let listenerB;

afterEach(() => {
  ec1 = undefined;
  ec2 = undefined;
  event = undefined;
  listenerA = undefined;
  listenerB = undefined;
});

describe('EventController', () => {
  it('is read-only', () => {
    const changeClass = () => {
      EventController = {};
    };

    const changeProto = () => {
      EventController.prototype = {};
    };

    expect(changeClass).toThrow();
    expect(changeProto).toThrow();
  });

  it('creates an instance', () => {
    ec1 = new EventController('ec1');
    ec2 = new EventController('ec2');

    expect(ec1).not.toBe(ec2);
    expect(ec1.name).not.toBe(ec2.name);
    expect(ec1.subscribe).toBe(ec2.subscribe);
  });
});

describe('EventController instance', () => {
  it('is read-only', () => {
    const addProp = () => (ec1.newProp = 'someValue');
    const changeProp = () => (ec1.registry = {});
    const changeProto = () => (ec1.prototype = {});

    expect(addProp).toThrow();
    expect(changeProp).toThrow();
    expect(changeProto).toThrow();
  });

  describe('subscribe', () => {
    beforeEach(() => {
      ec1 = new EventController('ec1');
      event = 'test1';
      listenerA = () => {
        console.log('take me out to the ball game');
      };
    });

    it('registers a listener w/ an event', () => {
      ec1.subscribe(event, listenerA);
      expect(ec1.registry.has(event)).toBe(true);
      expect(ec1.registry.get(event).has(listenerA)).toBe(true);
    });

    it('registers multiple listeners w/ an event', () => {
      listenerA = () => {
        console.log('take me out to the ball game');
      };

      listenerB = () => {
        console.log('take me out with the crowd');
      };

      ec1.subscribe(event, listenerA);
      ec1.subscribe(event, listenerB);

      expect(ec1.registry.get(event).has(listenerA)).toBe(true);
      expect(ec1.registry.get(event).has(listenerB)).toBe(true);
    });

    it('returns a function that unsubscribes the registered listener', () => {
      const unsubscribe = ec1.subscribe(event, listenerA);

      unsubscribe();
      expect(ec1.registry.get(event).has(listenerA)).toBe(false);
    });

    it('throws if invoked w/o parameters', () => {
      const invokeWithNothing = () => ec1.subscribe();
      expect(invokeWithNothing).toThrow();
    });

    it(`throws if second parameter is not of type 'function'`, () => {
      const invokeWithArray = () => ec1.subscribe(event, []);
      const invokeWithBoolean = () => ec1.subscribe(event, true);
      const invokeWithNumber = () => ec1.subscribe(event, 10);
      const invokeWithObject = () => ec1.subscribe(event, {});
      const invokeWithString = () => ec1.subscribe(event, 'hello');
      const invokeWithNothing = () => ec1.subscribe(event);

      expect(invokeWithArray).toThrow();
      expect(invokeWithBoolean).toThrow();
      expect(invokeWithNumber).toThrow();
      expect(invokeWithObject).toThrow();
      expect(invokeWithString).toThrow();
      expect(invokeWithNothing).toThrow();
    });
  });

  describe('unsubscribe', () => {
    beforeEach(() => {
      ec1 = new EventController('ec1');
      event = 'test2';
      listenerA = () => {
        console.log('take me out with the crowd');
      };
    });

    it('unsubscribes a listener', () => {
      ec1.subscribe(event, listenerA);
      expect(ec1.registry.has(event)).toBe(true);
      expect(ec1.registry.get(event).has(listenerA)).toBe(true);

      ec1.unsubscribe(event, listenerA);
      expect(ec1.registry.has(event)).toBe(true);
      expect(ec1.registry.get(event).has(listenerA)).toBe(false);
    });

    it('has no effect when invoked with invalid params', () => {
      ec1.subscribe(event, listenerA);
      expect(ec1.registry.has(event)).toBe(true);
      expect(ec1.registry.get(event).has(listenerA)).toBe(true);

      const invokedWithNoListener = () => ec1.unsubscribe(event);
      expect(invokedWithNoListener).not.toThrow();

      const invokedWithNoEvent = () => ec1.unsubscribe(null, listenerA);
      expect(invokedWithNoEvent).not.toThrow();

      const invokedWithNothing = () => ec1.unsubscribe();
      expect(invokedWithNothing).not.toThrow();
    });
  });

  describe('publish', () => {
    beforeEach(() => {
      ec1 = new EventController('ec1');
      event = 'test1';
      listenerA = jest.fn();
      listenerB = jest.fn();
      ec1.subscribe(event, listenerA);
      ec1.subscribe(event, listenerB);
    });

    it('publishes an event which invokes all registered listeners', () => {
      ec1.publish(event);
      expect(listenerA).toHaveBeenCalled();
      expect(listenerB).toHaveBeenCalled();
    });

    it('publishes an event with a payload that is consumed by all registered listeners', () => {
      const payload = { a: 1, b: 2 };
      ec1.publish(event, payload);
      expect(listenerA).toHaveBeenCalledWith(payload);
      expect(listenerB).toHaveBeenCalledWith(payload);
    });

    it('logs an error when publishing an invalid event', () => {
      const logFunc = jest.spyOn(console, 'error');
      ec1.publish('invalidEvent');
      expect(logFunc).toHaveBeenCalled();
    });
  });

  describe('once', () => {
    beforeEach(() => {
      ec1 = new EventController('ec1');
      event = 'test1';
      listenerA = jest.fn();
    });

    it('registers a listener w/ an event', () => {
      ec1.once(event, listenerA);
      expect(ec1.registry.has(event)).toBe(true);

      ec1.publish(event);
      expect(listenerA).toHaveBeenCalled();
    });

    it('deregisters a listener after it is invoked once', () => {
      ec1.once(event, listenerA);
      expect(ec1.registry.has(event)).toBe(true);

      ec1.publish(event);
      expect(listenerA).toHaveBeenCalledTimes(1);

      // We publish the event again to test that listenerA will not be invoked again
      ec1.publish(event);
      expect(listenerA).toHaveBeenCalledTimes(1);
    });

    it('throws if invoked w/o parameters', () => {
      const invokeWithNothing = () => ec1.once();
      expect(invokeWithNothing).toThrow();
    });

    it(`throws if second parameter is not of type 'function'`, () => {
      const invokeWithArray = () => ec1.once(event, []);
      const invokeWithBoolean = () => ec1.once(event, true);
      const invokeWithNumber = () => ec1.once(event, 10);
      const invokeWithObject = () => ec1.once(event, {});
      const invokeWithString = () => ec1.once(event, 'hello');
      const invokeWithNothing = () => ec1.once(event);

      expect(invokeWithArray).toThrow();
      expect(invokeWithBoolean).toThrow();
      expect(invokeWithNumber).toThrow();
      expect(invokeWithObject).toThrow();
      expect(invokeWithString).toThrow();
      expect(invokeWithNothing).toThrow();
    });
  });
});
