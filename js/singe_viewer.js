var app = new Vue({
    el: '#app',
    data: {
      file_loaded: false,
      search_term: "",
      citymodel: {}
    },
    methods: {
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
      downloadVersion(vid) {
        text = JSON.stringify(this.activeCityModel);

        this.download(vid + ".json", text);
      }
    }
})

Vue.config.devtools = true