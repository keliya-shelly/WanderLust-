(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      // ✅ Trim textareas before validation
      const textareas = form.querySelectorAll('textarea[required]')
      textareas.forEach(t => t.value = t.value.trim())

      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()
