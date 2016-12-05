// define the model 

var Contact = function (data) {
    data = data || {};
    this.id = m.prop(data.id || "");
    this.name = m.prop(data.name || "");
    this.email = m.prop(data.email || "");
}

Contact.list = function (data) {
    return m.request({ method: "GET", url: "/api/contact", type: Contact});
}

Contact.save = function (data) {
    return m.request({method: "POST", url:"/api/contact", data: data });
}

var ContactsWidget = {
    controller: function update() {
        this.contacts = Contact.list();
        this.save = function(contact) {
            if (contact.name() && contact.email()) {
                Contact.save(contact).then(update.bind(this))
            } else {
                console.log("error")
            }
        }.bind(this)
    },
    view: function(ctrl) {
        return [
            m.component(ContactForm, {onsave: ctrl.save}),
            m.component(ContactList, {contacts: ctrl.contacts})
        ]
    }
}

var ContactForm = {
    controller: function(args) {
        var dirty = false;
        var emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        this.contact = m.prop(args.contact || new Contact())
        this.checkStatus = function (data, name) {
            var value = data[name]();
            if (!dirty) {
                return "";
            }
            switch (name) {
                case "name":
                    return (!!value)? "has-success" : "has-error";
                case "email":
                    return (emailReg.test(value))? "has-success" : "has-error";
            };
        };
        this.submit = function (contact) {
            dirty = true;
            args.onsave(contact);
        }
    },
    view: function(ctrl, args) {
        var contact = ctrl.contact()
        var checkStatus = ctrl.checkStatus;
        var submit = ctrl.submit;

        return m("form", [
            m("div.form-group", {class:  checkStatus(contact, "name")}, [
                m("label", "Name"),
                m("input.form-control[aria-description='nameblock']", {oninput: m.withAttr("value", contact.name), value: contact.name()}),
                m("span.help-block#name-block", "error message")                
            ]),

            m("div.form-group", {class:  checkStatus(contact, "email")}, [
                m("label", "Email"),
                m("input.form-control", {oninput: m.withAttr("value", contact.email), value: contact.email()}),
            ]),
            m("button.btn.btn-default[type=button]", {
                onclick: submit.bind(this, contact)
            }, "Save")
        ])
    }
}

var ContactList = {
    view: function(ctrl, args) {
        return m("table.table", [
            m("thead", [
                m("tr", [
                    m("th", "Id"),
                    m("th", "Name"),
                    m("th", "Email"),
                ])
            ]),
            m("tbody", 
                args.contacts().map(function(contact) {
                    return m("tr", [
                        m("td", contact.id()),
                        m("td", contact.name()),
                        m("td", contact.email())
                    ])
                })
            )
        ])
    }
}

m.mount(document.getElementsByTagName("mail-widget")[0], ContactsWidget)