import { ParentComponent, createContext, useContext } from "solid-js"
import { useQueryContext } from "../../query/context/QueryContext"
import { User } from "../types/user.type"

type State = {
  user: User | null
}

type ContextType = [
  State,
  {
    login: (userId: string, password: string) => Promise<User | null>
    signup: (newUser: User, password: string) => Promise<User | null>
  }
]

const UserContext = createContext<ContextType>([
  { user: null },
  {
    login: async () => null,
    signup: async () => null,
  },
])

export const UserProvider: ParentComponent = (props) => {
  const [state, { setUser, remoteDb }] = useQueryContext()

  const login = async (
    userId: string,
    password: string
  ): Promise<User | null> => {
    try {
      const response = await remoteDb().logIn(userId, password)
      const loggedUser: any = await remoteDb().getUser(response.name)

      setUser(loggedUser)
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

      return null
    } catch (error: unknown) {
      return null
    }
  }

  const value: ContextType = [
    { user: state.user },
    {
      signup,
      login,
    },
  ]

  return (
    <UserContext.Provider value={value}>{props.children}</UserContext.Provider>
  )
}

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
}
