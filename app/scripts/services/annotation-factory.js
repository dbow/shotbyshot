'use strict';

function Annotation() {
  function annotation(data) {
    if (!data) {
      return;
    }

    // Parse author info.
    this.author = {
      name: data.author && data.author.name,
      image: '//memory.lossur.es/wp/wp-content/uploads/authors/' +
             data.author.nickname + '.jpg'
    };

    // Store content.
    this.content = data.content || '';

    // Parse custom fields (street view, timecodes, and highlight).

    var customFields = data.custom_fields;

    function getCustomField(key) {
      var value = customFields && customFields[key] && customFields[key][0];
      return value || '';
    }

    var streetView = getCustomField('mm_annotation_streetview');
    var start = getCustomField('mm_annotation_start_timecode');
    var end = getCustomField('mm_annotation_end_timecode');
    var x = getCustomField('mm_annotation_x');
    var y = getCustomField('mm_annotation_y');

    if (streetView) {
      this.streetView = streetView;
    }

    if (start || end) {
      this.timecodes = {
        start: start && parseFloat(start) || 0,
        end: end && parseFloat(end) || 0
      };
    }

    if (x || y) {
      this.highlight = {
        x: x && parseFloat(x) || 0,
        y: y && parseFloat(y) || 0
      };
    }

    // Parse tags.
    var tags = {};
    if (data.tags && data.tags.length) {
      // Make a map of tags for fast lookup.
      angular.forEach(data.tags, function(tag) {
        tags[tag.title] = 1;
      });
    }
    this.tags = tags;

    // TODO(dbow): Maybe handle attachments?
  }

  return annotation;
}

angular
  .module('shotbyshot')
  .factory('Annotation', Annotation);
