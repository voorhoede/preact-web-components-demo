import { useMountVueComponent } from './hooks/use-mount-vue-component.js';
import { ReactEnviroment } from './environments/React.jsx'
import { WebComponentEnvironment } from './environments/WebComponent.jsx'
import VueEnvironment from './environments/Vue.vue'
import './App.css'

function App() {
  const vueRef = useMountVueComponent(VueEnvironment)

  return (
    <main class="app">
      <h1>Rendering environments</h1>

      <h2>React (JSX):</h2>

      <ReactEnviroment />

      <h2>React (web component)</h2>

      <WebComponentEnvironment />

      <h2>Vue (web component)</h2>

      <div ref={vueRef} />
    </main>
  )
}

export default App
