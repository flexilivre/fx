if (!String.prototype.splice) {
    /**
     * {JSDoc}
     *
     * The splice() method changes the content of a string by removing a range of
     * characters and/or adding new characters.
     *
     * @this {String}
     * @param {number} start Index at which to start changing the string.
     * @param {number} delCount An integer indicating the number of old chars to remove.
     * @param {string} newSubStr The String that is spliced in.
     * @return {string} A new string with the spliced substring.
     */
    String.prototype.splice = function(start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position){
    return this.substr(position || 0, searchString.length) === searchString;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
      let subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      let lastIndex = subjectString.lastIndexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };
  }


  if (!String.prototype.toSnakeCase) {
    String.prototype.toSnakeCase = function() {
      let upperChars = this.match(/([A-Z])/g);
      if (! upperChars) {
          return this;
      }

      let str = this.toString();
      for (let i = 0, n = upperChars.length; i < n; i++) {
          str = str.replace(new RegExp(upperChars[i]), '_' + upperChars[i].toLowerCase());
      }

      if (str.slice(0, 1) === '_') {
          str = str.slice(1);
      }

      return str;
  };
}