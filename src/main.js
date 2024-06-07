import App from '@/App.vue';
import '@arco-design/web-vue/dist/arco.css';
import '@vscode/codicons/dist/codicon.css';
import 'virtual:uno.css';

const app = createApp(App);

const $Pinia = Pinia.createPinia();

app.use($Pinia);

app.mount('#app');
