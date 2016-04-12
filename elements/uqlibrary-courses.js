Polymer({
  is: 'uqlibrary-courses',
  properties: {
    autoload: {
      type: Boolean,
      value: true,
      notify: true
    },
    courses: {
      value: null,
      notify: true,
      observer: 'coursesChanged'
    },
    // Accessibility issues fixes
    keyboardNavigationKeys: {
      type: String,
      value: 'space enter'
    },
    learningResources: {
      type: Object,
      value: function () {
        return {};
      }
    },
    processedCourses: {
      value: null,
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
  togglePanel: function () {
    this.$.drawerPanel.togglePanel();
  },
  ready: function () {
    var that = this;
    var courseIndex = null;
    this.$.account.addEventListener('uqlibrary-api-account-loaded', function (e) {
      if (e.detail.hasSession) {
        if (e.detail.classes) {
          that.user = e.detail;
          that.courses = e.detail.classes;
        }
      }
      else {
        // Not logged in
        that.$.account.login(window.location.href);
      }
    });
    if (this.autoload) {
      this.$.account.get();
    }
    this.addEventListener('uqlibrary-courses-loaded', function () {
      this.get();
    });
    this.$.learning_resources.addEventListener('uqlibrary-api-learning-resources', function (e) {
      if (e.detail.length > 0) {
        for (var i = 0; i < that.processedCourses.length; i++) {
          for (var j = 0; j < e.detail.length; j++) {
            if (that.processedCourses[i].courseId == e.detail[j].title) {
              that.set('processedCourses.' + i + '.learning_resources', e.detail[j]);
              that.filterReadingLists(that.processedCourses[i]);
              that.filterExamPapers(that.processedCourses[i]);
              //that.notifyPath('processedCourses');
              var readingListId = that.getReadingListId(that.processedCourses[i].learning_resources.reading_lists);
              if (readingListId != '') {
                courseIndex = i;
                that.$.reading_list.get({code: readingListId});
              }
              else if (that.processedCourses[i].learning_resources.hasOwnProperty('multipleReadingLists')) {
              }
              //finish iterating
              j = e.detail.length;
            }
          }
        }
      }
      else {
        if (that.selectedTab) {
          for (var i = 0; i < that.processedCourses.length; i++) {
            if (that.processedCourses[i].courseId == that.selectedTab) {
              that.set('processedCourses.' + i + '.learning_resources', {
                reading_lists: {items: []},
                exam_papers: []
              });
            }
          }
        }
      }
    });
    this.$.reading_list.addEventListener('uqlibrary-api-course-reading-list', function (e) {
      if (courseIndex != null) {
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
        if (that.processedCourses[courseIndex].learning_resources.reading_lists) {
          that.set('processedCourses.' + courseIndex + '.learning_resources.reading_lists.items', e.detail);
        }
      }
    });
    this.$.library_guides.addEventListener('uqlibrary-api-library-guides', function (e) {
      for (var i = 0; i < that.courses.length; i++) {
        if (that.courses[i].courseId == that.selectedTab) {
          that.courses[i].library_guides = e.detail;
        }
      }
    });
    this.$.search_suggestions.addEventListener('uqlibrary-api-search-suggestions-loaded', function (e) {
      var suggestions = [];
      if (e.detail.length > 0) {
        e.detail.forEach(function (item) {
          item.text = item.name + ' (' + item.course_title + ', ' + item.campus + ', ' + item.period + ')';
          suggestions.push(item);
        });
        that.$.toolbar.suggestions = suggestions;
      }
    });
  },
  loadAutosuggest: function (event) {
    if (event.detail.value.length > 2) {
      this.$.search_suggestions.get(event.detail.value);
    }
  },
  performSearch: function (event) {
    if (!event.detail.searchItem) {
      return;
    }
    var course = event.detail.searchItem;
    this.transitioning = true;
    this.searchedCourse = {
      courseId: course.name.toUpperCase(),
      CATALOG_NBR: course.name.substring(4),
      STRM: '',
      term: course.period,
      campus: course.campus,
      SUBJECT: course.name.substring(0, 4)
    };
    if (!this.searchTabCreated) {
      this.courses.unshift(this.searchedCourse);
      this.searchTabCreated = true;
    }
    else {
      this.set('courses' + ('.' + 0), this.searchedCourse);
    }
    this.$.toolbar.clearSearchForm();
    this.$.toolbar.deactivateSearch();
  },
  get: function (code) {
    if ((!code || code == '') && this.processedCourses.length > 0) {
      code = this.processedCourses[0].courseId;
    }
    if (code) {
      for (var i = 0; i < this.processedCourses.length; i++) {
        if (this.processedCourses[i].courseId == code) {
          if (!this.processedCourses[i].hasOwnProperty('learning_resources')) {
            this.set('processedCourses.' + i + '.learning_resources', {
              reading_lists: [],
              exam_papers: []
            });
            this.$.learning_resources.get({code: code});
          }
          if (!this.processedCourses[i].hasOwnProperty('library_guides')) {
            this.set('processedCourses.' + i + '.library_guides', []);
            this.$.library_guides.get({code: this.processedCourses[i].courseId});
          }
          this.selectedCourse = this.processedCourses[i];
        }
      }
      this.selectedTab = code;
    }
  },
  coursesChanged: function (newValue, oldValue) {
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
      //filter courses to show only current
      var that = this;
      if (termCodes.length > 0) {
        this.$.term_dates.addEventListener('uqlibrary-api-term-dates', function (e) {
          that.termDates = e.detail;
          that.processData();
        });
        this.$.term_dates.get({codes: termCodes});
      }
    }
    else {
      this.set('processedCourses', []);
      this.fire('uqlibrary-courses-loaded');
    }
  },
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
  },
  selectedTabChanged: function (newValue, oldValue) {
    // check oldValue to prevent load on init
    if (oldValue != '' && newValue != '') {
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
  filterReadingLists: function (course) {
    if (course.learning_resources.reading_lists.length == 0) {
      return;
    }
    if (course.learning_resources.reading_lists.length == 1) {
      course.learning_resources.reading_lists = course.learning_resources.reading_lists[0];
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
      course.learning_resources.reading_lists = {items: []};
    }
    else if (found.length == 1) {
      course.learning_resources.reading_lists = found[0];
    }
    else {
      course.learning_resources.reading_lists = {items: []};
      course.learning_resources.multipleReadingLists = found;
    }
  },
  filterExamPapers: function (course) {
    for (var i = 0; i < course.learning_resources.exam_papers.length; i++) {
      if (course.learning_resources.exam_papers[i].course != course.learning_resources.course_title) {
      }
    }
  },
  filterCoursesByTerm: function (course) {
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
    this.$.drawerPanel.togglePanel();
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
