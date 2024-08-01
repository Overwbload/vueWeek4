export default {
  data() {
    return {

    }
  },
  methods: {
    openModal(isNew) {
      this.$emit('openNewModal', isNew);
    }
  },
  template:
    `<button class="btn btn-primary" @click="openModal('new')">
      建立新的產品
    </button>`
}