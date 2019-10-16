var app = new Vue({
    el: '#app',
    data: {
      file_loaded: false,
      search_term: "",
      citymodel: {}
    },
    computed: {
      filteredCityObjects: function() {
        var result = _.pickBy(this.citymodel.CityObjects, function(value, key) {
          var regex = RegExp(this.search_term, "i");
          var obj_json = JSON.stringify(value);
          return regex.test(key) | regex.test(obj_json);
        });

        return result;
      }
    },
    methods: {
      reset() {
        this.citymodel = {};
        this.search_term = "";
        this.file_loaded = false;
      },
      matches(coid, cityobject) {
        var regex = RegExp(this.search_term, "i");
        var obj_json = JSON.stringify(cityobject);
        return regex.test(coid) | regex.test(obj_json);
      },
      selectedFile() {
        console.log("Selected a CityJSON file...");
        console.log(this.$refs.cityJSONFile.files[0]);

        let file = this.$refs.cityJSONFile.files[0];
        if (!file || file.type != "application/json")
        {
          console.log("This is not a JSON file at all!!!");
          return;
        }

        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = evt => {
          cm = JSON.parse(evt.target.result);

          this.citymodel = cm;

          this.file_loaded = true;
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