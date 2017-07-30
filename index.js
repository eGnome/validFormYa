'use strict';

window.MyForm = {
  errors: [],
  classError: "error",
  form: document.forms["myForm"],
  elements: document.forms["myForm"].elements,
  resultContainer: document.getElementById("resultContainer"),
  regexEmail: /^[\w\d\.\-]{1,}\@(yandex\.(ru|ua|com|by|kz)|ya\.(ru))$/,
  regexPhone: /^\+7\(\d{3}\)\d{3}\-\d{2}\-\d{2}$/,

  getData () {
    return {
      fio: this.elements["fio"].value.trim().replace(/\s{1,}/g, " "),
      email: this.elements["email"].value.trim(),
      phone: this.elements["phone"].value.trim()
    }
  },
  setData (object) {
    if (typeof object !== "object" || object === null) return;

    this.elements["fio"].value = object.fio || "";
    this.elements["email"].value = object.email || "";
    this.elements["phone"].value = object.phone || "";
  },
  submit () {
    this.form.onsubmit = (e) => {
      e.preventDefault();
      const urlAction = this.form.getAttribute("action"),
            result = this.validate();

      if (!result.isValid) {
        this.setErrors(result.errorFields);
        return;
      }

      if (urlAction === "") {
        this.setResult({status: "error", reason: "Ошибка! Отсутствует action у формы."});
        return;
      }

      this.elements["submitButton"].disabled = "disabled";

      axios.post(urlAction, this.getData())
        .then(response => this.setResult(response.data))
        .catch(error => this.setResult({status: "error", reason: error.message}));
    }
  },
  setResult (data) {
    let status = data.status.toLowerCase();
    this.resultContainer.classList.add(status);

    if (status !== "progress")
      this.resultContainer.innerText = data.reason || "Success";

    else setTimeout(() => this.send(), data.timeout);
  },
  validate () {
    this.clearErrors(this.errors);
    let fio = this.getData().fio;

    if (fio.split(" ").length !== 3) {
      this.errors.push("fio");
    }

    if (!this.regexEmail.test(this.getData().email)) {
      this.errors.push("email");
    }

    if (!this.regexPhone.test(this.getData().phone) ||
      this.sum(this.getData().phone) > 30) {
      this.errors.push("phone");
    }

    return {
      isValid: !this.errors.length,
      errorFields: this.errors
    };
  },
  setErrors (names) {
    for (let name of names) {
      if (!this.elements[name]) continue;

      this.elements[name].classList.add(this.classError);
    }
  },
  clearErrors (names) {
    for (let name of names) {
      if (!this.elements[name]) continue;

      this.elements[name].classList.remove(this.classError);
    }

    this.errors = [];
  },
  sum (phone) {
    let sum = 0,
        tel = phone.replace(/\W/g, "");

    for (let i = 0; i < tel.length; i++) {
      sum += parseInt(tel[i]);
    }

    return sum;
  }
};

MyForm.submit();
