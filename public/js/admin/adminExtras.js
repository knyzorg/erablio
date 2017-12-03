$("body").on("click", "#addAnswer", (event) => {
    var index = $("#answers").data("count");
    $("#answers").append(`
    <div class="row">
        <div class="form-group col-md-6">
  <label for="answer${index}">Answer Text</label>
  <input name="answer${index}" class="form-control form-contro"/>
</div>
<div class="form-group col-md-4">
  <label for="code${index}">Answer Code</label>
  <input type="number" name="code${index}" class="form-control"/>
</div>
<div class="form-group col-md-2">
  <input type="button" value="remove" class="removeAnswer btn btn-secondary form-control"/>
</div></div>
    `)
    $("#answers").data("count", index + 1);
})

$("body").on("click", ".removeAnswer", function (event) {
    $(this).parent().parent().remove();
});

$("body").on("change", ".hidefile input", function (event) {
    $(this).parent().parent().submit()
})

Vue.component("confirm-link", {
    props: {
        href: String
    },
    template: '<a :href="link" @click="confirm"><span v-if="!clicked"><slot></slot></span><span v-else>{{ inner }}</span></a>',
    data: function () {
        return {
            clicked: false,
            inner: "",
            link: "#",
            realLink: this.href
        }
    },
    methods: {
        confirm: function (event) {
            if (!this.clicked) {
                event.preventDefault();
                this.inner = "Are you sure?"
                this.clicked = true;
                this.link = this.realLink
                setTimeout(() => {
                    this.inner = ""
                    this.clicked = false;
                    this.link = "#"
                }, 3000)
            }

        }
    }
})

let vm = new Vue({
    el: '#app',
    data: {
        todo: {
            text: 'Learn Vue',
            isComplete: false
        }
    }
})