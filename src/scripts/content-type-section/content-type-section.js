import ContentTypeSectionView from "./content-type-section-view";
import SearchService from "../search-service/search-service";
import ContentTypeList from '../content-type-list/content-type-list';
import ContentTypeDetail from '../content-type-detail/content-type-detail';
import {Eventful} from '../mixins/eventful';
import {renderErrorMessage} from '../utils/errors';

/**
 * @class ContentTypeSection
 * @mixes Eventful
 *
 * @fires Hub#select
 */
export default class ContentTypeSection {
  /**
   * @param {HubState} state
   */
  constructor(state, services) {
    // add event system
    Object.assign(this, Eventful());

    this.typeAheadEnabled = true;

    // add view
    this.view = new ContentTypeSectionView(state);

    // controller
    this.searchService = new SearchService(services);
    this.contentTypeList = new ContentTypeList();
    this.contentTypeDetail = new ContentTypeDetail(services);

    // add menu items
    ['All', 'My Content Types', 'Most Popular']
      .forEach(menuText => this.view.addMenuItem(menuText));
    this.view.initMenu();

    // Element for holding list and details views
    const section = document.createElement('div');
    section.classList.add('content-type-section');

    this.rootElement = section;
    this.rootElement.appendChild(this.contentTypeList.getElement());
    this.rootElement.appendChild(this.contentTypeDetail.getElement());

    this.view.getElement().appendChild(this.rootElement);

    // propagate events
    this.propagate(['select', 'update-content-type-list'], this.contentTypeList);
    this.propagate(['select'], this.contentTypeDetail);
    this.propagate(['reload'], this.view);

    // register listeners
    this.view.on('search', this.search, this);
    this.view.on('search', this.resetMenuSelection, this);
    this.view.on('search', this.resetMenuOnEnter, this);
    this.view.on('menu-selected', this.applySearchFilter, this);
    this.view.on('menu-selected', this.clearInputField, this);

    this.contentTypeList.on('row-selected', this.showDetailView, this);
    this.contentTypeDetail.on('close', this.closeDetailView, this);
    this.contentTypeDetail.on('select', this.closeDetailView, this);

    this.initContentTypeList();
  }

  /**
   * Initiates the content type list with a search
   */
  initContentTypeList() {
    // initialize by search
    this.searchService.search("")
      .then(contentTypes => this.contentTypeList.update(contentTypes))
      .catch(error => this.handleError(error));
  }

  /**
   * Handle errors communicating with HUB
   */
  handleError(error) {
    // TODO - use translation system:
    this.view.displayMessage({
      type: 'error',
      title: 'Not able to communicate with hub.',
      content: 'Error occured. Please try again.'
    });
  }

  /**
   * Executes a search and updates the content type list
   *
   * @param {string} query
   */
  search({query, keyCode}) {
    if (this.typeAheadEnabled || keyCode === 13) { // Search automatically or on 'enter'
      this.searchService.search(query)
        .then(contentTypes => this.contentTypeList.update(contentTypes));
    }
  }

  /**
   *  Ensures the first menu element is selected
   */
  resetMenuSelection() {
    this.view.resetMenuSelection();
  }

  resetMenuOnEnter({keyCode}) {
    if (keyCode === 13) {
      this.closeDetailView();
    }
  }

  /**
   * Should apply a search filter
   */
  applySearchFilter() {
    console.debug('ContentTypeSection: menu was clicked!', event);
  }

  clearInputField({element}) {
    if (!this.view.isFirstMenuItem(element)) {
      this.view.clearInputField(element);
    }
  }

  /**
   * Shows detail view
   *
   * @param {string} id
   */
  showDetailView({id}) {
    this.contentTypeList.hide();
    this.contentTypeDetail.loadById(id);
    this.contentTypeDetail.show();
    this.typeAheadEnabled = false;
  }


  /**
   * Close detail view
   */
  closeDetailView() {
    this.contentTypeDetail.hide();
    this.contentTypeList.show();
    this.typeAheadEnabled = true;
  }

  /**
   * Returns the element
   *
   * @return {HTMLElement}
   */
  getElement() {
    return this.view.getElement();
  }
}
