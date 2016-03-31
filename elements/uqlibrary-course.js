Polymer({
  is: 'uqlibrary-course',
  properties: {
    course: {
      notify: true,
      type: Object,
      value: function () {
        return {};
      }
    },
    ecpLinkUrl: {
      type: String,
      value: 'http://www.uq.edu.au/study/course.html?course_code='
    },
    examPapers: {
      type: Array,
      value: function () {
        return [];
      }
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
      type: Array,
      value: function () {
        return [];
      }
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
    observers: [
      'courseExamPapersChanged(course.learning_resources.exam_papers)',
      'libraryGuidesChanged(course.library_guides)',
      'courseReadingListItemsChanged(course.learning_resources.reading_lists.items)'
    ]
  },
  ready: function () {
    this.set('course.moreItemsCount', {
      readingLists: 0,
      examPapers: 0,
      libGuides: 0
    });
    var that = this;
    this.$.cards.addEventListener('swipeable-card-swipe-away', function (e) {
      Polymer.dom(Polymer.dom(e.target).parentNode).removeChild(e.target);
      // removes this card
      Polymer.dom(that.$.cards).appendChild(e.target);
      // adds this card to the end of the set of cards
      e.target.style.opacity = 1;
      e.target.style.transform = 'translate3d(0px, 0px, 0px) rotate(0deg)';
      e.target.style.webkitTransform = 'translate3d(0px, 0px, 0px) rotate(0deg)';
      that.$.ga.addEvent('Course Card Swiped Away', e.target.getAttribute('id'));
    });
  },
  created: function () {
  },
  extractExtension: function (url) {
    return url.substring(url.lastIndexOf('.') + 1);
  },
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
  courseReadingListItemsChanged: function (newValue) {
    if (newValue) {
      // slice reading list array to show limited number items
      if (this.visibleItemsCount.readingLists && this.visibleItemsCount.readingLists > 0 && newValue.length >= this.visibleItemsCount.readingLists) {
        this.readingList = newValue.slice(0, this.visibleItemsCount.readingLists);
        this.set('course.moreItemsCount.readingLists', newValue.length - this.visibleItemsCount.readingLists);
      }
      else {
        this.readingList = newValue;
        this.set('course.moreItemsCount.readingLists', 0);
      }
    }
  },
  courseExamPapersChanged: function (newValue) {
    if (newValue) {
      // slice reading list array to show limited number items
      if (this.visibleItemsCount.examPapers && this.visibleItemsCount.examPapers > 0 && newValue.length >= this.visibleItemsCount.examPapers) {
        this.examPapers = newValue.slice(0, this.visibleItemsCount.examPapers);
        this.set('course.moreItemsCount.examPapers', newValue.length - this.visibleItemsCount.examPapers);
      }
      else {
        this.examPapers = newValue;
        this.set('course.moreItemsCount.examPapers', 0);
      }
    }
  },
  libraryGuidesChanged: function (newValue) {
    if (newValue) {
      // slice reading list array to show limited number items
      if (this.visibleItemsCount.libGuides && this.visibleItemsCount.libGuides > 0 && newValue.length > this.visibleItemsCount.libGuides) {
        this.libGuides = newValue.slice(0, this.visibleItemsCount.libGuides);
        this.set('course.moreItemsCount.libGuides', newValue.length - this.visibleItemsCount.libGuides);
      }
      else {
        this.libGuides = newValue;
        this.set('course.moreItemsCount.libGuides', 0);
      }
    }
  },
  linkClicked: function (e, detail, sender) {
    var _id = sender.getAttribute('id');
    if (_id) {
      this.$.ga.addEvent('Link Clicked', _id);
    }
  },
  hostAttributes: {
    'layout': '',
    'center': ''
  },
  _hasReadingList: function (readingList) {
    return readingList.length > 0;
  },
  _hasMoreReadingListItems: function (course) {
    if (course.hasOwnProperty('moreItemsCount')) {
      return course.moreItemsCount.readingLists > 0;
    } else {
      return false;
    }
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
  _hasMoreExamPaperItems: function (course) {
    if (course.hasOwnProperty('moreItemsCount')) {
      return course.moreItemsCount.examPapers > 0;
    } else {
      return false;
    }
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
