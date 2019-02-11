Polymer({
  is: 'uqlibrary-courses-study-links',
  properties: {
    course: {
      type: Object
    }
  },
  linkClicked: function (e, detail, sender) {
    var _id = sender.getAttribute('id');
    if (_id) {
      this.$.ga.addEvent('Link Clicked', _id);
    }
  },
  _computeHidden: function (course) {
    return course.SUBJECT !== 'LAWS';
  }
});
