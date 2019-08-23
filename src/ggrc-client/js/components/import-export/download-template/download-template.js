/*
  Copyright (C) 2019 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import canStache from 'can-stache';
import canMap from 'can-map';
import canComponent from 'can-component';
import loSome from 'lodash/some';
import '../../dropdown/multiselect-dropdown';
import '../../autocomplete/autocomplete-component';
import template from './download-template.stache';
import {downloadTemplate, download} from '../../../plugins/utils/import-export-utils';
import {backendGdriveClient} from '../../../plugins/ggrc-gapi-client';
import {confirm} from '../../../plugins/utils/modals';

const CSV_FILE_NAME = 'import_template.csv';
const CSV_FORMAT = 'csv';
const SHEET_FORMAT = 'gdrive';
const importOptions = GGRC.Bootstrap.importable.map((el) => {
  return {
    name: el.model_singular,
    value: el.title_plural,
  };
});
const viewModel = canMap.extend({
  define: {
    showExtraFields: {
      get() {
        const selected = this.attr('selected');
        return loSome(selected, (item) => item.name === 'Assessment');
      },
    },
  },
  modalTitle: 'Download Template',
  modalState: {
    open: false,
    result: {},
  },
  isLoading: false,
  templates: [],
  selected: [],
  importableModels: importOptions,
  close() {
    if (this.attr('isLoading')) {
      return;
    }
    this.attr('modalState.open', false);
    this.attr('selected').replace([]);
    this.attr('importableModels').forEach((element) => {
      element.attr('checked', false);
    });
    this.attr('templates', []);
  },
  showDialog() {
    this.attr('modalState.open', true);
  },
  selectItems(event) {
    let selected = event.selected;

    if (!selected || !selected.length) {
      this.attr('selected', []);
    } else {
      this.attr('selected', selected);
    }
  },
  prepareSelected() {
    let selected = this.attr('selected');
    let objects = [];

    objects = Array.from(selected).map(({name}) => {
      const preparedObject = {
        object_name: name,
      };

      if (name === 'Assessment') {
        this.prepareTemplateIds(preparedObject);
      }

      return preparedObject;
    });

    return objects;
  },
  prepareTemplateIds(preparedObject) {
    preparedObject.template_ids = this.attr('templates')
      .map(({id}) => id)
      .filter((id) => !!id);
  },
  addTemplate() {
    this.attr('templates').push({
      id: null,
      value: null,
      isDuplicate: false,
    });
  },
  removeTemplate(index) {
    this.attr('templates').splice(index, 1);
    this.calculateDuplicates();
  },
  selectTemplate(selectedItem, index) {
    const {id, title} = selectedItem;

    this.attr('templates')[index].attr({
      id: id,
      value: title,
    });

    this.calculateDuplicates();

    // setting 'value' of autocomplete to display
    // selected item right inside autocomplete
    selectedItem.value = selectedItem.title;
  },
  calculateDuplicates() {
    const uniqIds = new Set();

    this.attr('templates').forEach((template, ind) => {
      if (template.id) {
        if (!uniqIds.has(template.id)) {
          uniqIds.add(template.id);
          this.attr(`templates.${ind}.isDuplicate`, false);
        } else {
          this.attr(`templates.${ind}.isDuplicate`, true);
        }
      }
    });
  },
  downloadCSV() {
    let objects = this.prepareSelected();

    this.attr('isLoading', true);

    return downloadTemplate({
      data: {
        objects,
        export_to: CSV_FORMAT,
      },
    }).then(function (data) {
      download(CSV_FILE_NAME, data);
    }).always(() => {
      this.attr('isLoading', false);
      this.close();
    });
  },
  downloadSheet() {
    let objects = this.prepareSelected();

    this.attr('isLoading', true);

    return backendGdriveClient.withAuth(() => {
      return downloadTemplate({
        data: {
          objects,
          export_to: SHEET_FORMAT,
        },
      });
    }).then((data) => {
      let link = `https://docs.google.com/spreadsheets/d/${data.id}`;

      confirm({
        modal_title: 'File Generated',
        modal_description: `GDrive file is generated successfully.
         Click button below to view the file.`,
        gDriveLink: link,
        button_view: `${GGRC.templates_path}/modals/open_sheet.stache`,
      });
    }).always(() => {
      this.attr('isLoading', false);
      this.close();
    });
  },
});

export default canComponent.extend({
  tag: 'download-template',
  view: canStache(template),
  leakScope: true,
  viewModel,
});
