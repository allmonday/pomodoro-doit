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
        this.contacts = Contact.list()
        this.save = function(contact) {
            Contact.save(contact).then(update.bind(this))
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
        this.contact = m.prop(args.contact || new Contact())
    },
    view: function(ctrl, args) {
        var contact = ctrl.contact()

        return m("form", [
            m("label", "Name"),
            m("input", {oninput: m.withAttr("value", contact.name), value: contact.name()}),

            m("label", "Email"),
            m("input", {oninput: m.withAttr("value", contact.email), value: contact.email()}),

            m("button[type=button]", {onclick: args.onsave.bind(this, contact)}, "Save")
        ])
    }
}

var ContactList = {
    view: function(ctrl, args) {
        return m("table", [
            args.contacts().map(function(contact) {
                return m("tr", [
                    m("td", contact.id()),
                    m("td", contact.name()),
                    m("td", contact.email())
                ])
            })
        ])
    }
}

m.mount(document.body, ContactsWidget)