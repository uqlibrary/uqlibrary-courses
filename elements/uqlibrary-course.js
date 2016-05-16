/**
 * Displays a single course, comprised of reading lists, exam papers and library guides
 */
Polymer({
  is: 'uqlibrary-course',
  properties: {
    ecpLinkUrl: {
      type: String,
      value: 'http://www.uq.edu.au/study/course.html?course_code='
    },
    examPapers: {
      type: Array
    },
    examPapersSearchUrl: {
      type: String,
      value: 'https://www.library.uq.edu.au/exams/papers.php?stub='
    },
    libGuides: {
      type: Array,
      value: function () {
        return [];
      }
    },
    libGuidesBrowseUrl: {
      type: String,
      value: 'http://guides.library.uq.edu.au/browse.php'
    },
    libGuidesLinkUrl: {
      type: String,
      value: 'http://guides.library.uq.edu.au'
    },
    libraryGuides: {observer: 'libraryGuidesChanged'},
    notesTrimLength: {
      type: Number,
      value: 90
    },
    readingList: {
      type: Array
    },
    readingListsSearchUrl: {
      type: String,
      value: 'http://lr.library.uq.edu.au/index.html'
    },
    visibleItemsCount: {
      type: Object,
      value: function () {
        return {
          readingLists: 2,
          examPapers: 2,
          libGuides: 2
        };
      }
    },
    course: {
      type: Object,
      observer: '_setCourse'
    },
    /**
     * Whether the reading list has been loaded
     */
    _readingListLoaded: {
      type: Boolean,
      value: false
    },
    /**
     * Whether exam papers have been loaded
     */
    _examPapersLoaded: {
      type: Boolean,
      value: false
    }
  },
  observers: [
    'courseExamPapersChanged(course.learning_resources.exam_papers)',
    'libraryGuidesChanged(course.library_guides)',
    'courseReadingListItemsChanged(course.learning_resources.reading_lists.items)'
  ],

  _setCourse: function() {
    this.set('course.moreItemsCount', {
      readingLists: 0,
      examPapers: 0,
      libGuides: 0
    });

  },
  ready: function () {
    var that = this;
  },
  /**
   * Get extension of filename
   *
   * @param url
   * @returns {string}
   */
  extractExtension: function (url) {
    return url.substring(url.lastIndexOf('.') + 1);
  },
  /**
   * Don't want to display too many notes, so trim them down
   *
   * @param value
   * @returns {*}
   */
  trimNotes: function (value) {
    if (value && value.length > this.notesTrimLength) {
      var _trimmed = value.substring(0, this.notesTrimLength);
      // trim on word boundary
      _trimmed = _trimmed.substring(0, _trimmed.lastIndexOf(' '));
      return _trimmed + '...';
    }
    else
      return value;
  },
  /**
   * Callback for the reading list learning resources
   *
   * @param newValue
   */
  courseReadingListItemsChanged: function (newValue) {
    if (newValue) {
      // slice reading list array to show limited number items
      if (this.visibleItemsCount.readingLists && (this.visibleItemsCount.readingLists > 0) && (newValue.length >= this.visibleItemsCount.readingLists)) {
        this.set('readingList', newValue.slice(0, this.visibleItemsCount.readingLists));
        this.set('course.moreItemsCount.readingLists', newValue.length - this.visibleItemsCount.readingLists);
      }
      else {
        this.set('readingList', newValue);
        this.set('course.moreItemsCount.readingLists', 0);
      }

      this._readingListLoaded = true;
    }
  },
  /**
   * Callback for the exam papers learning resources
   *
   * @param newValue
   */
  courseExamPapersChanged: function (newValue) {
    if (newValue) {
      // slice reading list array to show limited number items
      if (this.visibleItemsCount.examPapers && (this.visibleItemsCount.examPapers > 0) && (newValue.length >= this.visibleItemsCount.examPapers)) {
        this.set('examPapers', newValue.slice(0, this.visibleItemsCount.examPapers));
        this.set('course.moreItemsCount.examPapers', newValue.length - this.visibleItemsCount.examPapers);
      }
      else {
        this.set('examPapers', newValue);
        this.set('course.moreItemsCount.examPapers', 0);
      }

      this._examPapersLoaded = true;
    }
  },
  /**
   * Callback for library guides changing
   *
   * @param newValue
   */
  libraryGuidesChanged: function (newValue) {
    if (newValue) {
      // slice reading list array to show limited number items
      if (this.visibleItemsCount.libGuides && (this.visibleItemsCount.libGuides > 0) && (newValue.length > this.visibleItemsCount.libGuides)) {
        this.set('libGuides', newValue.slice(0, this.visibleItemsCount.libGuides));
        this.set('course.moreItemsCount.libGuides', newValue.length - this.visibleItemsCount.libGuides);
      }
      else {
        this.set('libGuides', newValue);
        this.set('course.moreItemsCount.libGuides', 0);
      }
    }
  },
  /**
   * Just fires an analytics event
   *
   * @param e
   */
  linkClicked: function (e) {
    var _id = e.currentTarget.dataset.title;
    if (_id) {
      this.$.ga.addEvent('Link Clicked', _id);
    }
  },
  /**
   * Allow the course to be set (use from outside of polymer in demo, test etc)
   *
   * @param course
   */
  setCourse: function (course) {
    this.set('course', course);
  },
  _hasReadingList: function (readingList) {
    return readingList.length > 0;
  },
  _hasExamPapers: function (examPapers) {
    return examPapers.length > 0;
  },
  _hasNoExamPapers: function (examPapers) {
    return examPapers.length === 0;
  },
  _courseLink: function (course, url) {
    if (!url) {
      url = 'https://learn.uq.edu.au/';
    }
    return url + course.courseId;
  },
  _hasLibGuides: function (libGuides) {
    return libGuides.length > 0;
  },
  _computeAriaLabel: function (item) {
    return 'Reading list for ' + item.title + ' ' + item.period;
  },
  _computeAriaLabel2: function (item) {
    return 'Reading list item ' + item.title + ', ' + item.referenceType + ', ' + item.importance;
  },
  _notesEmpty: function (item) {
    return !item.notes && (!item.startPage || !item.endPage);
  },
  _pagesEmpty: function (item) {
    return !item.startPage || !item.endPage;
  },
  _computeAriaLabel3: function (paper) {
    return 'past exam paper for ' + paper.period + ' format ' + this.extractExtension(paper.url);
  },
  _computeAriaLabel4: function (guide) {
    return 'library guide for ' + guide.title;
  },
  _pluralise: function (word, num) {
    return word + (num === 1 ? '' : 's');
  }
});
