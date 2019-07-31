import Vue from 'vue';
import Vuetify from 'vuetify/lib';
// import 'vuetify/dist/vuetify.min.css'
import theme from './theme';
import 'material-design-icons-iconfont/dist/material-design-icons.css'; // Ensure you are using css-loader

// Style
import '@/assets/sass/main.scss';

Vue.use(Vuetify);

export default new Vuetify({
    icons: {
      iconfont: 'md',
      theme
    },
    theme: {
        dark: true,
    },
});
