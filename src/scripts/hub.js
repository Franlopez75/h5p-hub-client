import React from 'react';
import ReactDOM from 'react-dom';
import Hub from './Components/Hub';
import Dictionary from './utils/dictionary';
import { Eventful } from './mixins/eventful';

/**
 * @class
 * @mixes Eventful
 */
export default class HubClient {
  /**
   * @param {Object} state
   * @param {Object} dictionary
   */
  constructor(state, dictionary) {
    // add event system
    Object.assign(this, Eventful());

    const self = this;
    const container = document.createElement('div');

    // Setting up Dictionary
    Dictionary.init(dictionary);

    /**
     * @private
     */
    const render = function () {
      // Render react into root element
      ReactDOM.render(
        <Hub
          title={state.title}
          contentId={parseInt(state.contentId)}
          contentTypes={state.contentTypes}
          selected={state.selected}
          getAjaxUrl={state.getAjaxUrl}
          onResize={self.trigger.bind(self, 'resize')}
          onUse={self.trigger.bind(self, 'select')}
          onUpload={self.trigger.bind(self, 'upload')}
        />,
        container
      );
    };

    /**
     * @return {HTMLElement} Container with the Hub
     */
    this.setPanelTitle = function (title) {
      state.title = title;
      render(); // Re-render
    };

    /**
     * @return {HTMLElement} Container with the Hub
     */
    this.getElement = function () {
      return container;
    };

    // Trigger initial rendering
    render();
  }
}
