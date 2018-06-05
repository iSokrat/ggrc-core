/*!
 Copyright (C) 2017 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

describe('GGRC.Components.mapButtonUsingAssessmentType', function () {
  var viewModel;

  beforeEach(function () {
    viewModel = GGRC.Components.getViewModel('mapButtonUsingAssessmentType');
  });

  describe('openMapper() method', function () {
    describe('when object mapper is shown', function () {
      var openMapper;

      beforeEach(function () {
        openMapper = spyOn(GGRC.Controllers.ObjectMapper, 'openMapper');
      });

      it('opens object mapper', function () {
        viewModel.openMapper();
        expect(openMapper).toHaveBeenCalled();
      });

      it('sets settings for open mapper', function () {
        viewModel.attr({
          instance: {
            id: 1,
            type: 'type',
            assessment_type: 'asmt type'
          },
          deferred_to: can.Deferred()
        });
        viewModel.openMapper();
        expect(openMapper).toHaveBeenCalledWith({
          join_object_type: viewModel.attr('instance.type'),
          join_object_id: viewModel.attr('instance.id'),
          type: viewModel.attr('instance.assessment_type'),
          deferred_to: viewModel.attr('deferredTo')
        });
      });
    });
  });

  describe('onClick() method', function () {
    it('sets for passed element a type field from instance.assessment_type',
    function () {
      var type = 'type';
      var element = $('<i></i>');

      viewModel.attr('instance.assessment_type', type);
      viewModel.onClick(element);

      expect(element.data('type')).toBe(type);
    });

    it('sets for passed element a deffered_to field from ' +
    'deferredTo field', function () {
      var deferredTo = can.Deferred();
      var element = $('<i></i>');

      viewModel.attr('deferredTo', deferredTo);
      viewModel.onClick(element);

      expect(element.data('deferred_to')).toBe(deferredTo);
    });

    it('triggers for passed element "openMapper" with passed event',
    function () {
      var event = {};
      var element = $('<i></i>');

      spyOn(can, 'trigger');
      viewModel.onClick(element, event);
      expect(can.trigger).toHaveBeenCalledWith(element, 'openMapper', event);
    });
  });

  describe('events', function () {
    var fakeComponent;
    var componentProto;

    beforeEach(function () {
      componentProto = GGRC
        .Components
        .get('mapButtonUsingAssessmentType')
        .prototype;
      fakeComponent = {
        viewModel: viewModel
      };
    });

    describe('inserted() event', function () {
      var event;

      beforeEach(function () {
        var eventName = 'inserted';
        event = componentProto.events[eventName].bind(fakeComponent);
      });

      it('sets for viewModel.deferredTo a deferred_to value from data ' +
      'element attribute', function () {
        var data = can.Deferred();
        fakeComponent.element = $('<i></i>');
        fakeComponent.element.data('deferred_to', data);
        event();
        expect(viewModel.attr('deferredTo')).toBe(data);
      });
    });

    describe('".assessment-map-btn click"() method', function () {
      var event;
      var eventObj;

      beforeEach(function () {
        var eventName = '.assessment-map-btn click';
        event = componentProto.events[eventName].bind(fakeComponent);
        eventObj = jasmine.createSpyObj('eventObj', ['preventDefault']);
        spyOn(viewModel, 'onClick');
      });

      it('calls viewModel.onClick with passed element and event', function () {
        var element = {};
        event(element, eventObj);
        expect(viewModel.onClick).toHaveBeenCalledWith(element, eventObj);
      });

      it('calls event.prefentDefaut', function () {
        event({}, eventObj);
        expect(eventObj.preventDefault).toHaveBeenCalled();
      });

      it('returns false', function () {
        var result = event({}, eventObj);
        expect(result).toBe(false);
      });
    });
  });
});
