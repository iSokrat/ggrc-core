/*!
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

describe('GGRC.Components.confirmEditAction', function () {
  var viewModel;

  beforeEach(function () {
    viewModel = GGRC.Components.getViewModel('confirmEditAction');
  });

  describe('openEditMode() method', function () {
    describe('when onStateChangeDfd was resolved', function () {
      it('dispatches "setEditMode" event if isInEditableState method ' +
      'returns false', function () {
        spyOn(viewModel, 'dispatch');
        spyOn(viewModel, 'isInEditableState').and.returnValue(true);
        viewModel.openEditMode();
        viewModel.attr('onStateChangeDfd')
          .then(function () {
            expect(viewModel.dispatch)
              .toHaveBeenCalledWith('setEditMode');
          });
      });
    });
  });

  describe('isInEditableState() method', function () {
    it('returns true if instance.status is "In Progress"', function () {
      var result;
      viewModel.attr('instance.status', 'In Progress');
      result = viewModel.isInEditableState();
      expect(result).toBe(true);
    });

    it('returns true if instance.status is "Not Started"', function () {
      var result;
      viewModel.attr('instance.status', 'Not Started');
      result = viewModel.isInEditableState();
      expect(result).toBe(true);
    });

    it('returns false if instance.status does not have needed type',
    function () {
      var result;
      viewModel.attr('instance.status', 'Unknown type');
      result = viewModel.isInEditableState();
      expect(result).toBe(false);
    });
  });

  describe('showConfirm() method', function () {
    it('shows confirm window', function () {
      var confirm = spyOn(GGRC.Controllers.Modals, 'confirm');
      viewModel.showConfirm();
      expect(confirm).toHaveBeenCalled();
    });
  });

  describe('confirmEdit() method', function () {
    describe('when isInEditableState method returns false', function () {
      beforeEach(function () {
        spyOn(viewModel, 'isInEditableState').and.returnValue(false);
      });

      it('calls showConfirm method',
      function () {
        spyOn(viewModel, 'showConfirm');
        viewModel.confirmEdit();
        expect(viewModel.showConfirm).toHaveBeenCalled();
      });

      it('does not trigger setEditMode event with isLastOpenInline = true',
      function () {
        var event = {
          type: 'setEditMode',
          isLastOpenInline: true
        };
        spyOn(viewModel, 'dispatch');
        viewModel.confirmEdit();
        expect(viewModel.dispatch).not.toHaveBeenCalledWith(event);
      });
    });

    describe('when isInEditableState method returns true', function () {
      beforeEach(function () {
        spyOn(viewModel, 'isInEditableState').and.returnValue(true);
      });

      it('triggers setEditMode event with isLastOpenInline = true', function () {
        var event = {
          type: 'setEditMode',
          isLastOpenInline: true
        };
        spyOn(viewModel, 'dispatch');
        viewModel.confirmEdit();
        expect(viewModel.dispatch).toHaveBeenCalledWith(event);
      });
    });
  });
});
