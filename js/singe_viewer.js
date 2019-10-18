if (!Element.prototype.scrollIntoViewIfNeeded) {
  Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

    var parent = getParent(this),
        parentComputedStyle = window.getComputedStyle(parent, null),
        parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
        parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
        overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
        overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
        overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
        overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
        alignWithTop = overTop && !overBottom;

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      this.scrollIntoView(alignWithTop);
    }
  };
}

function getParent(el) {
  var parent = el.parentNode;

  if (parent === document) {
      return document;
 } else if (parent.offsetHeight < parent.scrollHeight || parent.offsetWidth < parent.scrollWidth) {
      return parent;
  } else {
      return getParent(parent);
  }
}

var app = new Vue({
    el: '#app',
    data: {
      file_loaded: false,
      search_term: "",
      citymodel: {},
      selected_objid: null,
      loading: false,
      error_message: null
    },
    created() {
      let self = this;

      this.$root.$on('object_clicked', (objid) => {
        self.move_to_object(objid);
      });

      this.$root.$on('rendering', (status) => {
        self.loading = status;
      });
    },
    watch: {
      selected_objid: function() {
        if (this.selected_objid != null)
        {
          var card_id = $.escapeSelector(this.selected_objid);
          $(`#${card_id}`)[0].scrollIntoViewIfNeeded();
        }
      }
    },
    computed: {
      filteredCityObjects: function() {
        var result = _.pickBy(this.citymodel.CityObjects, function(value, key) {
          var regex = RegExp(this.search_term, "i");
          var obj_json = JSON.stringify(value);
          return regex.test(key) | regex.test(obj_json);
        });

        return result;
      },
      existsSelected: function() {
        return this.selected_objid != null;
      }
    },
    methods: {
      move_to_object(objid) {
        this.selected_objid = objid;
      },
      reset() {
        this.citymodel = {};
        this.search_term = "";
        this.file_loaded = false;
      },
      matches(coid, cityobject) {
        var regex = RegExp(this.search_term, "i");
        var obj_json = JSON.stringify(cityobject);
        if (cityobject.children && cityobject.children.length > 0)
        {
          return regex.test(coid) || regex.test(obj_json) || cityobject.children.some(obj_id => { return this.matches( obj_id, this.citymodel.CityObjects[obj_id] ) });
        }
        else
        {
          return regex.test(coid) || regex.test(obj_json);
        }
      },
      async selectedFile() {
        this.loading = true;

        let file = this.$refs.cityJSONFile.files[0];
        if (!file || file.type != "application/json")
        {
          this.error_message = "This is not a JSON file!";
          this.loading = false;
          return;
        }

        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = evt => {
          cm = JSON.parse(evt.target.result);

          this.citymodel = cm;

          this.file_loaded = true;

          this.loading = false;
        }
      },
      download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
      },
      downloadModel() {
        text = JSON.stringify(this.citymodel);

        this.download("citymodel.json", text);
      }
    }
})

Vue.config.devtools = true