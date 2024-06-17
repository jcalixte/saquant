/* @refresh reload */
import { render } from "solid-js/web"
import { Route, Router } from "@solidjs/router"
import "./index.css"
import App from "./App"
import { Layout } from "./routes/Layout"
import { QueryProvider } from "./modules/query/context/QueryContext"
import { UserProvider } from "./modules/user/context/UserContext"

const root = document.getElementById("root")

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  )
}

render(
  () => (
    <QueryProvider>
      <UserProvider>
        <Router root={Layout}>
          <Route path="/" component={App} />
        </Router>
      </UserProvider>
    </QueryProvider>
  ),
  root!,
)
