import { createSignal, type Component, createEffect } from "solid-js"
import { useUserContext } from "./modules/user/context/UserContext"

const App: Component = () => {
  const [username, setUsername] = createSignal<string>("")
  const [password, setPassword] = createSignal<string>("")
  const [state, { login }] = useUserContext()

  createEffect(() => {
    console.log(state)
  })

  return (
    <div>
      {state.user?.email}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          login(username(), password())
        }}
      >
        <input
          type="text"
          name="username"
          placeholder="username"
          value={username()}
          onInput={(e: Event) => {
            setUsername((e.target as HTMLInputElement).value)
          }}
        />
        <input
          type="password"
          name="password"
          placeholder="password"
          value={password()}
          onInput={(e: Event) => {
            setPassword((e.target as HTMLInputElement).value)
          }}
        />
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default App
