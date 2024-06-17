import { ParentComponent, createContext, useContext } from "solid-js"
import { useQueryContext } from "../../query/context/QueryContext"
import { User } from "../types/user.type"

const UserContext = createContext()

export const UserProvider: ParentComponent = ({ children }) => {
  const [_, { setUser, remoteDb }] = useQueryContext()

  const login = async (
    userId: string,
    password: string,
  ): Promise<User | null> => {
    try {
      const response = await remoteDb().logIn(userId, password)
      const loggedUser: any = await remoteDb().getUser(response.name)

      return loggedUser as User
    } catch (error) {
      return null
    }
  }

  const signup = async (newUser: User, password: string) => {
    try {
      const response = await remoteDb().signUp(newUser.userId, password, {
        metadata: newUser,
      })
      if (response.ok) {
        const result = await login(newUser.userId, password)
        setUser(newUser)
        return result
      }
      return {
        ok: response.ok,
      }
    } catch (error: unknown) {
      return {
        ok: false,
        message: "error",
      }
    }
  }

  const value = {
    signup,
    login,
  }

  console.log("QueryProvider", value)
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
}
