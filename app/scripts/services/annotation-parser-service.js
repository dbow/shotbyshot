'use strict';

/**
 * This service parses an array of annotations into an array of slide objects
 * based on the content field of the annotations.
 *
 * Usually there will be more slides than annotations since an annotation can
 * have multiple slides.
 *
 * For example, an annotation with the following "content":
 *
 *   [slide text]
 *     some text
 *   [slide background]
 *     <img src="url" />
 *   [slide text]
 *     more text
 *   [slide streetview="url"]
 *
 * will be parsed into 4 separate slide objects of type "text", "background",
 * "text", and "streetview".
 */
function AnnotationParserService(Annotation) {

  /**
   * Convert annotations to slides based on the content field.
   *
   * @param {Array.<Object>} annotations to parse.
   * @return {Array.<Object>} array of slide objects.
   */
  this.parse = function(annotations) {

    var slideObjects = [];

    angular.forEach(annotations, function(annotation) {

      /**
       * NOTE: Not sure a series of regexes is the best way to parse the
       * content. Could possibly just replace the [ ] brackets with < >
       * HTML tags and parse the containing string as a DOM element and
       * then use the native DOM getAttribute methods.
       */

      var annotationContent = annotation.content;
      // Separate each [slide or [Slide tag.
      var slides = annotationContent.split(/\[slide\s*/ig);

      if (slides.length < 2) {
        // No [slide] tags present. Default to text for now.
        slideObjects.push({
          type: 'text',
          content: annotationContent,
          attributes: {
            text: undefined
          },
          annotation: annotation // Reference to original annotation.
        });
        return false;
      }

      // Ignore first result since it's always outside a slide tag.
      slides = slides.slice(1);

      angular.forEach(slides, function(slide, i) {
        // Separate into attributes and content.
        var parts = slide.split(']');
        if (parts.length < 2) {
          throw new Error('Slide tag "' + parts[0] + '" did not have closing ' +
              'bracket: ' + annotationContent);
          return;
        }
        var attributes = parts[0];
        var content = parts[1];

        // Extract the type of slide (the first tag).
        //   [slide background] => background
        //   [slide highlight caption="blah" title="blah"] => highlight
        var typeAttributeRegex = /(\w+)(?=$|\s|=)/i;
        var type = typeAttributeRegex.exec(attributes);
        if (type === null) {
          throw new Error('Could not determine type of slide tag: ' + slide);
          return;
        }
        type = type[1];

        var ALLOWED_TYPES = {
          'text': 1,
          'background': 1,
          'photo': 1,
          'highlight': 1,
          'audio': 1,
          'video': 1,
          'streetview': 1
        };

        if (!ALLOWED_TYPES[type]) {
          throw new Error('Type not allowed: ' + type);
          return;
        }

        // Assemble a map of attributes and optional values.
        var attributeMap = {};

        // Find all the key/value attributes e.g. caption="blah"
        var keyValAttributeRegex = /(\w+)=("[^"]*"|'[^']*'|\w+)/g;
        var match;
        var key;
        var value;
        var result = attributes;
        while ((match = keyValAttributeRegex.exec(attributes)) !== null) {
          key = match[1].toLowerCase();
          value = match[2];
          // Remove leading and trailing quotes if present.
          if (value.charAt(0) === '"' || value.charAt(0) === '\'') {
            value = value.slice(1, -1);
          }
          // Split video attribute into array of video URLs.
          if (key === 'video') {
            value = value.split(',');
          }

          attributeMap[key] = value;

          // Remove match from result (used for other attributes below).
          result = result.replace(match[0], '');
        }

        // Split result on whitespace and add the remaining attributes to
        // the map. These are all ones that don't have a value e.g.
        // [slide background] or [slide photo] or something.
        angular.forEach(result.split(/\s+/g), function(attribute) {
          if (attribute) {
            attributeMap[attribute] = undefined;
          }
        });

        // Assemble slide object for the slide directive.
        var slideObject = {
          type: type,
          content: content,
          attributes: attributeMap,
          annotation: annotation // Reference to original annotation.
        };

        var NON_AUTHOR_TYPES = {
          photo: 1,
          video: 1,
          streetview: 1
        };

        // If first detected slide is not one of the non-author ones, add an
        // author slide.
        if (i === 0 && !NON_AUTHOR_TYPES[type]) {
          slideObjects.push({
            type: 'author',
            annotation: annotation
          });
        }

        slideObjects.push(slideObject);
      });
    });

    return slideObjects;
  };
}

angular
  .module('shotbyshot')
  .service('AnnotationParserService', AnnotationParserService);

