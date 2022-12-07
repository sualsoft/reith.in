const microQuery = function (e) {
  return (
    (this.selector = e || null),
    (this.elements = []),
    (this.length = 0),
    (this.microQueryVersion = "0.2.5"),
    this
  );
};
(microQuery.prototype.init = function () {
  if (0 === this.elements.length && null !== this.selector)
    switch (typeof this.selector) {
      case "object":
        if (void 0 !== this.selector.nodeName)
          "#document" === this.selector.nodeName
            ? (this.elements.push(this.selector), (this.selector = "document"))
            : (this.elements.push(this.selector), (this.selector = null));
        else if (void 0 !== this.selector.window)
          this.elements.push(this.selector), (this.selector = "window");
        else if (void 0 !== this.selector.microQueryVersion)
          return this.selector;
        break;
      case "string":
        if ("<" === this.selector.trim().substr(0, 1)) {
          const e = document.createElement("template");
          e.innerHTML = this.selector.trim();
          for (let t = 0; t < e.content.childNodes.length; t++)
            this.elements.push(e.content.childNodes[t]);
          this.selector = null;
        } else
          "document" === this.selector
            ? this.elements.push(document)
            : "window" === this.selector
            ? this.elements.push(window)
            : (this.elements = Array.from(
                document.querySelectorAll(this.selector)
              ));
    }
  return (
    this.elements.forEach((e) => {
      void 0 === e.microQueryData &&
        (e.microQueryData = { events: {}, customdataset: {} });
    }),
    (this.length = this.elements.length),
    this
  );
}),
  (microQuery.prototype.eventHandler = {
    bind: function (e, t, i) {
      this.unbind(e, i), i.addEventListener(e.split(".")[0], t, !0);
    },
    bindAllFromStorage: function (e) {
      const t = Object.entries(this.getAll(e));
      if (t.length > 0)
        for (let [i, n] of t)
          new microQuery(e).init().on(i, n.target, n.userCallback);
    },
    get: function (e, t) {
      return void 0 !== t.microQueryData.events[e]
        ? t.microQueryData.events[e]
        : null;
    },
    getAll: function (e) {
      return e.microQueryData.events;
    },
    unbind: function (e, t) {
      const i = this.get(e, t);
      null !== i && t.removeEventListener(e.split(".")[0], i.callback, !0);
    },
  }),
  (microQuery.prototype.stringOperations = {
    toCamelCase: (e) =>
      e
        .split("-")
        .map((e, t) => (t > 0 ? e[0].toUpperCase() : e[0]) + e.slice(1))
        .join(""),
  }),
  (microQuery.prototype.on = function (e, t, i) {
    const n = this;
    let r = function () {};
    return (
      "function" == typeof t
        ? (r = t)
        : ((t = t.trim()),
          (r = function (e) {
            let r = !1,
              o = n.find(t);
            if (
              (o.elements.forEach((t) => {
                t === e.target &&
                  ((r = !0), i.call(new microQuery(e.target).init(), e));
              }),
              !r)
            ) {
              new microQuery(e.target)
                .init()
                .parents(">" === t[0] ? t.slice(1) : t)
                .elements.some((t) =>
                  o.elements.some((n) => {
                    if (n === t) return i.call(new microQuery(n).init(), e), !0;
                  })
                );
            }
          })),
      this.elements.forEach((n) => {
        let o = function (e) {
          r.call(new microQuery(n).init(), e);
        };
        this.eventHandler.bind(e, o, n),
          (n.microQueryData.events[e] = {
            target: t,
            userCallback: i,
            callback: o,
          });
      }),
      this
    );
  }),
  (microQuery.prototype.off = function (e) {
    return (
      this.each((t) => {
        if (void 0 !== e)
          t.eventHandler.unbind(e, t.elements[0]),
            delete t.elements[0].microQueryData.events[e];
        else {
          for (let e of Object.keys(t.eventHandler.getAll(t.elements[0])))
            t.eventHandler.unbind(e, t.elements[0]);
          t.elements[0].microQueryData.events = {};
        }
      }),
      this
    );
  }),
  (microQuery.prototype.trigger = function (e, t) {
    let i,
      n = !1;
    return (
      document.createEvent
        ? (i = document.createEvent("HTMLEvents")).initEvent(e, !0, !0)
        : ((n = !0), ((i = document.createEventObject()).eventType = e)),
      (i.eventName = e),
      void 0 !== t && (i.mentenEventData = t),
      this.elements.forEach((e) => {
        n ? e.fireEvent("on" + i.eventType, i) : e.dispatchEvent(i);
      }),
      this
    );
  }),
  (microQuery.prototype.click = function () {
    return this.trigger("click");
  }),
  (microQuery.prototype.clone = function () {
    function e(t) {
      let i = t.cloneNode();
      Object.keys(t).forEach((e) => {
        i[e] = (function e(t) {
          if ("[object Array]" === Object.prototype.toString.call(t)) {
            let i = [];
            for (let n = 0; n < t.length; n++) i[n] = e(t[n]);
            return i;
          }
          if ("object" == typeof t) {
            let i = {};
            for (let n in t) t.hasOwnProperty(n) && (i[n] = e(t[n]));
            return i;
          }
          return t;
        })(t[e]);
      });
      for (let n = 0; n < t.childNodes.length; n++)
        i.appendChild(e(t.childNodes[n]));
      return i;
    }
    const t = new microQuery();
    return (
      this.each((i) => {
        let n = new microQuery(e(i.elements[0])).init();
        n.eventHandler.bindAllFromStorage(n.elements[0]),
          n
            .find("*")
            .each((e) => e.eventHandler.bindAllFromStorage(e.elements[0])),
          t.elements.push(n.elements[0]);
      }),
      t.init()
    );
  }),
  (microQuery.prototype.val = function (e) {
    return void 0 === e && this.length > 0
      ? this.elements[0].value
      : (this.elements.forEach((t) => (t.value = e)), this);
  }),
  (microQuery.prototype.focus = function (e) {
    const t = this;
    return (
      void 0 === e && (e = { preventScroll: !0 }),
      t.length > 0 &&
        setTimeout(function () {
          t.elements[0].focus(e);
        }, 1),
      t
    );
  }),
  (microQuery.prototype.select = function () {
    try {
      this.length > 0 && this.elements[0].select();
    } catch (e) {}
    return this;
  }),
  (microQuery.prototype.next = function () {
    const e = new microQuery();
    return (
      this.each(
        (t) =>
          null === t.elements[0].nextElementSibling ||
          e.elements.push(t.elements[0].nextElementSibling)
      ),
      e.init()
    );
  }),
  (microQuery.prototype.prev = function () {
    const e = new microQuery();
    return (
      this.each(
        (t) =>
          null === t.elements[0].previousElementSibling ||
          e.elements.push(t.elements[0].previousElementSibling)
      ),
      e.init()
    );
  }),
  (microQuery.prototype.append = function (html) {
    return "object" != typeof html &&
      "<" !== html.toString().trim().substr(0, 1)
      ? (this.elements.forEach((e) => (e.innerHTML = e.innerHTML + html)), this)
      : ("string" == typeof html && (html = new microQuery(html).init()),
        this.elements.forEach((e, t) =>
          (t < this.length - 1 ? html.clone() : html).elements.forEach((t) =>
            e.append(t)
          )
        ),
        html.elements.forEach((el) => {
          "SCRIPT" === el.nodeName && eval(el.innerHTML);
        }),
        html.find("script").elements.forEach((el) => eval(el.innerHTML)),
        this);
  }),
  (microQuery.prototype.prepend = function (html) {
    return "object" != typeof html &&
      "<" !== html.toString().trim().substr(0, 1)
      ? (this.elements.forEach((e) => (e.innerHTML = html + e.innerHTML)), this)
      : ("string" == typeof html && (html = new microQuery(html).init()),
        this.elements.forEach((e, t) =>
          (t < this.length - 1
            ? html.clone().elements
            : Array.from(html.elements)
          )
            .reverse()
            .forEach((t) => e.prepend(t))
        ),
        html.elements.forEach((el) => {
          "SCRIPT" === el.nodeName && eval(el.innerHTML);
        }),
        html.find("script").elements.forEach((el) => eval(el.innerHTML)),
        this);
  }),
  (microQuery.prototype.insertAfter = function (html) {
    return "object" != typeof html &&
      "<" !== html.toString().trim().substr(0, 1)
      ? (this.elements.forEach((e) =>
          e.parentNode.insertBefore(
            document.createTextNode(html),
            e.nextSibling
          )
        ),
        this)
      : ("string" == typeof html && (html = new microQuery(html).init()),
        this.elements.forEach((e, t) =>
          (t < this.length - 1
            ? html.clone().elements
            : Array.from(html.elements)
          )
            .reverse()
            .forEach((t) => e.parentNode.insertBefore(t, e.nextSibling))
        ),
        html.elements.forEach((el) => {
          "SCRIPT" === el.nodeName && eval(el.innerHTML);
        }),
        html.find("script").elements.forEach((el) => eval(el.innerHTML)),
        this);
  }),
  (microQuery.prototype.insertBefore = function (html) {
    return "object" != typeof html &&
      "<" !== html.toString().trim().substr(0, 1)
      ? (this.elements.forEach((e) =>
          e.parentNode.insertBefore(document.createTextNode(html), e)
        ),
        this)
      : ("string" == typeof html && (html = new microQuery(html).init()),
        this.elements.forEach((e, t) =>
          (t < this.length - 1
            ? html.clone().elements
            : Array.from(html.elements)
          )
            .reverse()
            .forEach((t) => e.parentNode.insertBefore(t, e))
        ),
        html.elements.forEach((el) => {
          "SCRIPT" === el.nodeName && eval(el.innerHTML);
        }),
        html.find("script").elements.forEach((el) => eval(el.innerHTML)),
        this);
  }),
  (microQuery.prototype.wrap = function (e) {
    const t = new microQuery(e).init();
    return (
      t.length > 0
        ? this.each((e) => {
            const i = new microQuery(t.elements[0]).init().clone();
            e.insertBefore(i),
              0 === i.children().length
                ? i.append(e)
                : i.find("*").some((t) => {
                    if (0 === t.children().length) return t.append(e), !0;
                  });
          })
        : console.error("wrapper element length === 0", t),
      this
    );
  }),
  (microQuery.prototype.wrapInner = function (e) {
    const t = new microQuery(e).init();
    return (
      t.length > 0
        ? this.each((e) => {
            const i = new microQuery(t.elements[0]).init().clone(),
              n = new microQuery();
            e.elements[0].childNodes.forEach((e) => n.elements.push(e)),
              0 === i.children().length
                ? i.append(n)
                : i.find("*").some((e) => {
                    if (0 === e.children().length) return e.append(n), !0;
                  }),
              e.append(i);
          })
        : console.error("wrapper element length === 0", t),
      this
    );
  }),
  (microQuery.prototype.wrapAll = function (e) {
    const t = new microQuery(new microQuery(e).init().elements[0]).init();
    return (
      this.length > 0 &&
        (t.length > 0
          ? (new microQuery(this.elements[0]).init().insertBefore(t),
            0 === t.children().length
              ? t.append(this)
              : t.find("*").some((e) => {
                  if (0 === e.children().length) return e.append(this), !0;
                }))
          : console.error("wrapper element length === 0", t)),
      this
    );
  }),
  (microQuery.prototype.unwrap = function () {
    return (
      this.each((e) => {
        const t = new microQuery(),
          i = e.parents().first();
        i.elements[0].childNodes.forEach((e) => t.elements.push(e)),
          i.insertBefore(t.init()).remove();
      }),
      this
    );
  }),
  (microQuery.prototype.unwrapInner = function () {
    return (
      this.each((e) => {
        const t = new microQuery();
        e.elements[0].childNodes.forEach((e) => t.elements.push(e)),
          e.insertBefore(t.init()).remove();
      }),
      this
    );
  }),
  (microQuery.prototype.children = function () {
    return this.find("> *");
  }),
  (microQuery.prototype.sort = function () {
    const e = !1;
    let t = null,
      i = null;
    e &&
      (console.log(this),
      console.log("arguments:"),
      console.log(arguments),
      console.log(""));
    try {
      if (void 0 === arguments[0]) i = [["text"]];
      else if ("string" == typeof arguments[0])
        ["asc", "desc"].includes(arguments[0].toString().toLowerCase())
          ? (i = [["text", arguments[0]]])
          : ((i = [[arguments[0]]]),
            "string" == typeof arguments[1] && (i[0][1] = arguments[1]),
            "string" == typeof arguments[2] && (i[0][2] = arguments[2]));
      else if (Array.isArray(arguments[0]) && arguments[0].length > 0)
        if (Array.isArray(arguments[0][0])) i = arguments[0];
        else {
          i = [];
          for (let e = 0; e < arguments.length; e++) i[i.length] = arguments[e];
        }
      else {
        if (
          void 0 === arguments[0].sortBy ||
          !Array.isArray(arguments[0].sortBy) ||
          0 === arguments[0].sortBy.length
        )
          throw "(check simple sort) invalid sortBy";
        i = arguments[0].sortBy;
      }
      if (
        (e &&
          (console.log("sortBy:"),
          console.log(typeof i),
          console.log(i),
          console.log("")),
        i.forEach((e) => {
          if (!(Array.isArray(e) && e.length >= 1 && e.length <= 3))
            throw "(check sortBy) invalid sortBy";
          switch (e.length) {
            case 3:
              if (!["asc", "desc"].includes(e[2].toLowerCase()))
                throw (
                  "(check sortBy 3 params) invalid sortBy direction '" +
                  e[2] +
                  "'"
                );
            case 2:
              if (
                "text" === e[0].toLowerCase() &&
                !["asc", "desc"].includes(e[1].toLowerCase())
              )
                throw (
                  "(check sortBy 2 params) invalid sortBy direction '" +
                  e[1] +
                  "'"
                );
            case 1:
              if (!["text", "attr", "data"].includes(e[0].toLowerCase()))
                throw "(check sortBy) invalid sortBy type '" + e[0] + "'";
              if (
                ["attr", "data"].includes(e[0].toLowerCase()) &&
                "string" != typeof e[1]
              )
                throw (
                  "(check sortBy) invalid sortBy second param for type '" +
                  e[0] +
                  "'"
                );
          }
        }),
        void 0 === arguments[0] || void 0 === arguments[0].target)
      ) {
        const e = this.parents().first();
        if (1 !== e.length) throw "(check target - parent) invalid target";
        t = e;
      } else if ("string" == typeof arguments[0].target)
        t = new microQuery(arguments[0].target).init();
      else {
        if (void 0 === arguments[0].target.microQueryVersion)
          throw "(check target) invalid target";
        t = arguments[0].target;
      }
      e && (console.log("target:"), console.log(t), console.log("")),
        this.elements.sort((t, n) =>
          (function t(n, r, o) {
            let l = 0;
            void 0 !== o && (l = o);
            let s,
              a = i[l][0].toLowerCase(),
              c = null;
            void 0 !== i[l][1]
              ? ((s = i[l][1]), (c = void 0 !== i[l][2] ? i[l][2] : "asc"))
              : (s = "asc");
            let h = null,
              p = null;
            const u = new microQuery(n).init(),
              d = new microQuery(r).init();
            if (
              ("text" === a
                ? ((h = u.text()), (p = d.text()))
                : "attr" === a
                ? ((h = u.attr(s)), (p = d.attr(s)))
                : "data" === a && ((h = u.data(s)), (p = d.data(s))),
              null == h || null == p)
            )
              throw (
                "(check value - type '" +
                a +
                "' and value '" +
                s +
                "') null value"
              );
            return (
              e &&
                console.log(
                  "sortByIndex " +
                    l +
                    " - a: " +
                    h +
                    "(string = " +
                    isNaN(h) +
                    ") - b: " +
                    p +
                    "(string = " +
                    isNaN(p) +
                    ")"
                ),
              ("" !== h &&
                "" !== p &&
                !isNaN(h) &&
                !isNaN(p) &&
                parseFloat(h) < parseFloat(p)) ||
              ("" !== h &&
                "" !== p &&
                isNaN(h) &&
                isNaN(p) &&
                !isNaN(Date.parse(h)) &&
                !isNaN(Date.parse(p)) &&
                Date.parse(h) < Date.parse(p)) ||
              (isNaN(h) &&
                isNaN(p) &&
                h
                  .toString()
                  .toUpperCase()
                  .localeCompare(p.toString().toUpperCase()) < 0)
                ? ("text" === a && "asc" === s.toString().toLowerCase()) ||
                  (["attr", "data"].includes(a) &&
                    "asc" === c.toString().toLowerCase())
                  ? -1
                  : 1
                : ("" !== h &&
                    "" !== p &&
                    !isNaN(h) &&
                    !isNaN(p) &&
                    parseFloat(h) > parseFloat(p)) ||
                  ("" !== h &&
                    "" !== p &&
                    isNaN(h) &&
                    isNaN(p) &&
                    !isNaN(Date.parse(h)) &&
                    !isNaN(Date.parse(p)) &&
                    Date.parse(h) > Date.parse(p)) ||
                  (isNaN(h) &&
                    isNaN(p) &&
                    h
                      .toString()
                      .toUpperCase()
                      .localeCompare(p.toString().toUpperCase()) > 0)
                ? ("text" === a && "asc" === s.toString().toLowerCase()) ||
                  (["attr", "data"].includes(a) &&
                    "asc" === c.toString().toLowerCase())
                  ? 1
                  : -1
                : void 0 === i[++l]
                ? 0
                : t(n, r, l)
            );
          })(t, n)
        ),
        t.html(""),
        this.elements.forEach((e) => t.append(new microQuery(e).init()));
    } catch (e) {
      return console.error(e), console.warn("no sorting done!"), this;
    }
    return e && console.log(this), this;
  }),
  (microQuery.prototype.replace = function (e) {
    return this.insertAfter(e), this.remove(), this;
  }),
  (microQuery.prototype.remove = function () {
    return this.elements.forEach((e) => e.remove()), this;
  }),
  (microQuery.prototype.html = function (e) {
    return void 0 === e && this.length > 0
      ? this.elements[0].innerHTML
      : (this.elements.forEach((t) => {
          (t.innerHTML = ""), new microQuery(t).init().append(e);
        }),
        this);
  }),
  (microQuery.prototype.text = function (e) {
    return void 0 === e && this.length > 0
      ? this.elements[0].textContent
      : (this.elements.forEach((t) => {
          t.innerText = e;
        }),
        this);
  }),
  (microQuery.prototype.addClass = function (e) {
    return this.elements.forEach((t) => t.classList.add(...e.split(" "))), this;
  }),
  (microQuery.prototype.removeClass = function (e) {
    return (
      this.elements.forEach((t) => t.classList.remove(...e.split(" "))), this
    );
  }),
  (microQuery.prototype.toggleClass = function (e) {
    return (
      this.elements.forEach((t) =>
        e.split(" ").forEach((e) => t.classList.toggle(e))
      ),
      this
    );
  }),
  (microQuery.prototype.hasClass = function (e) {
    return this.elements.some((t) => t.classList.contains(e));
  }),
  (microQuery.prototype.data = function (e, t) {
    if (this.length > 0) {
      if (
        ((e = e
          .split("-")
          .map((e, t) => (t > 0 ? e[0].toUpperCase() : e[0]) + e.slice(1))
          .join("")),
        void 0 === t)
      )
        return void 0 !== this.elements[0].microQueryData.customdataset[e]
          ? this.elements[0].microQueryData.customdataset[e]
          : void 0 !== this.elements[0].dataset[e]
          ? this.elements[0].dataset[e]
          : null;
      null !== t
        ? this.each((i) => {
            (i.elements[0].dataset[e] = t),
              (i.elements[0].microQueryData.customdataset[e] = t);
          })
        : this.each((t) => {
            t.elements[0].removeAttribute(
              "data-" +
                e
                  .split(/(?=[A-Z])/)
                  .join("-")
                  .toLowerCase()
            ),
              void 0 !== t.elements[0].microQueryData.customdataset[e] &&
                delete t.elements[0].microQueryData.customdataset[e];
          });
    }
    return this;
  }),
  (microQuery.prototype.attr = function (e, t) {
    if (this.length > 0) {
      if (
        ((e = e
          .split("-")
          .map((e, t) => (t > 0 ? e[0].toUpperCase() : e[0]) + e.slice(1))
          .join("")),
        void 0 === t)
      )
        return null !== this.elements[0].attributes.getNamedItem(e)
          ? this.elements[0].attributes.getNamedItem(e).value
          : null;
      null !== t
        ? this.each((i) => i.elements[0].setAttribute(e, t))
        : this.each((t) =>
            t.elements[0].removeAttribute(
              e
                .split(/(?=[A-Z])/)
                .join("-")
                .toLowerCase()
            )
          );
    }
    return this;
  }),
  (microQuery.prototype.find = function (e) {
    e = (e = e.trim()).replace(":selected", ":checked");
    const t = new microQuery();
    return (
      this.elements.forEach((i) => {
        if (-1 === ["#text", "#comment"].indexOf(i.nodeName))
          try {
            t.elements = t.elements.concat(
              Array.from(i.querySelectorAll(":scope " + e))
            );
          } catch (n) {
            const r = Date.now() + "";
            i.setAttribute("data-scope-uuid", r),
              (t.elements = t.elements.concat(
                Array.from(
                  i.querySelectorAll("[data-scope-uuid='" + r + "'] " + e)
                )
              )),
              i.removeAttribute("data-scope-UUID");
          }
      }),
      t.init()
    );
  }),
  (microQuery.prototype.each = function (e) {
    return (
      "function" == typeof e &&
        this.elements.forEach((t, i) => e(new microQuery(t).init(), i)),
      this
    );
  }),
  (microQuery.prototype.some = function (e) {
    return (
      "function" == typeof e &&
        this.elements.some((t, i) => e(new microQuery(t).init(), i)),
      this
    );
  }),
  (microQuery.prototype.first = function () {
    const e = new microQuery();
    return (
      void 0 !== this.elements[0] && e.elements.push(this.elements[0]), e.init()
    );
  }),
  (microQuery.prototype.serialize = function () {
    return void 0 !== this.elements[0] && "FORM" === this.elements[0].tagName
      ? new FormData(this.elements[0])
      : new FormData();
  }),
  (microQuery.prototype.parents = function (e) {
    const t = new microQuery();
    let i;
    return (
      void 0 !== e && (i = new microQuery(e).init()),
      this.elements.forEach((n) => {
        let r = n;
        do {
          (r = r.parentNode),
            void 0 === e || null == i
              ? t.elements.push(r)
              : i.elements.forEach((e) => {
                  e === r && t.elements.push(r);
                });
        } while (null !== r && "#document" !== r.nodeName);
      }),
      t.init()
    );
  }),
  (microQuery.prototype.is = function (e) {
    let t = new microQuery();
    switch (typeof e) {
      case "object":
        void 0 !== e.nodeName
          ? t.elements.push(e)
          : void 0 !== e.microQueryVersion && (t = e);
    }
    return (
      t.init(),
      this.elements.some((e) =>
        t.elements.some((t) => {
          if (e === t) return !0;
        })
      )
    );
  }),
  (microQuery.prototype.index = function () {
    return this.length > 0
      ? Array.from(this.elements[0].parentNode.children).indexOf(
          this.elements[0]
        )
      : null;
  }),
  (microQuery.prototype.css = function (e, t) {
    return void 0 !== t
      ? (this.elements.forEach((i) => (i.style[e] = t)), this)
      : this.elements[0].style[e] || null;
  }),
  (microQuery.prototype.table = function (e) {
    const t = function (t) {
      (this.el = {}),
        (this.el.wrapper = null),
        (this.el.scrollWrapper = null),
        (this.el.table = t),
        (this.el.filter = { wrapper: null, allSearch: null }),
        (this.el.head = { wrapper: null, original: null, cloned: null }),
        (this.el.body = { wrapper: null, original: null }),
        (this.el.foot = { wrapper: null, original: null, cloned: null }),
        (this.el.rowInfo = { wrapper: null }),
        (this.options = {
          default: {
            columnTypes: [],
            oddEven: !0,
            rowCountInfo: !0,
            rowCountInfoText1: "Zeige #1# Einträge",
            rowCountInfoText2: "Zeige #1# bis #2# von #3# Einträgen",
            rowCountInfoText3: "(gefiltert aus insgesamt #1# Einträgen)",
            emptyTableMessage: "Keine passenden Einträge gefunden",
            scrollY: "",
            scrollX: !1,
            scrollCollapse: !1,
            sort: !0,
            initSortColumn: 1,
            initSortDirection: "asc",
            sortableColumns: [],
            allowSorting: !0,
            sortArrows:
              "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 85'><path id='sortArrowAsc' class='sortArrow' d='M30 20L40 40L20 40L0 40L10 20L20 0L30 20Z' fill='#000000'></path><path id='sortArrowDesc' class='sortArrow' d='M30 65L40 45L20 45L0 45L10 65L20 85L30 65Z' fill='#000000'></path></svg>",
            sortArrowColor: "#000",
            filter: { allSearch: !0 },
            pagination: !1,
            dateLang: "en-US",
            dateOptions: {},
          },
          user: {},
        });
      const i = function (e) {
        this.tObj = e;
      };
      (i.prototype.init = function () {
        this.emptyTableCheck() || this.renderOddEven();
      }),
        (i.prototype.createRow = function () {
          const e = new microQuery("<tr></tr>").init();
          for (let t = 0; t < this.tObj.cols.length; t++)
            e.append(
              "<td>" + (void 0 !== arguments[t] ? arguments[t] : "") + "</td>"
            );
          return (
            this.renderCells(e),
            this.tObj.el.body.original.append(e),
            this.tObj.update(),
            e
          );
        }),
        (i.prototype.readRow = function (e) {
          return this.tObj.el.body.original.find(
            "> tr:nth-child(" + (parseInt(e) + 1) + "):not(.d3Table_empty)"
          );
        }),
        (i.prototype.updateRow = function (e, t) {
          if ((e = new microQuery(e).init()).length > 0) {
            for (let i in t) {
              let n = e.find("> td:nth-child(" + (parseInt(i) + 1) + ")");
              n.length > 0 && n.html(t[parseInt(i)]).data("raw-value", null);
            }
            this.renderCells(e), this.tObj.update();
          }
          return e;
        }),
        (i.prototype.deleteRow = function (e) {
          (e = new microQuery(e).init()).remove(), this.tObj.update();
        }),
        (i.prototype.get = function (e) {
          const t = this.tObj.el.body.original.find("> tr:not(.d3Table_empty)");
          if ("boolean" == typeof e && !0 === e) {
            let e = new microQuery();
            return (
              t.each((t) => {
                "collapse" !==
                  window.getComputedStyle(t.elements[0]).visibility &&
                  "hidden" !==
                    window.getComputedStyle(t.elements[0]).visibility &&
                  "none" !== window.getComputedStyle(t.elements[0]).display &&
                  e.elements.push(t.elements[0]);
              }),
              e.init()
            );
          }
          return t;
        }),
        (i.prototype.renderCells = function (e) {
          const t = this.tObj.getMergedOptions();
          e.find("> td").each((e) => {
            if (null === e.data("raw-value")) {
              let i = e.text();
              switch (t.columnTypes[e.index()]) {
                case "int":
                  i = "" !== i ? parseInt(i) : "";
                  break;
                case "float":
                  i = "" !== i ? parseFloat(i) : "";
                  break;
                case "date":
                  e.text(new Date(i).toLocaleString(t.dateLang, t.dateOptions));
              }
              e.data("raw-value", i);
            }
          });
        }),
        (i.prototype.renderOddEven = function () {
          if (!this.emptyTableCheck()) {
            this.tObj.getMergedOptions().oddEven &&
              this.get(!0).each((e, t) =>
                e
                  .removeClass("odd even")
                  .addClass((t + 1) % 2 == 0 ? "even" : "odd")
              );
          }
          return this;
        }),
        (i.prototype.renderRowCountInfo = function () {
          const e = this.tObj.getMergedOptions();
          if (e.rowCountInfo) {
            const t = this.get(),
              i = this.get(!0);
            let n = "";
            (n = e.pagination
              ? e.rowCountInfoText2
                  .replace("#1#", i.length > 0 ? "1" : "0")
                  .replace("#2#", i.length)
                  .replace("#3#", i.length)
              : e.rowCountInfoText1.replace("#1#", i.length)),
              t.length !== i.length &&
                (n += " " + e.rowCountInfoText3.replace("#1#", t.length)),
              this.tObj.el.rowInfo.wrapper.html(n);
          }
          return this;
        }),
        (i.prototype.emptyTableCheck = function () {
          const e = this.tObj.getMergedOptions();
          return 0 === this.get(!0).length
            ? (0 === this.tObj.el.body.original.find(".d3Table_empty").length &&
                this.tObj.el.body.original.append(
                  "<tr class='d3Table_empty'><td colspan='" +
                    this.tObj.cols.length +
                    "'>" +
                    e.emptyTableMessage +
                    "</td></tr>"
                ),
              !0)
            : (this.tObj.el.body.original.find(".d3Table_empty").remove(), !1);
        }),
        (this.rows = new i(this));
      const n = function (t) {
        (this.tObj = t),
          (this.length = 0),
          (this.types = e.columnTypes),
          (this.sortDirection = e.initSortDirection),
          (this.sortColumnNum = e.initSortColumn);
      };
      return (
        (n.prototype.init = function () {
          this.tObj.rows.get().each((e) => this.tObj.rows.renderCells(e)),
            (this.length = 0),
            this.tObj.el.head.original
              .find("tr:first-child > th,tr:first-child > td")
              .each((e) => {
                const t = parseInt(e.attr("colspan"));
                this.length += isNaN(t) ? 1 : t;
              });
        }),
        (this.cols = new n(this)),
        this
      );
    };
    (t.prototype.setUserOptions = function (e) {
      return (this.options.user = e), this;
    }),
      (t.prototype.getDefautOptions = function () {
        return this.options.default;
      }),
      (t.prototype.getUserOptions = function () {
        return this.options.user;
      }),
      (t.prototype.getMergedOptions = function () {
        return Object.assign({}, this.options.default, this.options.user);
      }),
      (t.prototype.update = function () {
        this.filter(),
          this.sort(this.cols.sortColumnNum, this.cols.sortDirection),
          this.rows.renderOddEven(),
          this.rows.renderRowCountInfo();
      }),
      (t.prototype.sort = function (e, t) {
        const i = this.getMergedOptions();
        if (
          null != this.el.head.original &&
          i.sort &&
          Array.isArray(i.sortableColumns) &&
          !isNaN(e) &&
          (0 === i.sortableColumns.length ||
            -1 !== i.sortableColumns.indexOf(e))
        ) {
          let i = this.el.head.cloned;
          null === i && (i = this.el.head.original);
          const n = i.find("th:nth-child(" + e + "), td:nth-child(" + e + ")");
          let r = "asc";
          "string" == typeof t &&
          -1 !== ["asc", "desc"].indexOf(t.toLowerCase())
            ? (r = t)
            : n.hasClass("asc") && (r = "desc"),
            n.parents("tr").first().find("th, td").removeClass("asc desc"),
            n.addClass(r);
          const o = this.rows.get();
          o.length > 0 &&
            (o.each((t) =>
              t.data(
                "temp-sort-value",
                t.find("> td:nth-child(" + e + ")").data("raw-value")
              )
            ),
            o.sort("data", "temp-sort-value", r),
            o.each((e) => e.data("temp-sort-value", null))),
            this.rows.renderOddEven(),
            (this.cols.sortDirection = r),
            (this.cols.sortColumnNum = e);
        }
        return this;
      }),
      (t.prototype.filter = function () {
        const e = this.getMergedOptions();
        if (null !== this.el.filter.allSearch) {
          const t = this.el.filter.allSearch.val().toLowerCase();
          this.rows.get().each((i) => {
            i.removeClass("searchAll_hidden");
            let n = i.text();
            Array.isArray(e.filter.allSearch) &&
              ((n = ""),
              e.filter.allSearch.forEach(
                (e) => (n += i.find(":nth-child(" + (e + 1) + ")").text() + " ")
              )),
              -1 === n.toLowerCase().indexOf(t) &&
                i.addClass("searchAll_hidden");
          });
        }
      }),
      (t.prototype.init = function () {
        if (
          void 0 !== this.el.table.elements[0].microQueryData &&
          void 0 !== this.el.table.elements[0].microQueryData.tableObj &&
          null !== this.el.table.elements[0].microQueryData.tableObj
        )
          return console.warn("multiple init on same table."), null;
        this.el.table.elements[0].microQueryData.tableObj = this;
        const e = this.getMergedOptions();
        return (
          (this.el.wrapper = new microQuery(
            "<div class='d3Table_wrapper'></div>"
          ).init()),
          this.el.table.insertBefore(this.el.wrapper),
          this.el.wrapper.append(this.el.table),
          this.el.table.addClass("d3Table").attr("table-type", "original"),
          (this.el.head.original = this.el.table.find("> thead")),
          0 === this.el.head.original.length && (this.el.head.original = null),
          (this.el.body.original = this.el.table.find("> tbody")),
          0 === this.el.body.original.length && (this.el.body.original = null),
          (this.el.foot.original = this.el.table.find("> tfoot")),
          0 === this.el.foot.original.length && (this.el.foot.original = null),
          this.cols.init(),
          this.rows.init(),
          this.initFilter(e),
          this.initRowInfo(e),
          this.initSorting(e),
          this.initScrollableTable(e),
          this
        );
      }),
      (t.prototype.initFilter = function () {
        const e = this.getMergedOptions();
        if (
          ("boolean" == typeof e.filter.allSearch &&
            !0 === e.filter.allSearch) ||
          Array.isArray(e.filter.allSearch)
        ) {
          if (
            ((this.el.filter.wrapper = new microQuery(
              "<div class='d3Table_filter'></div>"
            ).init()),
            ("boolean" == typeof e.filter.allSearch &&
              !0 === e.filter.allSearch) ||
              Array.isArray(e.filter.allSearch))
          ) {
            this.el.filter.allSearch = new microQuery(
              "<input class='allSearch' type='search' placeholder='Suche' />"
            ).init();
            let e = null;
            this.el.filter.allSearch.on("input", (t) => {
              null !== e && clearTimeout(e),
                (e = setTimeout(() => this.update(), 500));
            }),
              this.el.filter.wrapper.append(this.el.filter.allSearch);
          }
          this.el.wrapper.prepend(this.el.filter.wrapper);
        }
      }),
      (t.prototype.initRowInfo = function () {
        this.getMergedOptions().rowCountInfo &&
          ((this.el.rowInfo.wrapper = new microQuery(
            "<div class='d3Table_rowInfo'></div>"
          ).init()),
          this.rows.renderRowCountInfo(),
          this.el.wrapper.append(this.el.rowInfo.wrapper));
      }),
      (t.prototype.initSorting = function () {
        const e = this.getMergedOptions();
        if (
          null != this.el.head.original &&
          e.sort &&
          "number" == typeof e.initSortColumn &&
          e.initSortColumn > 0
        ) {
          const t = this.el.head.original.find("> tr:last-child > th");
          if (t.length > 0) {
            if (e.allowSorting) {
              const i = this,
                n = window.getComputedStyle(t.elements[0]),
                r =
                  parseFloat(n.getPropertyValue("height")) -
                  parseFloat(n.getPropertyValue("padding-top")) -
                  parseFloat(n.getPropertyValue("padding-bottom")),
                o = new microQuery(e.sortArrows).init();
              o.css("position", "absolute"),
                o.css("height", "calc(0.8 * " + r + "px)"),
                o.css("right", "10px"),
                o.css("margin-top", "calc(0.1 * " + r + "px)"),
                o.find(".sortArrow").attr("fill", e.sortArrowColor),
                t.each((t) => {
                  !Array.isArray(e.sortableColumns) ||
                    (0 !== e.sortableColumns.length &&
                      -1 ===
                        e.sortableColumns.indexOf(
                          t.elements[0].cellIndex + 1
                        )) ||
                    ("" === t.html() && t.html("&nbsp;"),
                    t.css("position", "relative"),
                    t.css("cursor", "pointer"),
                    t.append(o.clone()));
                }),
                this.el.head.original.on(
                  "click.sorting",
                  "> tr > th",
                  function () {
                    i.sort(this.elements[0].cellIndex + 1);
                  }
                );
            }
            "number" == typeof e.initSortColumn &&
              e.initSortColumn <= t.length &&
              this.sort(e.initSortColumn, e.initSortDirection);
          }
        }
      }),
      (t.prototype.initScrollableTable = function () {
        const e = this.getMergedOptions();
        if ("string" == typeof e.scrollY && "" !== e.scrollY) {
          if (
            ((this.el.scrollWrapper = new microQuery(
              "<div class='d3Table_scroll'></div>"
            ).init()),
            this.el.table.insertBefore(this.el.scrollWrapper),
            null != this.el.head.original)
          ) {
            (this.el.head.wrapper = new microQuery(
              "<div class='d3Table_head'><div class='d3Table_headInner'><table class='d3Table' table-type='helper'></table></div></div>"
            ).init()),
              (this.el.head.cloned = this.el.head.original.clone()),
              this.el.head.original.find("th,td").wrapInner("<div></div>"),
              this.el.head.wrapper.find("table").append(this.el.head.cloned);
            const e = new ResizeObserver((e) => {
              for (let t of e)
                this.el.head.cloned
                  .find("th:nth-child(" + (t.target.cellIndex + 1) + ")")
                  .css("width", t.target.clientWidth + "px");
              this.el.head.wrapper
                .find(".d3Table_headInner")
                .css(
                  "width",
                  this.el.body.wrapper.elements[0].clientWidth + "px"
                );
            });
            this.el.head.original.find("th").each((t, i) => {
              this.el.head.cloned
                .find("th:nth-child(" + (i + 1) + ")")
                .css("width", t.elements[0].clientWidth + "px"),
                e.observe(t.elements[0]);
            }),
              this.el.scrollWrapper.append(this.el.head.wrapper);
          }
          if (
            (null != this.el.body.original &&
              ((this.el.body.wrapper = new microQuery(
                "<div class='d3Table_body'></div>"
              ).init()),
              this.el.body.wrapper.append(this.el.table),
              this.el.scrollWrapper.append(this.el.body.wrapper)),
            null != this.el.foot.original)
          ) {
            (this.el.foot.wrapper = new microQuery(
              "<div class='d3Table_foot'><div class='d3Table_footInner'><table class='d3Table' table-type='helper'></table></div></div>"
            ).init()),
              (this.el.foot.cloned = this.el.foot.original.clone()),
              this.el.foot.original.find("th,td").wrapInner("<div></div>"),
              this.el.foot.wrapper.find("table").append(this.el.foot.cloned);
            const e = new ResizeObserver((e) => {
              for (let t of e)
                this.el.foot.cloned
                  .find("td:nth-child(" + (t.target.cellIndex + 1) + ")")
                  .css("width", t.target.clientWidth + "px");
              this.el.foot.original.elements[0].clientWidth <
                this.el.foot.cloned.elements[0].clientWidth &&
                this.el.foot.wrapper
                  .find(".d3Table_footInner")
                  .css(
                    "padding-right",
                    this.el.foot.cloned.elements[0].clientWidth -
                      this.el.foot.original.elements[0].clientWidth +
                      "px"
                  );
            });
            this.el.foot.original.find("td").each((t, i) => {
              this.el.foot.cloned
                .find("td:nth-child(" + (i + 1) + ")")
                .css("width", t.elements[0].clientWidth + "px"),
                e.observe(t.elements[0]);
            }),
              this.el.scrollWrapper.append(this.el.foot.wrapper);
          }
          this.el.body.wrapper.css("overflow-y", "scroll");
          let t = e.scrollY;
          if ("auto" === t) {
            this.el.body.original.css("visibility", "collapse");
            const e = window.getComputedStyle(
              this.el.wrapper.elements[0].parentNode
            );
            if (
              ((t =
                parseFloat(e.height + 0) -
                parseFloat(e.paddingTop + 0) -
                parseFloat(e.paddingBottom + 0)),
              (t -=
                this.el.table.elements[0].getBoundingClientRect().top -
                this.el.wrapper.elements[0].parentNode.getBoundingClientRect()
                  .top -
                parseFloat(e.paddingTop + 0)),
              null !== this.el.foot.wrapper)
            ) {
              const e = window.getComputedStyle(
                this.el.foot.wrapper.elements[0]
              );
              t -=
                parseFloat(e.height + 0) +
                parseFloat(e.paddingTop + 0) +
                parseFloat(e.paddingBottom + 0) +
                parseFloat(e.marginTop + 0) +
                parseFloat(e.marginBottom + 0);
            }
            if (null !== this.el.rowInfo.wrapper) {
              const e = window.getComputedStyle(
                this.el.rowInfo.wrapper.elements[0]
              );
              t -=
                parseFloat(e.height + 0) +
                parseFloat(e.paddingTop + 0) +
                parseFloat(e.paddingBottom + 0) +
                parseFloat(e.marginTop + 0) +
                parseFloat(e.marginBottom + 0);
            }
            (t += "px"), this.el.body.original.css("visibility", null);
          }
          this.el.body.wrapper.css(
            e.scrollCollapse ? "max-height" : "height",
            t
          );
        }
        "boolean" == typeof e.scrollX && e.scrollX;
      });
    const i = [];
    return (
      this.each((n) => {
        if ("TABLE" === n.elements[0].tagName)
          if (
            void 0 !== n.elements[0].microQueryData &&
            void 0 !== n.elements[0].microQueryData.tableObj &&
            null !== n.elements[0].microQueryData.tableObj
          )
            i.push(n.elements[0].microQueryData.tableObj);
          else {
            const r = new t(n);
            r.setUserOptions(e), null !== r.init() && i.push(r);
          }
      }),
      0 === i.length ? null : 1 === i.length ? i[0] : i
    );
  }),
  (microQuery.prototype.upload = function (e) {
    if (
      this.length <= 0 ||
      "INPUT" !== this.elements[0].tagName.toUpperCase() ||
      "FILE" !== this.elements[0].type.toUpperCase()
    )
      return console.warn("no valid input[type='file']"), this;
    if (
      void 0 !== this.elements[0].microQueryData.uploadStatus &&
      null !== this.elements[0].microQueryData.uploadStatus
    )
      return console.warn("Upload is running"), this;
    if ("object" != typeof e || Array.isArray(e))
      return console.error("param is no object or is not set"), this;
    if ("string" != typeof e.url)
      return console.error("option.url is not set / no string"), this;
    const t = Array.isArray(e.files) ? e.files : this.elements[0].files;
    if (0 === t.length)
      return "function" == typeof e.noFileCallback && e.noFileCallback(), this;
    this.elements[0].microQueryData.uploadStatus = {
      el: this,
      options: e,
      status: "initialize",
      reader: new FileReader(),
      httpRequest: new XMLHttpRequest(),
      chunkSize:
        "number" == typeof e.chunkSize ? parseInt(e.chunkSize) : 1024e3,
      fileCount: null,
      size: 0,
      sizeDone: 0,
      percentDone: 0,
      currentFile: {
        nextChunkStart: null,
        index: null,
        file: null,
        extention: "",
        sizeDone: 0,
        percentDone: 0,
      },
      uploadFile: function () {},
      uploadChunk: function () {},
    };
    let i = this.elements[0].microQueryData.uploadStatus;
    i.fileCount = t.length;
    for (let e = 0; e < i.fileCount; e++) i.size += t[e].size;
    return (
      (i.reader.onload = (e) => {
        if (e.target.readyState !== FileReader.DONE) return;
        if (
          ((i.httpRequest.onreadystatechange = (t) => {
            t.target.readyState === XMLHttpRequest.DONE &&
              ((i.currentFile.sizeDone += e.loaded),
              (i.currentFile.percentDone = Math.floor(
                (i.currentFile.sizeDone / i.currentFile.file.size) * 100
              )),
              (i.sizeDone += e.loaded),
              (i.percentDone = Math.floor((i.sizeDone / i.size) * 100)),
              i.currentFile.nextChunkStart < i.currentFile.file.size
                ? i.uploadChunk(i.currentFile.nextChunkStart)
                : i.currentFile.index + 1 < i.fileCount
                ? i.uploadFile(i.currentFile.index + 1)
                : (i.status = "done"),
              "function" == typeof i.options.callback && i.options.callback(i),
              "done" === i.status &&
                (this.elements[0].microQueryData.uploadStatus = null));
          }),
          i.httpRequest.open("POST", i.options.url),
          "object" == typeof i.options.headers &&
            !Array.isArray(i.options.headers))
        )
          for (let e in i.options.headers)
            i.httpRequest.setRequestHeader(e, i.options.headers[e]);
        let t = new FormData();
        if (
          (t.append(
            "fileProperties",
            JSON.stringify({
              name: i.currentFile.file.name,
              ext: i.currentFile.extention,
              type: i.currentFile.file.type,
              size: i.currentFile.file.size,
              lastModified: i.currentFile.file.lastModified,
            })
          ),
          t.append("chunk", e.target.result),
          t.append(
            "done",
            i.currentFile.nextChunkStart >= i.currentFile.file.size
          ),
          "object" == typeof i.options.params &&
            !Array.isArray(i.options.params))
        )
          for (let e in i.options.params) t.append(e, i.options.params[e]);
        void 0 !== t.get("filename") && null !== t.get("filename")
          ? (i.currentFile.newFileName =
              t.get("filename") + i.currentFile.extention)
          : (i.currentFile.newFileName = i.currentFile.file.name),
          i.httpRequest.send(t);
      }),
      (i.uploadChunk = (e) => {
        i.currentFile.nextChunkStart = e + i.chunkSize + 1;
        let t = i.currentFile.file.slice(e, i.currentFile.nextChunkStart);
        i.reader.readAsDataURL(t);
      }),
      (i.uploadFile = (e) => {
        e + 1 > t.length ||
          ((i.status = "running"),
          (i.currentFile.file = t[e]),
          (i.currentFile.nextChunkStart = 0),
          (i.currentFile.sizeDone = 0),
          (i.currentFile.percentDone = 0),
          (i.currentFile.extention =
            i.currentFile.file.name.split(".").pop() !== i.currentFile.file.name
              ? "." + i.currentFile.file.name.split(".").pop()
              : ""),
          (i.currentFile.index = e),
          "function" == typeof i.options.callback && i.options.callback(i),
          i.uploadChunk(i.currentFile.nextChunkStart));
      }),
      i.uploadFile(0),
      this
    );
  }),
  (microQuery.prototype.pageOffset = function () {
    if (this.length > 0) {
      let e = { top: 0, left: 0 },
        t = this.elements[0];
      if (t.offsetParent)
        do {
          (e.top += t.offsetTop),
            (e.left += t.offsetLeft),
            (t = t.offsetParent);
        } while (t);
      return e;
    }
    return null;
  }),
  (microQuery.prototype.tooltip = function () {
    this.addClass("micro-tooltip__handle"),
      this.on("touch.micro-tooltip", function () {
        e(this);
      }),
      this.on("mouseover.micro-tooltip", function () {
        e(this);
      }),
      this.on("mouseout.micro-tooltip", function () {
        t();
      }),
      new microQuery(window)
        .init()
        .on("scroll.micro-tooltip", function () {
          t();
        })
        .on("click.micro-tooltip", function (e) {
          const i = new microQuery(e.target).init();
          i.hasClass("micro-tooltip__handle") ||
            i.hasClass("micro-tooltip") ||
            0 !== i.parents(".micro-tooltip__handle").length ||
            0 !== i.parents(".micro-tooltip").length ||
            t();
        });
    const e = function (e) {
        const i = e.data("tooltip-content");
        if (null !== i)
          if (e.data("tooltip-open")) t();
          else {
            const t = new microQuery(
              "<div class='micro-tooltip'>" + i + "</div>"
            ).init();
            t.css("position", "absolute")
              .css("background-color", "#fff")
              .css("border", "1px solid #000")
              .css("border-radius", "4px")
              .css("padding", "15px")
              .css("max-width", "400px")
              .css("z-index", "2");
            const n = new microQuery(
              "<div class='micro-tooltip__arrow'></div>"
            ).init();
            n
              .css("position", "absolute")
              .css("height", "0")
              .css("width", "0")
              .css("border", "8px solid transparent")
              .css("border-top-color", "#000"),
              t.append(n),
              new microQuery("body").init().append(t);
            const r = e.pageOffset();
            t
              .css("top", r.top - t.elements[0].offsetHeight - 12 + "px")
              .css(
                "left",
                r.left -
                  t.elements[0].offsetWidth / 2 +
                  e.elements[0].offsetWidth / 2 -
                  parseFloat(getComputedStyle(t.elements[0]).borderLeftWidth) +
                  "px"
              ),
              n
                .css(
                  "top",
                  t.elements[0].offsetHeight -
                    parseFloat(
                      getComputedStyle(t.elements[0]).borderBottomWidth
                    ) +
                    "px"
                )
                .css(
                  "left",
                  t.elements[0].offsetWidth / 2 -
                    n.elements[0].offsetWidth / 2 -
                    parseFloat(
                      getComputedStyle(t.elements[0]).borderLeftWidth
                    ) +
                    "px"
                ),
              e.data("tooltip-open", !0);
          }
      },
      t = function () {
        new microQuery(".micro-tooltip").init().remove(),
          new microQuery("[data-tooltip-open=true]")
            .init()
            .data("tooltip-open", null);
      };
    return this;
  });
const µ = function (e) {
  return new microQuery(e).init();
};
