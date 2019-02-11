Polymer({
  is: 'uqlibrary-toolbar',
  properties: {
    /*
    * Flag to enable/disable search bar
    * */
    enableSearch: {
      type: Object
    },
    /**
     * Whether to show the "Clear Search" button
     */
    enableSearchClear: {
      type: Object,
      value: false
    },
    /*
    * Flag to enable/disable menu button
    * */
    enableMenu: {
      type: Object
    },
    /*
    * String to display on toolbar
    * */
    headerTitle: {
      type: String
    },
    /*
     * Autosuggestion property to display in drop down
     * */
    itemLabel: {
      type: String,
      value: 'name'
    },
    /*
     * Default text in search input field
     * */
    searchPlaceholderText: {
      type: String,
      value: 'Search...'
    },
    /*
     * Search term keyword
     * */
    searchTerm: {
      type: String,
      notify: true
    },
    /*
     * A list of suggestions to be displayed when user types in keyword
     * */
    suggestions: {
      type: Array,
      value: function () {
        return [];
      }
    },
    _searchInProgress: {
      type: Boolean,
      value: false
    }
  },
  _showSearch: function() {
    if (this._searchInProgress === false)
      this._searchInProgress = true;

    this.async(function () {
      this.$$('#asi').$.inputKeyword.focus();
    }, 5);
  },
  _hideSearch: function() {
    if (this._searchInProgress === true)
      this._searchInProgress = false;
  },
  _searchActivated: function(e) {
    this._hideSearch();

    var searchObject = null;

    if (typeof(e.detail) === 'object' && e.detail.hasOwnProperty(this.itemLabel)) {
      searchObject = { searchItem: e.detail };
    } else {
      searchObject = { searchTerm: this.searchTerm };
    }

    this.fire("uqlibrary-toolbar-search-submitted", searchObject );
  },
  _actionSelected: function(e) {
    this.fire('uqlibrary-toolbar-link-clicked', this.appLinks[e.detail.selected]);
  },
  _menuActivated: function () {
    this.fire('uqlibrary-toolbar-menu-clicked');
  },
  _clearSearch: function () {
    this.fire('uqlibrary-toolbar-clear-search-clicked');
  }
});