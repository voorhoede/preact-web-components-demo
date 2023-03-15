<template>
    <acme-alert v-if="show" type="warning" @acme-dismiss="close">You need to reset your password!</acme-alert>
</template>

<script setup>
import { ref } from 'vue'

const show = ref(true)

const close = () => {
    show.value = false
}
</script>

