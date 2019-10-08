Vue.component('version-item', {
    props: ['version', 'vid'],
    template: '<li class="list-group-item"><div><p class="h5">{{ version.message }} (<span class="version-id">{{ vid | truncate(8) }}</span>)</p><footer class="version-info"><b>{{ version.author }}</b> committed on {{ version.date }}</footer></li>'
})

var app = new Vue({
    el: '#app',
    data: {
      versions: {
        "db244f6be3791d72c94b099fde8db2915c6a7041": { author: "Solid Snake", message: "Initial commit", date: new Date('2011-04-11T10:20:30Z') },
        "816590924a31e92959281353dda3ce5b3f70bf44": { author: "Liquid Snake", message: "Something fixed", date: new Date('2011-04-13T10:20:30Z') }
      }
    },
    computed: {
        orderedVersions: function() {
            return _.orderBy(this.versions, 'date', 'desc');
        }
    }
})