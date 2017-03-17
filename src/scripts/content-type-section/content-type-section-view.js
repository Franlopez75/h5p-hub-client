import { setAttribute, getAttribute, hasAttribute, removeAttribute, querySelectorAll } from "utils/elements";
import { forEach } from "utils/functional";
import { relayClickEventAs } from '../utils/events';
import initNavbar from 'components/navbar';
import { Eventful } from '../mixins/eventful';

/**
 * @param {HTMLElement[]} elements
 * @function
 */
const unselectAll = forEach(removeAttribute('aria-selected'));

/**
 * @class ContentBrowserView
 * @mixes Eventful
 */
export default class ContentBrowserView {
  /**
   * @constructor
   * @param {object} state
   */
  constructor(state) {
    // add event system
    Object.assign(this, Eventful());

    // create elements
    this.rootElement = this.createElement(state);

    // pick elements
    this.menubar = this.rootElement.querySelector('.navbar-nav');
    this.inputField = this.rootElement.querySelector('[role="search"] input');
    this.displaySelected = this.rootElement.querySelector('.navbar-toggler-selected');
    const inputButton = this.rootElement.querySelector('[role="search"] .input-group-addon');

    // input field
    this.inputField.addEventListener('keyup', event => {
      this.fire('search', {
        element: event.target,
        query: event.target.value,
        keyCode: event.which || event.keyCode
      });
    });

    // input button
    inputButton.addEventListener('click', event => {
       let searchbar = event.target.parentElement.querySelector('#hub-search-bar');

       this.fire('search', {
         element: searchbar,
         query: searchbar.value,
         keyCode: 13 // Act like an 'enter' key press
       });

       searchbar.focus();
    })
  }

  /**
   * Creates the menu group element
   *
   * @param {object} state
   *
   * @return {HTMLElement}
   */
  createElement(state) {
    let menutitle = 'Browse content types';
    let menuId = 'content-type-filter';
    let searchText = 'Search for Content Types';

    // create element
    const element = document.createElement('div');
    element.innerHTML = `
      <div class="menu-group">
        <nav  role="menubar" class="navbar">
          <div class="navbar-header">
             <span class="navbar-toggler navbar-toggler-right" aria-controls="${menuId}" aria-expanded="false">
               <span class="navbar-toggler-selected"></span>
               <span class="icon-accordion-arrow"></span>
             </span>
            <span class="navbar-brand">${menutitle}</span>
          </div>

          <ul id="${menuId}" class="navbar-nav"></ul>
        </nav>
        
        <div class="input-group" role="search">
          <input id="hub-search-bar" class="form-control form-control-rounded" type="text" placeholder="${searchText}" />
          <div class="input-group-addon icon-search"></div>
        </div>
      </div>`;

    return element;
  }

  /**
   * Adds a menu item
   *
   * @param {string} title
   * @param {string} id
   * @param {boolean} id
   *
   * @return {HTMLElement}
   */
  addMenuItem({ title, id, selected }) {
    const element = document.createElement('li');
    element.setAttribute('role', 'menuitem');
    element.setAttribute('data-id', id);
    element.innerText = title;

    // sets if this menuitem should be selected
    if(selected) {
      element.setAttribute('aria-selected', 'true');
      this.displaySelected.innerText = title;
    }

    relayClickEventAs('menu-selected', this, element);

    // add to menu bar
    this.menubar.appendChild(element);
    return element;
  }

  /**
   * Clears the input field
   */
  clearInputField() {
    this.inputField.value = '';
  }

  /**
   * Sets the name of the currently selected filter
   *
   * @param {string} selectedName
   */
  setDisplaySelected(selectedName) {
    this.displaySelected.innerText = selectedName;
  }

  /**
   * Selects a menu item by id
   *
   * @param {string} id
   */
  selectMenuItemById(id) {
    const menuItems = this.menubar.querySelectorAll('[role="menuitem"]');
    const selectedMenuItem = this.menubar.querySelector(`[role="menuitem"][data-id="${id}"]`);

    if(selectedMenuItem) {
      unselectAll(menuItems);
      selectedMenuItem.setAttribute('aria-selected', 'true');

      this.fire('menu-selected', {
        element: selectedMenuItem,
        id: selectedMenuItem.getAttribute('data-id')
      });
    }
  }

  initMenu() {
    // create the underline
    const underline = document.createElement('span');
    underline.className = 'menuitem-underline';
    this.menubar.appendChild(underline);

    // call init menu from sdk
    initNavbar(this.rootElement);
  }

  /**
   * Returns the root element of the content browser
   *
   * @return {HTMLElement}
   */
  getElement() {
    return this.rootElement;
  }
}
