
<template>
  <v-app id="inspire">
    <v-app-bar
      app
      clipped-right
      color="blue"
      dark
    >
      <v-toolbar-title>Agora Basic Video Call</v-toolbar-title>
      <v-spacer />
    </v-app-bar>

    <v-content>
      <v-container
        class="fill-height"
        fluid
      >
        <Main></Main>
      </v-container>
    </v-content>
  </v-app>
</template>
<script>
import Main from './components/main'
export default {
  components: {
    Main
  }
};
</script>
