import { ParentComponent } from "solid-js"

export const Layout: ParentComponent = ({ children }) => {
  return (
    <>
      <header>Header</header>
      {children}
      <footer>Footer</footer>
    </>
  )
}
