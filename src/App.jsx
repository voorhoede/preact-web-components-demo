import { createApp } from 'vue';
import { useEffect, useRef } from 'react'
import { ReactEnviroment } from './environments/React.jsx'
import { WebComponentEnvironment } from './environments/WebComponent.jsx'
import VueEnvironment from './environments/Vue.vue'
import './App.css'

function App() {
  const vueRootRef = useRef(null)

  useEffect(() => {
    if (!vueRootRef.current) {
      return
    }

    const vueApp = createApp(VueEnvironment)

    vueApp.mount(vueRootRef.current)
  }, [vueRootRef])

  return (
    <main class="app">
      <h1>Rendering environments</h1>

      <h2>React (JSX):</h2>

      <ReactEnviroment />

      <h2>React (web component)</h2>

      <WebComponentEnvironment />

      <h2>Vue (web component)</h2>

      <div ref={vueRootRef} />
    </main>
  )
}

export default App
