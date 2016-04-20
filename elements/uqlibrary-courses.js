/**
 * Pulls the students courses and lets them search for other courses
 */
Polymer({
  is: 'uqlibrary-courses',
  properties: {
    // autoload the account
    autoload: {
      type: Boolean,
      value: true,
      notify: true
    },
    // raw courses
    courses: {
      value: null
    },
    // Accessibility issues fixes
    keyboardNavigationKeys: {
      type: String,
      value: 'space enter'
    },
    // courses which we work on and send to child elements
    processedCourses: {
      type: Array,
      value: function () {
        return null;
      }
    },
    searchTabCreated: {
      type: Boolean,
      value: false
    },
    searchedCourse: {
      value: null
    },
    selectedCourse: {
      type: Object,
      value: function () {
        return {};
      }
    },
    selectedTab: {
      type: String,
      value: '',
      observer: 'selectedTabChanged'
    },
    termDates: {
      type: Object,
      value: function () {
        return {};
      }
    },
    // Extend search dates for courses
    termExtendWeeksRange: {
      type: Object,
      value: function () {
        return {
          before: 3,
          after: 1
        };
      }
    },
    transitioning: {
      type: Boolean,
      value: false
    },
    user: {
      type: Object,
      value: function () {
        return {};
      }
    }
  },
  observers: [
    'coursesChanged(courses.length)'
  ],
  ready: function () {
    this.courseIndex = null;

    if (this.autoload) {
      this.$.account.get();
    }
  },
  /**
   * Callback for autocomplete, format results and send to dropdown
   *
   * @param e
   */
  searchSuggestionsLoaded: function (e) {
    var suggestions = [];
    if (e.detail.length > 0) {
      e.detail.forEach(function (item) {
        item.text = item.name + ' (' + item.course_title + ', ' + item.campus + ', ' + item.period + ')';
        suggestions.push(item);
      });
      this.$.toolbar.suggestions = suggestions;
    }
  },
  /**
   * Callback for when the library guides for a course are loaded
   *
   * @param e
   */
  libraryGuidesLoaded: function (e) {
    for (var i = 0; i < this.courses.length; i++) {
      if (this.courses[i].courseId == this.selectedTab) {
        this.set('courses.' + i + '.library_guides', e.detail);
        this.set('processedCourses.' + i + '.library_guides', e.detail);
      }
    }
  },
  /**
   * Callback for loaded account, we get the users courses from here
   * @param e
   */
  accountLoaded: function (e) {
    if (e.detail.hasSession) {
      if (e.detail.classes) {
        this.set('user', e.detail);
        this.set('courses', e.detail.classes);
      }
    }
    else {
      // Not logged in
      this.$.account.login(window.location.href);
    }
  },
  /**
   * Call back when reading lists for course are loaded
   *
   * @param e
   */
  readingListLoaded: function (e) {
    if (this.courseIndex != null) {
      var list = e.detail;
      // sort list by item importance
      var importanceList = {
        'Required': 1,
        'Recommended': 2,
        'Further': 3
      };
      list.sort(function (a, b) {
        // Item with defined importance should be higher
        if (a.hasOwnProperty('importance') && !b.hasOwnProperty('importance')) {
          return -1;
        }
        // Item with defined importance should be higher
        if (!a.hasOwnProperty('importance') && b.hasOwnProperty('importance')) {
          return 1;
        }
        if (!a.hasOwnProperty('importance') && !b.hasOwnProperty('importance')) {
          return 0;
        }
        var impA = importanceList.hasOwnProperty(a.importance) ? importanceList[a.importance] : 999;
        var impB = importanceList.hasOwnProperty(b.importance) ? importanceList[b.importance] : 999;
        return impA - impB;
      });
      if (this.processedCourses[this.courseIndex].learning_resources.reading_lists) {
        this.set('processedCourses.' + this.courseIndex + '.learning_resources.reading_lists.items', e.detail);
      }
    }
  },
  /**
   * Learning resources is pretty much everything about a course resources, the exams, the guides and the reading_lists
   * Once loaded we get the reading lists etc
   *
   * @param e
   */
  learningResourcesLoaded: function (e) {
    if (e.detail.length > 0) {
      for (var i = 0; i < this.processedCourses.length; i++) {
        for (var j = 0; j < e.detail.length; j++) {
          var course = this.processedCourses[i];
          if (course.courseId == e.detail[j].title) {
            this.set('processedCourses.' + i + '.learning_resources',  e.detail[j]);
            this.filterReadingLists(i);
            var readingListId = this.getReadingListId(course.learning_resources.reading_lists);
            if (readingListId != '') {
              this.courseIndex = i;
              this.$.reading_list.get({code: readingListId});
            }
            else if (course.learning_resources.hasOwnProperty('multipleReadingLists')) {
            }
            //finish iterating
            j = e.detail.length;
          }
        }
      }
    }
    else {
      if (this.selectedTab) {
        for (var i = 0; i < this.processedCourses.length; i++) {
          if (this.processedCourses[i].courseId == this.selectedTab) {
            this.set('processedCourses.' + i + '.learning_resources', {
              reading_lists: {
                items: []
              },
              exam_papers: []
            });
          }
        }
      }
    }
  },
  /**
   * Call back to make request for search
   *
   * @param event
   */
  loadAutosuggest: function (event) {
    if (event.detail.value.length > 2) {
      this.$.search_suggestions.get(event.detail.value);
    }
  },
  /**
   * Make the search request once the user has asked for one
   *
   * @param event
   */
  performSearch: function (event) {
    if (!event.detail.searchTerm) {
      return;
    }
    var course = event.detail.searchTerm;
    this.transitioning = true;
    this.set('searchedCourse', {
      courseId: course.name.toUpperCase(),
      CATALOG_NBR: course.name.substring(4),
      STRM: '',
      term: course.period,
      campus: course.campus,
      SUBJECT: course.name.substring(0, 4)
    });
    if (!this.searchTabCreated) {
      this.unshift('courses', this.searchedCourse);
      this.set('searchTabCreated', true);
    }
    else {
      this.set('courses.0', this.searchedCourse);
    }
    this.$.toolbar.deactivateSearch();
  },
  /**
   * Get the requested course for the user, if none is requested
   * just pass back the first course we have in memory
   *
   * @param code
   */
  get: function (code) {
    if ((!code || code == '') && this.processedCourses.length > 0) {
      code = this.processedCourses[0].courseId;
    }
    if (code) {
      for (var i = 0; i < this.processedCourses.length; i++) {
        if (this.processedCourses[i].courseId == code) {
          if (!this.processedCourses[i].hasOwnProperty('learning_resources')) {
            this.set('processedCourses.' + i + '.learning_resources', {
              reading_lists: {
                items: []
              },
              exam_papers: []
            });
            this.$.learning_resources.get({code: code});
          }
          if (!this.processedCourses[i].hasOwnProperty('library_guides')) {
            this.set('processedCourses.' + i + '.library_guides', []);
            this.$.library_guides.get({code: this.processedCourses[i].courseId});
          }
          this.set('selectedCourse', this.processedCourses[i]);
        }
      }
      this.set('selectedTab', code);
    }
  },
  /**
   * Run when the courses are updated
   */
  coursesChanged: function (newValue) {
    if (this.courses && (this.courses.length > 0)) {
      var termCodes = [];
      for (var i = 0; i < this.courses.length; i++) {
        this.set('courses' + ('.' + i) + '.courseId', this.courses[i].SUBJECT + this.courses[i].CATALOG_NBR);
        if (termCodes.indexOf(this.courses[i].STRM) === -1) {
          termCodes.push(this.courses[i].STRM);
        }
      }
      //sort courses by term
      this.courses.sort(function (a, b) {
        return a.STRM - b.STRM;
      });
      if (termCodes.length > 0) {
        //filter courses to show only current
        var that = this;
        this.$.term_dates.addEventListener('uqlibrary-api-term-dates', function (e) {
          that.termDates = e.detail;
          that.processData();
        });
        this.$.term_dates.get({codes: termCodes});
      }
    }
    else {
      // initialise courses
      this.set('processedCourses', []);
    }
  },
  /**
   * Not really sure, seems to deal with filtering courses once the term dates are returned
   */
  processData: function () {
    this.set('processedCourses', this.filterCoursesByTerm());
    //Check if there are 2 or more courses with the same code. If found - remove all but the first course
    var _codes = [];
    var _newProcessedCourses = [];
    for (var i = 0; i < this.processedCourses.length; i++) {
      if (_codes.indexOf(this.processedCourses[i].courseId) === -1) {
        _codes.push(this.processedCourses[i].courseId);
        _newProcessedCourses.push(this.processedCourses[i]);
      }
    }
    this.set('processedCourses', _newProcessedCourses);
    this.fire('uqlibrary-courses-loaded');
    this.get();
  },
  selectedTabChanged: function (newValue, oldValue) {
    // check oldValue to prevent load on init
    if (oldValue !== newValue) {
      this.get(newValue);
      this.$.ga.addEvent('Course selected', newValue);
    }
  },
  transitioningChangeHandler: function (e) {
    if (e.detail.hasOwnProperty('transitioning'))
      this.transitioning = e.detail.transitioning;
  },
  transitionPrepareHandler: function () {
    this.transitioning = true;
    this.fire('core-signal', {
      name: 'transitioning-change',
      data: {transitioning: this.transitioning}
    });
  },
  transitionEndHandler: function () {
    this.transitioning = false;
    this.fire('core-signal', {
      name: 'transitioning-change',
      data: {transitioning: this.transitioning}
    });
  },
  /**
   * If we have no reading lists, do nothing.  If we have one one reading this we set the course reading lists to that
   * if we have multiple reading lists, we set the reading lists to nothing and return the reading lists in the
   * multiple reading lists variable instead.  Kind of lame but don't want to break it by changing it
   *
   * @param courseIndex
   */
  filterReadingLists: function (courseIndex) {
    var course = this.processedCourses[courseIndex];
    if (course.learning_resources.reading_lists.length == 0) {
      return;
    }
    if (course.learning_resources.reading_lists.length == 1) {
      this.set('processedCourses.' + courseIndex + '.learning_resources.reading_lists', course.learning_resources.reading_lists[0]);
      return;
    }
    // Filter reading lists to show only list for course semester
    var term = '', campus = '', semesterString = '';
    if (this.searchedCourse != null && this.searchedCourse.courseId == course.courseId) {
      semesterString = this.searchedCourse.term;
      campus = this.searchedCourse.campus;
    }
    else {
      term = this.getYearSemesterByCode(course.STRM);
      campus = this.getCampusByCode(course.CAMPUS);
      semesterString = 'Semester ' + term.semester + ' ' + term.year;
    }
    var found = [];
    for (var i = 0; i < course.learning_resources.reading_lists.length; i++) {
      if (course.learning_resources.reading_lists[i].period == semesterString && course.learning_resources.reading_lists[i].campus.indexOf(
          campus) !== -1) {
        found.push(course.learning_resources.reading_lists[i]);
      }
    }
    if (found.length == 0) {
      this.set('processedCourses.' + courseIndex + '.learning_resources.reading_lists', {items: []});
    }
    else if (found.length == 1) {
      this.set('processedCourses.' + courseIndex + '.learning_resources.reading_lists', found[0]);
    }
    else {
      this.set('processedCourses.' + courseIndex + '.learning_resources.reading_lists', {items: []});
      this.set('processedCourses.' + courseIndex + '.learning_resources.multipleReadingLists', found);
    }
  },
  /**
   * Find courses which match the loaded term dates
   *
   * @returns {*}
   */
  filterCoursesByTerm: function () {
    if (this.termDates) {
      var today = moment();
      var that = this;
      return this.courses.filter(function (course) {
        if (course.courseId == that.searchedCode) {
          return true;
        }
        if (that.termDates.hasOwnProperty(course.STRM)) {
          var startDate = moment(that.termDates[course.STRM].begin);
          var endDate = moment(that.termDates[course.STRM].end);
          // show current courses plus courses that starts  in 3 weeks or ended 1 week before
          startDate.subtract(that.termExtendWeeksRange.before, 'weeks');
          endDate.add(that.termExtendWeeksRange.after, 'weeks');
          return course.SUBJECT != 'RSCH' && (today.isAfter(startDate) && today.isBefore(endDate));
        }
        else
          return true;
      });
    }
  },
  /**
   * Parse the reading list id from the reading_list url
   *
   * @param reading_list
   * @returns {string}
   */
  getReadingListId: function (reading_list) {
    var id = '';
    if (reading_list.hasOwnProperty('url')) {
      var url = reading_list.url;
      id = url.substring(url.lastIndexOf('/') + 1);
      if (id.indexOf('.') !== -1) {
        id = id.substring(0, url.indexOf('.'));
      }
    }
    return id;
  },
  /**
   * No idea
   *
   * @param code
   * @returns {{year: number, semester: number}}
   */
  getYearSemesterByCode: function (code) {
    var term = code;
    var year = 2000 + parseInt((parseInt(term) - 5000 + '').substring(0, 2));
    // i.e. 6520 - semester 1 year 2015, 6480 - semester 3 year 2014,
    var semester = 1;
    var semesterCode = parseInt(term.substr(-2));
    if (semesterCode >= 50 && semesterCode <= 79) {
      semester = 2;
    }
    if (semesterCode >= 80) {
      semester = 3;
    }
    return {
      year: year,
      semester: semester
    };
  },
  /**
   * Return prettier representation of campus given its code
   *
   * @param code
   * @returns {*}
   */
  getCampusByCode: function (code) {
    var campuses = {
      'STLUC': 'St Lucia',
      'GATTN': 'Gatton',
      'IPSWC': 'Ipswich',
      'HERST': 'Herston'
    };
    if (campuses.hasOwnProperty(code)) {
      return campuses[code];
    }
    else
      return null;
  },
  toggleMenuDrawer: function () {
    this.fire('uqlibrary-toggle-drawer');
  },
  _loadingCourses: function (processedCourses) {
    return !Array.isArray(processedCourses);
  },
  _hasCourses: function (processedCourses) {
    return !this._loadingCourses(processedCourses) && (processedCourses.length > 0);
  },
  _noCourses: function (processedCourses) {
    return !this._loadingCourses(processedCourses) && (processedCourses.length === 0);
  },
  _loadingOrNoCourses: function (processedCourses) {
    return this._loadingCourses(processedCourses) || this._noCourses(processedCourses);
  },
  _computeId: function (course) {
    return 'course' + course.courseId;
  },
  _computeAriaLabel: function (course) {
    return course.SUBJECT + ' ' + course.CATALOG_NBR;
  }
});
